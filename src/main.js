import { createApp } from 'vue'
import App from './App.vue'
import '../style.css'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err, info, err?.stack)
  const el = document.getElementById('app')
  if (el) {
    el.classList.add('error')
    const msg = err?.message || 'Unknown error'
    const stack = err?.stack ? '<br><small style="white-space:pre-wrap">' + err.stack.replace(/\n/g, '<br>') + '</small>' : ''
    el.innerHTML = `<div class="empty" style="padding:40px"><div class="big">😵</div>出错了：${msg}${stack}<br><small>${info || ''}</small></div>`
  }
}
app.config.warnHandler = () => {}
app.mount('#app')