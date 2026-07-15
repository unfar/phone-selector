import { ref, computed, reactive } from 'vue'
import { normDate, getSeriesName, featureTags } from '../utils.js'

// ===== Shared reactive state =====
export const phones = ref([])
export const loading = ref(true)
export const error = ref(null)

export function setPhones(data) {
  phones.value = data
  loading.value = false
  // Init brandList
  const brands = [...new Set(data.map(p => p.brand))]
  brandList.value = brands.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

// ===== Filter & Sort State =====
export const selectedBrands = reactive(new Set())
export const selectedScreen = ref(null)
export const selectedCpu = reactive(new Set())
export const selectedTags = reactive(new Set())
export const selectedScreenSizes = reactive(new Set())
export const selectedProtocols = reactive(new Set())
export const currentSort = ref('newest')
export const searchQuery = ref('')

// Price slider
export const priceMin = ref(0)
export const priceMax = ref(20000)
export const sliderMaxPrice = ref(20000)

// Derived
export const brandList = ref([])

export function brandCount(brand) {
  return phones.value.filter(p => p.brand === brand).length
}

// ===== URL Hash =====
export function updateHash() {
  const params = new URLSearchParams()
  if (selectedBrands.size > 0) params.set('brands', [...selectedBrands].join(','))
  if (selectedScreen.value) params.set('screen', selectedScreen.value)
  if (selectedCpu.size > 0) params.set('cpu', [...selectedCpu].join(','))
  if (selectedTags.size > 0) params.set('tags', [...selectedTags].join(','))
  if (priceMin.value > 0 || priceMax.value < sliderMaxPrice.value) {
    let priceStr = ''
    if (priceMin.value > 0) priceStr += priceMin.value
    priceStr += '-'
    if (priceMax.value < sliderMaxPrice.value) priceStr += priceMax.value
    params.set('price', priceStr)
  }
  if (selectedScreenSizes.size > 0) params.set('screenSize', [...selectedScreenSizes].join(','))
  if (selectedProtocols.size > 0) params.set('proto', [...selectedProtocols].join(','))
  if (currentSort.value !== 'newest') params.set('sort', currentSort.value)
  if (searchQuery.value) params.set('q', searchQuery.value)
  history.replaceState(null, '', `#${params.toString()}`)
}

export function restoreStateFromHash() {
  const hash = location.hash.slice(1)
  if (!hash) return
  const params = new URLSearchParams(hash)
  const brands = params.get('brands')
  if (brands) brands.split(',').forEach(b => selectedBrands.add(b))
  selectedScreen.value = params.get('screen') || null
  const cpu = params.get('cpu')
  if (cpu) cpu.split(',').forEach(c => selectedCpu.add(c))
  const tags = params.get('tags')
  if (tags) tags.split(',').forEach(t => selectedTags.add(t))
  const screenSizes = params.get('screenSize')
  if (screenSizes) screenSizes.split(',').forEach(s => selectedScreenSizes.add(s))
  const proto = params.get('proto')
  if (proto) proto.split(',').forEach(t => selectedProtocols.add(t))
  const price = params.get('price')
  if (price) {
    const parts = price.split('-')
    if (parts[0]) priceMin.value = parseInt(parts[0])
    if (parts[1]) priceMax.value = parseInt(parts[1])
  }
  currentSort.value = params.get('sort') || 'newest'
  searchQuery.value = params.get('q') || ''
}

// ===== Filter logic =====
export function matchesFilters(p) {
  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    const matchFields = [
      p.model, p.brand, (p.processor || ''), (p.camera_desc || ''),
      ...(p.tags || []), ...(p.features || [])
    ].filter(Boolean).map(s => s.toLowerCase())
    if (!matchFields.some(s => s.includes(q))) return false
  }
  if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false
  if (selectedScreen.value) {
    const screenVal = selectedScreen.value.replace(/^\S+\s*/, '')
    if (p.screen_form !== screenVal) return false
  }
  if (selectedCpu.size > 0) {
    let has = false
    for (let c of selectedCpu) if (p.tags.includes(c)) { has = true; break }
    if (!has) return false
  }
  const tagsRequireBoth = new Set(['NFC', '红外', 'USB3.0', '无线充电', '防尘抗水', '潜望长焦', '6500mAh+', '≤200g', '散热风扇', '有线投屏'])
  for (let t of selectedTags) {
    if (tagsRequireBoth.has(t)) {
      const inTags = p.tags.includes(t)
      const inFeatures = (p.features || []).some(f => f.includes(t))
      if (!inTags && !inFeatures) return false
    } else {
      if (!p.tags.includes(t)) return false
    }
  }
  if (priceMin.value > 0 && p.price < priceMin.value) return false
  if (priceMax.value < sliderMaxPrice.value && p.price > priceMax.value) return false
  if (selectedScreenSizes.size > 0) {
    let inSize = false
    for (let s of selectedScreenSizes) {
      const range = [{ name: "6英寸左右", min: 5.7, max: 6.3 }, { name: "6.5英寸左右", min: 6.2, max: 6.8 }, { name: "7英寸左右", min: 6.7, max: 7.5 }].find(sr => sr.name === s)
      if (range && p.screen_size >= range.min && p.screen_size <= range.max) { inSize = true; break }
    }
    if (!inSize) return false
  }
  if (selectedProtocols.size > 0) {
    const protos = p.charge_protocols || []
    for (let t of selectedProtocols) {
      if (!protos.includes(t)) return false
    }
  }
  return true
}

// ===== Sort logic =====
export function sortPhones(list) {
  const s = [...list]
  switch (currentSort.value) {
    case 'newest':
      s.sort((a, b) => {
        const dateCmp = normDate(b.release_date).localeCompare(normDate(a.release_date))
        if (dateCmp !== 0) return dateCmp
        const seriesA = a.brand + '|' + getSeriesName(a.model)
        const seriesB = b.brand + '|' + getSeriesName(b.model)
        const seriesCmp = seriesA.localeCompare(seriesB)
        if (seriesCmp !== 0) return seriesCmp
        return (a.price || 99999) - (b.price || 99999)
      })
      break
    case 'price_asc': s.sort((a, b) => (a.price || 99999) - (b.price || 99999)); break
    case 'price_desc': s.sort((a, b) => (b.price || 0) - (a.price || 0)); break
    case 'battery_desc': s.sort((a, b) => b.battery_mah - a.battery_mah); break
    case 'weight_asc': s.sort((a, b) => (a.weight_g || 9999) - (b.weight_g || 9999)); break
    case 'screen_desc': s.sort((a, b) => b.screen_size - a.screen_size); break
    case 'charging_desc': s.sort((a, b) => b.charging_w - a.charging_w); break
    case 'brand_asc': s.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model)); break
  }
  return s
}

// ===== Computed filters =====
export const filteredPhones = computed(() => {
  return phones.value.filter(matchesFilters)
})

export const sortedPhones = computed(() => {
  return sortPhones(filteredPhones.value)
})

export const resultCount = computed(() => sortedPhones.value.length)

// ===== Clear all filters =====
export function clearAllFilters() {
  selectedBrands.clear()
  selectedScreen.value = null
  selectedCpu.clear()
  selectedTags.clear()
  priceMin.value = 0
  priceMax.value = sliderMaxPrice.value
  selectedScreenSizes.clear()
  selectedProtocols.clear()
  updateHash()
}
