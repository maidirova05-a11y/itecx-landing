import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function About() {
  const { about } = useContent()

  return (
    <section
      id="about"
      className="relative overflow-hidden border-y py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      <PhotoBackdrop src="/images/about.jpg" objectPosition="center 40%" tone="var(--color-surface)" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{about.kicker}</SectionKicker>
        </Reveal>

        <Reveal delayMs={80}>
          <p
            className="text-balance mt-6 max-w-3xl text-[22px] font-medium leading-snug text-text sm:text-[26px]"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {about.fullName}
          </p>
        </Reveal>

        <Reveal delayMs={160}>
          <p
            className="mt-6 max-w-2xl text-[17px] leading-relaxed text-text"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}
          >
            {about.description}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {about.tracks.map((track, i) => (
            <Reveal key={track.name} delayMs={240 + i * 100}>
              <GlassCard className="h-full p-7">
                <h3 className="font-mono text-[13px] font-medium tracking-tight" style={{ color: 'var(--color-accent-soft)' }}>
                  {track.name}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{track.description}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={420}>
          <div className="mt-10 flex flex-wrap gap-3">
            {about.fill.map((item) => (
              <span
                key={item}
                className="rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text"
                style={{
                  borderColor: 'var(--color-hairline-strong)',
                  background: 'color-mix(in srgb, var(--color-surface-1) 70%, transparent)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delayMs={480}>
          <p
            className="text-balance mt-10 max-w-2xl text-[15px] leading-relaxed text-text-muted"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}
          >
            {about.closing}
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
