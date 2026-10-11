/**
 * Страница /guide — руководство участника: 12 шагов создания проекта
 * (сгруппированы в три этапа) и 6 критериев оценки жюри.
 *
 * Текст живёт в словарях (ключи `guide`, `projectJourney`, `criteria`),
 * здесь только вёрстка. Визуальный язык — тот же, что у лендинга: дуга
 * планеты, синий → красный по мере приближения к финалу.
 */

import { Container } from '../components/layout/Container'
import { SubpageHeader } from '../components/layout/SubpageHeader'
import { Reveal } from '../components/common/Reveal'
import { SectionHeader } from '../components/common/SectionHeader'
import { SectionKicker } from '../components/common/SectionKicker'
import { PhotoCard } from '../components/common/PhotoCard'
import { pathFor, useLanguage } from '../i18n'
import { REGISTRATION_URL } from '../lib/registration'

const pad = (n: number) => String(n).padStart(2, '0')

/** Цвет этапа: первые два — синее свечение, последний (защита) — красный. */
const phaseTone = (i: number, total: number) =>
  i === total - 1
    ? { rgb: '227 31 45', solid: 'var(--color-accent)' }
    : { rgb: '92 162 255', solid: 'var(--color-glow)' }

const PHASE_PHOTOS = ['/images/mission.jpg', '/images/prepare.jpg', '/images/stages.jpg']

function RegisterButton({ label, className = '' }: { label: string; className?: string }) {
  return (
    <a
      href={REGISTRATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`press rounded-full px-7 py-3.5 text-[14px] font-medium text-white ${className}`}
      style={{ background: 'var(--color-accent)', boxShadow: '0 0 32px rgb(227 31 45 / 0.35)' }}
    >
      {label}
    </a>
  )
}

export function GuidePage() {
  const { lang, content } = useLanguage()
  const { guide, projectJourney, criteria, apply, privacy, ui } = content
  const home = pathFor('home', lang)
  const phases = projectJourney.phases

  // Сквозная нумерация шагов 01–12 через все этапы
  const phaseStart = phases.map((_, i) => phases.slice(0, i).reduce((n, p) => n + p.steps.length, 0))

  return (
    <div>
      <a href="#main-content" className="skip-link">
        {ui.skipLink}
      </a>

      <SubpageHeader>
        <a
          href={REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="press hidden whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium text-white lg:inline-flex"
          style={{ background: 'var(--color-accent)' }}
        >
          {ui.applyCta}
        </a>
      </SubpageHeader>

      <main id="main-content">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden pb-36 pt-20 md:pb-48 md:pt-28">
          <div aria-hidden="true" className="aura aura-blue left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2" />
          <svg
            aria-hidden="true"
            viewBox="0 0 420 520"
            className="pointer-events-none absolute right-[-60px] top-10 hidden h-[460px] opacity-[0.08] md:block"
          >
            <path d="M16,40 L118,40 L210,250 L404,460 L302,460 L210,250 Z" fill="#e31f2d" />
            <path d="M404,40 L302,40 L210,250 L16,460 L118,460 L210,250 Z" fill="#e31f2d" />
          </svg>
          <div aria-hidden="true" className="horizon top-[calc(100%-90px)] md:top-[calc(100%-120px)]" />

          <Container className="relative">
            <Reveal>
              <SectionKicker>{guide.kicker}</SectionKicker>
            </Reveal>
            <Reveal delayMs={70}>
              <h1 className="section-title max-w-3xl" style={{ fontSize: 'clamp(34px, 5.4vw, 64px)' }}>
                {guide.title}
              </h1>
            </Reveal>
            <Reveal delayMs={140}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-text-muted md:text-[18px]">{guide.lead}</p>
            </Reveal>
            <Reveal delayMs={210}>
              <nav aria-label={guide.kicker} className="mt-10 flex flex-wrap gap-3">
                {[
                  { href: '#steps', label: guide.stepsLink, n: projectJourney.phases.reduce((n, p) => n + p.steps.length, 0) },
                  { href: '#criteria', label: guide.criteriaLink, n: criteria.items.length },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="press card card-hover inline-flex items-center gap-3 rounded-full py-2.5 pl-2.5 pr-5 text-[14px] text-text"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-[12px]"
                      style={{ background: 'rgb(92 162 255 / 0.12)', color: 'var(--color-glow)' }}
                    >
                      {link.n}
                    </span>
                    {link.label}
                    <span aria-hidden="true" className="text-text-faint">
                      ↓
                    </span>
                  </a>
                ))}
              </nav>
            </Reveal>
          </Container>
        </section>

        {/* ---------- Steps, grouped into phases ---------- */}
        <section id="steps" className="relative scroll-mt-20 py-20 md:py-28">
          <Container>
            <SectionHeader kicker={projectJourney.kicker} title={projectJourney.title} />

            <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
              {phases.map((phase, pi) => {
                const tone = phaseTone(pi, phases.length)
                return (
                  <div key={phase.title} className="grid gap-8 md:grid-cols-12 md:gap-10">
                    <div className="md:col-span-4">
                      <div className="md:sticky md:top-28">
                        <Reveal>
                          <p className="font-mono text-[12px] uppercase tracking-[0.16em]" style={{ color: tone.solid }}>
                            {guide.phaseLabel} {pad(pi + 1)}
                          </p>
                          <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-text sm:text-[30px]">
                            {phase.title}
                          </h3>
                        </Reveal>
                        <Reveal delayMs={120} className="mt-6 hidden md:block">
                          <PhotoCard src={PHASE_PHOTOS[pi % PHASE_PHOTOS.length]} objectPosition="center 40%" className="aspect-[4/3]" />
                        </Reveal>
                      </div>
                    </div>

                    <ol className="relative md:col-span-8">
                      {/* Rail through the step markers */}
                      <span
                        aria-hidden="true"
                        className="absolute bottom-6 left-[19px] top-6 w-px"
                        style={{ background: `linear-gradient(180deg, rgb(${tone.rgb} / 0.7), rgb(${tone.rgb} / 0.15))` }}
                      />
                      {phase.steps.map((step, si) => {
                        const n = phaseStart[pi] + si + 1
                        return (
                          <li key={step.title} className="relative pb-4 pl-14 last:pb-0">
                            <Reveal delayMs={si * 70}>
                              {/* Reveal двигается transform-ом и становится точкой отсчёта
                                  для absolute, поэтому маркер сдвинут на ширину отступа li (pl-14) */}
                              <span
                                aria-hidden="true"
                                className="absolute -left-14 top-5 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[12px]"
                                style={{
                                  borderColor: `rgb(${tone.rgb} / 0.55)`,
                                  background: 'var(--color-ink)',
                                  color: tone.solid,
                                  boxShadow: `0 0 18px rgb(${tone.rgb} / 0.35)`,
                                }}
                              >
                                {pad(n)}
                              </span>
                              <div className="card card-hover p-5 sm:p-6">
                                <h4 className="text-[17px] font-medium leading-snug text-text">
                                  <span className="sr-only">{pad(n)}. </span>
                                  {step.title}
                                </h4>
                                <p className="mt-1.5 text-[14.5px] leading-relaxed text-text-muted">{step.hint}</p>
                              </div>
                            </Reveal>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* ---------- Criteria ---------- */}
        <section id="criteria" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
          <div aria-hidden="true" className="aura aura-red -right-40 top-10 h-[420px] w-[520px]" />
          <Container className="relative">
            <div className="grid gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <SectionHeader kicker={criteria.kicker} title={criteria.title} lead={criteria.intro} />
              </div>
              <Reveal delayMs={160} className="md:col-span-5">
                <PhotoCard src="/images/criteria.jpg" objectPosition="center 40%" className="aspect-[16/9]" />
              </Reveal>
            </div>

            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {criteria.items.map((item, i) => (
                <li key={item.title}>
                  <Reveal delayMs={(i % 3) * 90} className="h-full">
                    <div className="card card-hover relative h-full overflow-hidden p-7">
                      {/* Крупная полупрозрачная цифра в углу — декор */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 -top-6 select-none text-[120px] font-semibold leading-none"
                        style={{ color: 'rgb(255 255 255 / 0.035)' }}
                      >
                        {i + 1}
                      </span>
                      <span aria-hidden="true" className="font-mono text-[12px]" style={{ color: 'var(--color-accent-soft)' }}>
                        {pad(i + 1)}
                      </span>
                      <h3 className="mt-4 text-[19px] font-medium leading-snug text-text">{item.title}</h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
                      {item.aspects.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {item.aspects.map((aspect) => (
                            <li key={aspect} className="chip">
                              {aspect}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section className="relative overflow-hidden pb-40 pt-24 md:pb-52 md:pt-28">
          <div aria-hidden="true" className="horizon top-[calc(100%-110px)] md:top-[calc(100%-140px)]" />
          <Container className="relative text-center">
            <Reveal>
              <h2 className="section-title mx-auto max-w-2xl">{guide.ctaTitle}</h2>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-text-muted">{guide.ctaText}</p>
            </Reveal>
            <Reveal delayMs={160}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <RegisterButton label={apply.cta} className="px-9 py-4 text-[15px]" />
                <a
                  href={home}
                  className="press rounded-full border px-7 py-4 text-[14px] font-medium text-text"
                  style={{ borderColor: 'var(--color-hairline-strong)' }}
                >
                  ← {privacy.backHome}
                </a>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      <footer className="border-t py-10" style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-ink)' }}>
        <Container className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-text-faint">{privacy.rights}</p>
          <a href={pathFor('privacy', lang)} className="press text-[13px] text-text-muted hover:text-text">
            {ui.privacyLink}
          </a>
        </Container>
      </footer>
    </div>
  )
}
