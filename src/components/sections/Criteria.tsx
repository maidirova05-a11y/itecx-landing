import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { Dot } from '../common/Dot'
import { StarField } from '../common/StarField'
import { PhotoCard } from '../common/PhotoCard'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Criteria() {
  const { criteria } = useContent()

  return (
    <section id="criteria" className="relative overflow-hidden py-24 md:py-32" style={{ background: 'var(--color-ink)' }}>
      <StarField />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{criteria.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-center">
          <Reveal delayMs={80} className="md:col-span-7">
            <p className="text-balance text-[17px] leading-relaxed text-text-muted">{criteria.intro}</p>
          </Reveal>
          <Reveal delayMs={160} className="h-48 md:col-span-5 md:h-56">
            <PhotoCard src="/images/criteria.jpg" objectPosition="center 30%" className="h-full" />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {criteria.items.map((item, i) => (
            <Reveal key={item.title} delayMs={i * 80}>
              <GlassCard className="h-full p-7">
                <h3 className="text-[16.5px] font-medium leading-snug text-text">{item.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-text-muted">{item.text}</p>
                {item.aspects.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-hairline)' }}>
                    {item.aspects.map((aspect) => (
                      <li key={aspect} className="flex items-center gap-2 text-[13px] text-text-muted">
                        <Dot />
                        {aspect}
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
