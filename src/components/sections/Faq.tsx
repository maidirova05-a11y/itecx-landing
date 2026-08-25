import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
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
    <section
      id="faq"
      className="border-t py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-ink)' }}
    >
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <SectionKicker>{faq.kicker}</SectionKicker>
              <h3 className="mt-6 text-[28px] font-medium leading-tight tracking-tight text-text sm:text-[34px]">
                {faq.title}
              </h3>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-text-muted">{faq.subtitle}</p>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            {faq.items.map((item, i) => (
              <Reveal key={item.q} delayMs={i * 60}>
                <details
                  className="group border-b"
                  style={{ borderColor: 'var(--color-hairline)' }}
                  open={i === 0}
                >
                  <summary
                    className="press flex cursor-pointer list-none items-start justify-between gap-6 py-5 marker:content-['']"
                    style={{ transitionProperty: 'color' }}
                  >
                    <h4 className="text-[16.5px] font-medium leading-snug text-text sm:text-[17.5px]">{item.q}</h4>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[18px] leading-none transition-transform duration-300 group-open:rotate-45"
                      style={{ color: 'var(--color-accent)', transitionTimingFunction: 'var(--ease-micro)' }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-10 text-[15px] leading-relaxed text-text-muted">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
