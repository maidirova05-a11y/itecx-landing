import App from './App.tsx'
import { PrivacyPage } from './privacy/PrivacyPage.tsx'
import { LanguageProvider, type Lang, type Page } from './i18n'

/** Дерево страницы — общее для гидратации в браузере (main.tsx) и для
 * пререндера при сборке (entry-server.tsx). Держим его в одном месте, чтобы
 * серверная и клиентская разметка не разъехались.
 *
 * Роутера в проекте нет: страницу выбирает вызывающий по pathname, а сборка
 * запекает каждую пару «страница × язык» в свой HTML-файл — index.html,
 * index.kk.html, privacy.en.html и т.д. (см. scripts/prerender.mjs). */
export function AppRoot({ page = 'home', lang }: { page?: Page; lang?: Lang }) {
  return (
    <LanguageProvider page={page} initialLang={lang}>
      {page === 'privacy' ? <PrivacyPage /> : <App />}
    </LanguageProvider>
  )
}
