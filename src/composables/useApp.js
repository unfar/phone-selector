import { ref, computed, reactive } from 'vue'
import { normDate, getSeriesName, featureTags, brandAccentColors, getDisplayName, getIpRating, getCameraSpecs, simplifyCapacity, getFoldableScreenDisplay, protocolTags, cpuTags, screenTypes, screenSizeRanges } from '../utils.js'

export const phones = ref([])
export const loading = ref(true)
export const error = ref(null)

// view: list | detail | compare
export const view = ref('list')
export const viewMode = ref(localStorage.getItem('ps_view_mode') || 'cards') // cards | table
export const detailId = ref(null)

export const selectedBrands = reactive(new Set())
export const selectedScreen = ref(null)
export const selectedCpu = reactive(new Set())
export const selectedTags = reactive(new Set())
export const selectedScreenSizes = reactive(new Set())
export const selectedProtocols = reactive(new Set())
export const currentSort = ref('newest')
export const searchQuery = ref('')
export const priceMin = ref(0)
export const priceMax = ref(20000)
export const sliderMaxPrice = ref(20000)
export const brandList = ref([])
export const compareList = ref([])

export function setPhones(data) {
  phones.value = data
  loading.value = false
  brandList.value = [...new Set(data.map(p => p.brand))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  const prices = data.map(p => p.price).filter(Boolean)
  if (prices.length) {
    const max = Math.ceil(Math.max(...prices) / 1000) * 1000
    sliderMaxPrice.value = max
    if (priceMax.value > max || priceMax.value === 20000) priceMax.value = max
  }
}

export function brandColor(brand) {
  return brandAccentColors[brand] || '#4f8cff'
}

export function openDetail(id) {
  detailId.value = id
  view.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
  updateHash()
}

export function openList() {
  view.value = 'list'
  detailId.value = null
  updateHash()
}

export function openCompare() {
  if (compareList.value.length < 2) {
    toast(compareList.value.length ? '再选 1 款即可对比' : '请先在列表中加入至少 2 款对比')
    return
  }
  view.value = 'compare'
  window.scrollTo({ top: 0, behavior: 'smooth' })
  updateHash()
}

export function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('ps_view_mode', mode)
}

export function toggleCompare(id) {
  const i = compareList.value.indexOf(id)
  if (i >= 0) compareList.value.splice(i, 1)
  else {
    if (compareList.value.length >= 4) return toast('最多对比 4 款')
    compareList.value.push(id)
  }
  updateHash()
}

export function clearCompare() {
  compareList.value = []
  updateHash()
}

export function isCompared(id) {
  return compareList.value.includes(id)
}

/** 搜索归一化：小写、去空格/符号，兼容「小米17 / findx9 / 一加15」 */
function normalizeSearchText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[＋+]/g, 'plus')
    .replace(/[×xＸ]/g, 'x')
    .replace(/[^\u4e00-\u9fff a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactSearchText(s) {
  return normalizeSearchText(s).replace(/\s+/g, '')
}

const BRAND_ALIASES = {
  apple: ['apple', '苹果', 'iphone'],
  huawei: ['huawei', '华为'],
  honor: ['honor', '荣耀'],
  xiaomi: ['xiaomi', '小米', 'mi'],
  redmi: ['redmi', '红米'],
  oppo: ['oppo'],
  vivo: ['vivo'],
  iqoo: ['iqoo'],
  oneplus: ['oneplus', '一加'],
  realme: ['realme', '真我'],
  samsung: ['samsung', '三星', 'galaxy'],
  redmagic: ['redmagic', '红魔', 'nubia', '努比亚'],
}

function brandAliasTokens(brand) {
  const key = String(brand || '').toLowerCase()
  // exact map first
  if (BRAND_ALIASES[key]) return BRAND_ALIASES[key]
  // common brand casing in data: HONOR / REDMI / OnePlus / RedMagic
  const map = {
    honor: BRAND_ALIASES.honor,
    redmi: BRAND_ALIASES.redmi,
    oneplus: BRAND_ALIASES.oneplus,
    redmagic: BRAND_ALIASES.redmagic,
    huawei: BRAND_ALIASES.huawei,
    xiaomi: BRAND_ALIASES.xiaomi,
    samsung: BRAND_ALIASES.samsung,
    apple: BRAND_ALIASES.apple,
    oppo: BRAND_ALIASES.oppo,
    vivo: BRAND_ALIASES.vivo,
    iqoo: BRAND_ALIASES.iqoo,
    realme: BRAND_ALIASES.realme,
  }
  if (map[key]) return map[key]
  for (const [k, aliases] of Object.entries(BRAND_ALIASES)) {
    if (key.includes(k)) return aliases
  }
  return [key].filter(Boolean)
}

/** 机型搜索：支持空格差异、中英文品牌别名、多关键词 AND */
function matchesSearch(p, rawQuery) {
  const q = normalizeSearchText(rawQuery)
  if (!q) return true

  const model = String(p.model || '')
  const brand = String(p.brand || '')
  const display = getDisplayName(p)
  // 型号相关字段（避免摄像头 15mm / 系统名误伤）
  const modelFields = [model, brand, display, p.network_model || '']
    .filter(Boolean).map(s => normalizeSearchText(s))
  const modelCompact = compactSearchText(modelFields.join(' '))

  // 扩展字段：处理器/标签等
  const extraFields = [
    p.processor || '',
    ...(p.tags || []),
  ].filter(Boolean).map(s => normalizeSearchText(s))
  const allCompact = compactSearchText([...modelFields, ...extraFields].join(' '))

  const qCompact = compactSearchText(q)
  // 1) 完整短语优先在型号字段命中
  if (qCompact && modelCompact.includes(qCompact)) return true
  // 2) 完整短语在扩展字段（如处理器）
  if (qCompact && allCompact.includes(qCompact)) return true

  const tokens = q.split(' ').filter(Boolean)
  if (tokens.length <= 1) {
    const t = tokens[0] || q
    const tCompact = compactSearchText(t)
    if (tCompact && modelCompact.includes(tCompact)) return true
    if (tCompact && allCompact.includes(tCompact)) return true

    // 中文品牌+数字连写：小米17 / 一加15 / 红魔11（只在 model/brand 上判）
    const m = t.match(/^([\u4e00-\u9fff]{1,4})([a-z0-9plus]+)$/i)
    if (m) {
      const [, zh, rest] = m
      const zc = compactSearchText(zh)
      const rc = compactSearchText(rest)
      const brandHit = brandAliasTokens(brand).some(a => {
        const ac = compactSearchText(a)
        return ac === zc || ac.includes(zc) || zc.includes(ac)
      })
      // 型号字段本身含中文品牌时也可
      const modelBrandHit = modelCompact.includes(zc)
      if ((brandHit || modelBrandHit) && rc && modelCompact.includes(rc)) return true
    }
    return false
  }

  // 多词 AND：每个 token 都要命中型号或品牌别名
  return tokens.every(token => {
    const tc = compactSearchText(token)
    if (!tc) return true
    if (modelCompact.includes(tc) || allCompact.includes(tc)) return true
    if (brandAliasTokens(brand).some(a => {
      const ac = compactSearchText(a)
      return ac === tc || tc.includes(ac) || ac.includes(tc)
    })) return true
    return false
  })
}

export function matchesFilters(p) {
  if (searchQuery.value) {
    if (!matchesSearch(p, searchQuery.value)) return false
  }
  if (selectedBrands.size && !selectedBrands.has(p.brand)) return false
  if (selectedScreen.value) {
    const screenVal = selectedScreen.value.replace(/^\S+\s*/, '')
    if (p.screen_form !== screenVal) return false
  }
  if (selectedCpu.size) {
    let ok = false
    for (const c of selectedCpu) if ((p.tags || []).includes(c) || (p.processor || '').includes(c)) { ok = true; break }
    if (!ok) return false
  }
  for (const t of selectedTags) {
    const inTags = (p.tags || []).includes(t)
    const inFeatures = (p.features || []).some(f => String(f).includes(t))
    if (!inTags && !inFeatures) return false
  }
  if (priceMin.value > 0 && p.price < priceMin.value) return false
  if (priceMax.value < sliderMaxPrice.value && p.price > priceMax.value) return false
  if (selectedScreenSizes.size) {
    let ok = false
    for (const s of selectedScreenSizes) {
      const range = screenSizeRanges.find(r => r.name === s)
      if (range && p.screen_size >= range.min && p.screen_size <= range.max) { ok = true; break }
    }
    if (!ok) return false
  }
  if (selectedProtocols.size) {
    const protos = p.charge_protocols || []
    for (const t of selectedProtocols) if (!protos.includes(t)) return false
  }
  return true
}

export function sortPhones(list) {
  const s = [...list]
  switch (currentSort.value) {
    case 'newest':
      s.sort((a, b) => {
        const d = normDate(b.release_date).localeCompare(normDate(a.release_date))
        if (d) return d
        const sa = a.brand + '|' + getSeriesName(a.model)
        const sb = b.brand + '|' + getSeriesName(b.model)
        const sc = sa.localeCompare(sb)
        if (sc) return sc
        return (a.price || 99999) - (b.price || 99999)
      })
      break
    case 'price_asc': s.sort((a, b) => (a.price || 99999) - (b.price || 99999)); break
    case 'price_desc': s.sort((a, b) => (b.price || 0) - (a.price || 0)); break
    case 'battery_desc': s.sort((a, b) => (b.battery_mah || 0) - (a.battery_mah || 0)); break
    case 'weight_asc': s.sort((a, b) => (a.weight_g || 9999) - (b.weight_g || 9999)); break
    case 'screen_desc': s.sort((a, b) => (b.screen_size || 0) - (a.screen_size || 0)); break
    case 'charging_desc': s.sort((a, b) => (b.charging_w || 0) - (a.charging_w || 0)); break
    case 'brand_asc': s.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)); break
  }
  return s
}

export const filteredPhones = computed(() => phones.value.filter(matchesFilters))
export const sortedPhones = computed(() => sortPhones(filteredPhones.value))
export const resultCount = computed(() => sortedPhones.value.length)
export const detailPhone = computed(() => phones.value.find(p => p.id === detailId.value) || null)
export const comparePhones = computed(() => compareList.value.map(id => phones.value.find(p => p.id === id)).filter(Boolean))

export function clearAllFilters() {
  selectedBrands.clear()
  selectedScreen.value = null
  selectedCpu.clear()
  selectedTags.clear()
  selectedScreenSizes.clear()
  selectedProtocols.clear()
  priceMin.value = 0
  priceMax.value = sliderMaxPrice.value
  searchQuery.value = ''
  updateHash()
}

export function updateHash() {
  const params = new URLSearchParams()
  if (view.value !== 'list') params.set('view', view.value)
  if (detailId.value) params.set('id', String(detailId.value))
  if (compareList.value.length) params.set('cmp', compareList.value.join(','))
  if (selectedBrands.size) params.set('brands', [...selectedBrands].join(','))
  if (selectedScreen.value) params.set('screen', selectedScreen.value)
  if (selectedCpu.size) params.set('cpu', [...selectedCpu].join(','))
  if (selectedTags.size) params.set('tags', [...selectedTags].join(','))
  if (selectedScreenSizes.size) params.set('screenSize', [...selectedScreenSizes].join(','))
  if (selectedProtocols.size) params.set('proto', [...selectedProtocols].join(','))
  if (priceMin.value > 0 || priceMax.value < sliderMaxPrice.value) {
    params.set('price', `${priceMin.value > 0 ? priceMin.value : ''}-${priceMax.value < sliderMaxPrice.value ? priceMax.value : ''}`)
  }
  if (currentSort.value !== 'newest') params.set('sort', currentSort.value)
  if (searchQuery.value) params.set('q', searchQuery.value)
  if (viewMode.value !== 'cards') params.set('mode', viewMode.value)
  history.replaceState(null, '', `#${params.toString()}`)
}

export function restoreStateFromHash() {
  const hash = location.hash.slice(1)
  if (!hash) return
  const params = new URLSearchParams(hash)
  const brands = params.get('brands'); if (brands) brands.split(',').forEach(b => selectedBrands.add(b))
  selectedScreen.value = params.get('screen') || null
  const cpu = params.get('cpu'); if (cpu) cpu.split(',').forEach(c => selectedCpu.add(c))
  const tags = params.get('tags'); if (tags) tags.split(',').forEach(t => selectedTags.add(t))
  const ss = params.get('screenSize'); if (ss) ss.split(',').forEach(s => selectedScreenSizes.add(s))
  const proto = params.get('proto'); if (proto) proto.split(',').forEach(t => selectedProtocols.add(t))
  const price = params.get('price')
  if (price) {
    const [a, b] = price.split('-')
    if (a) priceMin.value = parseInt(a)
    if (b) priceMax.value = parseInt(b)
  }
  currentSort.value = params.get('sort') || 'newest'
  searchQuery.value = params.get('q') || ''
  viewMode.value = params.get('mode') || viewMode.value
  const cmp = params.get('cmp'); if (cmp) compareList.value = cmp.split(',').map(n => Number(n)).filter(Boolean)
  const id = params.get('id'); if (id) detailId.value = Number(id)
  const v = params.get('view'); if (v === 'detail' || v === 'compare' || v === 'list') view.value = v
}

function toast(msg) {
  const old = document.querySelector('.toast'); if (old) old.remove()
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2200)
}

export function cardBrief(p) {
  const charge = []
  if (p.charging_w) charge.push(p.charging_w + 'W')
  if (p.wireless_charging_w) charge.push(p.wireless_charging_w + 'W无线')
  const screen = p.screen_form === '折叠屏'
    ? ((p.screen_unfolded?.size || p.screen_size || '') + '″折叠')
    : [p.screen_size ? p.screen_size + '″' : '', p.refresh_hz ? p.refresh_hz + 'Hz' : ''].filter(Boolean).join(' ')
  const cams = getCameraSpecs(p)
  const rear = cams.find(s => s.l === '后置')
  const cam = rear?.v?.split('\n')[0] || (p.camera_desc || '').split('|')[0].trim() || '—'
  return {
    charge: charge.join(' · ') || '—',
    screen: screen || '—',
    ip: getIpRating(p),
    cam,
    ram: p.ram ? simplifyCapacity(p.ram) : '—',
    storage: p.storage ? simplifyCapacity(p.storage) : '—',
    name: getDisplayName(p),
  }
}

export { featureTags, protocolTags, cpuTags, screenTypes, screenSizeRanges, getDisplayName, getIpRating, getCameraSpecs, simplifyCapacity, getFoldableScreenDisplay }
