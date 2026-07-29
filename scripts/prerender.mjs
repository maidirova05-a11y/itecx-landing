/**
 * Запекает разметку лендинга в dist/index.html после `vite build`.
 *
 * Зачем: лендинг — SPA, и до выполнения JS в HTML лежал пустой <div id="root">.
 * Google выполняет JS и видел контент, а Яндекс и краулеры соцсетей — нет.
 * Теперь текст секций приходит сразу в HTML.
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
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const templatePath = path.join(dist, 'index.html')
const template = await readFile(templatePath, 'utf8')

if (!template.includes(ROOT_DIV)) {
  throw new Error(`prerender: не нашёл ${ROOT_DIV} в dist/index.html — шаблон изменился?`)
}

// vercel.json переписывает /admin на отдельный файл: панели организатора нужен
// пустой root, иначе на ней мелькнул бы лендинг и сломалась бы гидратация.
await writeFile(path.join(dist, 'admin.html'), template)

const markup = render()
await writeFile(templatePath, template.replace(ROOT_DIV, `<div id="root">${markup}</div>`))

await rm(ssrDir, { recursive: true, force: true })

console.log(`prerender: запечено ${markup.length} символов разметки в dist/index.html`)
console.log('prerender: dist/admin.html создан с пустым root')
