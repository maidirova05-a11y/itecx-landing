import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoCard } from '../common/PhotoCard'
import { useContent } from '../../i18n'

export function About() {
  const { about } = useContent()

  return (
    <section id="about" className="relative overflow-hidden py-24 md:py-32">
      <div aria-hidden="true" className="aura aura-blue -left-40 top-10 h-[420px] w-[520px]" />

      <Container className="relative">
        <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10">
          <div className="md:col-span-7">
            <SectionHeader kicker={about.kicker} title={about.title} />
            <Reveal delayMs={140}>
              <p className="mt-4 font-mono text-[12px] leading-relaxed tracking-[0.04em] text-text-faint">
                {about.fullName}
              </p>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-text-muted">{about.text}</p>
            </Reveal>
          </div>

          <Reveal delayMs={200} className="md:col-span-5">
            <PhotoCard src="/images/about.jpg" objectPosition="center 40%" className="aspect-[4/3] md:aspect-[4/5]" />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
