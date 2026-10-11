import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionHeader } from '../common/SectionHeader'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { useContent } from '../../i18n'

export function ItalyDeepDive() {
  const { italyStage } = useContent()

  return (
    <section id="italy" className="relative overflow-hidden py-28 md:py-40">
      <PhotoBackdrop src="/images/italy.jpg" objectPosition="center 55%" strength={0.62} />

      <Container className="relative">
        <SectionHeader kicker={italyStage.kicker} title={italyStage.title} />

        {/* Italian tricolour under the title */}
        <Reveal delayMs={120}>
          <div aria-hidden="true" className="mt-6 flex h-1 w-20 overflow-hidden rounded-full">
            <span className="flex-1" style={{ background: '#009246' }} />
            <span className="flex-1" style={{ background: '#f4f4f4' }} />
            <span className="flex-1" style={{ background: '#ce2b37' }} />
          </div>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal delayMs={180} className="md:col-span-6">
            <p className="max-w-lg text-[17px] leading-relaxed text-text" style={{ textShadow: '0 2px 18px rgb(0 0 0 / 0.6)' }}>
              {italyStage.text}
            </p>
          </Reveal>

          <Reveal delayMs={260} className="md:col-span-5 md:col-start-8">
            <div className="card p-7">
              <div className="flex items-center gap-4">
                {/* Эмблема Fibonacci International — организатора ITECX.
                    Название стоит рядом текстом, поэтому картинка декоративная. */}
                <img
                  src="/images/fibonacci.png"
                  alt=""
                  aria-hidden="true"
                  width={34}
                  height={52}
                  loading="lazy"
                  decoding="async"
                  className="h-[52px] w-auto shrink-0"
                  style={{ filter: 'drop-shadow(0 0 18px rgb(227 31 45 / 0.45))' }}
                />
                <h3 className="text-[18px] font-medium text-text">{italyStage.publicationTitle}</h3>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-text-muted">{italyStage.publication}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
