import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/phone-selector/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    // 多页构建：根目录是旧版，v2/ 是全新版本（可并行访问 /phone-selector/v2/）
    rollupOptions: {
      input: {
        main: 'index.html',
        v2: 'v2/index.html'
      }
    }
  }
})
