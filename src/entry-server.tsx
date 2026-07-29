import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { AppRoot } from './AppRoot.tsx'

/** Отдаёт разметку лендинга на русском — том языке, который readSavedLang()
 * возвращает без window (см. i18n/index.tsx), так что первый клиентский рендер
 * совпадёт с этой строкой. Вызывается один раз при сборке из
 * scripts/prerender.mjs. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <AppRoot />
    </StrictMode>,
  )
}
