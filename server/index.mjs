/**
 * Локальный / VPS-запуск: берём общее приложение из app.mjs,
 * добавляем раздачу собранного сайта и поднимаем HTTP-сервер.
 * (На Vercel этот файл не используется — там точка входа api/index.mjs.)
 */

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

const sendPage = (file) => (_req, res) =>
  res.sendFile(path.join(dist, file), { headers: { 'Cache-Control': HTML_CACHE } })

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
app.get('/admin', (_req, res) =>
  res.sendFile(path.join(dist, 'admin.html'), { headers: { 'Cache-Control': 'no-store' } })
)

// На VPS слушаем только 127.0.0.1 — наружу порт не торчит,
// внешний трафик заходит исключительно через nginx-прокси.
const PORT = process.env.PORT ?? '3001'
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(Number(PORT), HOST, () => console.log(`ITECX API on http://${HOST}:${PORT}`))
