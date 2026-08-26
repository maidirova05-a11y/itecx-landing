/**
 * Запекает разметку сайта в статические HTML после `vite build`.
 *
 * Зачем: сайт — SPA, и до выполнения JS в HTML лежал пустой <div id="root">.
 * Google выполняет JS и видел контент, а Яндекс и краулеры соцсетей — нет.
 * Теперь текст секций приходит сразу в HTML.
 *
 * По файлу на каждую пару «страница × язык» (см. targets в entry-server.tsx):
 *   index.html · index.kk.html · index.en.html
 *   privacy.html · privacy.kk.html · privacy.en.html
 * Русские версии отдаются по чистому адресу, остальные — по ?lang= через
 * rewrite (vercel.json на Vercel, server/index.mjs на VPS). Благодаря этому
 * у каждой языковой версии есть свой готовый HTML со своими title, canonical,
 * hreflang и микроразметкой — то, чего JS-переключатель языка поисковику дать
 * не мог.
 *
 * Что НЕ меняется: анимации и внешний вид. Секции обёрнуты в .reveal
 * (opacity: 0), а класс .is-visible навешивает IntersectionObserver из
 * useEffect — то есть ровно так же, как до пререндера. Первый кадр в браузере
 * идентичен прежнему.
 */
import { readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, '.ssr-build')

const ROOT_DIV = '<div id="root"></div>'

// pathToFileURL обязателен: на Windows голый абсолютный путь в import() падает.
const { render, targets } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const templatePath = path.join(dist, 'index.html')
const template = await readFile(templatePath, 'utf8')

if (!template.includes(ROOT_DIV)) {
  throw new Error(`prerender: не нашёл ${ROOT_DIV} в dist/index.html — шаблон изменился?`)
}

// vercel.json переписывает /admin на отдельный файл: панели организатора нужен
// пустой root, иначе на ней мелькнул бы лендинг и сломалась бы гидратация.
await writeFile(path.join(dist, 'admin.html'), template)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Заменяет ровно одно вхождение и падает, если шаблон изменился, — молчаливо
 * разъехавшиеся мета-теги заметить куда сложнее, чем упавшую сборку. */
function replaceOnce(html, pattern, replacement, what) {
  if (!pattern.test(html)) throw new Error(`prerender: не нашёл ${what} в шаблоне — index.html изменился?`)
  return html.replace(pattern, () => replacement)
}

/** Приводит <head> шаблона к конкретной языковой версии страницы. */
function applyMeta(html, t) {
  const title = esc(t.title)
  const description = esc(t.description)

  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${t.lang}">`, 'атрибут lang у <html>')
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>')
  html = replaceOnce(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${description}" />`,
    'meta description'
  )
  html = replaceOnce(
    html,
    /<meta\s+name="keywords"[\s\S]*?\/>/,
    `<meta name="keywords" content="${esc(t.keywords)}" />`,
    'meta keywords'
  )
  html = replaceOnce(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${t.canonical}" />`,
    'canonical'
  )
  html = replaceOnce(
    html,
    /<link rel="alternate" hreflang="ru"[\s\S]*?<link rel="alternate" hreflang="x-default"[^>]*>/,
    t.alternates
      .map((a, i) => `${i === 0 ? '' : '    '}<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
      .join('\n'),
    'hreflang-ссылки'
  )
  html = replaceOnce(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`, 'og:title')
  html = replaceOnce(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${description}" />`,
    'og:description'
  )
  html = replaceOnce(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${t.canonical}" />`, 'og:url')
  html = replaceOnce(
    html,
    /<meta property="og:locale"[\s\S]*?<meta property="og:locale:alternate" content="en_US" \/>/,
    [
      `<meta property="og:locale" content="${t.ogLocale}" />`,
      ...t.ogLocaleAlternates.map((l) => `    <meta property="og:locale:alternate" content="${l}" />`),
    ].join('\n'),
    'og:locale'
  )
  html = replaceOnce(
    html,
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${title}" />`,
    'twitter:title'
  )
  html = replaceOnce(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${description}" />`,
    'twitter:description'
  )
  // Микроразметка своя у каждой пары «страница × язык»: организация + сайт +
  // WebPage, плюс FAQPage на лендинге и BreadcrumbList на политике.
  html = replaceOnce(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${t.jsonLd}\n    </script>`,
    'блок JSON-LD'
  )
  return html
}

for (const t of targets) {
  const markup = render(t.page, t.lang)
  const html = applyMeta(template, t).replace(ROOT_DIV, `<div id="root">${markup}</div>`)
  await writeFile(path.join(dist, t.file), html)
  console.log(`prerender: ${t.file} — ${markup.length} символов разметки (${t.page}/${t.lang})`)
}

await rm(ssrDir, { recursive: true, force: true })

console.log('prerender: dist/admin.html создан с пустым root')
