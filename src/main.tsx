import { StrictMode, Suspense, lazy } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { AppRoot } from './AppRoot.tsx'

// Скрытый маршрут панели организатора: /admin. Ссылок на него на сайте нет,
// код панели лежит в отдельном чанке и посетителям лендинга не загружается.
const AdminPage = lazy(() => import('./admin/AdminPage').then((m) => ({ default: m.AdminPage })))
// На Vercel /admin переписывается на /admin.html (см. vercel.json), и адрес в
// строке браузера остаётся /admin. Прямой заход по /admin.html тоже должен
// открывать панель, а не лендинг.
const currentPath = window.location.pathname.replace(/\/+$/, '')
const isAdmin = currentPath === '/admin' || currentPath === '/admin.html'
// Политика конфиденциальности — отдельная страница с запечённой разметкой
// (dist/privacy.html; на Vercel /privacy переписывается на неё, см. vercel.json).
const isPrivacy = currentPath === '/privacy' || currentPath === '/privacy.html'
const page = isPrivacy ? 'privacy' : 'home'

// Панель организатора не должна попадать в поисковую выдачу: перекрываем
// глобальный robots-тег на noindex именно для /admin (в robots.txt она тоже
// закрыта, но мета-тег — второй, надёжный барьер против индексации).
if (isAdmin) {
  const robots = document.querySelector('meta[name="robots"]') ?? document.head.appendChild(document.createElement('meta'))
  robots.setAttribute('name', 'robots')
  robots.setAttribute('content', 'noindex, nofollow')
  document.title = 'ITECX — Панель организатора'
}

const container = document.getElementById('root')!

if (isAdmin) {
  // Панель приходит с пустым root (dist/admin.html) — строим DOM с нуля.
  createRoot(container).render(
    <StrictMode>
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    </StrictMode>,
  )
} else if (container.hasChildNodes()) {
  // Прод: лендинг уже отрендерён в разметку при сборке
  // (scripts/prerender.mjs) — подхватываем готовый DOM, а не пересобираем его.
  // Анимации не затронуты: .reveal стартует скрытым и раскрывается из
  // useEffect, как и раньше.
  hydrateRoot(
    container,
    <StrictMode>
      <AppRoot page={page} />
    </StrictMode>,
  )
} else {
  // `npm run dev`: vite отдаёт index.html из исходников с пустым root —
  // гидрировать нечего, строим DOM с нуля.
  createRoot(container).render(
    <StrictMode>
      <AppRoot page={page} />
    </StrictMode>,
  )
}
