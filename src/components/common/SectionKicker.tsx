import type { ReactNode } from 'react'

/** Small mono label with a glowing red point. Rendered as a <p>: the section's
 * real heading is the title that follows it (see SectionHeader). */
export function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>
}
