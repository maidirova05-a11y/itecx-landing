import { useEffect, useState } from 'react'
import { Container } from '../layout/Container'
import { CssEarth } from './CssEarth'
import { useContent } from '../../i18n'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'

export function Hero() {
  const { hero } = useContent()
  const reducedMotion = usePrefersReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      setMounted(true)
      return
    }
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  const revealStyle = (delayMs: number) =>
    reducedMotion
      ? { opacity: 1, transform: 'none' }
      : {
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(18px)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '900ms',
          transitionDelay: `${delayMs}ms`,
          transitionTimingFunction: 'var(--ease-out-premium)',
        }

  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden bg-ink pt-20">
      <Container className="grid min-h-[calc(100vh-5rem)] items-center gap-10 py-14 md:grid-cols-2 md:gap-8 md:py-0">
        <div className="relative z-10 order-2 md:order-1">
          <span
            className="inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted"
            style={{ borderColor: 'var(--color-hairline-strong)', ...revealStyle(0) }}
          >
            {hero.eyebrow}
          </span>

          <h1
            className="text-balance mt-6 max-w-xl text-[38px] font-semibold leading-[1.08] tracking-tight text-text sm:text-[50px] md:text-[56px]"
            style={revealStyle(90)}
          >
            {hero.title}
          </h1>

          <p className="text-balance mt-6 max-w-md text-[17px] leading-relaxed text-text-muted" style={revealStyle(190)}>
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4" style={revealStyle(290)}>
            <a href="#about" className="press rounded-full bg-text px-7 py-3.5 text-[14px] font-medium text-ink">
              {hero.ctaPrimary}
            </a>
            <a
              href="#italy"
              className="press rounded-full border px-7 py-3.5 text-[14px] font-medium text-text"
              style={{ borderColor: 'var(--color-hairline-strong)' }}
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="relative order-1 h-[320px] sm:h-[420px] md:order-2 md:h-[640px]">
          {/* Soft accent halo behind the planet, faded out well before the slot edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 70%)',
              filter: 'blur(42px)',
              opacity: mounted ? 1 : 0,
              transitionProperty: 'opacity',
              transitionDuration: '1400ms',
              transitionTimingFunction: 'var(--ease-out-premium)',
            }}
          />
          {/* Decorative rotating Earth — the "international final in Italy" fact it evokes
              is stated as text in the #italy section, so it's hidden from assistive tech. */}
          <div
            className="absolute inset-0"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(0.92)',
              transitionProperty: 'opacity, transform',
              transitionDuration: '1400ms',
              transitionTimingFunction: 'var(--ease-out-premium)',
            }}
          >
            <CssEarth />
          </div>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--color-ink))' }}
      />
    </section>
  )
}
