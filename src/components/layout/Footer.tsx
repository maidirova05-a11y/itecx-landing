import { Container } from './Container'
import { BrandMark } from '../common/BrandMark'
import { pathFor, useLanguage } from '../../i18n'

export function Footer() {
  const { lang, content } = useLanguage()
  const { nav, footer, ui } = content

  return (
    <footer className="border-t py-14" style={{ borderColor: 'var(--color-hairline)', background: 'var(--color-ink)' }}>
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandMark size={64} fontSize={17} showTagline />
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-text-faint">{footer.tagline}</p>
        </div>

        <nav aria-label={ui.footerNavAria} className="flex flex-wrap gap-x-6 gap-y-3">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="press text-[13px] text-text-muted hover:text-text">
              {item.label}
            </a>
          ))}
          {/* Отдельная страница, а не якорь — отсюда единственный вход в неё для посетителя. */}
          <a href={pathFor('privacy', lang)} className="press text-[13px] text-text-faint hover:text-text">
            {ui.privacyLink}
          </a>
        </nav>
      </Container>
    </footer>
  )
}
