import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 4521,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': 'http://emarket-backend:4520',
    },
  },
})
