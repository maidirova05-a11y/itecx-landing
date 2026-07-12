import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { StarField } from '../common/StarField'
import { PhotoCard } from '../common/PhotoCard'
import { useContent } from '../../i18n'

export function Rules() {
  const { rules } = useContent()

  return (
    <section
      className="relative overflow-hidden border-y py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface)' }}
    >
      <StarField />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{rules.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 md:col-span-8">
            {rules.items.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 90}>
                <div className="border-t pt-5" style={{ borderColor: 'var(--color-hairline)' }}>
                  <h3 className="text-[17px] font-medium text-text">{item.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={200} className="h-56 md:col-span-4 md:h-auto">
            <PhotoCard src="/images/rules.jpg" objectPosition="center 30%" className="h-full" />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
