import App from './App.tsx'
import { LanguageProvider } from './i18n'

/** Дерево лендинга — общее для гидратации в браузере (main.tsx) и для
 * пререндера при сборке (entry-server.tsx). Держим его в одном месте, чтобы
 * серверная и клиентская разметка не разъехались. */
export function AppRoot() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  )
}
