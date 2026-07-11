/**
 * ITECX API — тонкий слой между сайтом и локальным PostgreSQL.
 *
 * База: `itecx` (владелец itecx_app) — полностью изолирована от
 * ascora_education: у роли itecx_app отозвано даже право CONNECT к ней.
 *
 * Безопасность:
 *  - пароль администратора хранится ТОЛЬКО как SHA-256(соль::пароль);
 *  - вход выдаёт HMAC-токен с истечением (12 часов), секрет — в server/.env;
 *  - перебор пароля ограничен по IP (5 промахов → блокировка с ростом);
 *  - приём заявок ограничен по IP и по email (анти-спам).
 */

import express from 'express'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

// ---- конфигурация ----------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.loadEnvFile?.(path.join(__dirname, '.env'))

const {
  DATABASE_URL,
  ADMIN_PASSWORD_HASH,
  ADMIN_SALT = 'itecx-admin-v1',
  TOKEN_SECRET,
  PORT = '3001',
} = process.env

if (!DATABASE_URL || !ADMIN_PASSWORD_HASH || !TOKEN_SECRET) {
  console.error('server/.env неполон: нужны DATABASE_URL, ADMIN_PASSWORD_HASH, TOKEN_SECRET')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 5 })

// ---- утилиты ---------------------------------------------------------------

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS)
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(exp).digest('hex')
  return `${exp}.${sig}`
}

function verifyToken(token) {
  const [exp, sig] = String(token ?? '').split('.')
  if (!exp || !sig) return false
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

// Прогрессивная блокировка входа по IP
const loginFails = new Map()
function loginLockSeconds(ip) {
  const st = loginFails.get(ip)
  if (!st) return 0
  return Math.max(0, Math.ceil((st.lockedUntil - Date.now()) / 1000))
}
function registerLoginFail(ip) {
  const st = loginFails.get(ip) ?? { count: 0, lockedUntil: 0 }
  st.count += 1
  if (st.count % 5 === 0) {
    st.lockedUntil = Date.now() + 30_000 * 4 ** (st.count / 5 - 1)
  }
  loginFails.set(ip, st)
  return loginLockSeconds(ip)
}

// ---- приложение -------------------------------------------------------------

const app = express()
app.set('trust proxy', true)
app.use(express.json({ limit: '32kb' }))

app.post('/api/applications', async (req, res) => {
  const ip = req.ip ?? 'unknown'
  const b = req.body ?? {}

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

  try {
    await pool.query(
      `INSERT INTO applications (first_name, last_name, email, phone, track, organization, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [firstName, lastName, email, phone || null, track, organization || null, message || null]
    )
    res.json({ ok: true })
  } catch (e) {
    console.error('insert failed:', e.message)
    res.status(500).json({ error: 'db' })
  }
})

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip ?? 'unknown'
  const locked = loginLockSeconds(ip)
  if (locked > 0) return res.status(429).json({ error: 'locked', retryAfter: locked })

  const password = String(req.body?.password ?? '')
  if (sha256(`${ADMIN_SALT}::${password}`) === ADMIN_PASSWORD_HASH) {
    loginFails.delete(ip)
    return res.json({ token: issueToken() })
  }
  const lockSeconds = registerLoginFail(ip)
  res.status(401).json({ error: 'invalid', retryAfter: lockSeconds })
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

// Продакшен: раздаём собранный сайт из ../dist (в dev это делает Vite)
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/^\/(admin)?$/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// На проде (Forge) слушаем только 127.0.0.1 — наружу порт 3001 не торчит,
// внешний трафик заходит исключительно через nginx-прокси.
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(Number(PORT), HOST, () => console.log(`ITECX API on http://${HOST}:${PORT}`))
