import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BrandMark } from '../components/common/BrandMark'
import { GlassCard } from '../components/common/GlassCard'
import { fetchApplications, type ApplicationRow } from '../lib/db'
import { tryLogin, isLoggedIn, logout, getToken } from './auth'

const fieldClass =
  'w-full rounded-md border bg-transparent px-4 py-3 text-[15px] text-text placeholder:text-text-faint outline-none transition-colors duration-200'
const fieldStyle = {
  borderColor: 'var(--color-hairline-strong)',
  background: 'color-mix(in srgb, var(--color-surface-1) 70%, transparent)',
  transitionTimingFunction: 'var(--ease-micro)',
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [lockSeconds, setLockSeconds] = useState(0)
  const [busy, setBusy] = useState(false)

  // Тикающий счётчик блокировки
  useEffect(() => {
    if (lockSeconds <= 0) return
    const id = window.setInterval(() => setLockSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [lockSeconds > 0])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy || lockSeconds > 0) return
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    setBusy(true)
    const result = await tryLogin(password)
    setBusy(false)
    if (result.ok) {
      onSuccess()
      return
    }
    if (result.lockSeconds > 0) {
      setLockSeconds(result.lockSeconds)
      setError(null)
    } else {
      setError('Неверный пароль')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--color-ink)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandMark size={64} fontSize={17} />
        </div>
        <GlassCard className="p-7">
          <h1 className="text-[20px] font-medium text-text">Панель организатора</h1>
          <p className="mt-1 text-[13.5px] text-text-muted">Доступ только для команды ITECX</p>

          <form onSubmit={onSubmit} className="mt-6">
            <label htmlFor="admin-password" className="mb-2 block text-[13.5px] font-medium text-text">
              Пароль
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              disabled={lockSeconds > 0}
              className={fieldClass}
              style={fieldStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
            />

            {lockSeconds > 0 ? (
              <p role="alert" className="mt-3 text-[13px]" style={{ color: 'var(--color-accent-soft)' }}>
                Слишком много попыток. Подождите {lockSeconds} с.
              </p>
            ) : (
              error && (
                <p role="alert" className="mt-3 text-[13px]" style={{ color: 'var(--color-accent-soft)' }}>
                  {error}
                </p>
              )
            )}

            <button
              type="submit"
              disabled={busy || lockSeconds > 0}
              className="press mt-5 w-full rounded-full px-6 py-3 text-[14.5px] font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {busy ? 'Проверка…' : 'Войти'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-lg border px-5 py-4"
      style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface-1)' }}
    >
      <div className="font-mono text-[24px] font-semibold text-text">{value}</div>
      <div className="mt-1 text-[12.5px] text-text-muted">{label}</div>
    </div>
  )
}

function Dashboard() {
  const [rows, setRows] = useState<ApplicationRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [trackFilter, setTrackFilter] = useState<'all' | 'ITECX college' | 'ITECX academic'>('all')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchApplications(token))
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('401')
          ? 'Сессия истекла — войдите заново.'
          : 'Не удалось загрузить заявки. Проверьте, что API-сервер запущен (npm run server).'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (trackFilter !== 'all' && r.track !== trackFilter) return false
      if (!q) return true
      return [r.first_name, r.last_name, r.email, r.phone, r.organization, r.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, query, trackFilter])

  const college = rows?.filter((r) => r.track === 'ITECX college').length ?? 0
  const academic = rows?.filter((r) => r.track === 'ITECX academic').length ?? 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ink)' }}>
      <header
        className="sticky top-0 z-10 border-b"
        style={{
          borderColor: 'var(--color-hairline)',
          background: 'color-mix(in srgb, var(--color-ink) 92%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <BrandMark size={36} fontSize={11} />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">Заявки</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="press rounded-full border px-4 py-2 text-[13px] text-text disabled:opacity-50"
              style={{ borderColor: 'var(--color-hairline-strong)' }}
            >
              {loading ? 'Обновление…' : 'Обновить'}
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                window.location.reload()
              }}
              className="press rounded-full border px-4 py-2 text-[13px] text-text-muted hover:text-text"
              style={{ borderColor: 'var(--color-hairline)' }}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid grid-cols-3 gap-4">
          <StatChip label="Всего заявок" value={rows?.length ?? 0} />
          <StatChip label="ITECX college" value={college} />
          <StatChip label="ITECX academic" value={academic} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: имя, email, организация…"
            className={`${fieldClass} sm:max-w-xs`}
            style={fieldStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
          />
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as typeof trackFilter)}
            className={`${fieldClass} sm:max-w-[220px]`}
            style={{ ...fieldStyle, colorScheme: 'dark' }}
          >
            <option value="all">Все форматы</option>
            <option value="ITECX college">ITECX college</option>
            <option value="ITECX academic">ITECX academic</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="mt-6 text-[14px]" style={{ color: 'var(--color-accent-soft)' }}>
            {error}
          </p>
        )}

        <div
          className="mt-6 overflow-x-auto rounded-lg border"
          style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface-1)' }}
        >
          <table className="w-full min-w-[820px] text-left text-[13.5px]">
            <thead>
              <tr
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-faint"
                style={{ borderBottom: '1px solid var(--color-hairline)' }}
              >
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Формат</th>
                <th className="px-4 py-3 font-medium">Организация</th>
                <th className="px-4 py-3 font-medium">Комментарий</th>
                <th className="px-4 py-3 font-medium">CRM</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-faint">
                    {loading ? 'Загрузка…' : 'Заявок пока нет'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-text-muted">
                      {new Date(r.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {r.first_name} {r.last_name}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">{r.phone ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className="rounded-full border px-2.5 py-1 font-mono text-[11px]"
                        style={{
                          borderColor: 'var(--color-hairline-strong)',
                          color: r.track === 'ITECX college' ? 'var(--color-accent-soft)' : 'var(--color-text-muted)',
                        }}
                      >
                        {r.track}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.organization ?? '—'}</td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-text-muted" title={r.message ?? undefined}>
                      {r.message ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center" title={r.bitrix_deal_id ? `Сделка #${r.bitrix_deal_id}` : 'Не синхронизировано'}>
                      {r.bitrix_deal_id ? (
                        <span style={{ color: 'var(--color-accent-soft)' }}>✓</span>
                      ) : (
                        <span className="text-text-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export function AdminPage() {
  const [authed, setAuthed] = useState(() => isLoggedIn())
  return authed ? <Dashboard /> : <LoginScreen onSuccess={() => setAuthed(true)} />
}
