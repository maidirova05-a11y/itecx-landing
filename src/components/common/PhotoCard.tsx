import type { ReactNode } from 'react'
import { webpFor } from './webp'

/** Framed illustrative photo (decorative — hidden from assistive tech, the
 * surrounding text carries the meaning). Children render over the bottom fade. */
export function PhotoCard({
  src,
  objectPosition = 'center',
  className = '',
  children,
}: {
  src: string
  objectPosition?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <figure className={`photo m-0 ${className}`} aria-hidden={children ? undefined : true}>
      <picture className="contents">
        <source srcSet={webpFor(src)} type="image/webp" />
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition }}
        />
      </picture>
      {children && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1]"
            style={{ background: 'linear-gradient(to top, rgb(6 8 13 / 0.92), rgb(6 8 13 / 0.35) 55%, transparent)' }}
          />
          <figcaption className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">{children}</figcaption>
        </>
      )}
    </figure>
  )
}
