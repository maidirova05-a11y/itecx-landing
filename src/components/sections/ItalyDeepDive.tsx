import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { useContent } from '../../i18n'

export function ItalyDeepDive() {
  const { italyStage } = useContent()

  return (
    <section id="italy" className="relative overflow-hidden py-24 md:py-32">
      <PhotoBackdrop src="/images/italy.jpg" objectPosition="center 60%" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{italyStage.kicker}</SectionKicker>
        </Reveal>

        <Reveal delayMs={90}>
          <h3
            className="text-balance mt-6 max-w-3xl text-[32px] font-medium leading-tight tracking-tight text-text sm:text-[40px]"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
          >
            {italyStage.title}
          </h3>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
          <Reveal delayMs={180}>
            <p className="text-[16px] leading-relaxed text-text" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
              {italyStage.text}
            </p>
          </Reveal>
          <Reveal delayMs={260}>
            <p
              className="border-l pl-6 text-[16px] leading-relaxed text-text"
              style={{ borderColor: 'var(--color-hairline-strong)', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
            >
              {italyStage.publication}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
