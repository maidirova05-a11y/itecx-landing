/**
 * Клиент ITECX API (server/index.mjs → локальный PostgreSQL, база `itecx`).
 * В dev запросы проксируются Vite на localhost:3001, в продакшене сайт и API
 * живут на одном origin.
 */

import { getAttribution } from './registration'

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
  /** Маркетинговая атрибуция визита (см. lib/registration.ts); null, если меток не было. */
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  referrer: string | null
  landing_path: string | null
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
    // Метки источника (utm, реферер, страница входа) снимаются при первом
    // визите и уходят вместе с заявкой — сервер пишет их в БД и в Bitrix24.
    body: JSON.stringify({ ...input, ...getAttribution() }),
  })
  if (res.status === 429) throw new RateLimitError('rate limit')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

/** Итог попытки входа: токен, неверный пароль, блокировка перебора или сбой
 * сервера (5xx / сеть) — последнее не должно выглядеть как «неверный пароль». */
export type AdminLoginResult =
  | { kind: 'ok'; token: string }
  | { kind: 'invalid' }
  | { kind: 'locked'; retryAfter: number }
  | { kind: 'unavailable' }

export async function adminLogin(password: string): Promise<AdminLoginResult> {
  let res: Response
  try {
    res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
  } catch {
    return { kind: 'unavailable' }
  }
  const body = (await res.json().catch(() => ({}))) as { token?: string; retryAfter?: number }
  if (res.ok && body.token) return { kind: 'ok', token: body.token }
  if (res.status === 429) return { kind: 'locked', retryAfter: body.retryAfter || 60 }
  if (res.status >= 500 || res.ok) return { kind: 'unavailable' }
  return { kind: 'invalid' }
}

export async function fetchApplications(token: string): Promise<ApplicationRow[]> {
  const res = await fetch('/api/applications', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const body = (await res.json()) as { rows: ApplicationRow[] }
  return body.rows
}

/** CSV-выгрузка всех заявок (включая метки источника) — тот же токен, что и у списка. */
export async function fetchApplicationsCsv(token: string): Promise<Blob> {
  const res = await fetch('/api/applications.csv', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.blob()
}

export interface ClickSummary {
  days: number
  total: number
  sources: { source: string; clicks: number }[]
}

/** Переходы к регистрации (клики по ссылке на Google-форму) по источникам. */
export async function fetchClickSummary(token: string, days = 30): Promise<ClickSummary> {
  const res = await fetch(`/api/registration-clicks/summary?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as ClickSummary
}

/** CSV-выгрузка журнала переходов к регистрации. */
export async function fetchClicksCsv(token: string): Promise<Blob> {
  const res = await fetch('/api/registration-clicks.csv', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.blob()
}
