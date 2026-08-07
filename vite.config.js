import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * 构建前自动同步数据文件:data/phones.json → public/data/ + dist/data/
 * 保证部署产物始终使用最新数据,无需手动拷贝。
 */
function syncDataPlugin() {
  return {
    name: 'sync-data',
    buildStart() {
      const src = resolve(__dirname, 'data/phones.json')
      const targets = [
        resolve(__dirname, 'public/data/phones.json'),
        resolve(__dirname, 'dist/data/phones.json'),
      ]
      for (const t of targets) {
        try {
          mkdirSync(dirname(t), { recursive: true })
          copyFileSync(src, t)
        } catch (e) {
          console.warn(`[sync-data] 同步 ${t} 失败:`, e.message)
        }
      }
      console.log('[sync-data] data/phones.json 已同步到 public/data/ 和 dist/data/')
    },
  }
}

export default defineConfig({
  plugins: [vue(), syncDataPlugin()],
  base: '/phone-selector/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096
  }
})
