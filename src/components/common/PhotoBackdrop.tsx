/**
 * Full-bleed section photo under a heavy scrim: fades to `tone` at the top and
 * bottom so the section blends into its neighbours, and darkens toward the
 * left where the text sits.
 */
import { webpFor } from './webp'

export function PhotoBackdrop({
  src,
  objectPosition = 'center',
  tone = 'var(--color-ink)',
  strength = 0.82,
}: {
  src: string
  objectPosition?: string
  tone?: string
  /** 0–1: how much of the photo the side scrim hides */
  strength?: number
}) {
  const pct = Math.round(strength * 100)
  return (
    <>
      {/* display:contents у <picture> — чтобы обёртка не ломала абсолютное
          позиционирование самой картинки */}
      <picture className="contents">
        <source srcSet={webpFor(src)} type="image/webp" />
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(100deg, ${tone} 15%, color-mix(in srgb, ${tone} ${pct}%, transparent) 50%, color-mix(in srgb, ${tone} ${Math.round(pct * 0.45)}%, transparent))`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to top, ${tone}, transparent 35%, transparent 70%, ${tone})` }}
      />
    </>
  )
}
