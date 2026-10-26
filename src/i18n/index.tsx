import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Content } from './ru'

export type Lang = 'ru' | 'kk' | 'en'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
]

/**
 * Словари грузятся по одному, отдельными чанками: посетителю /kk нужен только
 * казахский текст, а не все три языка разом (вместе они — около трети
 * клиентского бандла). main.tsx дожидается словаря первого рендера до
 * гидратации, а prerender.mjs кладёт в HTML modulepreload на его чанк, так что
 * лишнего сетевого шага нет. Остальные языки догружаются при переключении
 * (и заранее — при наведении/фокусе на переключатель, см. LangSwitcher).
 *
 * Пререндер (entry-server.tsx) регистрирует все три словаря синхронно через
 * registerDictionaries — на сервере ждать нечего.
 */
const dictionaries: Partial<Record<Lang, Content>> = {}

const DICTIONARY_LOADERS: Record<Lang, () => Promise<Content>> = {
  ru: () => import('./ru').then((m) => m.ru),
  kk: () => import('./kk').then((m) => m.kk),
  en: () => import('./en').then((m) => m.en),
}

const pendingDictionaries: Partial<Record<Lang, Promise<Content>>> = {}

export function registerDictionaries(d: Partial<Record<Lang, Content>>) {
  Object.assign(dictionaries, d)
}

/** Словарь языка: сразу, если уже загружен, иначе — один общий запрос чанка. */
export function loadDictionary(lang: Lang): Promise<Content> {
  const ready = dictionaries[lang]
  if (ready) return Promise.resolve(ready)
  pendingDictionaries[lang] ??= DICTIONARY_LOADERS[lang]().then(
    (c) => (dictionaries[lang] = c),
    (e) => {
      // Сеть моргнула — следующая попытка должна пойти заново, а не получить
      // тот же отклонённый промис.
      delete pendingDictionaries[lang]
      throw e
    },
  )
  return pendingDictionaries[lang]
}

/** Прогрев словаря заранее (наведение на переключатель языка). Ошибку глотаем:
 * при самом переключении загрузка всё равно повторится. */
export function preloadDictionary(lang: Lang) {
  loadDictionary(lang).catch(() => {})
}

/** Словарь, который обязан быть загружен к этому моменту. */
function dictionary(lang: Lang): Content {
  const c = dictionaries[lang]
  if (!c) throw new Error(`i18n: словарь «${lang}» ещё не загружен`)
  return c
}

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
export function readSavedLang(): Lang {
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

/** Страницы сайта: лендинг, руководство участника (/guide), политика
 * конфиденциальности (/privacy) и публичная оферта (/oferta).
 * Роутера в проекте нет — страница выбирается по pathname в main.tsx. */
export type Page = 'home' | 'guide' | 'privacy' | 'oferta'

const PAGE_PATH: Record<Page, string> = { home: '', guide: '/guide', privacy: '/privacy', oferta: '/oferta' }

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

/** title и description конкретной страницы поверх общих для сайта. */
export function seoForPage(c: Content, page: Page) {
  if (page === 'privacy') return { ...c.seo, ...c.privacy.seo }
  if (page === 'guide') return { ...c.seo, ...c.guide.seo }
  if (page === 'oferta') return { ...c.seo, ...c.oferta.seo }
  return c.seo
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
  const c = dictionary(lang)
  // У /guide и /privacy собственные title и description — иначе страница
  // показалась бы в выдаче и в превью мессенджеров как дубль лендинга.
  const seo = seoForPage(c, page)
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
  // Словарь сохранённого языка main.tsx загружает заранее, до гидратации, —
  // тогда подмена синхронная, как и раньше. Запасной путь (словаря почему-то
  // нет) — дождаться чанка и переключиться чуть позже.
  useIsomorphicLayoutEffect(() => {
    const initial = readSavedLang()
    const apply = () => setLangState((current) => (initial === current ? current : initial))
    if (dictionaries[initial]) apply()
    else loadDictionary(initial).then(apply, () => {})
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
    // Словарь обычно уже прогрет (наведение на переключатель) и готов сразу.
    const ready = loadDictionary(next)
    if (reduced) {
      ready.then(apply, () => {})
      return
    }
    // Fade out → swap dictionary → fade back in (double rAF so the new text
    // paints at opacity 0 before the fade-in transition starts). The swap waits
    // for both the 200ms fade and the dictionary chunk; if the chunk fails to
    // load, the page fades back in on the current language.
    setSwitching(true)
    const faded = new Promise((resolve) => window.setTimeout(resolve, 200))
    Promise.all([ready, faded]).then(
      () => {
        apply()
        requestAnimationFrame(() => requestAnimationFrame(() => setSwitching(false)))
      },
      () => setSwitching(false),
    )
  }

  return (
    <LanguageContext.Provider value={{ lang, switching, setLang, content: dictionary(lang) }}>
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
