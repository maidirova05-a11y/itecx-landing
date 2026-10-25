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
 * Примечание для serverless: блокировка входа, суточный лимит заявок по email
 * и почасовой лимит по IP (HMAC адреса, как у входа) хранятся в БД и
 * переживают холодные старты; in-memory лимитер остаётся первым, дешёвым
 * барьером внутри одного инстанса.
 *
 * Схема таблицы заявок поддерживается самим приложением (ensureSchema):
 * CREATE TABLE / ADD COLUMN IF NOT EXISTS, поэтому новая колонка добавляется в
 * коде и появляется в любой базе (Neon, VPS, Docker) при первом запросе.
 *
 * Маркетинговая атрибуция: вместе с заявкой принимаются utm-метки, реферер и
 * страница входа — клиент снимает их при первом визите (src/lib/registration.ts)
 * и присылает с формой. Они уходят и в Bitrix24 (поля UTM_*), и в CSV-выгрузку.
 * Регистрация на сайте ведёт во внешнюю Google-форму, поэтому клики по её
 * ссылкам с теми же метками пишутся отдельно — POST /api/registration-click →
 * таблица registration_clicks (сводка и CSV в панели организатора).
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

// ---- схема --------------------------------------------------------------------
//
// Таблица заявок исторически создавалась руками (deploy/setup-db.sql,
// DEPLOY-VERCEL.md). Теперь приложение само доводит её до актуального вида:
// CREATE TABLE для пустой базы, ADD COLUMN IF NOT EXISTS для уже существующей —
// так колонки атрибуции появляются и в Neon, и на VPS без ручной миграции.
// Все операторы идемпотентны, выполняются один раз на инстанс (memo-промис);
// при ошибке не роняем запрос — таблица, скорее всего, уже есть, а падение
// INSERT-а и так будет замечено и залогировано.

/** Поля атрибуции: имя колонки → максимальная длина. Единый источник для
 * схемы, приёма заявки и CSV. */
const ATTRIBUTION_COLUMNS = {
  utm_source: 120,
  utm_medium: 120,
  utm_campaign: 120,
  utm_content: 120,
  utm_term: 120,
  referrer: 500,
  landing_path: 255,
}

let schemaReady = null
function ensureSchema() {
  schemaReady ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS applications (
         id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
         created_at timestamptz NOT NULL DEFAULT now(),
         first_name text NOT NULL,
         last_name text NOT NULL,
         email text NOT NULL,
         phone text,
         track text NOT NULL,
         organization text,
         message text,
         bitrix_deal_id text
       );
       ALTER TABLE applications ADD COLUMN IF NOT EXISTS bitrix_deal_id text;
       ${Object.keys(ATTRIBUTION_COLUMNS)
         .map((col) => `ALTER TABLE applications ADD COLUMN IF NOT EXISTS ${col} text;`)
         .join('\n       ')}
       CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications (created_at DESC);
       CREATE INDEX IF NOT EXISTS applications_email_idx ON applications (email);
       CREATE TABLE IF NOT EXISTS application_submissions (
         ip_hash text NOT NULL,
         created_at timestamptz NOT NULL DEFAULT now()
       );
       CREATE INDEX IF NOT EXISTS application_submissions_created_idx ON application_submissions (created_at DESC);
       CREATE TABLE IF NOT EXISTS registration_clicks (
         id bigserial PRIMARY KEY,
         created_at timestamptz NOT NULL DEFAULT now(),
         lang text,
         ${Object.keys(ATTRIBUTION_COLUMNS).map((col) => `${col} text,`).join('\n         ')}
         link_location text
       );
       CREATE INDEX IF NOT EXISTS registration_clicks_created_idx ON registration_clicks (created_at DESC);
       CREATE TABLE IF NOT EXISTS registration_click_hits (
         ip_hash text NOT NULL,
         created_at timestamptz NOT NULL DEFAULT now()
       );
       CREATE INDEX IF NOT EXISTS registration_click_hits_created_idx ON registration_click_hits (created_at DESC);`
    )
    .catch((e) => {
      schemaReady = null
      console.error('[db] ensureSchema failed (работаем с тем, что есть):', e.message)
    })
  return schemaReady
}

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
async function pushToBitrix({ firstName, lastName, email, phone, track, organization, message, attribution = {} }) {
  if (!BITRIX_WEBHOOK_URL) return null
  const { utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, landing_path } = attribution

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
    (utm_source || utm_medium || utm_campaign) &&
      `Источник: ${[utm_source, utm_medium, utm_campaign].filter(Boolean).join(' / ')}`,
    utm_content && `Объявление (utm_content): ${utm_content}`,
    utm_term && `Ключ (utm_term): ${utm_term}`,
    referrer && `Реферер: ${referrer}`,
    landing_path && `Страница входа: ${landing_path}`,
  ].filter(Boolean)

  // UTM_* — штатные поля сделки Bitrix24: по ним CRM сама строит отчёты
  // по источникам; в COMMENTS те же метки продублированы для глаз менеджера.
  const utmFields = Object.fromEntries(
    [
      ['UTM_SOURCE', utm_source],
      ['UTM_MEDIUM', utm_medium],
      ['UTM_CAMPAIGN', utm_campaign],
      ['UTM_CONTENT', utm_content],
      ['UTM_TERM', utm_term],
    ].filter(([, v]) => v)
  )

  return bitrixCall('crm.deal.add', {
    fields: {
      TITLE: `ITECX — ${firstName} ${lastName}`,
      CATEGORY_ID: Number(BITRIX_CATEGORY_ID),
      SOURCE_ID: 'WEB',
      COMMENTS: commentLines.join('\n'),
      ...utmFields,
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
    // Buffer.from('не-hex', 'hex') молча даёт пустой буфер, а scrypt с keylen 0
    // возвращает такой же пустой — timingSafeEqual двух пустых буферов истинен,
    // и битый хэш в env пускал бы в панель по любому паролю.
    if (expected.length < 16) return false
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

// Лимиты приёма заявок: общие для in-memory барьера и проверки в БД.
const SUBMIT_MAX_PER_IP_HOUR = 10
const SUBMIT_MAX_PER_EMAIL_DAY = 5

const submitLimiterIp = makeLimiter({ windowMs: 60 * 60 * 1000, max: SUBMIT_MAX_PER_IP_HOUR })
const submitLimiterEmail = makeLimiter({ windowMs: 24 * 60 * 60 * 1000, max: SUBMIT_MAX_PER_EMAIL_DAY })

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

// Почасовой лимит заявок по IP — тоже в БД. In-memory счётчик (submitLimiterIp)
// на Vercel живёт ровно до холодного старта и не разделяется между инстансами,
// так что один адрес мог слать заявки без ограничений, просто попадая на разные
// инстансы. Здесь, как и у входа, хранится не адрес, а его HMAC.
async function submitBlockedInDb(ipHash, email) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM application_submissions
         WHERE ip_hash = $1 AND created_at > now() - interval '1 hour') AS by_ip,
       (SELECT count(*)::int FROM applications
         WHERE email = $2 AND created_at > now() - interval '1 day') AS by_email`,
    [ipHash, email]
  )
  return rows[0].by_ip >= SUBMIT_MAX_PER_IP_HOUR || rows[0].by_email >= SUBMIT_MAX_PER_EMAIL_DAY
}

async function noteSubmission(ipHash) {
  await pool.query('INSERT INTO application_submissions (ip_hash) VALUES ($1)', [ipHash])
  await pool.query(`DELETE FROM application_submissions WHERE created_at < now() - interval '1 day'`)
}

/**
 * Нормализует поля атрибуции из тела заявки: обрезает до лимита колонки (это
 * аналитика, а не данные участника — лишнее лучше отрезать, чем отклонить
 * заявку), убирает управляющие символы, реферер сводит к схеме+хосту+пути
 * (без query — там бывают чужие токены), путь входа принимает только с «/».
 * Не-строки (объект/массив/число в JSON) отбрасываются — иначе в БД и в
 * UTM_SOURCE сделки уезжал бы «[object Object]».
 */
function pickAttribution(b) {
  const clean = (v, max) =>
    (typeof v === 'string' ? v : '')
      // Управляющие символы вырезаются намеренно: метки уходят в CSV и в CRM.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, max) || null

  let referrer = clean(b.referrer, 2000)
  if (referrer) {
    try {
      const u = new URL(referrer)
      referrer = /^https?:$/.test(u.protocol) ? `${u.origin}${u.pathname}`.slice(0, ATTRIBUTION_COLUMNS.referrer) : null
    } catch {
      referrer = null
    }
  }

  let landing_path = clean(b.landingPath, ATTRIBUTION_COLUMNS.landing_path)
  if (landing_path && !landing_path.startsWith('/')) landing_path = null

  return {
    utm_source: clean(b.utmSource, ATTRIBUTION_COLUMNS.utm_source),
    utm_medium: clean(b.utmMedium, ATTRIBUTION_COLUMNS.utm_medium),
    utm_campaign: clean(b.utmCampaign, ATTRIBUTION_COLUMNS.utm_campaign),
    utm_content: clean(b.utmContent, ATTRIBUTION_COLUMNS.utm_content),
    utm_term: clean(b.utmTerm, ATTRIBUTION_COLUMNS.utm_term),
    referrer,
    landing_path,
  }
}

// ---- переходы к регистрации ------------------------------------------------
//
// Регистрация идёт во внешней Google-форме, поэтому utm-метки до нашей БД с
// заявкой не доезжают. Взамен клиент (lib/registration.ts) шлёт beacon при
// клике по ссылке регистрации: язык, место кнопки и те же метки атрибуции.
// Персональных данных здесь нет; IP — только HMAC в отдельном журнале лимита,
// который чистится через сутки.

const CLICK_MAX_PER_IP_HOUR = 30
const clickLimiterIp = makeLimiter({ windowMs: 60 * 60 * 1000, max: CLICK_MAX_PER_IP_HOUR })
const CLICK_LANGS = new Set(['ru', 'kk', 'en'])
/** Колонки журнала переходов — одна точка для INSERT и CSV. */
const CLICK_COLUMNS = ['id', 'created_at', 'lang', 'link_location', ...Object.keys(ATTRIBUTION_COLUMNS)]

async function clickBlockedInDb(ipHash) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n FROM registration_click_hits
      WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`,
    [ipHash]
  )
  return rows[0].n >= CLICK_MAX_PER_IP_HOUR
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

/**
 * Хост, по которому к нам обратились. На Vercel x-forwarded-host ставит сама
 * платформа. На VPS nginx выставляет Host из $host и НЕ трогает
 * X-Forwarded-Host — клиентский заголовок дошёл бы до нас как есть, и пара
 * «Origin: https://evil.example + X-Forwarded-Host: evil.example» проходила
 * бы проверку sameOrigin. Поэтому вне Vercel верим только Host.
 */
function requestHost(req) {
  const raw = process.env.VERCEL ? req.headers['x-forwarded-host'] || req.headers.host : req.headers.host
  return String(raw ?? '').split(',')[0].trim().toLowerCase()
}

/** Запрос пришёл с нашей же страницы (сравнение точного хоста, не суффикса). */
function sameOrigin(req) {
  const src = req.headers.origin || req.headers.referer
  if (!src) return false
  try {
    const host = requestHost(req)
    return Boolean(host) && new URL(src).host.toLowerCase() === host
  } catch {
    return false
  }
}

/** Ячейка CSV: кавычки удвоены; ячейка, начинающаяся с =, +, -, @ — экранирована
 * апострофом, иначе Excel выполнит её как формулу (CSV-инъекция через поле
 * «комментарий» заявки). */
function csvCell(v) {
  if (v == null) return ''
  let s = v instanceof Date ? v.toISOString() : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// ---- приложение -------------------------------------------------------------

const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by') // не палим стек (Express) потенциальному атакующему

// Единая CSP: инлайн-скриптов на сайте нет (только module-скрипт, metrika.js и gtag.js из index.html),
// поэтому script-src можно держать строгим — это гасит XSS даже при найденной
// дыре. style-src разрешает 'unsafe-inline', т.к. сайт активно использует
// inline style в React (иначе пришлось бы городить nonce на каждый узел).
const CSP = [
  "default-src 'self'",
  // mc.yandex.ru / yastatic.net — Яндекс.Метрика (public/metrika.js),
  // www.googletagmanager.com — Google Analytics (public/gtag.js).
  "script-src 'self' https://mc.yandex.ru https://yastatic.net https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://mc.yandex.ru https://mc.yandex.kz https://mc.yandex.com https://*.google-analytics.com https://www.googletagmanager.com",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.kz https://mc.yandex.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src blob: https://mc.yandex.ru",
  "child-src blob: https://mc.yandex.ru",
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
  const attribution = pickAttribution(b)

  if (!submitLimiterIp(ip) || !submitLimiterEmail(email)) {
    return res.status(429).json({ error: 'rate_limit' })
  }
  // In-memory лимит живёт в пределах одного инстанса; повтор по IP и по email
  // проверяем ещё и в БД — это переживает холодные старты.
  const ipHash = hashIp(ip)
  await ensureSchema()
  try {
    if (await submitBlockedInDb(ipHash, email)) return res.status(429).json({ error: 'rate_limit' })
  } catch (e) {
    console.error('rate check failed (заявка пропущена дальше):', e.message)
  }

  let insertedId
  try {
    const cols = Object.keys(ATTRIBUTION_COLUMNS)
    const { rows } = await pool.query(
      `INSERT INTO applications (first_name, last_name, email, phone, track, organization, message, ${cols.join(', ')})
       VALUES ($1, $2, $3, $4, $5, $6, $7, ${cols.map((_, i) => `$${i + 8}`).join(', ')}) RETURNING id`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        track,
        organization || null,
        message || null,
        ...cols.map((c) => attribution[c]),
      ]
    )
    insertedId = rows[0].id
  } catch (e) {
    console.error('insert failed:', e.message)
    return res.status(500).json({ error: 'db' })
  }
  // Не ждём запись в журнал IP-лимита перед ответом, но на Vercel она должна
  // доехать — иначе функция замёрзнет после ответа, строка не запишется, и
  // почасовой лимит по IP не сработает (см. waitUntil ниже).
  const submissionTask = noteSubmission(ipHash).catch((e) => console.error('submission log failed:', e.message))

  // Заявка уже в БД — отвечаем пользователю СРАЗУ, не дожидаясь Bitrix.
  // Иначе медленный CRM (2 HTTP-вызова × до 6с) держит форму «на отправке»
  // и на Vercel может упереть функцию в таймаут — посетитель увидел бы
  // ошибку при фактически сохранённой заявке.
  res.json({ ok: true })

  const bitrixTask = pushToBitrix({ firstName, lastName, email, phone, track, organization, message, attribution })
    .then((dealId) =>
      dealId
        ? pool.query('UPDATE applications SET bitrix_deal_id = $1 WHERE id = $2', [String(dealId), insertedId])
        : null
    )
    .catch((e) => console.error('[bitrix] push failed (заявка сохранена в БД, в CRM не попала):', e.message))

  // Vercel: не дать платформе заморозить функцию до завершения фоновых задач
  // (обе уже с .catch, поэтому Promise.all не отклонится).
  vercelWaitUntil?.(Promise.all([bitrixTask, submissionTask]))
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

/** Токен панели из заголовка Authorization: Bearer … */
function bearerOk(req) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
  return verifyToken(token)
}

// Колонки заявки, которые отдаются панели и в CSV (= ApplicationRow в lib/db.ts).
const APPLICATION_COLUMNS = [
  'id',
  'created_at',
  'first_name',
  'last_name',
  'email',
  'phone',
  'track',
  'organization',
  'message',
  ...Object.keys(ATTRIBUTION_COLUMNS),
  'bitrix_deal_id',
]
/** Потолок строк для списка в панели и CSV-выгрузок. */
const ADMIN_ROWS_LIMIT = 10000

app.get('/api/applications', async (req, res) => {
  if (!bearerOk(req)) return res.status(401).json({ error: 'unauthorized' })
  await ensureSchema()
  try {
    const { rows } = await pool.query(
      `SELECT ${APPLICATION_COLUMNS.join(', ')} FROM applications ORDER BY created_at DESC LIMIT $1`,
      [ADMIN_ROWS_LIMIT]
    )
    res.json({ rows })
  } catch (e) {
    console.error('select failed:', e.message)
    res.status(500).json({ error: 'db' })
  }
})

// Выгрузка в CSV для панели организатора — те же права, что и у списка.
// UTF-8 с BOM, чтобы Excel на Windows не показал кириллицу кракозябрами;
// разделитель — запятая, даты в ISO.
function sendCsv(res, columns, rows, name) {
  const lines = [columns.join(',')]
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c])).join(','))
  const stamp = new Date().toISOString().slice(0, 10)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${name}-${stamp}.csv"`)
  res.send(`\ufeff${lines.join('\r\n')}\r\n`)
}

app.get('/api/applications.csv', async (req, res) => {
  if (!bearerOk(req)) return res.status(401).json({ error: 'unauthorized' })
  await ensureSchema()
  try {
    const { rows } = await pool.query(
      `SELECT ${APPLICATION_COLUMNS.join(', ')} FROM applications ORDER BY created_at DESC LIMIT $1`,
      [ADMIN_ROWS_LIMIT]
    )
    sendCsv(res, APPLICATION_COLUMNS, rows, 'itecx-applications')
  } catch (e) {
    console.error('csv export failed:', e.message)
    res.status(500).json({ error: 'db' })
  }
})

// Beacon «клик по ссылке регистрации» (navigator.sendBeacon с нашей страницы).
// Те же барьеры, что у заявки: проверка Origin, in-memory и БД-лимит по HMAC IP,
// очистка меток через pickAttribution. Ответ без тела — beacon его не читает.
app.post('/api/registration-click', async (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'origin' })
  const ip = clientIp(req)
  if (!clickLimiterIp(ip)) return res.status(429).json({ error: 'rate_limit' })
  const b = req.body && typeof req.body === 'object' ? req.body : {}
  const lang = CLICK_LANGS.has(b.lang) ? b.lang : null
  const linkLocation = typeof b.linkLocation === 'string' && /^[a-z0-9-]{1,40}$/.test(b.linkLocation) ? b.linkLocation : null
  const attribution = pickAttribution(b)
  const ipHash = hashIp(ip)
  await ensureSchema()
  try {
    if (await clickBlockedInDb(ipHash)) return res.status(429).json({ error: 'rate_limit' })
    const cols = Object.keys(ATTRIBUTION_COLUMNS)
    await pool.query(
      `INSERT INTO registration_clicks (lang, link_location, ${cols.join(', ')})
       VALUES ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(', ')})`,
      [lang, linkLocation, ...cols.map((c) => attribution[c])]
    )
    await pool.query('INSERT INTO registration_click_hits (ip_hash) VALUES ($1)', [ipHash])
    await pool.query(`DELETE FROM registration_click_hits WHERE created_at < now() - interval '1 day'`)
  } catch (e) {
    console.error('registration click failed:', e.message)
    return res.status(503).json({ error: 'db' })
  }
  res.status(204).end()
})

// Сводка для панели: переходы к регистрации по источникам за последние N дней.
// Источник — utm_source, иначе хост реферера, иначе «прямой».
app.get('/api/registration-clicks/summary', async (req, res) => {
  if (!bearerOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const days = Math.min(Math.max(Number.parseInt(String(req.query.days ?? '30'), 10) || 30, 1), 365)
  await ensureSchema()
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(utm_source, substring(referrer from '^https?://(?:www\\.)?([^/:]+)'), '(прямой)') AS source,
              count(*)::int AS clicks
         FROM registration_clicks
        WHERE created_at > now() - make_interval(days => $1)
        GROUP BY 1 ORDER BY clicks DESC, source LIMIT 10`,
      [days]
    )
    const { rows: totalRows } = await pool.query(
      `SELECT count(*)::int AS total FROM registration_clicks WHERE created_at > now() - make_interval(days => $1)`,
      [days]
    )
    res.json({ days, total: totalRows[0].total, sources: rows })
  } catch (e) {
    console.error('click summary failed:', e.message)
    res.status(500).json({ error: 'db' })
  }
})

app.get('/api/registration-clicks.csv', async (req, res) => {
  if (!bearerOk(req)) return res.status(401).json({ error: 'unauthorized' })
  await ensureSchema()
  try {
    const { rows } = await pool.query(
      `SELECT ${CLICK_COLUMNS.join(', ')} FROM registration_clicks ORDER BY created_at DESC LIMIT $1`,
      [ADMIN_ROWS_LIMIT]
    )
    sendCsv(res, CLICK_COLUMNS, rows, 'itecx-registration-clicks')
  } catch (e) {
    console.error('click csv export failed:', e.message)
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
