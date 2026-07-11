import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Format() {
  const { format } = useContent()

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <PhotoBackdrop src="/images/format.jpg" objectPosition="center 35%" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{format.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-6">
          {format.items.map((item, i) => (
            <Reveal key={item.title} delayMs={i * 100}>
              <GlassCard className="h-full p-7">
                <h3 className="text-[18px] font-medium leading-snug text-text">{item.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
