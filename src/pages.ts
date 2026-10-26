import type { ComponentType } from 'react'
import type { Page } from './i18n'

/** Загрузчики страниц для браузера: каждая — отдельный чанк. main.tsx
 * дожидается нужного до гидратации, а prerender.mjs заранее кладёт в HTML
 * modulepreload на этот чанк (по манифесту сборки), так что загрузка идёт
 * параллельно с основным бандлом, а не после него. */
export const PAGE_LOADERS: Record<Page, () => Promise<ComponentType>> = {
  home: () => import('./App').then((m) => m.default),
  guide: () => import('./guide/GuidePage').then((m) => m.GuidePage),
  privacy: () => import('./privacy/PrivacyPage').then((m) => m.PrivacyPage),
  oferta: () => import('./oferta/OfertaPage').then((m) => m.OfertaPage),
}
