import { createApp } from 'vue'
import App from './App.vue'
import './styles/tokens.css'
import './styles/app.css'
import { startRouter } from './lib/router.js'
import { loadPhones, state } from './lib/store.js'

document.documentElement.setAttribute('data-mode', state.mode)
startRouter()
loadPhones()
createApp(App).mount('#app')
