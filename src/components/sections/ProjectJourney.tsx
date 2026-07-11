import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { useContent } from '../../i18n'

export function ProjectJourney() {
  const { projectJourney } = useContent()

  return (
    <section className="py-24 md:py-32" style={{ background: 'var(--color-ink)' }}>
      <Container>
        <Reveal>
          <SectionKicker>{projectJourney.kicker}</SectionKicker>
        </Reveal>

        <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {projectJourney.steps.map((step, i) => (
            <li key={step}>
              <Reveal delayMs={(i % 4) * 70} className="h-full">
                <div
                  className="group relative h-full min-h-[110px] overflow-hidden rounded-lg border p-5"
                  style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-surface-1)' }}
                >
                  {/* Themed photo backdrop — kept dim under a gradient so the text
                      stays fully readable; brightens slightly on hover (opacity/transform only) */}
                  <img
                    src={`/images/step-${String(i + 1).padStart(2, '0')}.jpg`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.22] grayscale-[40%] group-hover:opacity-40 group-hover:scale-[1.04]"
                    style={{
                      transitionProperty: 'opacity, transform',
                      transitionDuration: '450ms',
                      transitionTimingFunction: 'var(--ease-out-soft)',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top right, color-mix(in srgb, var(--color-ink) 92%, transparent) 30%, color-mix(in srgb, var(--color-ink) 45%, transparent))',
                    }}
                  />
                  <div className="relative">
                    <span aria-hidden="true" className="font-mono text-[12px]" style={{ color: 'var(--color-accent-soft)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-2 text-[14.5px] leading-snug text-text">{step}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
