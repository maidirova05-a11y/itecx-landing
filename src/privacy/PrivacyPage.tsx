/**
 * Страница /privacy — политика конфиденциальности на трёх языках.
 *
 * Текст живёт в словарях (i18n/*.ts, ключ `privacy`), здесь только вёрстка.
 * Собственная шапка и подвал вместо общих: навигация лендинга — якоря вида
 * #about, и с отдельной страницы они бы никуда не вели.
 */

import { Container } from '../components/layout/Container'
import { LangSwitcher } from '../components/layout/Navbar'
import { BrandMark } from '../components/common/BrandMark'
import { GlassCard } from '../components/common/GlassCard'
import { Reveal } from '../components/common/Reveal'
import { SectionKicker } from '../components/common/SectionKicker'
import { Dot } from '../components/common/Dot'
import { useContent } from '../i18n'

/** Двузначный номер раздела для монопрефикса: 01, 02, … */
const num = (i: number) => String(i + 1).padStart(2, '0')

export function PrivacyPage() {
  const { privacy, ui } = useContent()
  const { sections, contacts } = privacy

  return (
    <div>
      <a href="#main-content" className="skip-link">
        {ui.skipLink}
      </a>

      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: 'var(--color-hairline)',
          background: 'color-mix(in srgb, var(--color-ink) 92%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <Container className="flex h-20 items-center justify-between gap-4">
          <a href="/" className="press inline-flex items-center" aria-label="ITECX">
            <BrandMark size={44} fontSize={14} />
          </a>

          <div className="flex items-center gap-3 sm:gap-4">
            <a href="/" className="press hidden text-[13.5px] text-text-muted hover:text-text sm:inline">
              ← {privacy.backHome}
            </a>
            <LangSwitcher ariaLabel={ui.langAria} />
          </div>
        </Container>
      </header>

      <main id="main-content" className="py-16 md:py-24" style={{ background: 'var(--color-ink)' }}>
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionKicker>{privacy.kicker}</SectionKicker>
            </Reveal>

            <Reveal delayMs={70}>
              <h1 className="mt-6 text-[34px] font-medium leading-tight tracking-tight text-text sm:text-[44px]">
                {privacy.title}
              </h1>

              <p
                className="mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted"
                style={{ borderColor: 'var(--color-hairline-strong)' }}
              >
                {privacy.updatedLabel}
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
                  ·
                </span>
                {privacy.updatedDate}
              </p>

              <p className="mt-6 text-[16.5px] leading-relaxed text-text-muted">{privacy.intro}</p>
            </Reveal>

            {/* Оглавление: документ длинный, без него читателю пришлось бы скроллить вслепую. */}
            <Reveal delayMs={140} className="mt-10">
              <GlassCard className="p-6 sm:p-7">
                <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-text-faint">
                  {privacy.tocTitle}
                </h2>
                <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {[...sections, { id: 'contacts', title: contacts.title }].map((section, i) => (
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

                    {section.paragraphs.map((text) => (
                      <p key={text} className="mt-4 text-[15.5px] leading-relaxed text-text-muted">
                        {text}
                      </p>
                    ))}

                    {section.items.length > 0 && (
                      <ul className="mt-5 space-y-3">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-text-muted">
                            <Dot />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </Reveal>
              ))}

              <Reveal>
                <section id="contacts" style={{ scrollMarginTop: '96px' }}>
                  <GlassCard className="p-7 sm:p-9">
                    <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color: 'var(--color-accent)' }}>
                      {num(sections.length)}
                    </p>

                    <h2 className="mt-3 text-[22px] font-medium tracking-tight text-text sm:text-[26px]">
                      {contacts.title}
                    </h2>
                    <p className="mt-4 text-[15.5px] leading-relaxed text-text-muted">{contacts.text}</p>

                    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                          {contacts.emailLabel}
                        </dt>
                        <dd className="mt-1.5">
                          <a
                            href={`mailto:${contacts.email}`}
                            className="press text-[15px] text-text hover:text-accent-soft"
                          >
                            {contacts.email}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
                          {contacts.siteLabel}
                        </dt>
                        <dd className="mt-1.5">
                          <a href="/" className="press text-[15px] text-text hover:text-accent-soft">
                            {contacts.site}
                          </a>
                        </dd>
                      </div>
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
          <p className="text-[13px] text-text-faint">{privacy.rights}</p>
          <a href="/" className="press text-[13px] text-text-muted hover:text-text">
            ← {privacy.backHome}
          </a>
        </Container>
      </footer>
    </div>
  )
}
