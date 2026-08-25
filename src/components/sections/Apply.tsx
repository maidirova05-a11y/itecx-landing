import { useRef, useState, type FormEvent } from 'react'
import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'
import { insertApplication, RateLimitError } from '../../lib/db'

/** Email relay — резервная копия заявки на почту организаторов (основное
 * хранилище — PostgreSQL через наш API). Первая отправка потребует
 * одноразового подтверждения от formsubmit.co на этой почте. */
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/bajbosenovd@gmail.com'

/* Anti-spam: how long one browser must wait between submissions, and the
 * minimum time a human plausibly needs to fill the form (bots submit instantly). */
const COOLDOWN_MS = 60_000
const MIN_FILL_MS = 3_000
const COOLDOWN_KEY = 'itecx-apply-last'

type Status = 'idle' | 'sending' | 'success' | 'error'

interface Payload {
  firstName: string
  lastName: string
  email: string
  phone: string
  track: string
  organization: string
  message: string
}

async function sendEmailCopy(p: Payload): Promise<void> {
  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...p,
      _subject: `ITECX — новая заявка: ${p.firstName} ${p.lastName}`,
      _template: 'table',
      _captcha: 'false',
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

const fieldClass =
  'w-full rounded-md border bg-transparent px-4 py-3 text-[15px] text-text placeholder:text-text-faint outline-none transition-colors duration-200'

const fieldStyle = {
  borderColor: 'var(--color-hairline-strong)',
  background: 'color-mix(in srgb, var(--color-surface-1) 70%, transparent)',
  transitionTimingFunction: 'var(--ease-micro)',
}

export function Apply() {
  const { apply } = useContent()
  const [status, setStatus] = useState<Status>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)
  const mountedAt = useRef(Date.now())

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot: bots fill every field; humans never see this one.
    if (data.get('_honey')) return

    // Instant submits are bots — a human can't fill five fields this fast.
    if (Date.now() - mountedAt.current < MIN_FILL_MS) return

    // Per-browser cooldown between submissions.
    const last = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
    if (Date.now() - last < COOLDOWN_MS) {
      setValidationError(apply.cooldown)
      return
    }

    const firstName = String(data.get('firstName') ?? '').trim()
    const lastName = String(data.get('lastName') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const track = String(data.get('track') ?? '')

    if (!firstName || !lastName || !email || !track) {
      setValidationError(apply.required)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError(apply.invalidEmail)
      return
    }
    // Optional field, but if filled it should look like a phone number:
    // digits, spaces, dashes, parentheses, leading +; at least 6 digits total.
    if (phone && !/^\+?[\d\s\-()]{6,20}$/.test(phone)) {
      setValidationError(apply.invalidPhone)
      return
    }

    setValidationError(null)
    setStatus('sending')

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      track,
      organization: String(data.get('organization') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    }

    try {
      // Основное хранилище — PostgreSQL (через API); почтовая копия уходит
      // параллельно, её сбой не должен ломать отправку.
      await insertApplication(payload)
      void sendEmailCopy(payload).catch(() => {})
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      setStatus('success')
      form.reset()
    } catch (err) {
      if (err instanceof RateLimitError) {
        setStatus('idle')
        setValidationError(apply.cooldown)
      } else {
        setStatus('error')
      }
    }
  }

  return (
    <section
      id="apply"
      className="border-t py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <SectionKicker>{apply.kicker}</SectionKicker>
          </Reveal>

          <Reveal delayMs={70}>
            <h3 className="mt-6 text-[30px] font-medium leading-tight tracking-tight text-text sm:text-[36px]">
              {apply.title}
            </h3>
            <p className="mt-3 text-[16px] leading-relaxed text-text-muted">{apply.subtitle}</p>
          </Reveal>

          <Reveal delayMs={160} className="mt-10">
            <GlassCard className="p-6 sm:p-8">
              {status === 'success' ? (
                <div role="status" className="flex items-center gap-3 py-6 text-[16px] text-text">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    ✓
                  </span>
                  {apply.success}
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  {/* Honeypot — visually hidden, tab-unreachable */}
                  <input
                    type="text"
                    name="_honey"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="apply-first-name" className="mb-2 block text-[13.5px] font-medium text-text">
                        {apply.firstName} *
                      </label>
                      <input
                        id="apply-first-name"
                        name="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        placeholder={apply.firstNamePlaceholder}
                        className={fieldClass}
                        style={fieldStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-last-name" className="mb-2 block text-[13.5px] font-medium text-text">
                        {apply.lastName} *
                      </label>
                      <input
                        id="apply-last-name"
                        name="lastName"
                        type="text"
                        required
                        autoComplete="family-name"
                        placeholder={apply.lastNamePlaceholder}
                        className={fieldClass}
                        style={fieldStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-email" className="mb-2 block text-[13.5px] font-medium text-text">
                        {apply.email} *
                      </label>
                      <input
                        id="apply-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={apply.emailPlaceholder}
                        className={fieldClass}
                        style={fieldStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-phone" className="mb-2 block text-[13.5px] font-medium text-text">
                        {apply.phone}
                      </label>
                      <input
                        id="apply-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder={apply.phonePlaceholder}
                        className={fieldClass}
                        style={fieldStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="apply-track" className="mb-2 block text-[13.5px] font-medium text-text">
                      {apply.track} *
                    </label>
                    <select
                      id="apply-track"
                      name="track"
                      required
                      defaultValue=""
                      className={fieldClass}
                      style={{ ...fieldStyle, colorScheme: 'dark' }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                    >
                      <option value="" disabled>
                        {apply.trackPlaceholder}
                      </option>
                      <option value="ITECX college">{apply.trackCollege}</option>
                      <option value="ITECX academic">{apply.trackAcademic}</option>
                    </select>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="apply-org" className="mb-2 block text-[13.5px] font-medium text-text">
                      {apply.org}
                    </label>
                    <input
                      id="apply-org"
                      name="organization"
                      type="text"
                      autoComplete="organization"
                      placeholder={apply.orgPlaceholder}
                      className={fieldClass}
                      style={fieldStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                    />
                  </div>

                  <div className="mt-5">
                    <label htmlFor="apply-message" className="mb-2 block text-[13.5px] font-medium text-text">
                      {apply.message}
                    </label>
                    <textarea
                      id="apply-message"
                      name="message"
                      rows={4}
                      placeholder={apply.messagePlaceholder}
                      className={`${fieldClass} resize-y`}
                      style={fieldStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-hairline-strong)')}
                    />
                  </div>

                  {(validationError || status === 'error') && (
                    <p role="alert" className="mt-4 text-[13.5px]" style={{ color: 'var(--color-accent-soft)' }}>
                      {validationError ?? apply.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="press mt-7 w-full rounded-full px-7 py-3.5 text-[15px] font-medium text-white disabled:opacity-60 sm:w-auto"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    {status === 'sending' ? apply.sending : apply.submit}
                  </button>

                  {/* Согласие на обработку данных берётся в момент отправки — рядом с кнопкой,
                      а не только ссылкой в подвале, которую посетитель формы не увидит. */}
                  <p className="mt-4 text-[12.5px] leading-relaxed text-text-faint">
                    {apply.consentBefore}
                    <a
                      href="/privacy"
                      className="underline underline-offset-2 hover:text-text"
                      style={{ textDecorationColor: 'var(--color-hairline-strong)' }}
                    >
                      {apply.consentLink}
                    </a>
                    {apply.consentAfter}
                  </p>
                </form>
              )}
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
