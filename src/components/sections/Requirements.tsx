import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoCard } from '../common/PhotoCard'
import { useContent } from '../../i18n'

export function Requirements() {
  const { requirements } = useContent()

  return (
    <section id="requirements" className="relative overflow-hidden py-24 md:py-32">
      <div aria-hidden="true" className="aura aura-blue -right-40 top-20 h-[420px] w-[520px]" />

      <Container className="relative">
        <SectionHeader kicker={requirements.kicker} title={requirements.title} />

        <div className="mt-12 grid gap-4 sm:grid-cols-3 md:gap-6">
          {requirements.items.map((item, i) => (
            <Reveal key={item.title} delayMs={i * 90} className="h-full">
              <div className="card card-hover h-full p-7">
                <p className="flex items-baseline gap-2" aria-hidden="true">
                  <span className="text-[52px] font-semibold leading-none tracking-tight text-text">{item.value}</span>
                  <span className="font-mono text-[13px] text-text-faint">{item.unit}</span>
                </p>
                <h3 className="mt-6 text-[18px] font-medium text-text">
                  {item.title}
                  {/* Число с единицей — для скринридера, визуально оно уже стоит выше */}
                  <span className="sr-only">
                    {' '}
                    — {item.value} {item.unit}
                  </span>
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-12 md:gap-6">
          <Reveal delayMs={120} className="h-56 md:col-span-5 md:h-auto">
            <PhotoCard src="/images/prepare.jpg" objectPosition="center 40%" className="h-full" />
          </Reveal>
          <div className="grid gap-4 md:col-span-7 md:gap-6">
            {requirements.rules.map((rule, i) => (
              <Reveal key={rule.title} delayMs={180 + i * 90} className="h-full">
                <div className="card h-full p-7">
                  <h3 className="text-[18px] font-medium text-text">{rule.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-muted">{rule.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
