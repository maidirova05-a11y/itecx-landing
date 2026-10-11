import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { useContent } from '../../i18n'

/**
 * Частые вопросы. Раскрывашки — нативные <details>, без состояния и JS:
 * ответы лежат в разметке всегда, поэтому их видят и краулеры (в том числе
 * Яндекс, который JS исполняет далеко не везде), и посетитель без скриптов.
 * Тот же текст уходит в JSON-LD FAQPage при сборке — см. entry-server.tsx.
 */
export function Faq() {
  const { faq } = useContent()

  return (
    <section id="faq" className="relative py-24 md:py-32" style={{ background: 'var(--color-surface)' }}>
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <SectionHeader kicker={faq.kicker} title={faq.title} lead={faq.subtitle} />
            </div>
          </div>

          <div className="space-y-3 md:col-span-8">
            {faq.items.map((item, i) => (
              <Reveal key={item.q} delayMs={i * 50}>
                <details className="card group open:border-[rgb(92_162_255_/_0.3)]" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 p-6 marker:content-[''] [&::-webkit-details-marker]:hidden">
                    <h3 className="text-[16.5px] font-medium leading-snug text-text sm:text-[17.5px]">{item.q}</h3>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[16px] leading-none transition-transform duration-300 group-open:rotate-45"
                      style={{
                        borderColor: 'rgb(227 31 45 / 0.45)',
                        color: 'var(--color-accent-soft)',
                        transitionTimingFunction: 'var(--ease-micro)',
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="-mt-1 max-w-2xl px-6 pb-6 pr-14 text-[15px] leading-relaxed text-text-muted">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
