import { useEffect, useRef, useState } from 'react'
import { Container } from './Container'
import { BrandMark } from '../common/BrandMark'
import { LANGS, useLanguage } from '../../i18n'

/** Общий для лендинга и /privacy — переключатель один и тот же на обеих страницах. */
export function LangSwitcher({ ariaLabel }: { ariaLabel: string }) {
  const { lang, setLang } = useLanguage()
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: 'var(--color-hairline-strong)' }}
    >
      {LANGS.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLang(item.code)}
          aria-pressed={lang === item.code}
          className="press rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.08em]"
          style={{
            background: lang === item.code ? 'var(--color-text)' : 'transparent',
            color: lang === item.code ? 'var(--color-ink)' : 'var(--color-text-muted)',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Navbar() {
  const { content } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the mobile menu and returns focus to the toggle button.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300"
      style={{
        borderColor: scrolled || menuOpen ? 'var(--color-hairline)' : 'transparent',
        background:
          scrolled || menuOpen ? 'color-mix(in srgb, var(--color-ink) 92%, transparent)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        transitionTimingFunction: 'var(--ease-micro)',
      }}
    >
      <Container className="flex h-20 items-center justify-between gap-4">
        <a href="#top" className="press inline-flex items-center">
          <BrandMark size={44} fontSize={14} />
        </a>

        {/* gap сжимается на узких десктопах: шесть пунктов + переключатель языка +
            кнопка заявки едва помещаются в 1024px. whitespace-nowrap обязателен —
            без него flex сжимает ссылки и «О конгрессе» ломается на две строки. */}
        <nav
          aria-label={content.ui.mainNavAria}
          className="hidden items-center gap-4 lg:flex xl:gap-8"
        >
          {content.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="press whitespace-nowrap text-[13px] text-text-muted hover:text-text xl:text-[14px]"
              style={{ transitionProperty: 'color, transform' }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
          <LangSwitcher ariaLabel={content.ui.langAria} />
          <a
            href="#apply"
            className="press whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium text-white xl:px-5"
            style={{ background: 'var(--color-accent)' }}
          >
            {content.ui.applyCta}
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LangSwitcher ariaLabel={content.ui.langAria} />
          <button
            ref={menuButtonRef}
            type="button"
            className="press relative flex h-10 w-10 items-center justify-center rounded-full"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? content.ui.menuClose : content.ui.menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              aria-hidden="true"
              className="absolute h-[1.5px] w-5 bg-text"
              style={{
                transition: 'transform 220ms var(--ease-micro), opacity 220ms var(--ease-micro)',
                transform: menuOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-4px) rotate(0)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute h-[1.5px] w-5 bg-text"
              style={{
                transition: 'transform 220ms var(--ease-micro), opacity 220ms var(--ease-micro)',
                transform: menuOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(4px) rotate(0)',
              }}
            />
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        className="absolute inset-x-0 top-full border-b lg:hidden"
        style={{
          borderColor: 'var(--color-hairline)',
          background: 'color-mix(in srgb, var(--color-ink) 96%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          visibility: menuOpen ? 'visible' : 'hidden',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
          transitionProperty: 'opacity, transform, visibility',
          transitionDuration: '320ms',
          transitionTimingFunction: 'var(--ease-out-premium)',
          transitionDelay: menuOpen ? '0ms' : '0ms, 0ms, 260ms',
        }}
      >
        <Container className="flex flex-col gap-1 py-4">
          {content.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="press rounded-md px-2 py-3 text-[15px] text-text-muted hover:text-text"
              style={{
                transitionProperty: 'color, transform, opacity',
                opacity: menuOpen ? 1 : 0,
                transitionDelay: menuOpen ? `${80 + i * 40}ms` : '0ms',
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#apply"
            onClick={() => setMenuOpen(false)}
            className="press mt-2 rounded-full px-5 py-3 text-center text-[14px] font-medium text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            {content.ui.applyCta}
          </a>
        </Container>
      </div>
    </header>
  )
}
