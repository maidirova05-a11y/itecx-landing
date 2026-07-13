/**
 * Точка входа для Vercel: все запросы /api/* переписываются сюда (vercel.json),
 * Express-приложение работает как serverless-функция.
 */
import app from '../server/app.mjs'

export default app
