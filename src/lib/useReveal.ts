import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver that adds `.is-visible` the first time the
 * element scrolls into view, triggering the `.reveal` CSS transition
 * (transform/opacity only, premium cubic-bezier — see index.css).
 */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
