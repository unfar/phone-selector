<template>
  <div>
    <header class="site-header">
      <div class="site-brand">
        <div class="site-brand-mark">📱</div>
        <div>
          <h1>智能手机选购助手</h1>
          <div class="site-brand-sub">国行机型参数对比</div>
        </div>
      </div>
      <div class="site-header-actions">
        <button class="icon-btn mobile-filter-toggle" type="button" title="筛选" @click="filterOpen = true">☰</button>
        <button class="icon-btn" type="button" :title="isDark ? '切换亮色' : '切换暗色'" @click="toggleDark">{{ isDark ? '☀️' : '🌙' }}</button>
      </div>
    </header>

    <div class="sidebar-backdrop" :class="{ show: filterOpen }" @click="filterOpen = false"></div>

    <div class="app-shell">
      <HeroPanel />
      <div class="layout">
        <aside class="sidebar" :class="{ open: filterOpen }">
          <FilterPanel />
        </aside>
        <main class="main-col">
          <ActiveBar />
          <Toolbar />
          <div class="phone-grid" v-if="!loading">
            <template v-if="sortedPhones.length > 0">
              <PhoneCard v-for="phone in sortedPhones" :key="phone.id" :phone="phone" />
            </template>
            <div v-else class="no-results">
              <div class="emoji">😕</div>
              <p>未找到符合条件的机型</p>
              <p style="margin-top:8px;font-size:.85rem;color:var(--text-3)">试试放宽品牌 / 价格 / 特性条件</p>
            </div>
          </div>
          <div v-else-if="error" class="error-msg">
            <div class="emoji">😢</div>
            <p>数据加载失败：{{ error }}</p>
          </div>
          <div v-else class="loading">
            <div class="spinner">⏳</div>
            <p>加载数据中...</p>
          </div>
        </main>
      </div>
      <CompareBar />
      <ComparePanel />
      <footer>💡 数据来源：各品牌官网 · 参数仅供参考，实际以官方为准<br>Made with ❤️ by Lumi</footer>
    </div>
    <button class="back-top" v-show="showBackTop" @click="scrollTop">↑</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { loading, error, setPhones, restoreStateFromHash, updateHash, sortedPhones } from './composables/useFilters.js'
import { clearCompareSelection } from './composables/useCompare.js'
import HeroPanel from './components/HeroPanel.vue'
import FilterPanel from './components/FilterPanel.vue'
import ActiveBar from './components/ActiveBar.vue'
import Toolbar from './components/Toolbar.vue'
import PhoneCard from './components/PhoneCard.vue'
import CompareBar from './components/CompareBar.vue'
import ComparePanel from './components/ComparePanel.vue'

const isDark = ref(localStorage.getItem('darkMode') === 'true')
const showBackTop = ref(false)
const filterOpen = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('darkMode', isDark.value.toString())
}
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll() { showBackTop.value = window.scrollY > 500 }

// close mobile drawer on resize to desktop
function onResize() {
  if (window.innerWidth > 980) filterOpen.value = false
}

watch(filterOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(async () => {
  if (isDark.value) document.body.classList.add('dark-mode')
  try {
    const resp = await fetch('data/phones.json')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    setPhones(data.filter(p => p.processor && p.price))
    restoreStateFromHash()
    updateHash()
  } catch (err) {
    loading.value = false
    error.value = err.message
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  setTimeout(() => {
    const i = new Image()
    i.src = 'https://phone-selector-stats.gedaye-vip.workers.dev/track'
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearCompareSelection()
    filterOpen.value = false
  }
})
</script>
