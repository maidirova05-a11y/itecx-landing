import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { pathFor, useLanguage } from '../../i18n'
import { REGISTRATION_URL } from '../../lib/registration'

/** Closing call to action: the hero's planet horizon and red X return as a bookend. */
export function Apply() {
  const { lang, content } = useLanguage()
  const { apply } = content

  return (
    <section id="apply" className="relative overflow-hidden pb-40 pt-24 md:pb-56 md:pt-32">
      {/* Faint X behind the copy */}
      <svg
        aria-hidden="true"
        viewBox="0 0 420 520"
        className="pointer-events-none absolute left-1/2 top-6 h-[420px] -translate-x-1/2 opacity-[0.07] md:h-[520px]"
      >
        <path d="M16,40 L118,40 L210,250 L404,460 L302,460 L210,250 Z" fill="#e31f2d" />
        <path d="M404,40 L302,40 L210,250 L16,460 L118,460 L210,250 Z" fill="#e31f2d" />
      </svg>
      <div aria-hidden="true" className="horizon top-[calc(100%-110px)] md:top-[calc(100%-150px)]" />

      <Container className="relative">
        <SectionHeader kicker={apply.kicker} title={apply.title} lead={apply.subtitle} align="center" />

        <Reveal delayMs={200}>
          <div className="mt-10 flex flex-col items-center gap-5 text-center">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="press w-full rounded-full px-9 py-4 text-[15px] font-medium text-white sm:w-auto"
              style={{ background: 'var(--color-accent)', boxShadow: '0 0 44px rgb(227 31 45 / 0.45)' }}
            >
              {apply.cta}
            </a>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-text-faint">
              {apply.consentBefore}
              <a
                href={pathFor('privacy', lang)}
                className="underline underline-offset-2 hover:text-text"
                style={{ textDecorationColor: 'var(--color-hairline-strong)' }}
              >
                {apply.consentLink}
              </a>
              {apply.consentAfter}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
