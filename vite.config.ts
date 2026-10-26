import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // В dev API-сервер (server/index.mjs → PostgreSQL) живёт на 3001
      '/api': 'http://localhost:3001',
    },
  },
  build: isSsrBuild
    ? {}
    : {
        // Манифест читает scripts/prerender.mjs: по нему в каждую запечённую
        // страницу ставятся modulepreload на чанк страницы и словарь её языка
        // (иначе они грузились бы только после выполнения основного бандла).
        // После пререндера файл удаляется — наружу он не раздаётся.
        manifest: true,
        // Один CSS-файл на весь сайт, как и до разбиения JS на чанки: стили
        // секций лендинга (Hero.css и др.) должны прийти вместе с запечённой
        // разметкой, а не после загрузки чанка страницы, — иначе первый кадр
        // был бы без них.
        cssCodeSplit: false,
        // Шрифты не встраиваем в CSS как data: URL, даже мелкие: CSP разрешает
        // шрифты только с 'self', и data:-шрифт был бы заблокирован.
        assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined),
        rolldownOptions: {
          output: {
            codeSplitting: {
              groups: [
                // React меняется реже, чем код сайта: отдельный чанк остаётся
                // в кеше браузера между деплоями (/assets/* — immutable).
                { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              ],
            },
          },
        },
      },
}))
