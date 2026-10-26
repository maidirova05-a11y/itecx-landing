/**
 * Уменьшенные WebP-копии фотографий для srcset: about-640.webp,
 * about-1024.webp и т.д. рядом с исходниками в public/images.
 *
 * Зачем: карточки с фото на телефоне занимают ~350 CSS-пикселей, а WebP-файл
 * был один — шириной 1000–1400 px. Браузер скачивал втрое больше пикселей,
 * чем показывал (Lighthouse: «Properly size images», ~200 КБ на главной).
 * С srcset/sizes он сам выбирает наименьший файл, которого хватает для
 * экрана и плотности пикселей; полноразмерный WebP остаётся в наборе для
 * широких и retina-экранов.
 *
 * Как и WebP-версии, файлы генерируются один раз и лежат в репозитории —
 * сборке не нужен ни пакет обработки картинок, ни лишний шаг. Ширины должны
 * совпадать с PHOTO_WIDTHS в src/components/common/webp.ts. Перезапуск после
 * замены фото:
 *
 *   npm i --no-save sharp && node scripts/make-images.mjs
 *
 * Источник — исходный JPEG (а не WebP), чтобы не пережимать уже сжатое.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { default: sharp } = await import('sharp').catch(() => {
  console.error('Нужен sharp: npm i --no-save sharp')
  process.exit(1)
})

/** Фото → ширины уменьшенных копий (только меньше исходной). */
const VARIANTS = {
  about: [640, 1024],
  academic: [640],
  college: [640],
  stages: [640, 1024],
}

for (const [name, widths] of Object.entries(VARIANTS)) {
  const src = path.join(root, 'public', 'images', `${name}.jpg`)
  const { width } = await sharp(src).metadata()
  for (const w of widths) {
    if (w >= width) throw new Error(`${name}: копия ${w}px не меньше исходника (${width}px)`)
    const out = path.join(root, 'public', 'images', `${name}-${w}.webp`)
    const info = await sharp(src).resize({ width: w }).webp({ quality: 80, effort: 6 }).toFile(out)
    console.log(`${path.relative(root, out)} — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} КБ`)
  }
}
