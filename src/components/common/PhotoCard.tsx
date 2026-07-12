/** Framed illustrative photo shown beside section content (decorative — hidden
 * from assistive tech, the surrounding text carries the meaning). */
export function PhotoCard({
  src,
  objectPosition = 'center',
  className = '',
}: {
  src: string
  objectPosition?: string
  className?: string
}) {
  return (
    <figure
      aria-hidden="true"
      className={`m-0 overflow-hidden rounded-lg border ${className}`}
      style={{ borderColor: 'var(--color-hairline)' }}
    >
      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition }} />
    </figure>
  )
}
