import type { ComponentType } from 'react'
import { LanguageProvider, type Lang, type Page } from './i18n'

/** Дерево страницы — общее для гидратации в браузере (main.tsx) и для
 * пререндера при сборке (entry-server.tsx). Держим его в одном месте, чтобы
 * серверная и клиентская разметка не разъехались.
 *
 * Роутера в проекте нет: страницу выбирает вызывающий по pathname, а сборка
 * запекает каждую пару «страница × язык» в свой HTML-файл — index.html,
 * index.kk.html, privacy.en.html и т.д. (см. scripts/prerender.mjs).
 *
 * Компонент страницы передаётся снаружи, а не импортируется здесь: в браузере
 * каждая страница — свой чанк (src/pages.ts), и посетитель лендинга не качает
 * код руководства, политики и оферты (и наоборот). Пререндер передаёт те же
 * компоненты, импортированные статически. */
export function AppRoot({ page = 'home', lang, Page }: { page?: Page; lang?: Lang; Page: ComponentType }) {
  return (
    <LanguageProvider page={page} initialLang={lang}>
      <Page />
    </LanguageProvider>
  )
}
