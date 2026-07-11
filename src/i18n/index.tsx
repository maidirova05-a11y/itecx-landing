import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

function readSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'kk' || saved === 'en') return saved
  } catch {
    /* storage unavailable (privacy mode) — fall through to default */
  }
  return 'ru'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readSavedLang)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    document.documentElement.lang = lang
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
