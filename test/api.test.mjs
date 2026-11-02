/**
 * Тесты API без реальной базы: проверяют валидацию, авторизацию, формат
 * ошибок и health. Pool в pg подключается лениво, а адрес базы здесь заведомо
 * недоступен (порт 1), поэтому любой код, дошедший до БД, получит отказ —
 * это и проверяется (health → 503).
 * Запуск: npm test
 */
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.DATABASE_URL = 'postgresql://u:p@127.0.0.1:1/none'
process.env.ADMIN_PASSWORD_HASH = 'scrypt:00:00' // заведомо негодный
process.env.TOKEN_SECRET = 'test-secret-'.padEnd(40, 'x')

const { default: app } = await import('../server/app.mjs')
const { validateApplication, pickAttribution, parseDays } = await import('../server/lib/validate.mjs')

let server
let base
before(async () => {
  await new Promise((r) => (server = app.listen(0, '127.0.0.1', r)))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

const post = (path, body, headers = {}) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const valid = { firstName: 'Айдар', lastName: 'Нур', email: 'A@Example.com', track: 'ITECX college' }

test('validateApplication: нормализует и принимает корректную заявку', () => {
  const r = validateApplication(valid)
  assert.equal(r.value.email, 'a@example.com')
})

test('validateApplication: коды ошибок', () => {
  assert.equal(validateApplication({ ...valid, firstName: '' }).error, 'required')
  assert.equal(validateApplication({ ...valid, email: 'nope' }).error, 'email')
  assert.equal(validateApplication({ ...valid, phone: 'abc' }).error, 'phone')
  assert.equal(validateApplication({ ...valid, track: 'x' }).error, 'track')
  assert.equal(validateApplication({ ...valid, message: 'x'.repeat(2001) }).error, 'too_long')
  assert.equal(validateApplication({ ...valid, firstName: { a: 1 } }).error, 'invalid')
  assert.equal(validateApplication([]).error, 'invalid')
})

test('pickAttribution: чистит метки, реферер без query, путь только с «/»', () => {
  const a = pickAttribution({
    utmSource: ' ya\u0000ndex ',
    utmMedium: { x: 1 },
    referrer: 'https://example.com/p?token=secret',
    landingPath: 'evil',
  })
  assert.equal(a.utm_source, 'yandex')
  assert.equal(a.utm_medium, null)
  assert.equal(a.referrer, 'https://example.com/p')
  assert.equal(a.landing_path, null)
  assert.equal(pickAttribution({ referrer: 'javascript:alert(1)' }).referrer, null)
})

test('parseDays: границы', () => {
  assert.equal(parseDays(undefined), 30)
  assert.equal(parseDays('9999'), 365)
  assert.equal(parseDays('-5'), 1)
})

test('POST /api/applications: чужой Origin → 403', async () => {
  const res = await post('/api/applications', valid, { Origin: 'https://evil.example' })
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'origin' })
})

test('POST /api/applications: невалидные данные → 400 с кодом', async () => {
  const res = await post('/api/applications', { ...valid, email: 'bad' })
  assert.equal(res.status, 400)
  assert.deepEqual(await res.json(), { error: 'email' })
})

test('POST /api/applications: honeypot → 200 без обращения к БД', async () => {
  const res = await post('/api/applications', { ...valid, _honey: 'bot' })
  assert.equal(res.status, 200)
})

test('битый JSON → 400 bad_request, без стека', async () => {
  const res = await post('/api/applications', '{oops')
  assert.equal(res.status, 400)
  assert.deepEqual(await res.json(), { error: 'bad_request' })
})

test('слишком большое тело → 413 too_large', async () => {
  const res = await post('/api/applications', { ...valid, message: 'x'.repeat(40_000) })
  assert.equal(res.status, 413)
  assert.deepEqual(await res.json(), { error: 'too_large' })
})

test('админские GET без токена → 401', async () => {
  for (const p of ['/api/applications', '/api/applications.csv', '/api/registration-clicks.csv', '/api/registration-clicks/summary']) {
    const res = await fetch(base + p)
    assert.equal(res.status, 401, p)
    assert.deepEqual(await res.json(), { error: 'unauthorized' })
  }
})

test('подделанный токен → 401', async () => {
  const res = await fetch(base + '/api/applications', {
    headers: { Authorization: `Bearer ${Date.now() + 1000}.${'ab'.repeat(32)}` },
  })
  assert.equal(res.status, 401)
})

test('неизвестный /api маршрут → 404 JSON', async () => {
  const res = await fetch(base + '/api/nope')
  assert.equal(res.status, 404)
  assert.deepEqual(await res.json(), { error: 'not_found' })
})

test('health: база недоступна → 503, ответ без деталей', async () => {
  const res = await fetch(base + '/api/health')
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { status: 'degraded', error: 'db' })
})

test('заголовки безопасности и no-store на /api', async () => {
  const res = await fetch(base + '/api/nope')
  assert.equal(res.headers.get('cache-control'), 'no-store')
  assert.equal(res.headers.get('x-frame-options'), 'DENY')
  assert.ok(res.headers.get('x-request-id'))
  assert.equal(res.headers.get('access-control-allow-origin'), null)
})
