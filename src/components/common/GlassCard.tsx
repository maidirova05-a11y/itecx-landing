import type { ReactNode } from 'react'

/** Flat card on a surface step with a hairline; `hover` brightens the border. */
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
