import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { SectionKicker } from './SectionKicker'

/** Kicker + h2 title (+ optional lead) — the opening of every section. */
export function SectionHeader({
  kicker,
  title,
  lead,
  align = 'left',
  className = '',
}: {
  kicker: ReactNode
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      <Reveal>
        <SectionKicker>{kicker}</SectionKicker>
      </Reveal>
      <Reveal delayMs={70}>
        <h2 className="section-title">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delayMs={140}>
          <p className={`mt-5 text-[17px] leading-relaxed text-text-muted ${centered ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}
