/**
 * Локальный / VPS-запуск: берём общее приложение из app.mjs,
 * добавляем раздачу собранного сайта и поднимаем HTTP-сервер.
 * (На Vercel этот файл не используется — там точка входа api/index.mjs.)
 */

import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import app from './app.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Долгоживущий процесс (в отличие от serverless-функции на Vercel) — одна
// необработанная ошибка способна убить Node и положить сайт для всех до
// ручного перезапуска. Логируем и продолжаем работу вместо падения.
process.on('unhandledRejection', (err) => {
  console.error('[process] unhandled rejection:', err)
})
process.on('uncaughtException', (err) => {
  console.error('[process] uncaught exception:', err)
})

// Продакшен: раздаём собранный сайт из ../dist (в dev это делает Vite)
const dist = path.join(__dirname, '..', 'dist')

// Языковые версии — отдельные запечённые файлы (см. scripts/prerender.mjs):
// /kk отдаёт index.kk.html, /en/privacy — privacy.en.html, чистые адреса —
// русские версии. Должно стоять ДО express.static.
//
// Кеширование:
//  - /assets/* — файлы с хэшем содержимого в имени (Vite): новое содержимое =
//    новое имя, поэтому браузеру можно хранить их год и не перепроверять;
//  - HTML — no-cache: браузер каждый раз сверяет ETag (дёшево, 304), иначе
//    после деплоя посетитель получал бы старую страницу со ссылками на уже
//    удалённые чанки;
//  - остальное из public/ (фото, текстура, иконки, robots.txt) — без хэша в
//    имени, поэтому кешируем умеренно: сутки.
const HTML_CACHE = 'no-cache'
const ASSET_CACHE = 'public, max-age=31536000, immutable'
const PUBLIC_CACHE = 'public, max-age=86400'

const cacheFor = (rel) =>
  rel.startsWith('assets/') ? ASSET_CACHE : rel.endsWith('.html') ? HTML_CACHE : PUBLIC_CACHE

/*
 * Заранее сжатые копии (file.br / file.gz кладёт scripts/prerender.mjs).
 * Сжимать на лету каждый ответ — это CPU на каждый запрос: под нагрузкой
 * GET / упирался в brotli, а не в сеть. Готовые копии отдаются как есть;
 * middleware compression (server/app.mjs) видит Content-Encoding и второй
 * раз не жмёт. Список файлов — снимок dist на старте: искать по нему
 * безопаснее, чем собирать путь к файлу из адреса запроса.
 */
const precompressed = new Set()
for (const entry of readdirSync(dist, { recursive: true })) {
  const rel = String(entry).split(path.sep).join('/')
  if (rel.endsWith('.br') || rel.endsWith('.gz')) precompressed.add(rel)
}
const ENCODINGS = [
  ['br', '.br'],
  ['gzip', '.gz'],
]

/** Отдаёт файл из dist (rel — путь относительно dist): сжатую копию, если
 * она есть и клиент её принимает, иначе сам файл. */
function sendDist(req, res, rel, cacheControl = cacheFor(rel)) {
  const accept = String(req.headers['accept-encoding'] ?? '')
  const headers = { 'Cache-Control': cacheControl, Vary: 'Accept-Encoding' }
  for (const [encoding, ext] of ENCODINGS) {
    if (precompressed.has(rel + ext) && new RegExp(`\\b${encoding}\\b`).test(accept)) {
      // Тип — по исходному имени (send не перезапишет уже выставленный).
      res.type(path.extname(rel))
      return res.sendFile(path.join(dist, rel + ext), { headers: { ...headers, 'Content-Encoding': encoding } })
    }
  }
  return res.sendFile(path.join(dist, rel), { headers })
}

const sendPage = (file) => (req, res) => sendDist(req, res, file)

// Сжатые копии статики по прямым адресам (/, /assets/…, /sitemap.xml).
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  let rel
  try {
    rel = decodeURIComponent(req.path).replace(/^\/+/, '')
  } catch {
    return next()
  }
  if (rel === '' || rel.endsWith('/')) rel += 'index.html'
  if (!precompressed.has(rel + '.br') && !precompressed.has(rel + '.gz')) return next()
  sendDist(req, res, rel)
})

for (const lang of ['kk', 'en']) {
  app.get(`/${lang}`, sendPage(`index.${lang}.html`))
  app.get(`/${lang}/privacy`, sendPage(`privacy.${lang}.html`))
  app.get(`/${lang}/guide`, sendPage(`guide.${lang}.html`))
  app.get(`/${lang}/oferta`, sendPage(`oferta.${lang}.html`))
}
app.get('/privacy', sendPage('privacy.html'))
app.get('/guide', sendPage('guide.html'))
app.get('/oferta', sendPage('oferta.html'))

app.use(
  '/assets',
  express.static(path.join(dist, 'assets'), {
    immutable: true,
    maxAge: '1y',
    index: false,
  })
)
app.use(
  express.static(dist, {
    setHeaders: (res, file) =>
      res.setHeader('Cache-Control', file.endsWith('.html') ? HTML_CACHE : PUBLIC_CACHE),
  })
)
app.get('/admin', (req, res) => sendDist(req, res, 'admin.html', 'no-store'))

// На VPS слушаем только 127.0.0.1 — наружу порт не торчит,
// внешний трафик заходит исключительно через nginx-прокси.
const PORT = process.env.PORT ?? '3001'
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(Number(PORT), HOST, () => console.log(`ITECX API on http://${HOST}:${PORT}`))
