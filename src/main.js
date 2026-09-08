import { createApp } from 'vue'
import App from './App.vue'
import '../style.css'

const app = createApp(App)
// 生产环境静默 Vue 运行时警告（如模板中的未定义字段），开发环境保留以便排查
if (import.meta.env.PROD) {
  app.config.warnHandler = () => {}
}
app.mount('#app')