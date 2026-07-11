import type { ReactNode } from 'react'

/**
 * Doubles as the section's real h2 — sized small on purpose (visual scale and
 * document heading level are independent), so screen-reader users still get a
 * correct outline while the design keeps its restrained "eyebrow" look.
 */
export function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <h2
      className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
      style={{ color: 'var(--color-accent-soft)' }}
    >
      {children}
    </h2>
  )
}
