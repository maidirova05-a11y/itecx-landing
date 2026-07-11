import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // В dev API-сервер (server/index.mjs → PostgreSQL) живёт на 3001
      '/api': 'http://localhost:3001',
    },
  },
})
