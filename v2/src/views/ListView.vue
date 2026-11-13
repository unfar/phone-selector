<template>
  <div class="section" style="margin-top: 4px">
    <div class="section-head">
      <h2 class="section-title">参数库</h2>
      <span class="section-desc">按参数精确筛选；切「专业」模式可看表格与全量规格</span>
    </div>

    <div class="list-layout">
      <aside class="filters" :class="{ open: filtersOpen }">
        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('scene') }" @click="toggleGroup('scene')" :aria-expanded="openGroups.has('scene')">
            场景<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('scene')" class="chips">
            <button v-for="s in SCENES" :key="s.id" class="chip" :class="{ on: scene === s.id }" @click="pickScene(s.id)">
              {{ s.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('price') }" @click="toggleGroup('price')" :aria-expanded="openGroups.has('price')">
            价格<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('price')" class="chips">
            <button v-for="b in BUDGETS" :key="b.id" class="chip" :class="{ on: priceBand === b.id }" @click="pickPrice(b.id)">
              {{ b.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('form') }" @click="toggleGroup('form')" :aria-expanded="openGroups.has('form')">
            屏幕形态<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('form')" class="chips">
            <button class="chip" :class="{ on: form === 'flat' }" @click="pickForm('flat')">直屏</button>
            <button class="chip" :class="{ on: form === 'curved' }" @click="pickForm('curved')">曲面</button>
            <button class="chip" :class="{ on: form === 'fold' }" @click="pickForm('fold')">折叠</button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('size') }" @click="toggleGroup('size')" :aria-expanded="openGroups.has('size')">
            屏幕尺寸<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('size')" class="chips">
            <button v-for="b in SCREEN_SIZE_BANDS" :key="b.id" class="chip" :class="{ on: sizes.includes(b.id) }" @click="pickSize(b.id)">
              {{ b.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('feature') }" @click="toggleGroup('feature')" :aria-expanded="openGroups.has('feature')">
            特性<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('feature')" class="chips">
            <button v-for="f in FEATURE_FILTERS" :key="f.id" class="chip" :class="{ on: features.includes(f.id) }" @click="pickFeature(f.id)">
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('chip') }" @click="toggleGroup('chip')" :aria-expanded="openGroups.has('chip')">
            处理器<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('chip')" class="chips">
            <button v-for="c in CHIP_FAMILIES" :key="c.id" class="chip" :class="{ on: chips.includes(c.id) }" @click="pickChip(c.id)">
              {{ c.label }}
            </button>
            <button class="chip" :class="{ on: chips.includes('other') }" @click="pickChip('other')">其他</button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('protocol') }" @click="toggleGroup('protocol')" :aria-expanded="openGroups.has('protocol')">
            充电协议<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('protocol')" class="chips">
            <button v-for="p in PROTOCOL_OPTIONS" :key="p" class="chip" :class="{ on: protocols.includes(p) }" @click="pickProtocol(p)">
              {{ p }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <button class="filter-title" :class="{ open: openGroups.has('brand') }" @click="toggleGroup('brand')" :aria-expanded="openGroups.has('brand')">
            品牌<span class="caret">▾</span>
          </button>
          <div v-show="openGroups.has('brand')" class="chips">
            <button v-for="b in brandList" :key="b" class="chip" :class="{ on: brands.includes(b) }" @click="pickBrand(b)">
              {{ b }}
            </button>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-sm" @click="expandAll">展开全部</button>
          <button class="btn btn-sm" @click="collapseAll">收起全部</button>
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

        <div v-if="!filtered.length" class="empty-state">
          没有符合条件的机型，试着放宽一个条件。
          <div style="margin-top:14px"><button class="btn btn-sm" @click="clearAll">清空条件</button></div>
        </div>

        <template v-else-if="state.mode === 'pro'">
          <div class="pro-table-wrap">
            <table class="pro-table">
              <thead>
                <tr>
                  <th>机型</th><th>价格</th><th>综合</th><th>芯片</th><th>电池</th><th>充电</th>
                  <th>屏幕</th><th>重量</th><th>主摄</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in visibleList" :key="p.id">
                  <td>
                    <a class="pro-name" :href="'#/phone/' + encodeURIComponent(p.id)">{{ displayName(p) }}</a>
                    <div class="pro-brand">{{ p.brand }}</div>
                  </td>
                  <td class="num">{{ fmtPrice(p) }}</td>
                  <td class="num"><b>{{ profile(p).overall }}</b></td>
                  <td>{{ shortChip(p) }}</td>
                  <td class="num">{{ fmtBattery(p) }}</td>
                  <td class="num">{{ p.charging_w ? p.charging_w + 'W' : '—' }}</td>
                  <td>{{ fmtScreen(p) }}</td>
                  <td class="num">{{ fmtWeight(p) }}</td>
                  <td>{{ cameraBrief(p) }}</td>
                  <td>
                    <button class="btn btn-sm" :class="{ 'btn-primary': isComparing(p.id) }" @click="toggleCompare(p.id)">
                      {{ isComparing(p.id) ? '已选' : '+ 对比' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else>
          <div class="grid-cards">
            <PhoneCard v-for="p in visibleList" :key="p.id" :phone="p" :score="profile(p)" />
          </div>
        </template>

        <div v-if="filtered.length > visibleCount" class="load-more">
          <button class="btn" @click="visibleCount += PAGE_SIZE">
            加载更多（还有 {{ filtered.length - visibleCount }} 款）
          </button>
          <span>已显示 {{ visibleList.length }} / {{ filtered.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import PhoneCard from '../components/PhoneCard.vue'
import { route, replaceRoute } from '../lib/router.js'
import { state, isComparing, toggleCompare } from '../lib/store.js'
import {
  BUDGETS, SORTS, scoreOf, sortPhones,
  SCREEN_SIZE_BANDS, FEATURE_FILTERS, CHIP_FAMILIES, PROTOCOL_OPTIONS,
  chipFamily, normalizeProtocols,
  displayName, fmtPrice, fmtBattery, fmtScreen, fmtWeight, shortChip, cameraBrief,
} from '../lib/derive.js'

const SCENES = [
  { id: 'camera', label: '拍照优先', dim: 'camera' },
  { id: 'performance', label: '游戏性能', dim: 'performance' },
  { id: 'battery', label: '长续航', dim: 'battery' },
  { id: 'light', label: '轻薄 ≤200g', dim: 'portability' },
  { id: 'fold', label: '折叠屏' },
  { id: 'small', label: '小屏 ≤6.4″' },
]

const PAGE_SIZE = 24
const q = ref('')
const scene = ref('')
const brands = ref([])
const sizes = ref([])
const features = ref([])
const chips = ref([])
const protocols = ref([])
const priceBand = ref('')
const form = ref('')
const sort = ref('recommend')
const filtersOpen = ref(false)
const openGroups = ref(new Set(['scene', 'price', 'form', 'size', 'feature']))
function toggleGroup(id) {
  const s = new Set(openGroups.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  openGroups.value = s
}
function expandAll() { openGroups.value = new Set(['scene', 'price', 'form', 'size', 'feature', 'chip', 'protocol', 'brand']) }
function collapseAll() { openGroups.value = new Set() }
const visibleCount = ref(PAGE_SIZE)

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
  sizes.value = (qq.size || '').split(',').filter(Boolean)
  features.value = (qq.feature || '').split(',').filter(Boolean)
  chips.value = (qq.chip || '').split(',').filter(Boolean)
  protocols.value = (qq.proto || '').split(',').filter(Boolean)
  priceBand.value = qq.price || ''
  form.value = qq.form || ''
  sort.value = qq.sort || 'recommend'
  visibleCount.value = PAGE_SIZE
}
onMounted(readUrl)
watch(() => route.query, readUrl)

function commit() {
  replaceRoute('/list', {
    q: q.value, scene: scene.value, brand: brands.value.join(','),
    size: sizes.value.join(','), feature: features.value.join(','),
    chip: chips.value.join(','), proto: protocols.value.join(','),
    price: priceBand.value, form: form.value, sort: sort.value,
  })
  visibleCount.value = PAGE_SIZE
}

function pickScene(id) { scene.value = scene.value === id ? '' : id; commit() }
function pickPrice(id) { priceBand.value = priceBand.value === id ? '' : id; commit() }
function pickForm(id) { form.value = form.value === id ? '' : id; commit() }
function toggleIn(arrRef, id) {
  const arr = arrRef.value
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
  commit()
}
function pickSize(id) { toggleIn(sizes, id) }
function pickFeature(id) { toggleIn(features, id) }
function pickChip(id) { toggleIn(chips, id) }
function pickProtocol(id) { toggleIn(protocols, id) }
function pickBrand(id) { toggleIn(brands, id) }
function clearAll() {
  q.value = ''; scene.value = ''; brands.value = []; sizes.value = []
  features.value = []; chips.value = []; protocols.value = []
  priceBand.value = ''; form.value = ''
  sort.value = 'recommend'
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

  if (sizes.value.length) {
    const bands = SCREEN_SIZE_BANDS.filter(b => sizes.value.includes(b.id))
    list = list.filter(p => bands.some(b => Number(p.screen_size || 0) >= b.min && Number(p.screen_size || 0) < b.max))
  }
  if (features.value.length) {
    const tests = FEATURE_FILTERS.filter(f => features.value.includes(f.id))
    list = list.filter(p => tests.every(f => f.test(p)))
  }
  if (chips.value.length) list = list.filter(p => chips.value.includes(chipFamily(p)))
  if (protocols.value.length) {
    list = list.filter(p => {
      const has = normalizeProtocols(p)
      return protocols.value.every(x => has.has(x))
    })
  }

  if (sort.value === 'recommend') {
    const sceneDef = SCENES.find(s => s.id === scene.value)
    if (sceneDef && sceneDef.dim) {
      const dim = sceneDef.dim
      return [...list].sort((a, b) => profile(b)[dim] - profile(a)[dim])
    }
  }
  return sortPhones(list, sort.value, state.profiles)
})

const visibleList = computed(() => filtered.value.slice(0, visibleCount.value))
</script>
