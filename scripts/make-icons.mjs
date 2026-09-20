/**
 * Собирает квадратные иконки из той же геометрии, что лежит в
 * public/favicon.svg: apple-touch-icon.png (180), icon-192.png, icon-512.png.
 *
 * Зачем скрипт, а не «нарисовали один раз и забыли»: раньше
 * <link rel="apple-touch-icon"> указывал на og-image.png — карточку 1200x630.
 * iOS вписывает touch-иконку в квадрат, так что на домашнем экране получался
 * сплющенный баннер, а не знак. Файлы лежат в репозитории (сборке ничего
 * генерировать не нужно), но если знак изменится — правьте favicon.svg,
 * повторите координаты здесь и перезапустите `node scripts/make-icons.mjs`,
 * чтобы растровые версии не разошлись с векторной.
 *
 * Без графических библиотек: PNG — это zlib-поток и четыре заголовка, а знак
 * состоит из скруглённого прямоугольника и четырёх треугольников. Сглаживание
 * — суперсэмплинг 4x4, иначе диагонали на 180px заметно лесенкой.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const VIEW = 64
const RADIUS = 14
const BG = [0x06, 0x08, 0x0d]
const FG = [0xe3, 0x1f, 0x2d]

/** Каждый <path> в favicon.svg возвращается в (32,33), то есть рисует два
 *  треугольника. Здесь они перечислены явно. */
const TRIS = [
  [[4, 8], [19, 8], [32, 33]],
  [[32, 33], [60, 58], [45, 58]],
  [[60, 8], [45, 8], [32, 33]],
  [[32, 33], [4, 58], [19, 58]],
]

function inTriangle(px, py, [[ax, ay], [bx, by], [cx, cy]]) {
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
  if (d === 0) return false
  const a = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d
  const b = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d
  return a >= 0 && b >= 0 && a + b <= 1
}

function inRoundRect(px, py) {
  const cx = Math.min(Math.max(px, RADIUS), VIEW - RADIUS)
  const cy = Math.min(Math.max(py, RADIUS), VIEW - RADIUS)
  return (px - cx) ** 2 + (py - cy) ** 2 <= RADIUS ** 2
}

function render(size, samples = 4) {
  const scale = VIEW / size
  const step = 1 / samples
  const total = samples * samples
  const rows = []

  for (let y = 0; y < size; y += 1) {
    // Формат PNG: каждой строке предшествует байт фильтра (0 — без фильтра).
    const row = Buffer.alloc(size * 3 + 1)
    let o = 1
    for (let x = 0; x < size; x += 1) {
      let inside = 0
      let mark = 0
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const ux = (x + (sx + 0.5) * step) * scale
          const uy = (y + (sy + 0.5) * step) * scale
          if (!inRoundRect(ux, uy)) continue
          inside += 1
          if (TRIS.some((t) => inTriangle(ux, uy, t))) mark += 1
        }
      }
      // За пределами скругления — тот же тёмный цвет, а не прозрачность: iOS
      // подкладывает под иконку белое, и прозрачный угол стал бы белым срезом.
      const a = inside === 0 ? 0 : mark / total
      for (let i = 0; i < 3; i += 1) row[o++] = Math.round(FG[i] * a + BG[i] * (1 - a))
    }
    rows.push(row)
  }
  return Buffer.concat(rows)
}

function chunk(tag, data) {
  const body = Buffer.concat([Buffer.from(tag, 'ascii'), data])
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function writePng(file, size) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // бит на канал
  ihdr[9] = 2 // truecolour RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(render(size), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path.join(root, file), png)
  console.log(`make-icons: ${file} — ${size}x${size}, ${png.length} байт`)
}

writePng('public/apple-touch-icon.png', 180)
writePng('public/icon-192.png', 192)
writePng('public/icon-512.png', 512)
