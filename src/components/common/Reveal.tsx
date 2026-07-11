import type { ReactNode } from 'react'
import { useReveal } from '../../lib/useReveal'

/** Wraps a block in the scroll-triggered `.reveal` transition (see index.css). */
export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  )
}
