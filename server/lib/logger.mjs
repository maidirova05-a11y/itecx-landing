/**
 * Структурированный лог: одна JSON-строка на событие (stdout/stderr), чтобы
 * его можно было фильтровать в Vercel / docker logs / journald.
 * Секреты, пароли, токены и тела запросов сюда не передавать — только коды,
 * идентификаторы и тексты ошибок.
 */

const write = (level, msg, fields) => {
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...fields })
  if (level === 'error' || level === 'warn') console.error(line)
  else console.log(line)
}

/** Ошибку приводим к безопасным полям: сообщение и код, без стека и без тела. */
export const errFields = (e) => ({ err: e?.message ?? String(e), ...(e?.code ? { code: e.code } : {}) })

export const log = {
  info: (msg, fields = {}) => write('info', msg, fields),
  warn: (msg, fields = {}) => write('warn', msg, fields),
  error: (msg, fields = {}) => write('error', msg, fields),
}
