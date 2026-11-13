<template>
  <div class="section" style="margin-top: 4px">
    <div class="section-head">
      <h2 class="section-title">参数库</h2>
      <span class="section-desc">按参数精确筛选；想要全量规格就切「专业」模式</span>
    </div>

    <div class="list-layout">
      <aside class="filters" :class="{ open: filtersOpen }">
        <div class="filter-group">
          <div class="filter-title">场景</div>
          <div class="chips">
            <button v-for="s in SCENES" :key="s.id" class="chip" :class="{ on: scene === s.id }" @click="pickScene(s.id)">
              {{ s.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-title">价格</div>
          <div class="chips">
            <button v-for="b in BUDGETS" :key="b.id" class="chip" :class="{ on: priceBand === b.id }" @click="pickPrice(b.id)">
              {{ b.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-title">屏幕形态</div>
          <div class="chips">
            <button class="chip" :class="{ on: form === 'flat' }" @click="pickForm('flat')">直屏</button>
            <button class="chip" :class="{ on: form === 'curved' }" @click="pickForm('curved')">曲面</button>
            <button class="chip" :class="{ on: form === 'fold' }" @click="pickForm('fold')">折叠</button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-title">品牌</div>
          <div class="chips">
            <button v-for="b in brandList" :key="b" class="chip" :class="{ on: brands.includes(b) }" @click="pickBrand(b)">
              {{ b }}
            </button>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-sm" @click="clearAll">清空条件</button>
        </div>
      </aside>

      <div class="results">
        <div class="results-head">
          <button class="btn btn-sm filter-toggle" @click="filtersOpen = !filtersOpen">
            {{ filtersOpen ? '收起筛选' : '筛选' }}
          </button>
          <span class="results-count">共 <b>{{ filtered.length }}</b> 款</span>
          <span v-if="q" class="results-count">搜索「{{ q }}」</span>
          <select v-model="sort" aria-label="排序" @change="commit">
            <option v-for="s in SORTS" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
        </div>

        <div v-if="filtered.length" class="grid-cards">
          <PhoneCard v-for="p in filtered" :key="p.id" :phone="p" :score="profile(p)" />
        </div>
        <div v-else class="empty-state">
          没有符合条件的机型，试着放宽一个条件。
          <div style="margin-top:14px"><button class="btn btn-sm" @click="clearAll">清空条件</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PhoneCard from '../components/PhoneCard.vue'
import { route, replaceRoute } from '../lib/router.js'
import { state } from '../lib/store.js'
import {
  BUDGETS, SORTS, scoreOf, sortPhones,
} from '../lib/derive.js'

const SCENES = [
  { id: 'camera', label: '拍照优先', dim: 'camera' },
  { id: 'performance', label: '游戏性能', dim: 'performance' },
  { id: 'battery', label: '长续航', dim: 'battery' },
  { id: 'light', label: '轻薄 ≤200g', dim: 'portability' },
  { id: 'fold', label: '折叠屏' },
  { id: 'small', label: '小屏 ≤6.4″' },
]

const q = ref('')
const scene = ref('')
const brands = ref([])
const priceBand = ref('')
const form = ref('')
const sort = ref('recommend')
const filtersOpen = ref(false)

const brandList = computed(() => {
  const counts = new Map()
  state.phones.forEach(p => counts.set(p.brand, (counts.get(p.brand) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0])
})

function readUrl() {
  const qq = route.query
  q.value = qq.q || ''
  scene.value = qq.scene || ''
  brands.value = (qq.brand || '').split(',').filter(Boolean)
  priceBand.value = qq.price || ''
  form.value = qq.form || ''
  sort.value = qq.sort || 'recommend'
}
onMounted(readUrl)
watch(() => route.query, readUrl)

function commit() {
  replaceRoute('/list', {
    q: q.value, scene: scene.value, brand: brands.value.join(','),
    price: priceBand.value, form: form.value, sort: sort.value,
  })
}

function pickScene(id) { scene.value = scene.value === id ? '' : id; commit() }
function pickPrice(id) { priceBand.value = priceBand.value === id ? '' : id; commit() }
function pickForm(id) { form.value = form.value === id ? '' : id; commit() }
function pickBrand(b) {
  const i = brands.value.indexOf(b)
  if (i >= 0) brands.value.splice(i, 1)
  else brands.value.push(b)
  commit()
}
function clearAll() {
  q.value = ''; scene.value = ''; brands.value = []; priceBand.value = ''; form.value = ''; sort.value = 'recommend'
  commit()
}

function profile(p) { return scoreOf(state.profiles, p) }

const filtered = computed(() => {
  let list = state.phones
  if (q.value.trim()) {
    const needle = q.value.toLowerCase().replace(/\s+/g, '')
    list = list.filter(p => {
      const hay = [p.model, p.brand, p.processor, ...(p.tags || [])].join(' ').toLowerCase().replace(/\s+/g, '')
      return hay.includes(needle)
    })
  }
  if (brands.value.length) list = list.filter(p => brands.value.includes(p.brand))
  const band = BUDGETS.find(b => b.id === priceBand.value)
  if (band) list = list.filter(p => p.price && p.price >= band.min && p.price <= band.max)
  if (form.value === 'fold') list = list.filter(p => /折叠/.test(p.screen_form || ''))
  if (form.value === 'curved') list = list.filter(p => /曲面|微曲/.test(p.screen_form || ''))
  if (form.value === 'flat') list = list.filter(p => !/折叠|曲面|微曲/.test(p.screen_form || ''))

  if (scene.value === 'fold') list = list.filter(p => /折叠/.test(p.screen_form || ''))
  if (scene.value === 'small') list = list.filter(p => Number(p.screen_size || 99) <= 6.4)
  if (scene.value === 'light') list = list.filter(p => p.weight_g && p.weight_g <= 200)

  if (sort.value === 'recommend') {
    const sceneDef = SCENES.find(s => s.id === scene.value)
    if (sceneDef && sceneDef.dim) {
      const dim = sceneDef.dim
      return [...list].sort((a, b) => profile(b)[dim] - profile(a)[dim])
    }
  }
  return sortPhones(list, sort.value, state.profiles)
})
</script>
