/**
 * Страница /oferta — публичная оферта ТОО «AZ GROUP LLC» на трёх языках.
 *
 * Текст живёт в словарях (i18n/*.ts, ключ `oferta`), здесь только вёрстка —
 * та же, что у политики конфиденциальности.
 */

import { Container } from '../components/layout/Container'
import { SubpageHeader } from '../components/layout/SubpageHeader'
import { GlassCard } from '../components/common/GlassCard'
import { Reveal } from '../components/common/Reveal'
import { SectionKicker } from '../components/common/SectionKicker'
import { Dot } from '../components/common/Dot'
import { pathFor, useLanguage } from '../i18n'

/** Двузначный номер раздела для монопрефикса: 01, 02, … */
const num = (i: number) => String(i + 1).padStart(2, '0')

export function OfertaPage() {
  const { lang, content } = useLanguage()
  const { oferta, privacy, ui } = content
  const { sections, details } = oferta
  // Ссылки «домой» ведут на главную того же языка: /kk, /en или /
  const home = pathFor('home', lang)

  return (
    <div>
      <a href="#main-content" className="skip-link">
        {ui.skipLink}
      </a>

      <SubpageHeader />

      <main id="main-content" className="py-16 md:py-24" style={{ background: 'var(--color-ink)' }}>
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionKicker>{oferta.kicker}</SectionKicker>
            </Reveal>

            <Reveal delayMs={70}>
              <h1 className="mt-6 text-[34px] font-medium leading-tight tracking-tight text-text sm:text-[44px]">
                {oferta.title}
              </h1>

              <p
                className="mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted"
                style={{ borderColor: 'var(--color-hairline-strong)' }}
              >
                {oferta.updatedLabel}
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
                  ·
                </span>
                {oferta.updatedDate}
              </p>

              <p className="mt-6 text-[16.5px] leading-relaxed text-text-muted">{oferta.intro}</p>
            </Reveal>

            {/* Оглавление: документ длинный, без него читателю пришлось бы скроллить вслепую. */}
            <Reveal delayMs={140} className="mt-10">
              <GlassCard className="p-6 sm:p-7">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-text-faint">
                  {oferta.tocTitle}
                </h2>
                <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {[...sections, details].map((section, i) => (
                    <li key={section.id} className="flex gap-3 text-[14px] leading-snug">
                      <span className="font-mono text-[12px] text-text-faint">{num(i)}</span>
                      <a href={`#${section.id}`} className="press text-text-muted hover:text-text">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            </Reveal>

            <div className="mt-16 space-y-14">
              {sections.map((section, i) => (
                <Reveal key={section.id}>
                  <section
                    id={section.id}
                    className="border-t pt-7"
                    style={{ borderColor: 'var(--color-hairline)', scrollMarginTop: '96px' }}
                  >
                    <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: 'var(--color-accent)' }}>
                      {num(i)}
                    </p>

                    <h2 className="mt-3 text-[22px] font-medium leading-snug tracking-tight text-text sm:text-[26px]">
                      {section.title}
                    </h2>

                    {section.blocks.map((block) =>
                      typeof block === 'string' ? (
                        <p key={block} className="mt-4 text-[15.5px] leading-relaxed text-text-muted">
                          {block}
                        </p>
                      ) : (
                        <ul key={block.join()} className="mt-4 space-y-3">
                          {block.map((item) => (
                            <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-text-muted">
                              <Dot />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </section>
                </Reveal>
              ))}

              <Reveal>
                <section id={details.id} style={{ scrollMarginTop: '96px' }}>
                  <GlassCard className="p-7 sm:p-9">
                    <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: 'var(--color-accent)' }}>
                      {num(sections.length)}
                    </p>

                    <h2 className="mt-3 text-[22px] font-medium tracking-tight text-text sm:text-[26px]">
                      {details.title}
                    </h2>

                    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                      {details.rows.map((row) => (
                        <div key={row.label}>
                          <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                            {row.label}
                          </dt>
                          <dd className="mt-1.5 break-words text-[15px] text-text">
                            {row.href ? (
                              <a
                                href={row.href}
                                className="press hover:text-accent-soft"
                                {...(row.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
                              >
                                {row.value}
                              </a>
                            ) : (
                              row.value
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </GlassCard>
                </section>
              </Reveal>
            </div>
          </div>
        </Container>
      </main>

      <footer
        className="border-t py-10"
        style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
      >
        <Container className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-text-faint">{oferta.rights}</p>
          <a href={home} className="press text-[13px] text-text-muted hover:text-text">
            ← {privacy.backHome}
          </a>
        </Container>
      </footer>
    </div>
  )
}
