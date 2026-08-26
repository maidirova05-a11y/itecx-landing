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
const sendPage = (base, lang) => (_req, res) => res.sendFile(path.join(dist, `${base}.${lang}.html`))

for (const lang of ['kk', 'en']) {
  app.get(`/${lang}`, sendPage('index', lang))
  app.get(`/${lang}/privacy`, sendPage('privacy', lang))
}
app.get('/', sendPage('index', 'ru'))
app.get('/privacy', sendPage('privacy', 'ru'))

app.use(express.static(dist))
app.get('/admin', (_req, res) => res.sendFile(path.join(dist, 'admin.html')))

// На VPS слушаем только 127.0.0.1 — наружу порт не торчит,
// внешний трафик заходит исключительно через nginx-прокси.
const PORT = process.env.PORT ?? '3001'
const HOST = process.env.HOST ?? '127.0.0.1'
app.listen(Number(PORT), HOST, () => console.log(`ITECX API on http://${HOST}:${PORT}`))
