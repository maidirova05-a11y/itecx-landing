import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import { ru, type Content } from './ru'
import { en } from './en'
import { kk } from './kk'

export type Lang = 'ru' | 'kk' | 'en'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
]

const dictionaries: Record<Lang, Content> = { ru, kk, en }

const STORAGE_KEY = 'itecx-lang'

interface LanguageContextValue {
  lang: Lang
  /** true while the 200ms fade-out runs before the dictionary swap */
  switching: boolean
  setLang: (next: Lang) => void
  content: Content
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const isLang = (v: unknown): v is Lang => v === 'ru' || v === 'kk' || v === 'en'

/** Язык из адреса: /kk и /kk/privacy — казахский, /en… — английский,
 * всё остальное — русский. Null на сервере.
 *
 * Именно он определяет ПЕРВЫЙ рендер: сборка запекает под каждый язык свой
 * HTML (index.kk.html и т.д.), и клиент обязан начать с того же словаря,
 * иначе гидратация не совпадёт с разметкой. */
export function langFromUrl(): Lang | null {
  try {
    const match = /^\/(kk|en)(\/|$)/.exec(window.location.pathname)
    if (match && isLang(match[1])) return match[1]
  } catch {
    /* нет window — SSR */
  }
  return null
}

/** Язык из старых ссылок вида ?lang=en. Раньше языковые версии жили на
 * параметре, такие ссылки могли разойтись — продолжаем их понимать. */
function legacyLangFromQuery(): Lang | null {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('lang')
    if (isLang(fromQuery)) return fromQuery
  } catch {
    /* нет window/URL — SSR */
  }
  return null
}

/** Приоритет источника языка: путь → устаревший ?lang → сохранённый выбор →
 * русский по умолчанию. */
function readSavedLang(): Lang {
  const fromUrl = langFromUrl() ?? legacyLangFromQuery()
  if (fromUrl) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage unavailable (privacy mode) — fall through to default */
  }
  return 'ru'
}

const SITE_URL = 'https://itecx.kz'

/** Страницы сайта: лендинг и политика конфиденциальности (/privacy).
 * Роутера в проекте нет — страница выбирается по pathname в main.tsx. */
export type Page = 'home' | 'privacy'

const PAGE_PATH: Record<Page, string> = { home: '', privacy: '/privacy' }

/**
 * Адрес страницы на нужном языке: / · /kk · /en/privacy и т.д.
 *
 * Язык живёт в пути, а не в ?lang: Vercel кеширует ответ по пути и параметр
 * запроса в ключ кеша не входит — из-за этого на / выдавалась случайная
 * языковая версия, какая попала в кеш первой. У отдельных путей такой
 * проблемы нет, и для поисковика это привычнее.
 */
export function pathFor(page: Page, lang: Lang): string {
  const prefix = lang === 'ru' ? '' : `/${lang}`
  return `${prefix}${PAGE_PATH[page]}` || '/'
}

function canonicalFor(lang: Lang, page: Page): string {
  return `${SITE_URL}${pathFor(page, lang)}`
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Синхронизирует title, description, canonical и OG/Twitter-теги с языком.
 * Google рендерит JS, поэтому эти правки видны краулеру; плюс корректное
 * превью в мессенджерах/соцсетях при шаринге страницы на нужном языке. */
function applySeo(lang: Lang, page: Page) {
  const c = dictionaries[lang]
  // У /privacy собственные title и description — иначе страница показалась бы
  // в выдаче и в превью мессенджеров как дубль лендинга.
  const seo = page === 'privacy' ? { ...c.seo, ...c.privacy.seo } : c.seo
  const url = canonicalFor(lang, page)
  document.documentElement.lang = lang
  document.title = seo.title

  upsertMeta('meta[name="description"]', 'name', 'description', seo.description)
  upsertMeta('meta[name="keywords"]', 'name', 'keywords', c.seo.keywords)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', seo.title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', seo.description)
  upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', c.seo.ogLocale)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url
}

/** На сервере (пререндер) useLayoutEffect не выполняется и React ругается —
 * там подменяем его на useEffect, который в SSR просто игнорируется. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function LanguageProvider({
  children,
  page = 'home',
  initialLang,
}: {
  children: ReactNode
  page?: Page
  /** Язык пререндера. Задаётся только на сервере (entry-server.tsx): в браузере
   * язык первого рендера берётся из ?lang= — ровно того параметра, по которому
   * сервер отдал соответствующий запечённый HTML. */
  initialLang?: Lang
}) {
  // Первый рендер обязан совпасть с запечённой разметкой: /?lang=kk отдаётся
  // из index.kk.html, поэтому и клиент стартует с казахского словаря. Без
  // параметра — русский, как в index.html.
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? langFromUrl() ?? 'ru')
  const [switching, setSwitching] = useState(false)

  // Сохранённый выбор языка (localStorage) применяем до первой отрисовки —
  // подмены текста на экране не видно. При заходе с ?lang= он уже учтён выше.
  useIsomorphicLayoutEffect(() => {
    const initial = readSavedLang()
    setLangState((current) => (initial === current ? current : initial))
  }, [])

  useEffect(() => {
    applySeo(lang, page)
    // Отражаем язык в адресе без перезагрузки — ссылку можно скопировать, и
    // она откроется сразу на нужном языке (сервер отдаст свой файл).
    // Заодно чистим устаревший ?lang, если пришли по старой ссылке.
    try {
      const target = pathFor(page, lang) + window.location.hash
      if (target !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, '', target)
      }
    } catch {
      /* history недоступна — не критично */
    }
  }, [lang, page])

  const setLang = (next: Lang) => {
    if (next === lang || switching) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const apply = () => {
      setLangState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* non-fatal */
      }
    }
    if (reduced) {
      apply()
      return
    }
    // Fade out → swap dictionary → fade back in (double rAF so the new text
    // paints at opacity 0 before the fade-in transition starts).
    setSwitching(true)
    window.setTimeout(() => {
      apply()
      requestAnimationFrame(() => requestAnimationFrame(() => setSwitching(false)))
    }, 200)
  }

  return (
    <LanguageContext.Provider value={{ lang, switching, setLang, content: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}

export function useContent(): Content {
  return useLanguage().content
}
