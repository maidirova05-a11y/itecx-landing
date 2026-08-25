/**
 * Full-bleed section photo with a dual scrim: a diagonal gradient so text on
 * the left/top stays readable, and a vertical fade so the section blends into
 * the flat-color sections above/below instead of ending in a hard photo edge.
 * `tone` should match whatever solid background the section used before
 * (var(--color-ink) or var(--color-surface)) so the seam is invisible.
 */
import { webpFor } from './webp'

export function PhotoBackdrop({
  src,
  objectPosition = 'center',
  tone = 'var(--color-ink)',
}: {
  src: string
  objectPosition?: string
  tone?: string
}) {
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
          background: `linear-gradient(105deg, ${tone} 22%, color-mix(in srgb, ${tone} 78%, transparent) 45%, color-mix(in srgb, ${tone} 40%, transparent) 75%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to top, ${tone} 0%, transparent 30%, transparent 78%, ${tone} 100%)` }}
      />
    </>
  )
}
