/**
 * The full ITECX lockup — the big red X mark (two bowtie shapes meeting at a
 * center pinch point, redrawn as a vector so it's crisp and transparent) with
 * the "ITECX" wordmark layered in front, sitting in the X's narrow waist.
 * "Kazakhstan" tucks in as a flowing continuation off the wordmark's own
 * baseline (right-aligned under it), matching the official logo's lockup
 * rather than sitting as a separate centered caption.
 */
export function BrandMark({
  size = 80,
  fontSize,
  showTagline = false,
  className = '',
}: {
  size?: number
  fontSize?: number
  showTagline?: boolean
  className?: string
}) {
  const width = size
  const height = size * (520 / 420)
  const label = fontSize ?? size * 0.24

  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <svg viewBox="0 0 420 520" width={width} height={height} className="absolute inset-0" aria-hidden="true">
        <path d="M16,40 L118,40 L210,250 L404,460 L302,460 L210,250 Z" fill="#e31f2d" />
        <path d="M404,40 L302,40 L210,250 L16,460 L118,460 L210,250 Z" fill="#e31f2d" />
      </svg>
      <div className="absolute left-1/2 top-[46%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-end">
        <span
          className="whitespace-nowrap font-extrabold leading-none tracking-tight text-text"
          style={{ fontSize: label }}
        >
          ITEC<span style={{ color: '#e31f2d' }}>X</span>
        </span>
        {showTagline && (
          <span
            className="whitespace-nowrap font-medium italic leading-none text-white/85"
            style={{ fontSize: label * 0.38, marginTop: label * 0.08 }}
          >
            Kazakhstan
          </span>
        )}
      </div>
    </div>
  )
}
