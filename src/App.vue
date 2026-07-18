<template>
  <div class="app">
    <header class="top">
      <div class="logo" @click="openList" style="cursor:pointer">
        <div class="logo-badge">📱</div>
        <div>
          <h1>智能手机选购助手</h1>
          <p>国行选购 · 参数对比</p>
        </div>
      </div>

      <div class="search" v-if="view === 'list'">
        <span class="ico">🔍</span>
        <input :value="searchQuery" @input="onSearch" placeholder="搜索机型 / 品牌 / 处理器" />
        <span class="x" v-if="searchQuery" @click="clearSearch">✕</span>
      </div>

      <div class="top-actions">
        <button v-if="view !== 'list'" class="btn ghost" @click="openList">← 返回列表</button>
        <button class="btn" :class="{ active: compareList.length }" @click="openCompare">
          对比
          <span v-if="compareList.length" class="badge-count">{{ compareList.length }}</span>
        </button>
      </div>
    </header>

    <!-- LIST -->
    <div v-if="view === 'list'" class="shell">
      <aside class="side">
        <div class="panel">
          <h3>筛选条件</h3>

          <details class="section" open>
            <summary>品牌 <span v-if="selectedBrands.size" class="count">({{ selectedBrands.size }})</span></summary>
            <div class="chips">
              <button
                v-for="b in brandList" :key="b" class="chip brand"
                :class="{ on: selectedBrands.has(b) }"
                :style="{ '--bcolor': brandColor(b) }"
                @click="toggleBrand(b)"
              >{{ b }}</button>
            </div>
          </details>

          <details class="section" open>
            <summary>价格 <span v-if="priceActive" class="count">(已设)</span></summary>
            <div class="price-box">
              <div class="price-row">
                <label>最低
                  <input type="number" :value="priceMin" min="0" step="100" @change="onPriceMin" />
                </label>
                <label>最高
                  <input type="number" :value="priceMax" min="0" step="100" @change="onPriceMax" />
                </label>
              </div>
            </div>
          </details>

          <details class="section">
            <summary>屏幕形态 <span v-if="selectedScreen" class="count">(1)</span></summary>
            <div class="chips">
              <button v-for="s in screenTypes" :key="s" class="chip" :class="{ on: selectedScreen === s }" @click="selectScreen(s)">{{ s }}</button>
            </div>
          </details>

          <details class="section">
            <summary>处理器 <span v-if="selectedCpu.size" class="count">({{ selectedCpu.size }})</span></summary>
            <div class="chips">
              <button v-for="t in cpuTags" :key="t" class="chip" :class="{ on: selectedCpu.has(t) }" @click="toggleSet(selectedCpu, t)">{{ t }}</button>
            </div>
          </details>

          <details class="section">
            <summary>特性 <span v-if="selectedTags.size" class="count">({{ selectedTags.size }})</span></summary>
            <div class="chips">
              <button v-for="t in featureTags" :key="t" class="chip" :class="{ on: selectedTags.has(t) }" @click="toggleSet(selectedTags, t)">{{ t }}</button>
            </div>
          </details>

          <details class="section">
            <summary>充电协议 <span v-if="selectedProtocols.size" class="count">({{ selectedProtocols.size }})</span></summary>
            <div class="chips">
              <button v-for="t in protocolTags" :key="t" class="chip" :class="{ on: selectedProtocols.has(t) }" @click="toggleSet(selectedProtocols, t)">{{ t }}</button>
            </div>
          </details>

          <details class="section">
            <summary>屏幕尺寸 <span v-if="selectedScreenSizes.size" class="count">({{ selectedScreenSizes.size }})</span></summary>
            <div class="chips">
              <button v-for="r in screenSizeRanges" :key="r.name" class="chip" :class="{ on: selectedScreenSizes.has(r.name) }" @click="toggleSet(selectedScreenSizes, r.name)">{{ r.name }}</button>
            </div>
          </details>

          <button class="btn" style="width:100%;margin-top:6px" @click="clearAllFilters">清空筛选</button>
        </div>
      </aside>

      <main class="main">
        <div class="panel toolbar">
          <div class="stats">
            <template v-if="hasFilters">筛选后 <b>{{ resultCount }}</b> / {{ phones.length }} 款</template>
            <template v-else>共 <b>{{ resultCount }}</b> 款机型</template>
          </div>
          <div class="toolbar-right">
            <div class="seg">
              <button :class="{ on: viewMode === 'cards' }" @click="setViewMode('cards')">卡片</button>
              <button :class="{ on: viewMode === 'table' }" @click="setViewMode('table')">表格</button>
            </div>
            <select class="select" v-model="currentSort" @change="updateHash">
              <option value="newest">最新发布</option>
              <option value="price_asc">价格 ↑</option>
              <option value="price_desc">价格 ↓</option>
              <option value="battery_desc">电池 ↓</option>
              <option value="weight_asc">重量 ↑</option>
              <option value="screen_desc">屏幕 ↓</option>
              <option value="charging_desc">快充 ↓</option>
              <option value="brand_asc">品牌 A-Z</option>
            </select>
          </div>
        </div>

        <div class="active-line" v-if="activePills.length">
          <span class="pill" v-for="(p,i) in activePills" :key="i">
            {{ p.label }} <button @click="p.clear">✕</button>
          </span>
          <button class="btn ghost" style="height:30px" @click="clearAllFilters">全部清空</button>
        </div>

        <div v-if="loading" class="empty"><div class="big">⏳</div>加载中…</div>
        <div v-else-if="error" class="empty"><div class="big">😢</div>{{ error }}</div>
        <div v-else-if="!sortedPhones.length" class="empty"><div class="big">😕</div>没有符合条件的机型</div>

        <!-- cards -->
        <div v-else-if="viewMode === 'cards'" class="grid">
          <article
            v-for="p in sortedPhones" :key="p.id"
            class="card" :class="{ selected: isCompared(p.id) }"
            :style="{ '--bcolor': brandColor(p.brand) }"
          >
            <div class="card-top">
              <div class="card-top-row">
                <span class="brand">{{ p.brand }}</span>
                <span class="price" :class="{ future: isFuture(p) }">{{ priceText(p) }}</span>
              </div>
              <div class="name">{{ brief(p).name }}</div>
              <div class="meta" v-if="p.release_date">{{ p.release_date }} 发布</div>
            </div>
            <div class="card-body">
              <div class="metrics">
                <div class="metric"><div class="k">芯片</div><div class="v">{{ p.processor || '—' }}</div></div>
                <div class="metric"><div class="k">电池</div><div class="v">{{ p.battery_mah ? p.battery_mah + 'mAh' : '—' }}</div></div>
                <div class="metric"><div class="k">充电</div><div class="v">{{ brief(p).charge }}</div></div>
                <div class="metric"><div class="k">重量</div><div class="v">{{ p.weight_g ? p.weight_g + 'g' : '—' }}</div></div>
                <div class="metric"><div class="k">屏幕</div><div class="v">{{ brief(p).screen }}</div></div>
                <div class="metric"><div class="k">防水</div><div class="v">{{ brief(p).ip }}</div></div>
              </div>
              <div class="cam">📸 {{ brief(p).cam }}</div>
              <div class="card-actions">
                <button class="btn" @click="openDetail(p.id)">详情</button>
                <button class="btn primary" @click="toggleCompare(p.id)">{{ isCompared(p.id) ? '已加入' : '+ 对比' }}</button>
              </div>
            </div>
          </article>
        </div>

        <!-- table -->
        <div v-else class="table-wrap panel">
          <table class="list">
            <thead>
              <tr>
                <th>机型</th><th>价格</th><th>芯片</th><th>电池</th><th>充电</th><th>屏幕</th><th>重量</th><th>防水</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in sortedPhones" :key="p.id">
                <td class="name-cell" @click="openDetail(p.id)">{{ brief(p).name }}</td>
                <td>{{ priceText(p) }}</td>
                <td>{{ p.processor || '—' }}</td>
                <td>{{ p.battery_mah ? p.battery_mah + 'mAh' : '—' }}</td>
                <td>{{ brief(p).charge }}</td>
                <td>{{ brief(p).screen }}</td>
                <td>{{ p.weight_g ? p.weight_g + 'g' : '—' }}</td>
                <td>{{ brief(p).ip }}</td>
                <td>
                  <button class="mini-btn" @click="openDetail(p.id)">详情</button>
                  <button class="mini-btn" :class="{ on: isCompared(p.id) }" @click="toggleCompare(p.id)">
                    {{ isCompared(p.id) ? '已选' : '对比' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- DETAIL -->
    <div v-else-if="view === 'detail' && detailPhone" class="detail">
      <section class="detail-hero" :style="{ '--bcolor': brandColor(detailPhone.brand) }">
        <div class="brand">{{ detailPhone.brand }}</div>
        <h2>{{ brief(detailPhone).name }}</h2>
        <div class="price-lg">{{ priceText(detailPhone) }}</div>
        <div class="meta" style="margin-top:8px">{{ detailPhone.release_date || '—' }} 发布 · {{ detailPhone.os || '系统待补' }}</div>
        <div class="detail-actions">
          <button class="btn primary" @click="toggleCompare(detailPhone.id)">
            {{ isCompared(detailPhone.id) ? '已加入对比' : '+ 加入对比' }}
          </button>
          <button class="btn" @click="openCompare" v-if="compareList.length >= 2">去对比页</button>
          <button class="btn ghost" @click="openList">返回列表</button>
        </div>
      </section>

      <section class="spec-blocks">
        <div class="panel spec-block">
          <h4>核心参数</h4>
          <div class="spec-rows">
            <div class="spec-row"><div class="k">处理器</div><div class="v">{{ detailPhone.processor || '—' }}</div></div>
            <div class="spec-row"><div class="k">入网型号</div><div class="v">{{ detailPhone.network_model || '—' }}</div></div>
            <div class="spec-row"><div class="k">内存</div><div class="v">{{ brief(detailPhone).ram }}</div></div>
            <div class="spec-row"><div class="k">存储</div><div class="v">{{ brief(detailPhone).storage }}</div></div>
            <div class="spec-row"><div class="k">电池</div><div class="v">{{ detailPhone.battery_mah ? detailPhone.battery_mah + 'mAh' : '—' }}</div></div>
            <div class="spec-row"><div class="k">重量</div><div class="v">{{ detailPhone.weight_g ? detailPhone.weight_g + 'g' : '—' }}</div></div>
            <div class="spec-row"><div class="k">充电</div><div class="v">{{ brief(detailPhone).charge }}</div></div>
            <div class="spec-row"><div class="k">USB</div><div class="v">{{ detailPhone.usb_version || '—' }}</div></div>
            <div class="spec-row"><div class="k">屏幕</div><div class="v">{{ getFoldableScreenDisplay(detailPhone) || brief(detailPhone).screen }}</div></div>
            <div class="spec-row"><div class="k">分辨率/刷新率</div><div class="v">{{ resolutionText(detailPhone) }}</div></div>
            <div class="spec-row"><div class="k">防尘抗水</div><div class="v">{{ brief(detailPhone).ip }}</div></div>
            <div class="spec-row"><div class="k">系统</div><div class="v">{{ detailPhone.os || '—' }}</div></div>
            <div class="spec-row full" v-if="detailPhone.charge_protocols?.length">
              <div class="k">充电协议</div><div class="v">{{ detailPhone.charge_protocols.join(' · ') }}</div>
            </div>
            <div class="spec-row full">
              <div class="k">影像</div>
              <div class="v">{{ cameraFull(detailPhone) }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- COMPARE -->
    <div v-else-if="view === 'compare'" class="panel" style="padding:14px">
      <div class="compare-head">
        <div>
          <h2 style="font-size:1.15rem">规格对比</h2>
          <p style="color:var(--muted);font-size:.82rem;margin-top:4px">已选 {{ comparePhones.length }} / 4 款 · 差异项高亮</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn" @click="clearCompare">清空</button>
          <button class="btn ghost" @click="openList">返回列表</button>
        </div>
      </div>

      <div v-if="comparePhones.length < 2" class="empty">
        <div class="big">📊</div>
        至少选择 2 款机型才能对比
      </div>

      <div v-else class="compare-table-wrap">
        <table class="compare">
          <thead>
            <tr>
              <th>参数</th>
              <th v-for="p in comparePhones" :key="p.id">
                <div class="phone-col-title">{{ brief(p).name }}</div>
                <div class="phone-col-sub">{{ priceText(p) }}</div>
                <button class="mini-btn" style="margin-top:6px" @click="toggleCompare(p.id)">移除</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in compareRows" :key="row.l">
              <td>{{ row.l }}</td>
              <td
                v-for="(val, idx) in row.values"
                :key="idx"
                :class="row.same ? 'same' : 'diff'"
              >{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <footer>
      参考精品目录风设计：浅色通透 · 列表 / 详情 / 对比<br>
      数据来源：各品牌官网 · 仅供参考 · Made with ❤️ by Lumi
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import {
  phones, loading, error, setPhones, view, viewMode, searchQuery, currentSort,
  selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes, selectedProtocols,
  priceMin, priceMax, sliderMaxPrice, brandList, compareList, resultCount, sortedPhones,
  detailPhone, comparePhones, openList, openDetail, openCompare, setViewMode, toggleCompare,
  clearCompare, isCompared, clearAllFilters, updateHash, restoreStateFromHash, brandColor, cardBrief,
  featureTags, protocolTags, cpuTags, screenTypes, screenSizeRanges, getFoldableScreenDisplay, getCameraSpecs
} from './composables/useApp.js'

const today = new Date().toISOString().split('T')[0]
const priceActive = computed(() => priceMin.value > 0 || priceMax.value < sliderMaxPrice.value)
const hasFilters = computed(() => !!(
  searchQuery.value || selectedBrands.size || selectedScreen.value || selectedCpu.size ||
  selectedTags.size || selectedScreenSizes.size || selectedProtocols.size || priceActive.value
))

function brief(p) { return cardBrief(p) }
function isFuture(p) { return p.release_date && p.release_date.length >= 10 && p.release_date > today }
function priceText(p) {
  if (isFuture(p)) {
    const [, m, d] = p.release_date.split('-')
    return `${m}/${d}`
  }
  return p.price ? '¥' + p.price : '—'
}
function resolutionText(p) {
  return ((p.resolution || '') + ' · ' + (p.refresh_hz ? p.refresh_hz + 'Hz' : '')).replace(/^ · /, '').replace(/ · $/, '') || '—'
}
function cameraFull(p) {
  const cams = getCameraSpecs(p)
  const rear = cams.find(s => s.l === '后置')
  const front = cams.find(s => s.l === '前置')
  const parts = []
  if (rear) parts.push(rear.v)
  if (front) parts.push('前置 ' + front.v)
  return parts.join('\n') || p.camera_desc || '—'
}

function onSearch(e) { searchQuery.value = e.target.value; updateHash() }
function clearSearch() { searchQuery.value = ''; updateHash() }
function toggleBrand(b) { selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b); updateHash() }
function toggleSet(set, v) { set.has(v) ? set.delete(v) : set.add(v); updateHash() }
function selectScreen(s) {
  selectedScreen.value = selectedScreen.value === s ? null : s
  updateHash()
}
function onPriceMin(e) {
  let v = parseInt(e.target.value || '0')
  if (Number.isNaN(v)) v = 0
  priceMin.value = Math.max(0, Math.min(v, priceMax.value))
  updateHash()
}
function onPriceMax(e) {
  let v = parseInt(e.target.value || String(sliderMaxPrice.value))
  if (Number.isNaN(v)) v = sliderMaxPrice.value
  priceMax.value = Math.max(priceMin.value, Math.min(v, sliderMaxPrice.value))
  updateHash()
}

const activePills = computed(() => {
  const out = []
  if (searchQuery.value) out.push({ label: '🔍 ' + searchQuery.value, clear: clearSearch })
  selectedBrands.forEach(b => out.push({ label: b, clear: () => { selectedBrands.delete(b); updateHash() } }))
  if (selectedScreen.value) out.push({ label: selectedScreen.value, clear: () => { selectedScreen.value = null; updateHash() } })
  selectedCpu.forEach(c => out.push({ label: c, clear: () => { selectedCpu.delete(c); updateHash() } }))
  selectedTags.forEach(t => out.push({ label: t, clear: () => { selectedTags.delete(t); updateHash() } }))
  selectedProtocols.forEach(t => out.push({ label: '🔌 ' + t, clear: () => { selectedProtocols.delete(t); updateHash() } }))
  selectedScreenSizes.forEach(s => out.push({ label: s, clear: () => { selectedScreenSizes.delete(s); updateHash() } }))
  if (priceActive.value) out.push({
    label: `¥${priceMin.value || 0}-${priceMax.value}`,
    clear: () => { priceMin.value = 0; priceMax.value = sliderMaxPrice.value; updateHash() }
  })
  return out
})

const compareRows = computed(() => {
  const ps = comparePhones.value
  if (ps.length < 2) return []
  const fields = [
    { l: '价格', v: p => priceText(p) },
    { l: '处理器', v: p => p.processor || '—' },
    { l: '内存', v: p => brief(p).ram },
    { l: '存储', v: p => brief(p).storage },
    { l: '电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—' },
    { l: '充电', v: p => brief(p).charge },
    { l: '屏幕', v: p => brief(p).screen },
    { l: '分辨率/刷新率', v: p => resolutionText(p) },
    { l: '重量', v: p => p.weight_g ? p.weight_g + 'g' : '—' },
    { l: '防尘抗水', v: p => brief(p).ip },
    { l: 'USB', v: p => p.usb_version || '—' },
    { l: '系统', v: p => p.os || '—' },
    { l: '影像', v: p => brief(p).cam },
    { l: '发布日期', v: p => p.release_date || '—' },
  ]
  return fields.map(f => {
    const values = ps.map(p => f.v(p))
    const same = values.every(v => v === values[0])
    return { l: f.l, values, same }
  })
})

onMounted(async () => {
  try {
    const resp = await fetch('data/phones.json')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    setPhones(data.filter(p => p.processor && p.price))
    restoreStateFromHash()
    updateHash()
  } catch (e) {
    loading.value = false
    error.value = e.message
  }
})
</script>
