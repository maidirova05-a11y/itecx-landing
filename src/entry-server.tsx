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

/**
 * Дата последнего содержательного изменения страницы, в формате sitemap
 * (YYYY-MM-DD).
 *
 * НЕ дата сборки. lastmod, который меняется на каждый деплой, поисковик
 * быстро перестаёт учитывать — он видит, что страница «менялась» десять раз
 * подряд без единой правки текста, и дальше игнорирует поле совсем. Поэтому
 * значение правится руками вместе с содержимым.
 *
 * Для политики это та же дата, что и `privacy.updatedDate` в словарях: один
 * документ не может быть обновлён в двух разных числах.
 */
const LAST_MODIFIED: Record<Page, string> = {
  home: '2026-08-17',
  privacy: '2026-08-17',
}

const dictionaries: Record<Lang, Content> = { ru, kk, en }
const LANGS: Lang[] = ['ru', 'kk', 'en']
const PAGE_PATH: Record<Page, string> = { home: '', privacy: '/privacy' }

/** Канонический адрес: / · /kk · /en/privacy. Должен совпадать с pathFor()
 * в i18n/index.tsx, иначе клиент после гидратации перепишет canonical на
 * другой адрес и поисковик увидит расхождение. */
function canonical(page: Page, lang: Lang): string {
  const prefix = lang === 'ru' ? '' : `/${lang}`
  return `${SITE_URL}${`${prefix}${PAGE_PATH[page]}` || '/'}`
}

/** Имя запечённого файла: русские версии — index.html и privacy.html, они
 * лежат по своим адресам и отдаются напрямую; остальные языки — index.kk.html
 * и т.п., на них ведут rewrites с /kk и /en. Языки разведены по разным путям,
 * поэтому правила ни с чем не конфликтуют. */
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
    {
      // Карточка как отдельный узел, с настоящими размерами. Поисковик не
      // возьмёт картинку в расширенный сниппет, пока не знает, что она
      // достаточно широкая, а лезть за байтами он может и не успеть.
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#primaryimage`,
      url: OG_IMAGE,
      contentUrl: OG_IMAGE,
      width: 1200,
      height: 630,
      caption: 'ITECX — международный научный конгресс',
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
    primaryImageOfPage: { '@id': `${SITE_URL}/#primaryimage` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    // Та же дата, что уходит в lastmod и что видит посетитель на политике.
    dateModified: LAST_MODIFIED[page],
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
      // Одна крошка — не пустая трата: именно из неё выдача строит
      // «itecx.kz › ITECX» вместо голого адреса, и на неё ссылается
      // хлебная крошка политики.
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: c.footer.name, item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang,
      isPartOf: { '@id': `${url}#webpage` },
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
  /** YYYY-MM-DD для <lastmod> в sitemap. */
  lastmod: string
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
      lastmod: LAST_MODIFIED[page],
    }
  }),
)

/**
 * sitemap.xml, собираемый из того же списка `targets`.
 *
 * Зачем генерировать, а не держать файл руками: прошлый public/sitemap.xml
 * перечислял только `/` и `/privacy`. Казахской и английской версий в нём не
 * было вообще — при том, что ради них и делался пререндер по файлу на язык.
 * Для hreflang правило простое: каждый языковой адрес должен быть отдельным
 * <url> и внутри перечислять все версии, включая себя. Иначе поисковик видит
 * группу из одной страницы и связь языков не выстраивается.
 *
 * Теперь адреса, hreflang и lastmod берутся ровно оттуда же, откуда их берут
 * сами HTML-файлы, — разъехаться им негде.
 */
export function buildSitemap(): string {
  const priority = (t: PrerenderTarget) => (t.page === 'home' ? '1.0' : '0.3')
  const changefreq = (t: PrerenderTarget) => (t.page === 'home' ? 'weekly' : 'yearly')

  const urls = targets
    .map((t) => {
      const alternates = t.alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
        .join('\n')
      return [
        '  <url>',
        `    <loc>${t.canonical}</loc>`,
        alternates,
        `    <lastmod>${t.lastmod}</lastmod>`,
        `    <changefreq>${changefreq(t)}</changefreq>`,
        `    <priority>${priority(t)}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}
