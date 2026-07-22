import { createApp } from 'vue'
import App from './App.vue'
import '../style.css'

const app = createApp(App)
app.config.warnHandler = () => {}
app.mount('#app')