import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { Dot } from '../common/Dot'
import { StarField } from '../common/StarField'
import { PhotoCard } from '../common/PhotoCard'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Goals() {
  const { goals } = useContent()

  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ background: 'var(--color-ink)' }}>
      <StarField />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{goals.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {goals.groups.map((group, i) => (
            <Reveal key={group.title} delayMs={i * 120}>
              <GlassCard className="h-full p-8">
                <h3 className="text-[21px] font-medium leading-snug tracking-tight text-text">{group.title}</h3>
                <ul className="mt-6 space-y-4">
                  {group.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-text-muted">
                      <Dot />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          ))}
          <Reveal delayMs={240} className="h-56 md:h-auto">
            <PhotoCard src="/images/goals.jpg" objectPosition="center 35%" className="h-full" />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
