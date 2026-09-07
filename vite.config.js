import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/phone-selector/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096
  }
})
