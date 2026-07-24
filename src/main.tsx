import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n'

// Скрытый маршрут панели организатора: /admin. Ссылок на него на сайте нет,
// код панели лежит в отдельном чанке и посетителям лендинга не загружается.
const AdminPage = lazy(() => import('./admin/AdminPage').then((m) => ({ default: m.AdminPage })))
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

// Панель организатора не должна попадать в поисковую выдачу: перекрываем
// глобальный robots-тег на noindex именно для /admin (в robots.txt она тоже
// закрыта, но мета-тег — второй, надёжный барьер против индексации).
if (isAdmin) {
  const robots = document.querySelector('meta[name="robots"]') ?? document.head.appendChild(document.createElement('meta'))
  robots.setAttribute('name', 'robots')
  robots.setAttribute('content', 'noindex, nofollow')
  document.title = 'ITECX — Панель организатора'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    ) : (
      <LanguageProvider>
        <App />
      </LanguageProvider>
    )}
  </StrictMode>,
)
