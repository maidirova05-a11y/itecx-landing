import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

interface Track {
  name: string
  age: string
  categories: readonly string[]
  participants: string
  structure: readonly string[]
}

function TrackCard({ track, delayMs }: { track: Track; delayMs: number }) {
  return (
    <Reveal delayMs={delayMs}>
      <GlassCard className="h-full p-8">
        <h3 className="font-mono text-[15px] tracking-tight" style={{ color: 'var(--color-accent-soft)' }}>
          {track.name}
        </h3>
        <p className="mt-2 text-[15px] text-text-muted">{track.age}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {track.categories.map((c) => (
            <span
              key={c}
              className="rounded-full border px-3 py-1 text-[12px] text-text-muted"
              style={{ borderColor: 'var(--color-hairline-strong)' }}
            >
              {c}
            </span>
          ))}
        </div>

        <p className="mt-6 text-[14.5px] leading-relaxed text-text-muted">{track.participants}</p>

        <div
          className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-6"
          style={{ borderColor: 'var(--color-hairline)' }}
        >
          {track.structure.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-[12.5px] text-text">{s}</span>
              {i < track.structure.length - 1 && (
                <span aria-hidden="true" className="text-text-faint">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </Reveal>
  )
}

export function Formats() {
  const { formats } = useContent()

  return (
    <section id="formats" className="relative overflow-hidden py-24 md:py-32">
      <PhotoBackdrop src="/images/formats.jpg" objectPosition="center 30%" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{formats.kicker}</SectionKicker>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
          <TrackCard track={formats.college} delayMs={80} />
          <TrackCard track={formats.academic} delayMs={180} />
        </div>
      </Container>
    </section>
  )
}
