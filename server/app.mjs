/**
 * ITECX API — Express-приложение без привязки к способу запуска.
 * Используется двумя способами:
 *   - локально / на VPS: server/index.mjs добавляет статику и app.listen();
 *   - на Vercel: api/index.mjs экспортирует его как serverless-функцию.
 *
 * Безопасность:
 *  - пароль администратора хранится ТОЛЬКО как хэш (scrypt; SHA-256 — устаревший формат);
 *  - вход выдаёт HMAC-токен с истечением (12 часов), секрет — в env;
 *  - перебор пароля ограничен по IP и глобально, счётчик в БД;
 *  - приём заявок ограничен по IP и по email (анти-спам);
 *  - жёсткие HTTP-заголовки безопасности (CSP, X-Frame-Options и др.);
 *  - обрыв соединения с БД не роняет процесс (см. pool.on('error') ниже) —
 *    без этого обработчика разрыв связи с Neon аварийно завершал бы Node
 *    на VPS-деплое, кладя весь сайт для всех посетителей разом;
 *  - все SQL-запросы параметризованы (нет конкатенации строк → нет SQLi);
 *  - ответы /api/* никогда не кешируются (Cache-Control: no-store).
 *
 * Bitrix24: каждая заявка после сохранения в БД best-effort дублируется
 * сделкой в CRM (см. pushToBitrix) — сбой Bitrix не портит ответ пользователю,
 * БД остаётся источником правды. Настраивается через BITRIX_WEBHOOK_URL.
 *
 * Примечание для serverless: блокировка входа и суточный лимит заявок по email
 * хранятся в БД и переживают холодные старты; почасовой лимит по IP — in-memory.
 */

import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

// waitUntil продлевает жизнь serverless-функции Vercel после отправки ответа —
// так Bitrix-синхронизация доезжает в фоне, не заставляя посетителя ждать.
// Вне Vercel (VPS/локально) пакет может отсутствовать или не работать — там
// процесс долгоживущий и фоновая задача доедет сама, поэтому мягкий fallback.
let vercelWaitUntil = null
try {
  ;({ waitUntil: vercelWaitUntil } = await import('@vercel/functions'))
} catch {
  /* не на Vercel — fire-and-forget достаточно */
}

// ---- конфигурация ----------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Локально секреты лежат в server/.env; на Vercel файла нет — переменные
// приходят из панели, поэтому отсутствие файла не ошибка.
try {
  process.loadEnvFile?.(path.join(__dirname, '.env'))
} catch {
  /* нет файла — работаем от process.env */
}

const {
  DATABASE_URL,
  ADMIN_PASSWORD_HASH,
  ADMIN_SALT = 'itecx-admin-v1',
  TOKEN_SECRET,
  // Необязательно: если не задан, заявки просто не дублируются в Bitrix24 —
  // сайт и без него работает штатно (см. pushToBitrix ниже).
  BITRIX_WEBHOOK_URL,
  BITRIX_CATEGORY_ID = '17',
} = process.env

if (!DATABASE_URL || !ADMIN_PASSWORD_HASH || !TOKEN_SECRET) {
  throw new Error('Не заданы обязательные переменные: DATABASE_URL, ADMIN_PASSWORD_HASH, TOKEN_SECRET')
}
if (!isLikelyStrongSecret(TOKEN_SECRET)) {
  console.warn('[security] TOKEN_SECRET выглядит коротким/предсказуемым — сгенерируйте `openssl rand -hex 32`.')
}

function isLikelyStrongSecret(s) {
  return typeof s === 'string' && s.length >= 32
}

// Локальный Postgres — без TLS; управляемый (Neon/Vercel Postgres и т.п.) — с TLS.
const isLocalDb = /@(localhost|127\.0\.0\.1)[:/]/.test(DATABASE_URL)
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 5,
  // Не виснуть навечно, если БД недоступна — быстрый явный отказ лучше,
  // чем зависший запрос, съедающий лимит serverless-функции.
  connectionTimeoutMillis: 8_000,
  idleTimeoutMillis: 30_000,
  // Neon и другие управляемые Postgres предъявляют публично доверенный
  // сертификат — проверяем его, иначе TLS-канал можно тихо перехватить.
  // DB_SSL_NO_VERIFY=1 — только для сервера с самоподписанной цепочкой.
  ssl: isLocalDb ? undefined : { rejectUnauthorized: process.env.DB_SSL_NO_VERIFY !== '1' },
})

// КРИТИЧНО: без этого обработчика ошибка на простаивающем соединении
// (например, Neon разрывает связь по таймауту) становится необработанным
// событием 'error' и аварийно завершает весь процесс Node — сайт падает
// целиком на VPS-деплое, пока кто-то вручную не перезапустит демон.
pool.on('error', (err) => {
  console.error('[db] idle client error (обработано, процесс жив):', err.message)
})

// ---- интеграция с Bitrix24 --------------------------------------------------
//
// Best-effort: заявка уже сохранена в нашей БД до вызова этой функции, поэтому
// падение/недоступность Bitrix НЕ ломает форму для посетителя — мы просто
// логируем ошибку и продолжаем. БД остаётся единственным надёжным источником
// правды; bitrix_deal_id в таблице — просто след успешной синхронизации.
//
// Секрет — сам URL вебхука (в нём токен), поэтому он живёт только в env,
// как и DATABASE_URL, и никогда не попадает в git.

async function bitrixCall(method, payload) {
  const url = `${BITRIX_WEBHOOK_URL.replace(/\/+$/, '')}/${method}.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6_000),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error) {
    throw new Error(body.error_description || body.error || `HTTP ${res.status}`)
  }
  return body.result
}

/** Создаёт контакт + сделку в воронке CATEGORY_ID (по умолчанию 17 — «ITECX»
 * из ссылки заказчика). Возвращает ID созданной сделки или null, если
 * интеграция не настроена / упала (в последнем случае — кидает наверх). */
async function pushToBitrix({ firstName, lastName, email, phone, track, organization, message }) {
  if (!BITRIX_WEBHOOK_URL) return null

  let contactId
  try {
    contactId = await bitrixCall('crm.contact.add', {
      fields: {
        NAME: firstName,
        LAST_NAME: lastName,
        SOURCE_ID: 'WEB',
        EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
        ...(phone ? { PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }] } : {}),
        ...(organization ? { COMMENTS: `Организация: ${organization}` } : {}),
      },
    })
  } catch (e) {
    console.error('[bitrix] contact.add failed (сделка всё равно будет создана):', e.message)
  }

  const commentLines = [
    `Формат участия: ${track}`,
    `Email: ${email}`,
    phone && `Телефон: ${phone}`,
    organization && `Организация: ${organization}`,
    message && `Комментарий: ${message}`,
  ].filter(Boolean)

  return bitrixCall('crm.deal.add', {
    fields: {
      TITLE: `ITECX — ${firstName} ${lastName}`,
      CATEGORY_ID: Number(BITRIX_CATEGORY_ID),
      SOURCE_ID: 'WEB',
      COMMENTS: commentLines.join('\n'),
      ...(contactId ? { CONTACT_ID: contactId } : {}),
    },
    params: { REGISTER_SONET_EVENT: 'Y' },
  })
}

// ---- утилиты ---------------------------------------------------------------

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

/** Сравнение строк за постоянное время — ответ не выдаёт, сколько символов совпало. */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

/**
 * Проверка пароля администратора.
 *
 * Новый формат (рекомендуется): `scrypt:<соль hex>:<хэш hex>` — медленная
 * функция с памятью, перебор утёкшего хэша стоит годы, а не минуты.
 * Сгенерировать: `node scripts/hash-admin-password.mjs`.
 *
 * Старый формат — SHA-256 от `соль::пароль` — пока принимается, чтобы смена
 * версии не заблокировала вход; замените его, как только будет минута.
 */
function passwordMatches(password) {
  if (ADMIN_PASSWORD_HASH.startsWith('scrypt:')) {
    const [, saltHex, hashHex] = ADMIN_PASSWORD_HASH.split(':')
    if (!saltHex || !hashHex) return false
    const expected = Buffer.from(hashHex, 'hex')
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, SCRYPT_PARAMS)
    return crypto.timingSafeEqual(actual, expected)
  }
  return safeEqual(sha256(`${ADMIN_SALT}::${password}`), ADMIN_PASSWORD_HASH)
}
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
if (!ADMIN_PASSWORD_HASH.startsWith('scrypt:')) {
  console.warn('[security] ADMIN_PASSWORD_HASH в старом формате SHA-256 — перейдите на scrypt: node scripts/hash-admin-password.mjs')
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS)
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(exp).digest('hex')
  return `${exp}.${sig}`
}

function verifyToken(token) {
  const [exp, sig] = String(token ?? '').split('.')
  if (!exp || !sig) return false
    // токен не может «жить» дольше, чем мы вообще выдаём
  if (Number(exp) > Date.now() + TOKEN_TTL_MS + 60_000) return false
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(exp).digest('hex')
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false
  } catch {
    return false
  }
  return Number(exp) > Date.now()
}

/** Примитивный in-memory лимитер: N событий на ключ за окно. */
function makeLimiter({ windowMs, max }) {
  const hits = new Map()
  setInterval(() => {
    const cutoff = Date.now() - windowMs
    for (const [key, times] of hits) {
      const alive = times.filter((t) => t > cutoff)
      if (alive.length) hits.set(key, alive)
      else hits.delete(key)
    }
  }, windowMs).unref()
  return (key) => {
    const now = Date.now()
    const times = (hits.get(key) ?? []).filter((t) => t > now - windowMs)
    if (times.length >= max) return false
    times.push(now)
    hits.set(key, times)
    return true
  }
}

const submitLimiterIp = makeLimiter({ windowMs: 60 * 60 * 1000, max: 10 }) // 10 заявок/час с IP
const submitLimiterEmail = makeLimiter({ windowMs: 24 * 60 * 60 * 1000, max: 5 }) // 5/сутки на email

// Блокировка перебора пароля. Счётчик в БД, а не в памяти: на Vercel каждый
// холодный старт функции обнулял бы in-memory счётчик, и перебор шёл бы
// без ограничений. Плюс общий потолок на все адреса — против ботнета.
const LOGIN_WINDOW_MIN = 15
const LOGIN_MAX_PER_IP = 5
const LOGIN_MAX_GLOBAL = 50

let loginTableReady = null
function ensureLoginTable() {
  loginTableReady ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS admin_login_failures (
         ip_hash text NOT NULL,
         created_at timestamptz NOT NULL DEFAULT now()
       );
       CREATE INDEX IF NOT EXISTS admin_login_failures_created_idx ON admin_login_failures (created_at DESC);`
    )
    .catch((e) => {
      loginTableReady = null
      throw e
    })
  return loginTableReady
}

/** IP хранится только как HMAC — это персональные данные, а нужно лишь равенство. */
const hashIp = (ip) => crypto.createHmac('sha256', TOKEN_SECRET).update(ip).digest('hex').slice(0, 32)

async function loginBlocked(ipHash) {
  await ensureLoginTable()
  const { rows } = await pool.query(
    `SELECT count(*)::int AS total, count(*) FILTER (WHERE ip_hash = $1)::int AS mine
       FROM admin_login_failures
      WHERE created_at > now() - make_interval(mins => $2)`,
    [ipHash, LOGIN_WINDOW_MIN]
  )
  return rows[0].mine >= LOGIN_MAX_PER_IP || rows[0].total >= LOGIN_MAX_GLOBAL
}

async function noteLoginFailure(ipHash) {
  await ensureLoginTable()
  await pool.query('INSERT INTO admin_login_failures (ip_hash) VALUES ($1)', [ipHash])
  await pool.query(`DELETE FROM admin_login_failures WHERE created_at < now() - interval '1 day'`)
}

/**
 * Настоящий адрес посетителя. На Vercel — x-real-ip: его ставит сама
 * платформа, клиент подделать не может. На VPS перед нами ровно один nginx,
 * поэтому доверяем одному прокси (trust proxy = 1), а не всей цепочке
 * X-Forwarded-For, которую клиент пишет сам.
 */
function clientIp(req) {
  if (process.env.VERCEL) return String(req.headers['x-real-ip'] ?? '').trim() || req.ip || 'unknown'
  return req.ip ?? 'unknown'
}

/** Запрос пришёл с нашей же страницы (сравнение точного хоста, не суффикса). */
function sameOrigin(req) {
  const src = req.headers.origin || req.headers.referer
  if (!src) return false
  try {
    return new URL(src).host === (req.headers['x-forwarded-host'] || req.headers.host)
  } catch {
    return false
  }
}

// ---- приложение -------------------------------------------------------------

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by') // не палим стек (Express) потенциальному атакующему

// Единая CSP: инлайн-скриптов на сайте нет (только module-скрипт из index.html),
// поэтому script-src можно держать строгим — это гасит XSS даже при найденной
// дыре. style-src разрешает 'unsafe-inline', т.к. сайт активно использует
// inline style в React (иначе пришлось бы городить nonce на каждый узел).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000')
  // API-ответы (в т.ч. содержащие заявки) никогда не кешируются прокси/браузером
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store')
  next()
})

app.use(express.json({ limit: '32kb' }))

app.post('/api/applications', async (req, res) => {
  const ip = clientIp(req)
  if (!sameOrigin(req)) return res.status(403).json({ error: 'origin' })
  const b = req.body && typeof req.body === 'object' ? req.body : {}

  // honeypot: боты заполняют всё подряд — отвечаем «успехом», ничего не сохраняя
  if (b._honey) return res.json({ ok: true })

  const firstName = String(b.firstName ?? '').trim()
  const lastName = String(b.lastName ?? '').trim()
  const email = String(b.email ?? '').trim().toLowerCase()
  const phone = String(b.phone ?? '').trim()
  const track = String(b.track ?? '')
  const organization = String(b.organization ?? '').trim()
  const message = String(b.message ?? '').trim()

  if (!firstName || !lastName || !email || !track) return res.status(400).json({ error: 'required' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'email' })
  if (phone && !/^\+?[\d\s\-()]{6,20}$/.test(phone)) return res.status(400).json({ error: 'phone' })
  if (!['ITECX college', 'ITECX academic'].includes(track)) return res.status(400).json({ error: 'track' })
  if ([firstName, lastName, organization].some((s) => s.length > 200) || message.length > 2000)
    return res.status(400).json({ error: 'too_long' })

  if (!submitLimiterIp(ip) || !submitLimiterEmail(email)) {
    return res.status(429).json({ error: 'rate_limit' })
  }
  // In-memory лимит живёт в пределах одного инстанса; повтор по email
  // проверяем ещё и в БД — это переживает холодные старты.
  try {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM applications WHERE email = $1 AND created_at > now() - interval '1 day'`,
      [email]
    )
    if (rows[0].n >= 5) return res.status(429).json({ error: 'rate_limit' })
  } catch (e) {
    console.error('rate check failed (заявка пропущена дальше):', e.message)
  }

  let insertedId
  try {
    const { rows } = await pool.query(
      `INSERT INTO applications (first_name, last_name, email, phone, track, organization, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [firstName, lastName, email, phone || null, track, organization || null, message || null]
    )
    insertedId = rows[0].id
  } catch (e) {
    console.error('insert failed:', e.message)
    return res.status(500).json({ error: 'db' })
  }

  // Заявка уже в БД — отвечаем пользователю СРАЗУ, не дожидаясь Bitrix.
  // Иначе медленный CRM (2 HTTP-вызова × до 6с) держит форму «на отправке»
  // и на Vercel может упереть функцию в таймаут — посетитель увидел бы
  // ошибку при фактически сохранённой заявке.
  res.json({ ok: true })

  const bitrixTask = pushToBitrix({ firstName, lastName, email, phone, track, organization, message })
    .then((dealId) =>
      dealId
        ? pool.query('UPDATE applications SET bitrix_deal_id = $1 WHERE id = $2', [String(dealId), insertedId])
        : null
    )
    .catch((e) => console.error('[bitrix] push failed (заявка сохранена в БД, в CRM не попала):', e.message))

  // Vercel: не дать платформе заморозить функцию до завершения фоновой задачи.
  vercelWaitUntil?.(bitrixTask)
})

app.post('/api/admin/login', async (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'origin' })
  const ipHash = hashIp(clientIp(req))
  try {
    if (await loginBlocked(ipHash)) {
      return res.status(429).json({ error: 'locked', retryAfter: LOGIN_WINDOW_MIN * 60 })
    }
  } catch (e) {
    console.error('login throttle check failed:', e.message)
    return res.status(503).json({ error: 'unavailable' })
  }

  const password = String(req.body?.password ?? '').slice(0, 256)
  if (password && passwordMatches(password)) {
    return res.json({ token: issueToken() })
  }
  await noteLoginFailure(ipHash).catch((e) => console.error('login failure log failed:', e.message))
  console.warn(`[security] неудачный вход в админку (ip ${ipHash.slice(0, 8)})`)
  res.status(401).json({ error: 'invalid', retryAfter: 0 })
})

app.get('/api/applications', async (req, res) => {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  if (!verifyToken(token)) return res.status(401).json({ error: 'unauthorized' })
  try {
    const { rows } = await pool.query('SELECT * FROM applications ORDER BY created_at DESC LIMIT 1000')
    res.json({ rows })
  } catch (e) {
    console.error('select failed:', e.message)
    res.status(500).json({ error: 'db' })
  }
})

// Неизвестный маршрут внутри /api/* — явный 404, а не откат к SPA-разметке.
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

// Единая точка отказа: сюда попадают, например, ошибки парсинга битого JSON
// из express.json(). Ответ всегда общий JSON без стека — детали только в логах.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[express] unhandled error:', err?.message ?? err)
  if (res.headersSent) return
  res.status(err?.status && err.status < 500 ? err.status : 400).json({ error: 'bad_request' })
})

export default app
