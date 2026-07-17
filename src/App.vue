<template>
  <div>
    <header class="topbar">
      <div class="brand-lockup">
        <div class="brand-mark">📱</div>
        <h1>智能手机选购助手</h1>
      </div>

      <div class="top-search">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          :value="searchQuery"
          @input="onSearch"
          placeholder="搜索机型、品牌、处理器…"
        />
        <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
      </div>

      <div class="top-actions">
        <button class="ghost-btn mobile-only" type="button" @click="filterOpen = true">筛选</button>
        <button class="icon-btn" type="button" :title="isDark ? '亮色' : '暗色'" @click="toggleDark">{{ isDark ? '☀️' : '🌙' }}</button>
      </div>
    </header>

    <div class="sidebar-backdrop" :class="{ show: filterOpen }" @click="filterOpen = false"></div>

    <div class="page">
      <div class="layout">
        <aside class="sidebar" :class="{ open: filterOpen }">
          <FilterPanel @close="filterOpen = false" />
        </aside>

        <main class="main">
          <ActiveBar />
          <Toolbar />
          <div :class="['phone-grid', { 'list-mode': viewMode === 'list' }]" v-if="!loading">
            <template v-if="sortedPhones.length">
              <PhoneCard v-for="p in sortedPhones" :key="p.id" :phone="p" />
            </template>
            <div v-else class="no-results">
              <div class="emoji">😕</div>
              <p>没有符合条件的机型</p>
              <p style="margin-top:6px;font-size:.85rem;color:var(--text-3)">试试放宽品牌 / 价格 / 特性</p>
            </div>
          </div>
          <div v-else-if="error" class="error-msg">
            <div class="emoji">😢</div>
            <p>数据加载失败：{{ error }}</p>
          </div>
          <div v-else class="loading">
            <div class="emoji">⏳</div>
            <p>加载中…</p>
          </div>
        </main>
      </div>

      <CompareBar />
      <ComparePanel />
      <footer>💡 数据来源：各品牌官网 · 参数仅供参考<br>Made with ❤️ by Lumi</footer>
    </div>

    <button class="back-top" v-show="showBackTop" @click="scrollTop">↑</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import {
  loading, error, setPhones, restoreStateFromHash, updateHash, sortedPhones, searchQuery
} from './composables/useFilters.js'
import { clearCompareSelection } from './composables/useCompare.js'
import FilterPanel from './components/FilterPanel.vue'
import ActiveBar from './components/ActiveBar.vue'
import Toolbar from './components/Toolbar.vue'
import PhoneCard from './components/PhoneCard.vue'
import CompareBar from './components/CompareBar.vue'
import ComparePanel from './components/ComparePanel.vue'

const isDark = ref(localStorage.getItem('darkMode') === 'true')
const showBackTop = ref(false)
const filterOpen = ref(false)
const viewMode = ref(localStorage.getItem('viewMode') || 'grid')

provide('viewMode', viewMode)
provide('setViewMode', (mode) => {
  viewMode.value = mode
  localStorage.setItem('viewMode', mode)
})

function toggleDark() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('darkMode', String(isDark.value))
}
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll() { showBackTop.value = window.scrollY > 500 }
function onResize() { if (window.innerWidth > 980) filterOpen.value = false }
function onSearch(e) {
  searchQuery.value = e.target.value
  updateHash()
}
function clearSearch() {
  searchQuery.value = ''
  updateHash()
}

watch(filterOpen, (open) => { document.body.style.overflow = open ? 'hidden' : '' })

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
  setTimeout(() => { const i = new Image(); i.src = 'https://phone-selector-stats.gedaye-vip.workers.dev/track' }, 1000)
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
