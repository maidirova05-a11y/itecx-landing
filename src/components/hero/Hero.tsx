import './Hero.css'
import { Container } from '../layout/Container'
import { StarField } from '../common/StarField'
import { useContent } from '../../i18n'

/* Same bowtie geometry as BrandMark (viewBox 420×520, waist at 210,250) —
   arms run at ±34° from vertical, which is the angle the beams settle on. */
const X_ARMS = [
  'M16,40 L118,40 L210,250 L404,460 L302,460 L210,250 Z',
  'M404,40 L302,40 L210,250 L16,460 L118,460 L210,250 Z',
]

const WORDMARK = ['I', 'T', 'E', 'C', 'X']

/**
 * Cinematic opening, driven entirely by CSS keyframes so it plays straight from
 * the prerendered HTML (no wait for hydration) and never replays on re-render:
 *
 *   1. the top of a planet rises out of the dark with a blue atmospheric glow;
 *   2. a red shaft of light shoots up from behind the horizon;
 *   3. it splits into two beams that scissor open into the ITECX "X";
 *   4. the solid mark lands, then the wordmark and the copy follow.
 *
 * Timings live in Hero.css. Reduced motion skips straight to the final frame.
 */
export function Hero() {
  const { hero } = useContent()

  return (
    <section id="top" className="hero relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-ink">
      <div aria-hidden="true" className="hero-sky">
        <StarField />
      </div>

      {/* Stage: the X lockup is centred here, the horizon sits on its bottom edge */}
      <div className="hero-stage relative flex min-h-[46svh] flex-1 items-center justify-center pb-8 pt-24">
        <div aria-hidden="true" className="hero-lockup">
          <div className="hero-shaft" />
          <div className="hero-beam hero-beam--a" />
          <div className="hero-beam hero-beam--b" />
          <div className="hero-flash" />

          <svg viewBox="0 0 420 520" className="hero-x">
            <defs>
              <linearGradient id="hero-x-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff3b47" />
                <stop offset="0.5" stopColor="#e31f2d" />
                <stop offset="1" stopColor="#b3121e" />
              </linearGradient>
            </defs>
            {X_ARMS.map((d) => (
              <path key={d} d={d} fill="url(#hero-x-fill)" />
            ))}
          </svg>

          <div className="hero-wordmark">
            <span className="hero-wordmark-text">
              {WORDMARK.map((ch, i) => (
                <span
                  key={i}
                  className={`hero-letter${ch === 'X' ? ' is-accent' : ''}`}
                  style={{ animationDelay: `calc(var(--t-word) + ${i * 85}ms)` }}
                >
                  {ch}
                </span>
              ))}
            </span>
            <span className="hero-tagline">Kazakhstan</span>
          </div>
        </div>
      </div>

      {/* Planet + copy. The planet's top edge is the horizon line of the stage. */}
      <div className="relative z-10">
        <div aria-hidden="true" className="hero-planet-wrap">
          <div className="hero-atmosphere" />
          <div className="hero-planet" />
        </div>

        <Container className="relative flex flex-col items-center pb-20 pt-14 text-center md:pb-24 md:pt-20">
          <span
            className="hero-copy inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted"
            style={{ borderColor: 'var(--color-hairline-strong)', animationDelay: 'var(--t-copy)' }}
          >
            {hero.eyebrow}
          </span>

          <h1
            className="hero-copy text-balance mt-6 max-w-3xl text-[30px] font-semibold leading-[1.12] tracking-tight text-text sm:text-[40px] md:text-[48px]"
            style={{ animationDelay: 'calc(var(--t-copy) + 100ms)' }}
          >
            {hero.title}
          </h1>

          <p
            className="hero-copy text-balance mt-5 max-w-xl text-[16px] leading-relaxed text-text-muted md:text-[17px]"
            style={{ animationDelay: 'calc(var(--t-copy) + 200ms)' }}
          >
            {hero.subtitle}
          </p>

          <div
            className="hero-copy mt-9 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: 'calc(var(--t-copy) + 300ms)' }}
          >
            <a
              href="#about"
              className="press rounded-full px-7 py-3.5 text-[14px] font-medium text-white"
              style={{ background: 'var(--color-accent)', boxShadow: '0 0 32px rgb(227 31 45 / 0.35)' }}
            >
              {hero.ctaPrimary}
            </a>
            <a
              href="#italy"
              className="press rounded-full border px-7 py-3.5 text-[14px] font-medium text-text"
              style={{
                borderColor: 'var(--color-hairline-strong)',
                background: 'color-mix(in srgb, var(--color-ink) 50%, transparent)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </Container>
      </div>
    </section>
  )
}
