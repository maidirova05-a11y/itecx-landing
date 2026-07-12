import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { StarField } from '../common/StarField'
import { PhotoCard } from '../common/PhotoCard'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Format() {
  const { format } = useContent()

  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ background: 'var(--color-ink)' }}>
      <StarField />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{format.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-12 md:gap-8">
          <Reveal delayMs={60} className="h-56 md:col-span-5 md:h-auto">
            <PhotoCard src="/images/format.jpg" objectPosition="center 35%" className="h-full" />
          </Reveal>

          <div className="space-y-5 md:col-span-7">
            {format.items.map((item, i) => (
              <Reveal key={item.title} delayMs={140 + i * 100}>
                <GlassCard className="p-7">
                  <h3 className="text-[18px] font-medium leading-snug text-text">{item.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
