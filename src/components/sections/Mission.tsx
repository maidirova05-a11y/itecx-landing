import type { ReactNode } from 'react'
import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { useContent } from '../../i18n'

const ICONS: ReactNode[] = [
  // Atom — research skills
  <>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)" />
  </>,
  // Globe — international exchange
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9S9.4 5.8 12 3Z" />
  </>,
  // Spark — innovation
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
]

export function Mission() {
  const { mission } = useContent()

  return (
    <section id="mission" className="relative overflow-hidden py-24 md:py-36">
      <PhotoBackdrop src="/images/mission.jpg" objectPosition="center 30%" strength={0.7} />

      <Container className="relative">
        <SectionHeader kicker={mission.kicker} title={mission.title} className="md:max-w-2xl" />

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-6">
          {mission.items.map((item, i) => (
            <Reveal key={item.title} delayMs={i * 100} className="h-full">
              <div className="card card-hover h-full p-7">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border"
                  style={{
                    borderColor: 'rgb(92 162 255 / 0.35)',
                    background: 'rgb(92 162 255 / 0.08)',
                    color: 'var(--color-glow)',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    {ICONS[i % ICONS.length]}
                  </svg>
                </span>
                <h3 className="mt-6 text-[19px] font-medium leading-snug text-text">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
