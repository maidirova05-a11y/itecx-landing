import { Container } from '../layout/Container'
import { Reveal } from '../common/Reveal'
import { SectionKicker } from '../common/SectionKicker'
import { Dot } from '../common/Dot'
import { PhotoBackdrop } from '../common/PhotoBackdrop'
import { GlassCard } from '../common/GlassCard'
import { useContent } from '../../i18n'

export function VisionMission() {
  const { vision } = useContent()

  return (
    <section
      id="vision"
      className="relative overflow-hidden border-y py-24 md:py-32"
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      <PhotoBackdrop src="/images/vision.jpg" objectPosition="center 30%" />

      <Container className="relative">
        <Reveal>
          <SectionKicker>{vision.kicker}</SectionKicker>
        </Reveal>

        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-7" delayMs={80}>
            <h3
              className="text-[26px] font-medium leading-snug tracking-tight text-text sm:text-[30px]"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55)' }}
            >
              {vision.visionTitle}
            </h3>
            <p
              className="text-balance mt-5 max-w-xl text-[18px] leading-relaxed text-text"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
            >
              {vision.visionText}
            </p>
          </Reveal>

          <Reveal className="md:col-span-5" delayMs={180}>
            <GlassCard className="p-8">
              <h3 className="text-[20px] font-medium text-text">{vision.missionTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{vision.missionIntro}</p>
              <ul className="mt-5 space-y-3">
                {vision.missionPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-[14.5px] leading-relaxed text-text-muted">
                    <Dot />
                    {point}
                  </li>
                ))}
              </ul>
              <p
                className="mt-5 border-t pt-5 text-[14px] leading-relaxed text-text-muted"
                style={{ borderColor: 'var(--color-hairline)' }}
              >
                {vision.missionClosing}
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
