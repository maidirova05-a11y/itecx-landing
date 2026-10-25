/**
 * Авторизация админ-панели — серверная. Пароль уходит на POST /api/admin/login,
 * где сравнивается с SHA-256-хэшем (сам пароль нигде не хранится). Сервер
 * ограничивает перебор по IP и выдаёт HMAC-токен на 12 часов; токен живёт
 * в sessionStorage и прикладывается к запросам списка заявок.
 */

import { adminLogin } from '../lib/db'

const SESSION_KEY = 'itecx-admin-token'

export type LoginOutcome = { ok: true } | { ok: false; reason: 'invalid' | 'unavailable' } | { ok: false; reason: 'locked'; lockSeconds: number }

export async function tryLogin(password: string): Promise<LoginOutcome> {
  const result = await adminLogin(password)
  if (result.kind === 'ok') {
    try {
      sessionStorage.setItem(SESSION_KEY, result.token)
    } catch {
      return { ok: false, reason: 'unavailable' }
    }
    return { ok: true }
  }
  if (result.kind === 'locked') return { ok: false, reason: 'locked', lockSeconds: result.retryAfter }
  return { ok: false, reason: result.kind }
}

export function getToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

export function isLoggedIn(): boolean {
  const token = getToken()
  if (!token) return false
  const exp = Number(token.split('.')[0])
  return Number.isFinite(exp) && exp > Date.now()
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
