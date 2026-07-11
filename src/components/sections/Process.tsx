import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function Process() {
  const { process } = useContent()

  return (
    <section className="relative overflow-hidden border-y py-24 md:py-32" style={{ borderColor: 'var(--color-hairline)' }}>
      <PhotoBackdrop src="/images/process.jpg" objectPosition="center 35%" tone="var(--color-surface)" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{process.kicker}</SectionKicker>
        </Reveal>

        <Reveal delayMs={60} className="mt-10">
          <GlassCard className="px-6 py-2 sm:px-10">
            {process.items.map((item, i) => (
              <div
                key={item.step}
                className="grid gap-4 py-10 md:grid-cols-12 md:gap-8"
                style={i > 0 ? { borderTop: '1px solid var(--color-hairline)' } : undefined}
              >
                <div className="md:col-span-1">
                  <span className="font-mono text-[13px]" style={{ color: 'var(--color-accent-soft)' }}>
                    {item.step}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-[19px] font-medium leading-snug tracking-tight text-text">{item.title}</h3>
                </div>
                <div className="md:col-span-7">
                  <p className="text-[15px] leading-relaxed text-text-muted">{item.text}</p>
                  {item.support.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.support.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border px-3 py-1 text-[12px] text-text-muted"
                          style={{ borderColor: 'var(--color-hairline-strong)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </GlassCard>
        </Reveal>
      </Container>
    </section>
  )
}
