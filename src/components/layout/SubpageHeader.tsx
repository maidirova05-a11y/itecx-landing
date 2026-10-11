import type { ReactNode } from 'react'
import { Container } from './Container'
import { LangSwitcher } from './Navbar'
import { BrandMark } from '../common/BrandMark'
import { pathFor, useLanguage } from '../../i18n'

/**
 * Шапка отдельных страниц (/guide, /privacy). Навигация лендинга — якоря вида
 * #about, и с другой страницы они бы никуда не вели, поэтому здесь только
 * логотип, «На главную» и переключатель языка. `children` — дополнительные
 * действия справа (например, кнопка регистрации).
 */
export function SubpageHeader({ children }: { children?: ReactNode }) {
  const { lang, content } = useLanguage()
  const { privacy, ui } = content
  // Ссылки «домой» ведут на главную того же языка: /kk, /en или /
  const home = pathFor('home', lang)

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: 'var(--color-hairline)',
        background: 'color-mix(in srgb, var(--color-ink) 92%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Container className="flex h-20 items-center justify-between gap-4">
        <a href={home} className="press inline-flex items-center" aria-label="ITECX">
          <BrandMark size={44} fontSize={14} />
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <a href={home} className="press hidden text-[13.5px] text-text-muted hover:text-text sm:inline">
            ← {privacy.backHome}
          </a>
          <LangSwitcher ariaLabel={ui.langAria} />
          {children}
        </div>
      </Container>
    </header>
  )
}
