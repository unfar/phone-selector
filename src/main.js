import { createApp } from 'vue'
import App from './App.vue'
import './styles/tokens.css'
import './styles/app.css'
import { startRouter } from './lib/router.js'
import { loadPhones, state } from './lib/store.js'

document.documentElement.setAttribute('data-theme', state.theme)
startRouter()
loadPhones()
createApp(App).mount('#app')

// PWA：生产环境注册 Service Worker（离线壳 + 数据缓存）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {
      /* 注册失败不影响主流程 */
    })
  })
}
