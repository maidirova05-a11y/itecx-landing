import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoCard } from '../common/PhotoCard'
import { PathSteps } from '../common/PathSteps'
import { useContent } from '../../i18n'

const TRACK_PHOTOS = [
  { src: '/images/college.jpg', position: 'center 35%' },
  { src: '/images/academic.jpg', position: 'center 30%' },
]

export function Formats() {
  const { formats } = useContent()

  return (
    <section id="formats" className="relative overflow-hidden py-24 md:py-32">
      <div aria-hidden="true" className="aura aura-red -right-40 top-1/3 h-[420px] w-[520px]" />

      <Container className="relative">
        <SectionHeader kicker={formats.kicker} title={formats.title} />

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
          {formats.tracks.map((track, i) => (
            <Reveal key={track.name} delayMs={80 + i * 100} className="h-full">
              <article className="card card-hover flex h-full flex-col overflow-hidden">
                <PhotoCard
                  src={TRACK_PHOTOS[i].src}
                  objectPosition={TRACK_PHOTOS[i].position}
                  className="h-52 rounded-none border-0 sm:h-60"
                >
                  <span
                    className="rounded-full px-3 py-1 font-mono text-[12.5px] tracking-tight text-white"
                    style={{ background: 'rgb(6 8 13 / 0.6)', backdropFilter: 'blur(6px)' }}
                  >
                    {track.name}
                  </span>
                </PhotoCard>

                <div className="flex flex-1 flex-col p-7 sm:p-8">
                  <h3 className="text-[22px] font-medium leading-snug tracking-tight text-text">{track.audience}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{track.text}</p>
                  <PathSteps steps={track.path} className="mt-auto pt-8" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={200}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
              {formats.categoriesLabel}
            </span>
            {formats.categories.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
