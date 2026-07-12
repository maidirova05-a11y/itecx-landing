import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { StarField } from '../common/StarField'
import { PhotoCard } from '../common/PhotoCard'
import { useContent } from '../../i18n'

export function Stages() {
  const { stages } = useContent()

  return (
    <section
      id="stages"
      className="relative overflow-hidden border-y py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
    >
      <StarField />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{stages.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-8">
          <Reveal delayMs={80} className="h-56 md:col-span-4 md:h-auto">
            <PhotoCard src="/images/stages.jpg" objectPosition="center 25%" className="h-full" />
          </Reveal>

          <div className="md:col-span-8">
            {stages.items.map((item, i) => (
              <Reveal key={item.step} delayMs={120 + i * 120}>
                <div
                  className="grid gap-3 border-t py-8 md:grid-cols-12 md:gap-6"
                  style={{ borderColor: 'var(--color-hairline)' }}
                >
                  <div className="md:col-span-1">
                    <span className="font-mono text-[13px]" style={{ color: 'var(--color-accent-soft)' }}>
                      {item.step}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-[20px] font-medium leading-snug tracking-tight text-text">{item.title}</h3>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-[15px] leading-relaxed text-text-muted">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="border-t" style={{ borderColor: 'var(--color-hairline)' }} />
          </div>
        </div>
      </Container>
    </section>
  )
}
