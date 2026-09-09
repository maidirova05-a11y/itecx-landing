import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { GlassCard } from '../common/GlassCard'
import { pathFor, useLanguage } from '../../i18n'
import { REGISTRATION_URL } from '../../lib/registration'

export function Apply() {
  const { lang, content } = useLanguage()
  const { apply } = content

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
            <GlassCard className="flex flex-col items-center gap-5 p-6 text-center sm:p-8">
              <a
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="press w-full rounded-full px-7 py-3.5 text-[15px] font-medium text-white sm:w-auto"
                style={{ background: 'var(--color-accent)' }}
              >
                {apply.cta}
              </a>

              <p className="text-[12.5px] leading-relaxed text-text-faint">
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
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
