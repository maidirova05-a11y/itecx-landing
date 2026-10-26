/**
 * Рядом с каждым JPEG в public/images лежит его WebP-версия (примерно вдвое
 * легче при том же качестве). Отдаём её через <picture>, оставляя JPEG
 * запасным вариантом: вес страницы — часть оценки скорости, а она влияет и на
 * позиции в поиске, и на то, дождётся ли посетитель загрузки.
 *
 * WebP-файлы генерируются один раз и лежат в репозитории вместе с исходными
 * JPEG — сборке не нужен ни дополнительный пакет, ни шаг обработки картинок.
 */
export const webpFor = (src: string) => src.replace(/\.jpe?g$/i, '.webp')

/**
 * Ширины WebP-копий фото: уменьшенные (scripts/make-images.mjs) и исходная.
 * Для фото из этого списка <picture> получает srcset, и браузер берёт
 * наименьший файл, которого хватает для экрана.
 */
const PHOTO_WIDTHS: Record<string, number[]> = {
  '/images/about.jpg': [640, 1024, 1400],
  '/images/academic.jpg': [640, 1200],
  '/images/college.jpg': [640, 1000],
  '/images/stages.jpg': [640, 1024, 1400],
}

/** srcset для <source type="image/webp">; без копий — просто один WebP. */
export function webpSrcSet(src: string): string {
  const widths = PHOTO_WIDTHS[src]
  if (!widths) return webpFor(src)
  const full = widths[widths.length - 1]
  return widths
    .map((w) => `${w === full ? webpFor(src) : src.replace(/\.jpe?g$/i, `-${w}.webp`)} ${w}w`)
    .join(', ')
}
