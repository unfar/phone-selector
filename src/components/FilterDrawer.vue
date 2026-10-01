<template>
  <!-- 窄屏：遮罩抽屉（模态） -->
  <div
    v-if="isNarrow && showFilterDrawer"
    class="filter-overlay"
    @click.self="closeDrawer"
  >
    <div
      class="filter-drawer"
      ref="drawerRef"
      role="dialog"
      aria-modal="true"
      aria-label="筛选条件"
      @keydown="onKeydown"
    >
      <div class="filter-drawer-head">
        <strong>筛选条件</strong>
        <button class="btn ghost" ref="closeBtnRef" @click="closeDrawer" aria-label="关闭筛选">✕</button>
      </div>
      <div class="filter-drawer-body">
        <FilterBody />
        <button v-if="hasFilters" class="btn ghost filter-clear" @click="clearAllFilters">清空全部筛选</button>
      </div>
    </div>
  </div>

  <!-- 宽屏：常驻侧边栏（非模态，列表实时联动） -->
  <aside v-else-if="!isNarrow && filterPinned" class="filter-sidebar" aria-label="筛选条件">
    <div class="filter-sidebar-head">
      <strong>筛选条件</strong>
      <div class="filter-sidebar-head-actions">
        <button v-if="hasFilters" class="link-btn" @click="clearAllFilters">清空</button>
        <button class="link-btn" @click="toggleFilterPinned" aria-label="收起筛选侧栏" title="收起筛选侧栏">‹</button>
      </div>
    </div>
    <div class="filter-sidebar-body">
      <FilterBody />
    </div>
  </aside>
</template>

<script setup>
/**
 * 筛选面板外壳。形态由视口宽度决定，不再由「设备是否支持触摸」决定：
 *  - < 1024px  → 遮罩抽屉（模态，带焦点陷阱 + 背景滚动锁）
 *  - >= 1024px → 常驻左侧侧栏（非模态，勾选后列表立刻联动，不遮挡）
 * 具体筛选项在 FilterBody.vue，两种形态共用。
 */
import { ref, watch, nextTick, onUnmounted } from 'vue'
import FilterBody from './FilterBody.vue'
import { clearAllFilters } from '../composables/useApp.js'
import {
  isNarrow, showFilterDrawer, filterPinned, toggleFilterPinned, hasFilters,
} from '../composables/useFilterUI.js'

const drawerRef = ref(null)
const closeBtnRef = ref(null)
let lastFocused = null
let prevOverflow = ''

function closeDrawer() { showFilterDrawer.value = false }

/** 抽屉内 Tab 循环：不让焦点跑到背景列表上 */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
function onKeydown(e) {
  if (e.key !== 'Tab' || !drawerRef.value) return
  const items = [...drawerRef.value.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled && el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

// 抽屉打开：锁背景滚动 + 焦点移入；关闭：解除锁定 + 焦点还回触发元素
watch(showFilterDrawer, async (open) => {
  if (!isNarrow.value) return
  if (open) {
    lastFocused = document.activeElement
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeBtnRef.value?.focus()
  } else {
    unlock()
  }
})

// 抽屉开着时拉伸窗口到宽屏会切换成非模态侧栏，此时必须解锁，否则页面永久滚不动
watch(isNarrow, (narrow) => { if (!narrow) unlock() })

function unlock() {
  document.body.style.overflow = prevOverflow
  if (lastFocused?.isConnected) lastFocused.focus()
  lastFocused = null
}
onUnmounted(unlock)
</script>
