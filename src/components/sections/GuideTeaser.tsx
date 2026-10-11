import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { webpFor } from '../common/webp'
import { pathFor, useLanguage } from '../../i18n'

/** Карточка-переход на /guide: шаги проекта и критерии живут там. */
export function GuideTeaser() {
  const { lang, content } = useLanguage()
  const { guideTeaser } = content

  return (
    <section id="criteria" className="relative py-16 md:py-24">
      <Container>
        <Reveal>
          <a
            href={pathFor('guide', lang)}
            className="card card-hover group relative grid overflow-hidden md:grid-cols-12"
          >
            <div className="relative z-10 p-8 sm:p-10 md:col-span-7 md:p-14">
              <SectionKicker>{guideTeaser.kicker}</SectionKicker>
              <h2 className="section-title max-w-xl">{guideTeaser.title}</h2>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-text-muted">{guideTeaser.text}</p>
              <span
                className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-white"
                style={{ background: 'var(--color-accent)', boxShadow: '0 0 32px rgb(227 31 45 / 0.35)' }}
              >
                {guideTeaser.cta}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  style={{ transitionTimingFunction: 'var(--ease-out-soft)' }}
                >
                  →
                </span>
              </span>
            </div>

            <div className="relative h-56 md:col-span-5 md:h-auto">
              <picture className="contents">
                <source srcSet={webpFor('/images/criteria.jpg')} type="image/webp" />
                <img
                  src="/images/criteria.jpg"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                  style={{ objectPosition: 'center 40%', transitionTimingFunction: 'var(--ease-out-soft)' }}
                />
              </picture>
              {/* Fade the photo into the card on the text side */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, var(--color-surface-1), transparent 40%), linear-gradient(to right, color-mix(in srgb, var(--color-surface-1) 90%, transparent), transparent 55%)',
                }}
              />
            </div>
          </a>
        </Reveal>
      </Container>
    </section>
  )
}
