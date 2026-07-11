import type { ReactNode } from 'react'

/** Frosted card used to keep content readable when a section has a photo backdrop. */
export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border ${className}`}
      style={{
        borderColor: 'var(--color-hairline-strong)',
        background: 'color-mix(in srgb, var(--color-surface-1) 88%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </div>
  )
}
