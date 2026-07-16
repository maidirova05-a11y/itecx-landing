/**
 * Клиент ITECX API (server/index.mjs → локальный PostgreSQL, база `itecx`).
 * В dev запросы проксируются Vite на localhost:3001, в продакшене сайт и API
 * живут на одном origin.
 */

export interface ApplicationRow {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  track: string
  organization: string | null
  message: string | null
  /** ID сделки в Bitrix24, если синхронизация прошла успешно (иначе null). */
  bitrix_deal_id: string | null
}

export interface ApplicationInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  track: string
  organization: string
  message: string
}

export class RateLimitError extends Error {}

export async function insertApplication(input: ApplicationInput): Promise<void> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (res.status === 429) throw new RateLimitError('rate limit')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function adminLogin(password: string): Promise<{ token?: string; retryAfter?: number }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  const body = (await res.json().catch(() => ({}))) as { token?: string; retryAfter?: number }
  if (res.ok && body.token) return { token: body.token }
  return { retryAfter: body.retryAfter ?? 0 }
}

export async function fetchApplications(token: string): Promise<ApplicationRow[]> {
  const res = await fetch('/api/applications', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const body = (await res.json()) as { rows: ApplicationRow[] }
  return body.rows
}
