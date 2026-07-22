import { createApp } from 'vue'
import App from './App.vue'
import '../style.css'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info)
  // Don't crash — show error in DOM
  const el = document.getElementById('app')
  if (el) {
    el.classList.add('error')
    const msg = err?.message || 'Unknown error'
    el.innerHTML = `<div class="empty" style="padding:40px"><div class="big">😵</div>出错了：${msg}<br><small>${info || ''}</small></div>`
  }
}
app.config.warnHandler = () => {}
app.mount('#app')