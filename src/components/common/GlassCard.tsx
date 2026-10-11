import type { ReactNode } from 'react'

/** Frosted card with a faint top light; `hover` adds the blue-rim lift. */
export function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>
}
