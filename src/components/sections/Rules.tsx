import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Rules() {
  const { rules } = useContent()

  return (
    <section className="relative overflow-hidden border-y py-24 md:py-32" style={{ borderColor: 'var(--color-hairline)' }}>
      <PhotoBackdrop src="/images/rules.jpg" objectPosition="center 30%" tone="var(--color-surface)" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{rules.kicker}</SectionKicker>
        </Reveal>

        <Reveal delayMs={60} className="mt-10">
          <GlassCard className="px-6 py-2 sm:px-10">
            <div className="grid gap-x-8 gap-y-10 py-8 md:grid-cols-2">
              {rules.items.map((item) => (
                <div key={item.title} className="border-t pt-5" style={{ borderColor: 'var(--color-hairline)' }}>
                  <h3 className="text-[17px] font-medium text-text">{item.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  )
}
