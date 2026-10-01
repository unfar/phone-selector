/**
 * 筛选/排序的交互状态与处理函数。
 *
 * 原先这些都写在 App.vue 的 <script setup> 里，拆分视图组件后筛选抽屉、
 * 顶部工具栏、页头筛选入口三处都要用，抽成独立 composable 避免来回传 props。
 * 只放"交互层"，筛选判定逻辑仍在 useApp.js 的 matchesFilters。
 */
import { computed, reactive, ref } from 'vue'
import {
  searchQuery, currentSort, selectedBrands, selectedScreen, selectedCpu, selectedTags,
  selectedScreenSizes, selectedProtocols, priceMin, priceMax, sliderMaxPrice,
  showFavoritesOnly, updateHash,
} from './useApp.js'

export const priceActive = computed(() => priceMin.value > 0 || priceMax.value < sliderMaxPrice.value)

export const hasFilters = computed(() => !!(
  searchQuery.value || selectedBrands.value.size || selectedScreen.value || selectedCpu.value.size ||
  selectedTags.value.size || selectedScreenSizes.value.size || selectedProtocols.value.size ||
  priceActive.value || showFavoritesOnly.value
))

/** 抽屉开合（页头入口 / FAB / Esc 都操作它） */
export const showFilterDrawer = ref(false)

/** 抽屉内各分组的展开状态 */
export const sectionOpen = reactive({
  brand: false, screen: true, cpu: true, tags: true, proto: true, size: true,
})
export function toggleSection(key) { sectionOpen[key] = !sectionOpen[key] }

// ===== 搜索（300ms 防抖）=====
let searchTimer = null
export function onSearch(e) {
  const v = e.target.value
  // 防抖 300ms：避免输入法组合阶段反复过滤，也减少高频输入开销
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = v
    updateHash()
  }, 300)
}
export function clearSearch() {
  clearTimeout(searchTimer)
  searchQuery.value = ''
  updateHash()
}

// ===== 排序 =====
export function setSort(sort) { currentSort.value = sort; updateHash() }
/** 恢复默认排序（最新发布） */
export function resetSort() { setSort('newest') }
/**
 * 下拉选「更多排序」：选到占位项（空值）即视为取消排序，回到默认的「最新发布」。
 * 注：占位项必须可选，否则从下拉里选了非常用排序后就没有取消入口。
 */
export function onMoreSort(e) { setSort(e.target.value || 'newest') }

// 下拉只放 5 个非常用排序；若当前是常用排序之一（select 里没对应 option）就显示空
const MORE_SORTS = new Set(['battery_desc', 'weight_asc', 'screen_desc', 'charging_desc', 'brand_asc'])
export const moreSortValue = computed({
  get: () => MORE_SORTS.has(currentSort.value) ? currentSort.value : '',
  set: () => {},
})
const SORT_LABELS = {
  newest: '最新发布',
  price_asc: '价格 ↑',
  price_desc: '价格 ↓',
  battery_desc: '电池 ↓',
  weight_asc: '重量 ↑',
  screen_desc: '屏幕 ↓',
  charging_desc: '快充 ↓',
  brand_asc: '品牌 A-Z',
}
export const sortLabel = computed(() => SORT_LABELS[currentSort.value] || currentSort.value)

// ===== 各筛选维度的开合 =====
/** 往 Set 型筛选里增删一项。重建 Set 是为了让依赖它的 computed 稳定失效。 */
function toggleSet(setRef, v) {
  const s = setRef.value
  if (s.has(v)) s.delete(v)
  else s.add(v)
  setRef.value = new Set(s)
  updateHash()
}
export function toggleBrand(b) { toggleSet(selectedBrands, b) }
export function toggleTag(t) { toggleSet(selectedTags, t) }
export function toggleCpu(t) { toggleSet(selectedCpu, t) }
export function toggleProtocol(t) { toggleSet(selectedProtocols, t) }
export function toggleScreenSize(r) { toggleSet(selectedScreenSizes, r) }

export function selectScreen(s) {
  selectedScreen.value = selectedScreen.value === s ? null : s
  updateHash()
}

/** 已生效条件的可移除胶囊 */
export const activePills = computed(() => {
  const out = []
  if (searchQuery.value) out.push({ label: '🔍 ' + searchQuery.value, clear: clearSearch })
  selectedBrands.value.forEach(b => out.push({ label: b, clear: () => { selectedBrands.value.delete(b); updateHash() } }))
  if (selectedScreen.value) out.push({ label: selectedScreen.value, clear: () => { selectedScreen.value = null; updateHash() } })
  selectedCpu.value.forEach(c => out.push({ label: c, clear: () => { selectedCpu.value.delete(c); updateHash() } }))
  selectedTags.value.forEach(t => out.push({ label: t, clear: () => { selectedTags.value.delete(t); updateHash() } }))
  selectedProtocols.value.forEach(t => out.push({ label: '🔌 ' + t, clear: () => { selectedProtocols.value.delete(t); updateHash() } }))
  selectedScreenSizes.value.forEach(s => out.push({ label: s, clear: () => { selectedScreenSizes.value.delete(s); updateHash() } }))
  if (priceActive.value) out.push({
    label: `¥${priceMin.value || 0}-${priceMax.value}`,
    clear: () => { priceMin.value = 0; priceMax.value = sliderMaxPrice.value; updateHash() },
  })
  return out
})

/** 徽标数字：按"维度"计数，不是按条件条数 */
export const activeFilterCount = computed(() => {
  let n = 0
  if (selectedBrands.value.size) n++
  if (priceActive.value) n++
  if (selectedScreen.value) n++
  if (selectedCpu.value.size) n++
  if (selectedTags.value.size) n++
  if (selectedProtocols.value.size) n++
  if (selectedScreenSizes.value.size) n++
  return n || ''
})
