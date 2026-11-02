/**
 * Валидация входных данных публичных эндпоинтов. Чистые функции без доступа к
 * БД и сети: принимают распарсенное тело, возвращают очищенное значение либо
 * код ошибки (он же уходит клиенту как `{ error: <код> }`).
 */

/** Поля атрибуции: имя колонки → максимальная длина. Единый источник для
 * схемы, приёма заявки и CSV. */
export const ATTRIBUTION_COLUMNS = {
  utm_source: 120,
  utm_medium: 120,
  utm_campaign: 120,
  utm_content: 120,
  utm_term: 120,
  referrer: 500,
  landing_path: 255,
}

export const TRACKS = ['ITECX college', 'ITECX academic']
export const CLICK_LANGS = new Set(['ru', 'kk', 'en'])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s\-()]{6,20}$/

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Строковое поле: undefined/null → '', любой не-строковый тип → null (ошибка).
 * Раньше String({}) тихо превращал объект в "[object Object]" и сохранял его. */
function text(v) {
  if (v == null) return ''
  return typeof v === 'string' ? v.trim() : null
}

/**
 * Проверка заявки. Возвращает { value } или { error }.
 * Коды ошибок: required | email | phone | track | too_long | invalid.
 */
export function validateApplication(b) {
  if (!isPlainObject(b)) return { error: 'invalid' }
  const fields = {
    firstName: text(b.firstName),
    lastName: text(b.lastName),
    email: text(b.email),
    phone: text(b.phone),
    track: text(b.track),
    organization: text(b.organization),
    message: text(b.message),
  }
  if (Object.values(fields).some((v) => v === null)) return { error: 'invalid' }
  const email = fields.email.toLowerCase()
  const { firstName, lastName, phone, track, organization, message } = fields

  if (!firstName || !lastName || !email || !track) return { error: 'required' }
  if (email.length > 254 || !EMAIL_RE.test(email)) return { error: 'email' }
  if (phone && !PHONE_RE.test(phone)) return { error: 'phone' }
  if (!TRACKS.includes(track)) return { error: 'track' }
  if ([firstName, lastName, organization].some((s) => s.length > 200) || message.length > 2000) {
    return { error: 'too_long' }
  }
  return { value: { firstName, lastName, email, phone, track, organization, message } }
}

/**
 * Нормализует поля атрибуции: обрезает до лимита колонки (это аналитика, а не
 * данные участника — лишнее лучше отрезать, чем отклонить заявку), убирает
 * управляющие символы, реферер сводит к схеме+хосту+пути (без query — там
 * бывают чужие токены), путь входа принимает только с «/». Не-строки
 * отбрасываются — иначе в БД и в UTM_SOURCE сделки уезжал бы «[object Object]».
 */
export function pickAttribution(b) {
  const clean = (v, max) =>
    (typeof v === 'string' ? v : '')
      // Управляющие символы вырезаются намеренно: метки уходят в CSV и в CRM.
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, max) || null

  let referrer = clean(b.referrer, 2000)
  if (referrer) {
    try {
      const u = new URL(referrer)
      referrer = /^https?:$/.test(u.protocol) ? `${u.origin}${u.pathname}`.slice(0, ATTRIBUTION_COLUMNS.referrer) : null
    } catch {
      referrer = null
    }
  }

  let landing_path = clean(b.landingPath, ATTRIBUTION_COLUMNS.landing_path)
  if (landing_path && !landing_path.startsWith('/')) landing_path = null

  return {
    utm_source: clean(b.utmSource, ATTRIBUTION_COLUMNS.utm_source),
    utm_medium: clean(b.utmMedium, ATTRIBUTION_COLUMNS.utm_medium),
    utm_campaign: clean(b.utmCampaign, ATTRIBUTION_COLUMNS.utm_campaign),
    utm_content: clean(b.utmContent, ATTRIBUTION_COLUMNS.utm_content),
    utm_term: clean(b.utmTerm, ATTRIBUTION_COLUMNS.utm_term),
    referrer,
    landing_path,
  }
}

/** Beacon «клик по ссылке регистрации»: язык и место кнопки — только из белого списка/шаблона. */
export function pickClick(b) {
  return {
    lang: CLICK_LANGS.has(b.lang) ? b.lang : null,
    linkLocation:
      typeof b.linkLocation === 'string' && /^[a-z0-9-]{1,40}$/.test(b.linkLocation) ? b.linkLocation : null,
  }
}

/** Окно сводки в днях: 1..365, по умолчанию 30. */
export function parseDays(v) {
  return Math.min(Math.max(Number.parseInt(String(v ?? '30'), 10) || 30, 1), 365)
}
