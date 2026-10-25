export const REGISTRATION_URL = 'https://forms.gle/VxPersagmTDMprSz7'

/**
 * Маркетинговая атрибуция визита.
 *
 * При первом открытии сайта снимаем utm-метки из адреса, реферер и страницу
 * входа и держим их в sessionStorage до конца вкладки: посетитель ходит по
 * секциям и языковым версиям, адрес переписывается (history.replaceState в
 * i18n), и к моменту отправки заявки в URL меток уже нет. Отправляются вместе
 * с заявкой (lib/db.ts → POST /api/applications), сервер пишет их в колонки
 * utm_* / referrer / landing_path и в сделку Bitrix24.
 *
 * Хранилище может быть недоступно (приватный режим) — тогда метки живут только
 * в памяти этой загрузки страницы; заявка от этого не ломается.
 */
export interface Attribution {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrer?: string
  landingPath?: string
}

const STORAGE_KEY = 'itecx-attribution'
const UTM_KEYS: [keyof Attribution, string][] = [
  ['utmSource', 'utm_source'],
  ['utmMedium', 'utm_medium'],
  ['utmCampaign', 'utm_campaign'],
  ['utmContent', 'utm_content'],
  ['utmTerm', 'utm_term'],
]

let memory: Attribution | null = null

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Attribution) : null
  } catch {
    return null
  }
}

function fromLocation(): Attribution {
  const out: Attribution = {}
  try {
    const params = new URLSearchParams(window.location.search)
    for (const [key, param] of UTM_KEYS) {
      const value = params.get(param)?.trim()
      if (value) out[key] = value.slice(0, 120)
    }
    // Свой же сайт реферером не считаем — это переход между страницами.
    const ref = document.referrer
    if (ref && !ref.startsWith(window.location.origin)) out.referrer = ref.slice(0, 500)
    out.landingPath = (window.location.pathname + window.location.search).slice(0, 255)
  } catch {
    /* нет window — SSR; вернём пустой объект */
  }
  return out
}

/** Вызывается один раз при загрузке страницы (main.tsx). Уже сохранённые метки
 * не перезаписываются: первый визит в сессии — источник, остальное шум.
 * Исключение — визит с новыми utm-метками: он важнее сохранённого. */
export function captureAttribution(): void {
  const stored = readStored()
  const current = fromLocation()
  const hasUtm = UTM_KEYS.some(([key]) => current[key])
  const next = stored && !hasUtm ? stored : current
  memory = next
  try {
    if (next !== stored) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* хранилище недоступно — метки останутся в памяти */
  }
}

/** Метки для отправки с заявкой. Пустые поля опущены. */
export function getAttribution(): Attribution {
  const source = memory ?? readStored() ?? {}
  return Object.fromEntries(Object.entries(source).filter(([, v]) => typeof v === 'string' && v)) as Attribution
}

/**
 * Переходы к регистрации. Заявка заполняется во внешней Google-форме, куда
 * наши метки не доходят, поэтому при клике по любой ссылке на REGISTRATION_URL
 * отправляем на свой сервер лёгкий beacon: язык страницы, место кнопки
 * (data-reg-location) и метки атрибуции. Без имён и контактов; переход по
 * ссылке не задерживается — sendBeacon уходит в фоне даже при уходе со страницы.
 */
function sendRegistrationClick(link: HTMLAnchorElement): void {
  const lang = document.documentElement.lang.slice(0, 2)
  const linkLocation = link.dataset.regLocation ?? link.closest('section[id]')?.id ?? 'other'
  const payload = JSON.stringify({ lang, linkLocation, ...getAttribution() })
  try {
    const blob = new Blob([payload], { type: 'application/json' })
    if (navigator.sendBeacon?.('/api/registration-click', blob)) return
  } catch {
    /* sendBeacon недоступен — пробуем fetch ниже */
  }
  void fetch('/api/registration-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

/** Один делегированный слушатель на документ (main.tsx): ловит обычный клик и
 * открытие средней кнопкой мыши. */
export function trackRegistrationClicks(): void {
  const handler = (e: MouseEvent) => {
    if (e.type === 'auxclick' && e.button !== 1) return
    const target = e.target instanceof Element ? e.target : null
    const link = target?.closest<HTMLAnchorElement>('a[href]')
    if (link && link.href === REGISTRATION_URL) sendRegistrationClick(link)
  }
  document.addEventListener('click', handler, { capture: true })
  document.addEventListener('auxclick', handler, { capture: true })
}
