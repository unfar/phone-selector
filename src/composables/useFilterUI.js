/**
 * 筛选/排序的交互状态与处理函数。
 *
 * 原先这些都写在 App.vue 的 <script setup> 里，拆分视图组件后筛选抽屉、
 * 顶部工具栏、页头筛选入口三处都要用，抽成独立 composable 避免来回传 props。
 * 只放"交互层"，筛选判定逻辑仍在 useApp.js 的 matchesFilters。
 */
import { computed, reactive, ref, watch } from 'vue'
import {
  searchQuery, sortKeys, selectedBrands, selectedScreen, selectedCpu, selectedTags,
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

/**
 * 窄屏形态（< 1024px）：抽屉式；宽屏（>= 1024px）：常驻侧边栏。
 *
 * ⚠️ 之前用 `navigator.maxTouchPoints > 0 || 'ontouchstart' in window` 判断触屏，
 *    触控笔记本 / Surface / 一体机都会被误判成移动设备 —— 桌面用户看不到页头的
 *    「筛选」按钮，只剩一个悬浮的移动端 FAB，且筛选一打开就是全屏遮罩挡住列表。
 *    断点只应取决于视口宽度，与设备是否支持触摸无关。
 */
export const isNarrow = ref(false)
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(max-width: 1023px)')
  isNarrow.value = mq.matches
  mq.addEventListener('change', (e) => { isNarrow.value = e.matches })
}

/** 宽屏下筛选侧栏是否展开（默认展开，用户可收起让列表占满宽度） */
export const filterPinned = ref(true)
export function toggleFilterPinned() { filterPinned.value = !filterPinned.value }

/** 筛选面板当前是否可见：窄屏看抽屉开合，宽屏看侧栏是否展开 */
export const filterPanelVisible = computed(() =>
  isNarrow.value ? showFilterDrawer.value : filterPinned.value
)

/** 抽屉内各分组的展开状态 */
export const sectionOpen = reactive({
  brand: true, screen: true, cpu: true, tags: true, proto: true, size: true,
})
export function toggleSection(key) { sectionOpen[key] = !sectionOpen[key] }

// ===== 搜索（300ms 防抖 + 输入法组合保护）=====
/**
 * ⚠️ 输入框不能用 searchQuery 做受控绑定。
 * 之前是 `:value="searchQuery"` + 300ms 防抖：中文输入法组合阶段（打"xiaomi"还没上屏），
 * input 已触发但 searchQuery 要 300ms 后才更新，这期间 Vue 会把 DOM value 回写成旧的
 * searchQuery —— 直接打断输入法组合，用户打的字被吞掉。
 *
 * 现在的做法：DOM value 绑定本地 inputText（输入时立刻同步，Vue 不会回写不同值），
 * 防抖只作用于真正驱动筛选的 searchQuery；组合期间完全不触发筛选。
 */
export const inputText = ref(searchQuery.value)
let searchTimer = null
let composing = false

/** 防抖提交到真正的筛选状态 */
function commitSearch(v) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchQuery.value = v
    updateHash()
  }, 300)
}

export function onSearchInput(e) {
  // 关键：先让本地值与 DOM 保持一致，避免 Vue 回写打断输入
  inputText.value = e.target.value
  if (composing) return          // 组合期不上屏，等 compositionend
  commitSearch(inputText.value)
}
export function onCompositionStart() { composing = true }
export function onCompositionEnd(e) {
  composing = false
  inputText.value = e.target.value
  commitSearch(inputText.value)
}
export function clearSearch() {
  clearTimeout(searchTimer)
  inputText.value = ''
  searchQuery.value = ''
  updateHash()
}

// 外部改动（hash 恢复 / 浏览器前进后退 / 全部清空）时同步回输入框
watch(searchQuery, (v) => { if (v !== inputText.value) inputText.value = v })

// ===== 排序（多关键字链，可叠加）=====

/**
 * 排序键所属维度。同一维度内互斥（价格 ↑ 和价格 ↓ 不可能同时成立），
 * 不同维度才可叠加（电池 + 最新可以同时生效）。
 */
const SORT_DIM = {
  newest: 'date', price_asc: 'price', price_desc: 'price',
  battery_desc: 'battery', weight_asc: 'weight', screen_desc: 'screen',
  charging_desc: 'charging', brand_asc: 'brand',
}

/**
 * 点击一个排序键的行为：
 * - 它是当前主排序（链首）→ 取消它；链空了就回落到默认的「最新发布」
 * - 它已在链中但不是主排序 → 提到链首，成为主排序
 * - 它不在链中 → 插入链首，成为主排序，其余键自动降级为次要排序
 *
 * 「后点的为主」最符合直觉：用户最后点的那个通常是当下最关心的维度。
 * 想换优先级，再点一次已在链中的键就能把它提上来。
 * 例如先点「最新」再选「电池 ↓」→ ['battery_desc','newest']：
 * 先按电池降序，电池相同的再按发布时间降序 —— 两个条件都生效。
 */
export function setSort(key) {
  const dim = SORT_DIM[key]
  // 同维度互斥：换「价格 ↓」时把链里的「价格 ↑」顶掉，而不是堆在一起
  const rest = sortKeys.value.filter(k => k !== key && SORT_DIM[k] !== dim)
  const next = sortKeys.value[0] === key
    ? rest                    // 点主排序 = 取消它
    : [key, ...rest]          // 已在链中则提前，否则插入，都作为主排序
  sortKeys.value = next.length ? next : ['newest']   // 链空则回落到默认
  updateHash()
}

/** 只移除链中某个键（排序状态条上的 ✕） */
export function removeSort(key) {
  const next = sortKeys.value.filter(k => k !== key)
  sortKeys.value = next.length ? next : ['newest']
  updateHash()
}

/** 恢复默认排序（最新发布） */
export function resetSort() { sortKeys.value = ['newest']; updateHash() }

/**
 * 下拉选「更多排序」：选到占位项（空值）视为恢复默认。
 * 注：占位项必须可选，否则选了非常用排序后就没有取消入口。
 */
export function onMoreSort(e) {
  const v = e.target.value
  if (v) setSort(v)
  else resetSort()
}

// 下拉只放 5 个非常用排序；链里命中哪个就显示哪个（取优先级最高的那个）
const MORE_SORTS = new Set(['battery_desc', 'weight_asc', 'screen_desc', 'charging_desc', 'brand_asc'])
export const moreSortValue = computed({
  get: () => sortKeys.value.find(k => MORE_SORTS.has(k)) || '',
  set: () => {},
})
export const SORT_LABELS = {
  newest: '最新',
  price_asc: '价格 ↑',
  price_desc: '价格 ↓',
  battery_desc: '电池 ↓',
  weight_asc: '重量 ↑',
  screen_desc: '屏幕 ↓',
  charging_desc: '快充 ↓',
  brand_asc: '品牌 A-Z',
}
/** 单个键的中文名 */
export function sortKeyLabel(k) { return SORT_LABELS[k] || k }
/** 整条链的文案，如「电池 ↓ › 最新」 */
export const sortLabel = computed(() => sortKeys.value.map(sortKeyLabel).join(' › '))
/** 是否处于非默认排序（决定要不要显示排序状态条） */
export const hasCustomSort = computed(() => {
  const k = sortKeys.value
  return !(k.length === 1 && k[0] === 'newest')
})
/** 该键在链中的优先级序号（1 起）；不在链中返回 0 */
export function sortRank(k) {
  const i = sortKeys.value.indexOf(k)
  return i < 0 ? 0 : i + 1
}

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
