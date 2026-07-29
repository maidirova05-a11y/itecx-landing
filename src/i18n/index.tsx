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

/** Приоритет источника языка: ?lang в URL (shareable-ссылка для поисковика и
 * пользователя) → сохранённый выбор → русский по умолчанию. */
function readSavedLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (isLang(fromUrl)) return fromUrl
  } catch {
    /* нет window/URL — игнорируем */
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage unavailable (privacy mode) — fall through to default */
  }
  return 'ru'
}

const SITE_URL = 'https://itecx.kz'

/** Канонический адрес для языка: ru — чистый корень, остальные — с ?lang. */
function canonicalFor(lang: Lang): string {
  return lang === 'ru' ? `${SITE_URL}/` : `${SITE_URL}/?lang=${lang}`
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
function applySeo(lang: Lang) {
  const c = dictionaries[lang]
  const url = canonicalFor(lang)
  document.documentElement.lang = lang
  document.title = c.seo.title

  upsertMeta('meta[name="description"]', 'name', 'description', c.seo.description)
  upsertMeta('meta[name="keywords"]', 'name', 'keywords', c.seo.keywords)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', c.seo.title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', c.seo.description)
  upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', c.seo.ogLocale)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', c.seo.title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', c.seo.description)

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Первый рендер всегда русский — ровно то, что запёк пререндер
  // (scripts/prerender.mjs). Иначе при заходе по ?lang=en клиент нарисовал бы
  // английский поверх русской разметки и React отбросил бы её как несовпавшую.
  const [lang, setLangState] = useState<Lang>('ru')
  const [switching, setSwitching] = useState(false)

  // Настоящий язык (?lang= либо сохранённый) применяем до первой отрисовки,
  // поэтому подмены текста на экране не видно.
  useIsomorphicLayoutEffect(() => {
    const initial = readSavedLang()
    if (initial !== 'ru') setLangState(initial)
  }, [])

  useEffect(() => {
    applySeo(lang)
    // Отражаем язык в URL (?lang=…) без перезагрузки — ссылку можно
    // скопировать и она откроется сразу на нужном языке.
    try {
      const url = new URL(window.location.href)
      if (lang === 'ru') url.searchParams.delete('lang')
      else url.searchParams.set('lang', lang)
      window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    } catch {
      /* history недоступна — не критично */
    }
  }, [lang])

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
