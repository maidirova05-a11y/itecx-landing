/**
 * Конфигурация из окружения: читаем и проверяем ОДИН раз при старте.
 * Нет обязательной переменной или значение явно неверное — падаем сразу с
 * понятным сообщением (имена переменных, но не их значения), а не при первом
 * запросе посетителя. Секреты живут только в env / server/.env (в git нет).
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { log } from './logger.mjs'

const dir = path.dirname(fileURLToPath(import.meta.url))
// Локально секреты лежат в server/.env; на Vercel файла нет — переменные
// приходят из панели, поэтому отсутствие файла не ошибка.
try {
  process.loadEnvFile?.(path.join(dir, '..', '.env'))
} catch {
  /* нет файла — работаем от process.env */
}

const env = process.env
const missing = ['DATABASE_URL', 'ADMIN_PASSWORD_HASH', 'TOKEN_SECRET'].filter((k) => !env[k])
if (missing.length) throw new Error(`Не заданы обязательные переменные: ${missing.join(', ')}`)

if (env.TOKEN_SECRET.length < 32) {
  log.warn('TOKEN_SECRET короткий — сгенерируйте `openssl rand -hex 32`', { area: 'security' })
}

let bitrixWebhookUrl = env.BITRIX_WEBHOOK_URL?.trim() || null
if (bitrixWebhookUrl) {
  try {
    if (new URL(bitrixWebhookUrl).protocol !== 'https:') throw new Error('not https')
  } catch {
    // Необязательная интеграция: кривой URL отключает её, но не роняет сайт.
    log.error('BITRIX_WEBHOOK_URL не https-адрес — интеграция с Bitrix24 отключена', { area: 'config' })
    bitrixWebhookUrl = null
  }
}

const bitrixCategoryId = Number(env.BITRIX_CATEGORY_ID ?? '17')
if (!Number.isInteger(bitrixCategoryId) || bitrixCategoryId < 0) {
  throw new Error('BITRIX_CATEGORY_ID должен быть целым неотрицательным числом')
}

export const config = Object.freeze({
  databaseUrl: env.DATABASE_URL,
  adminPasswordHash: env.ADMIN_PASSWORD_HASH,
  // Соль нужна только для устаревшего формата SHA-256; у scrypt она в самом хэше.
  adminSalt: env.ADMIN_SALT ?? 'itecx-admin-v1',
  tokenSecret: env.TOKEN_SECRET,
  bitrixWebhookUrl,
  bitrixCategoryId,
  dbSslVerify: env.DB_SSL_NO_VERIFY !== '1',
  isVercel: Boolean(env.VERCEL),
})
