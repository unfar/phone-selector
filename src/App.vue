<template>
  <div class="app">
    <header class="top">
      <div class="logo" @click="openList" style="cursor:pointer" title="机选 · 返回列表">
        <div class="logo-badge" aria-hidden="true">
          <svg class="logo-mark" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect x="18" y="12" width="28" height="40" rx="6" fill="#fff" fill-opacity=".96"/>
            <rect x="21.5" y="17" width="21" height="26" rx="2.5" fill="#ccfbf1"/>
            <circle cx="32" cy="14.8" r="1.1" fill="#0f766e" fill-opacity=".35"/>
            <rect x="27" y="46.5" width="10" height="2.2" rx="1.1" fill="#0f766e" fill-opacity=".28"/>
            <circle cx="44.5" cy="43.5" r="9.2" fill="#c2410c"/>
            <path d="M40.2 43.5l2.6 2.6 5.5-5.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>机选</h1>
          <p>国行选购 · 参数对比</p>
        </div>
      </div>

      <div class="search" v-if="view === 'list'">
        <span class="ico">🔍</span>
        <input :value="searchQuery" @input="onSearch" placeholder="搜索机型 / 品牌 / 处理器" aria-label="搜索机型" />
        <span class="x" v-if="searchQuery" @click="clearSearch" role="button" aria-label="清除搜索">✕</span>
      </div>

      <div class="top-actions">
        <button v-if="view === 'list' && !isTouchDevice" class="btn ghost filter-entry" @click="showFilterDrawer = true" :title="'筛选 · ' + activeFilterCount + ' 项'">
          ⚙ 筛选<span v-if="activeFilterCount" class="fab-badge-static">{{ activeFilterCount }}</span>
        </button>
        <button class="btn ghost theme-toggle" @click="toggleTheme" :aria-label="theme === 'dark' ? '切换浅色' : '切换暗色'" :title="theme === 'dark' ? '切换浅色' : '切换暗色'">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <button v-if="view !== 'list'" class="btn ghost" @click="openList" title="返回上一层视图">← 返回</button>
      </div>
    </header>

    <!-- LIST -->
    <div v-if="view === 'list'" class="shell">
      <FilterDrawer v-if="showFilterDrawer" />

      <!-- 浮动筛选按钮（可拖动，仅移动端） -->
      <button
        v-if="isTouchDevice"
        class="filter-fab"
        ref="fabRef"
        @click="onFabClick"
      >
        <span v-if="hasFilters" class="fab-badge">{{ activeFilterCount }}</span>
        🔍 筛选
      </button>

      <main class="main">
        <ListToolbar />

        <div v-if="loading" class="empty"><div class="big">⏳</div>加载中…</div>
        <div v-else-if="error" class="empty">
          <div class="big">😢</div>{{ error }}
          <div style="margin-top:12px"><button class="btn primary" @click="reloadData">重新加载</button></div>
        </div>
        <div v-else-if="!sortedPhones.length" class="empty">
          <div class="big">{{ showFavoritesOnly ? '⭐' : '😕' }}</div>
          <template v-if="showFavoritesOnly">
            {{ favorites.length ? '收藏列表中没有符合条件的机型' : '还没有收藏任何机型' }}
            <div style="margin-top:10px;font-size:.85rem;color:var(--muted)">在卡片或详情页点击 ☆ 即可收藏心仪机型</div>
          </template>
          <template v-else>没有符合条件的机型</template>
        </div>

        <!-- cards -->
        <div v-else-if="viewMode === 'cards'" class="grid">
          <PhoneCard v-for="p in sortedPhones" :key="p.id" :phone="p" />
        </div>

        <!-- table -->
        <PhoneTable v-else :phones="sortedPhones" />
      </main>
    </div>

    <!-- DETAIL -->
    <PhoneDetail v-else-if="view === 'detail' && detailPhone" />

    <!-- COMPARE -->
    <CompareView v-else-if="view === 'compare'" />

    <!-- 底部对比入口（全端） -->
    <div class="compare-dock" v-if="(view === 'list' || view === 'detail') && compareList.length">
      <div class="dock-info">
        <strong>已选 {{ compareList.length }} 款</strong>
        <span>最多 4 款</span>
      </div>
      <div class="dock-actions">
        <button class="btn ghost" @click="clearCompare">清空</button>
        <button class="btn primary" :disabled="compareList.length < 2" @click="openCompare">
          {{ compareList.length < 2 ? '再选一款' : '查看对比' }}
        </button>
      </div>
    </div>

    <!-- 返回顶部（滚动超出一屏时显示） -->
    <button v-show="showBackTop" class="back-top" @click="scrollToTop" aria-label="返回顶部">↑</button>

    <footer>
      机选 · 浅色通透目录风 · 列表 / 详情 / 对比<br>
      数据来源：各品牌官网 · 截至 {{ dataDate }} · 库内 {{ phones.length }} 款，当前显示 {{ resultCount }} 款<br>
      Made with ❤️ by Lumi
    </footer>
  </div>
</template>

<script setup>
/**
 * App.vue 只保留应用外壳：页头、视图路由、常驻浮层（FAB / 对比条 / 返回顶部）与生命周期。
 * 四个视图各自拆到 components/，共享状态走 composables/，不再塞在一个 979 行的文件里。
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import FilterDrawer from './components/FilterDrawer.vue'
import ListToolbar from './components/ListToolbar.vue'
import PhoneCard from './components/PhoneCard.vue'
import PhoneTable from './components/PhoneTable.vue'
import PhoneDetail from './components/PhoneDetail.vue'
import CompareView from './components/CompareView.vue'
import {
  phones, loading, error, setPhones, view, viewMode, searchQuery,
  sortedPhones, resultCount, detailPhone, compareList, openList, openCompare,
  clearCompare, restoreStateFromHash, updateHash, showFavoritesOnly, favorites,
} from './composables/useApp.js'
import {
  showFilterDrawer, activeFilterCount, hasFilters, onSearch, clearSearch,
} from './composables/useFilterUI.js'

const dataDate = computed(() => {
  // 取库内最新的 verified_at 作为数据截止日
  const dates = phones.value.map(p => p.verified_at).filter(Boolean).sort().reverse()
  return dates[0] || '—'
})

// ===== 主题：优先用用户手动选择，否则跟随系统偏好 =====
const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)')
const theme = ref(localStorage.getItem('ps-theme') || (systemDark?.matches ? 'dark' : 'light'))
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t) }
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('ps-theme', theme.value)
  applyTheme(theme.value)
}

// ===== 返回顶部 =====
const showBackTop = ref(false)
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll() { showBackTop.value = window.scrollY > 600 }

// ===== 移动端 FAB（可拖动，位置持久化） =====
const fabRef = ref(null)
const fabDragging = ref(false)
let fabDragStart = null
let fabMoved = false
let fabMouseActive = false
let suppressNextFabClick = false
// 是否触屏设备 → 桌面不渲染 FAB
const isTouchDevice = computed(() =>
  typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)
)

function onFabClick() {
  // onEnd() 每次都会置 suppressNextFabClick：轻点时它已开过抽屉，
  // 拖动时它什么都没开 —— 两种情况都不该再由 click 打开一次。
  if (suppressNextFabClick) { suppressNextFabClick = false; return }
  showFilterDrawer.value = true
}

/** 加载/重新加载数据（错误态"重新加载"按钮复用） */
async function reloadData() {
  loading.value = true
  error.value = null
  try {
    const resp = await fetch(import.meta.env.BASE_URL + 'data/phones.json')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const phonesData = await resp.json()
    // ⚠️ 不再按 price 过滤：未发布 / 官方未公布价格的机型（如 iQOO16、小米18 标准版）
    //    对用户同样有参考价值，应在列表里以「未发布」角标展示，而不是被彻底丢弃。
    //    仅过滤缺 processor 的脏数据。
    setPhones(phonesData.filter(p => p.processor))
    restoreStateFromHash()
    // 还原后再写一次，把 URL 规范化（例如缺省排序、价格上限被数据实际最大值收窄）
    updateHash()
  } catch (e) {
    error.value = e?.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

// 保存需要清理的 listener 引用，在 onUnmounted 里统一清理
const _cleanup = []
function trackCleanup(remove) { _cleanup.push(remove) }

onMounted(() => {
  applyTheme(theme.value)
  // 用户未手动选择时，跟随系统明暗切换
  const onSystemThemeChange = (e) => {
    if (!localStorage.getItem('ps-theme')) {
      theme.value = e.matches ? 'dark' : 'light'
      applyTheme(theme.value)
    }
  }
  systemDark?.addEventListener?.('change', onSystemThemeChange)
  trackCleanup(() => systemDark?.removeEventListener?.('change', onSystemThemeChange))

  reloadData()

  // 浏览器返回/前进 — popstate 恢复状态
  const onPopstate = () => restoreStateFromHash()
  window.addEventListener('popstate', onPopstate)
  trackCleanup(() => window.removeEventListener('popstate', onPopstate))

  // 手动改地址栏 hash / 点站内锚点会触发 hashchange 而非 popstate。
  // 应用自身的 updateHash() 走 history.replaceState/pushState，不会触发 hashchange，
  // 所以这里不会和自己打架。
  const onHashChange = () => restoreStateFromHash()
  window.addEventListener('hashchange', onHashChange)
  trackCleanup(() => window.removeEventListener('hashchange', onHashChange))

  // Esc 关闭抽屉
  const onKeydown = (e) => {
    if (e.key === 'Escape' && showFilterDrawer.value) showFilterDrawer.value = false
  }
  window.addEventListener('keydown', onKeydown)
  trackCleanup(() => window.removeEventListener('keydown', onKeydown))

  // 返回顶部按钮显隐
  window.addEventListener('scroll', onScroll, { passive: true })
  trackCleanup(() => window.removeEventListener('scroll', onScroll))

  // FAB 拖动（阈值 10px 防误触，位置 localStorage 持久化）
  const el = fabRef.value
  if (!el) return
  const FAB_POS_KEY = 'ps_fab_pos'
  let savedPos = null
  try { savedPos = JSON.parse(localStorage.getItem(FAB_POS_KEY) || 'null') } catch {}
  // 初始定位：优先用记忆位置，否则右侧屏幕 1/4 高度
  if (savedPos && savedPos.side) {
    el.style.top = savedPos.top + 'px'
    if (savedPos.side === 'left') { el.style.left = '8px'; el.style.right = 'auto' }
    else { el.style.right = '8px'; el.style.left = 'auto' }
  } else {
    el.style.top = window.innerHeight * 0.25 + 'px'
    el.style.right = '16px'
  }
  function saveFabPos(side) {
    try { localStorage.setItem(FAB_POS_KEY, JSON.stringify({ top: el.offsetTop, side })) } catch {}
  }

  function onStart(e) {
    fabMoved = false
    fabMouseActive = true
    if (e.type === 'touchstart') e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    fabDragStart = { x: touch.clientX, y: touch.clientY }
    fabDragging.value = true
    el.style.transition = 'none'
  }
  function onMove(e) {
    if (!fabDragging.value) return
    const touch = e.touches ? e.touches[0] : e
    const dx = touch.clientX - fabDragStart.x
    const dy = touch.clientY - fabDragStart.y
    fabDragStart = { x: touch.clientX, y: touch.clientY }
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) fabMoved = true
    const top = Math.max(10, Math.min(el.offsetTop + dy, window.innerHeight - el.offsetHeight - 100))
    const left = Math.max(0, Math.min(el.offsetLeft + dx, window.innerWidth - el.offsetWidth - 10))
    el.style.top = top + 'px'
    el.style.left = left + 'px'
    el.style.right = 'auto'
  }
  function onEnd() {
    if (!fabDragging.value) return
    fabDragging.value = false
    fabMouseActive = false
    // ⚠️ 无论是否拖动都要吞掉随后的 click：
    //   ① 轻点 → 这里直接开抽屉，click 不能再开一次（否则闪烁）
    //   ② 拖动 → 拖动结束不应弹抽屉，click 必须被吞掉（此前漏了这条，
    //      导致拖完 FAB 会莫名弹出筛选抽屉）
    suppressNextFabClick = true
    if (!fabMoved) showFilterDrawer.value = true
    el.style.transition = 'transform .2s ease'
    const cx = el.offsetLeft + el.offsetWidth / 2
    if (cx < window.innerWidth / 2) {
      el.style.left = '8px'
      el.style.right = 'auto'
      saveFabPos('left')
    } else {
      el.style.left = 'auto'
      el.style.right = '8px'
      saveFabPos('right')
    }
  }
  function onGlobalMouseUp() {
    // 只有鼠标操作起始于 FAB 时才处理
    if (!fabMouseActive) return
    onEnd()
  }
  el.addEventListener('touchstart', onStart, { passive: false })
  el.addEventListener('touchmove', onMove, { passive: false })
  el.addEventListener('touchend', onEnd)
  el.addEventListener('mousedown', onStart)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onGlobalMouseUp)
  trackCleanup(() => el.removeEventListener('mousedown', onStart))
  trackCleanup(() => window.removeEventListener('mousemove', onMove))
  trackCleanup(() => window.removeEventListener('mouseup', onGlobalMouseUp))
})

onUnmounted(() => {
  _cleanup.forEach(fn => fn())
})
</script>
