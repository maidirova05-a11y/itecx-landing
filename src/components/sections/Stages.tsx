import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoCard } from '../common/PhotoCard'
import { useContent } from '../../i18n'

/**
 * Three stages on one glowing track: blue at the school end, red at the final —
 * the same blue→red journey as the hero. Desktop runs it horizontally, mobile
 * drops it into a vertical rail on the left.
 */
export function Stages() {
  const { stages } = useContent()
  const lastIndex = stages.items.length - 1

  return (
    <section id="stages" className="relative overflow-hidden py-24 md:py-32" style={{ background: 'var(--color-surface)' }}>
      <div aria-hidden="true" className="aura aura-blue left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2" />

      <Container className="relative">
        <SectionHeader kicker={stages.kicker} title={stages.title} />

        <div className="relative mt-14 pl-10 md:mt-20 md:pl-0">
          {/* The rail: vertical on mobile, horizontal through the nodes on desktop */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[13px] top-2 w-px md:hidden"
            style={{ background: 'linear-gradient(180deg, rgb(92 162 255 / 0.7), rgb(227 31 45 / 0.8))' }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[13px] hidden h-px md:block"
            style={{ background: 'linear-gradient(90deg, rgb(92 162 255 / 0.7), rgb(227 31 45 / 0.8))' }}
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {stages.items.map((item, i) => {
            const final = i === lastIndex
            return (
              <li key={item.step} className="relative">
                <Reveal delayMs={i * 140}>
                  <span
                    aria-hidden="true"
                    className="absolute -left-10 top-0 flex h-[27px] w-[27px] items-center justify-center rounded-full border md:static"
                    style={{
                      borderColor: final ? 'rgb(227 31 45 / 0.8)' : 'rgb(92 162 255 / 0.6)',
                      background: 'var(--color-surface)',
                      boxShadow: final ? '0 0 22px rgb(227 31 45 / 0.6)' : '0 0 18px rgb(92 162 255 / 0.45)',
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: final ? 'var(--color-accent)' : 'var(--color-glow)' }}
                    />
                  </span>
                  <p className="font-mono text-[12px] text-text-faint md:mt-7">{item.step}</p>
                  <h3 className="mt-2 text-[21px] font-medium leading-snug tracking-tight text-text">{item.title}</h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-text-muted">{item.text}</p>
                </Reveal>
              </li>
            )
          })}
          </ol>
        </div>

        <Reveal delayMs={200} className="mt-16 md:mt-20">
          <PhotoCard src="/images/stages.jpg" objectPosition="center 45%" className="h-64 sm:h-80">
            <p className="max-w-lg text-[15px] leading-relaxed text-text sm:text-[16px]">{stages.note}</p>
          </PhotoCard>
        </Reveal>
      </Container>
    </section>
  )
}
