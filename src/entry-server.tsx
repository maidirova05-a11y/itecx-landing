import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { AppRoot } from './AppRoot.tsx'
import { ru } from './i18n/ru'
import { en } from './i18n/en'
import { kk } from './i18n/kk'
import type { Content } from './i18n/ru'
import type { Lang, Page } from './i18n'

/** Отдаёт разметку страницы на нужном языке. Вызывается при сборке из
 * scripts/prerender.mjs — по файлу на каждую пару «страница × язык», чтобы
 * поисковику (и посетителю без JS) приходил готовый текст, а не пустой div. */
export function render(page: Page = 'home', lang: Lang = 'ru'): string {
  return renderToString(
    <StrictMode>
      <AppRoot page={page} lang={lang} />
    </StrictMode>,
  )
}

const SITE_URL = 'https://itecx.kz'
const OG_IMAGE = `${SITE_URL}/og-image.png`

const dictionaries: Record<Lang, Content> = { ru, kk, en }
const LANGS: Lang[] = ['ru', 'kk', 'en']
const PAGE_PATH: Record<Page, string> = { home: '/', privacy: '/privacy' }

/** Канонический адрес: русский — чистый путь, остальные языки — с ?lang.
 * Должен совпадать с canonicalFor() в i18n/index.tsx, иначе клиент после
 * гидратации перепишет canonical на другой адрес и поисковик увидит расхождение. */
function canonical(page: Page, lang: Lang): string {
  const path = PAGE_PATH[page]
  return lang === 'ru' ? `${SITE_URL}${path}` : `${SITE_URL}${path}?lang=${lang}`
}

/** Имя запечённого файла: русский — index.html / privacy.html (их отдают по
 * чистому адресу), остальные — index.kk.html и т.п. (см. vercel.json). */
function fileFor(page: Page, lang: Lang): string {
  const base = page === 'home' ? 'index' : 'privacy'
  return lang === 'ru' ? `${base}.html` : `${base}.${lang}.html`
}

function seoFor(page: Page, lang: Lang) {
  const c = dictionaries[lang]
  return page === 'privacy' ? { ...c.seo, ...c.privacy.seo } : c.seo
}

/** Общая для всех страниц «шапка» графа: организация и сайт. Ссылки по @id
 * связывают её со страницами, поэтому дублировать данные не нужно. */
function organizationGraph(lang: Lang) {
  const c = dictionaries[lang]
  return [
    {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: 'ITECX',
      alternateName: 'First Fibonacci International Congress on Engineering, Technology, and Mathematics',
      url: `${SITE_URL}/`,
      logo: OG_IMAGE,
      image: OG_IMAGE,
      description: c.seo.description,
      email: c.privacy.contacts.email,
      address: { '@type': 'PostalAddress', addressCountry: 'KZ' },
      areaServed: 'KZ',
      knowsLanguage: LANGS,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'admissions',
        email: c.privacy.contacts.email,
        availableLanguage: ['Russian', 'Kazakh', 'English'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'ITECX',
      inLanguage: LANGS,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ]
}

function pageGraph(page: Page, lang: Lang) {
  const c = dictionaries[lang]
  const url = canonical(page, lang)
  const seo = seoFor(page, lang)

  const webPage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: OG_IMAGE,
  }

  if (page === 'privacy') {
    return [
      webPage,
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: c.footer.name, item: canonical('home', lang) },
          { '@type': 'ListItem', position: 2, name: c.privacy.title, item: url },
        ],
      },
    ]
  }

  // FAQPage — то, из чего Google и Яндекс строят быстрые ответы в выдаче.
  // Вопросы обязаны быть видимы на самой странице: разметка повторяет секцию
  // «Частые вопросы» (components/sections/Faq.tsx) слово в слово.
  return [
    webPage,
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang,
      mainEntity: c.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]
}

/** Всё, что prerender.mjs подставляет в шаблон: одна запись — один HTML-файл. */
export interface PrerenderTarget {
  file: string
  page: Page
  lang: Lang
  title: string
  description: string
  keywords: string
  ogLocale: string
  /** og:locale:alternate — локали остальных языковых версий */
  ogLocaleAlternates: string[]
  canonical: string
  alternates: { hreflang: string; href: string }[]
  /** Готовое содержимое <script type="application/ld+json"> */
  jsonLd: string
}

export const targets: PrerenderTarget[] = (['home', 'privacy'] as Page[]).flatMap((page) =>
  LANGS.map((lang) => {
    const c = dictionaries[lang]
    const seo = seoFor(page, lang)
    return {
      file: fileFor(page, lang),
      page,
      lang,
      title: seo.title,
      description: seo.description,
      keywords: c.seo.keywords,
      ogLocale: c.seo.ogLocale,
      ogLocaleAlternates: LANGS.filter((l) => l !== lang).map((l) => dictionaries[l].seo.ogLocale),
      canonical: canonical(page, lang),
      alternates: [
        ...LANGS.map((l) => ({ hreflang: l, href: canonical(page, l) })),
        { hreflang: 'x-default', href: canonical(page, 'ru') },
      ],
      jsonLd: JSON.stringify(
        { '@context': 'https://schema.org', '@graph': [...organizationGraph(lang), ...pageGraph(page, lang)] },
        null,
        2,
      ).replace(/<\//g, '<\\/'),
    }
  }),
)
