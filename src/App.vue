<template>
  <div>
    <button class="dark-mode-toggle" id="darkModeToggle" @click="toggleDark" v-html="isDark ? '☀️' : '🌙'" :title="isDark ? '切换亮色模式' : '切换暗色模式'"></button>
    <div class="container">
      <HeroPanel />
      <FilterPanel />
      <ActiveBar />
      <Toolbar />
      <div class="phone-grid" v-if="!loading">
        <template v-if="sortedPhones.length > 0">
          <PhoneCard v-for="phone in sortedPhones" :key="phone.id" :phone="phone" />
        </template>
        <div v-else class="no-results">
          <div class="emoji">😕</div>
          <p>未找到符合条件的机型</p>
          <p style="margin-top:8px;font-size:.85rem;color:var(--text-muted)">建议放宽：处理器 / 价格区间</p>
        </div>
      </div>
      <div v-else-if="error" class="error-msg">
        <div class="emoji">😢</div>
        <p>数据加载失败：{{ error }}</p>
        <p style="margin-top:8px;font-size:.85rem">请检查网络连接或刷新页面重试</p>
      </div>
      <div v-else class="loading">
        <div class="spinner">⏳</div>
        <p>加载数据中...</p>
      </div>
      <CompareBar />
      <ComparePanel />
    </div>
    <footer>💡 数据来源：各品牌官网 · 参数仅供参考，实际以官方为准<br>Made with ❤️ by Lumi</footer>
    <button class="back-top" id="backTop" v-show="showBackTop" @click="scrollTop">↑</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { phones, loading, error, setPhones, restoreStateFromHash, updateHash } from './composables/useFilters.js'
import { clearCompareSelection } from './composables/useCompare.js'
import { sortedPhones } from './composables/useFilters.js'
import HeroPanel from './components/HeroPanel.vue'
import FilterPanel from './components/FilterPanel.vue'
import ActiveBar from './components/ActiveBar.vue'
import Toolbar from './components/Toolbar.vue'
import PhoneCard from './components/PhoneCard.vue'
import CompareBar from './components/CompareBar.vue'
import ComparePanel from './components/ComparePanel.vue'

const isDark = ref(localStorage.getItem('darkMode') === 'true')
const showBackTop = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('darkMode', isDark.value.toString())
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  showBackTop.value = window.scrollY > 500
}

onMounted(async () => {
  // Apply dark mode
  if (isDark.value) document.body.classList.add('dark-mode')
  
  try {
    const resp = await fetch('data/phones.json')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    // 过滤空壳/未补全条目（无处理器或无价格），避免卡片全是 —
    setPhones(data.filter(p => p.processor && p.price))
    restoreStateFromHash()
    updateHash()
  } catch (err) {
    loading.value = false
    error.value = err.message
  }
  
  window.addEventListener('scroll', onScroll, { passive: true })
  // Track pixel
  setTimeout(() => {
    const i = new Image()
    i.src = 'https://phone-selector-stats.gedaye-vip.workers.dev/track'
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearCompareSelection()
  }
})
</script>
