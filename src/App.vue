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
        <input :value="searchQuery" @input="onSearch" placeholder="搜索机型 / 品牌 / 处理器（支持 小米17、一加15、findx9）" />
        <span class="x" v-if="searchQuery" @click="clearSearch">✕</span>
      </div>

      <div class="top-actions">
        <button class="btn ghost theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换浅色' : '切换暗色'">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
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
            <div class="sort-btns">
              <button class="sort-btn" :class="{ on: currentSort === 'newest' }" @click="setSort('newest')">最新</button>
              <button class="sort-btn" :class="{ on: currentSort === 'price_asc' }" @click="setSort('price_asc')">价格 ↑</button>
              <button class="sort-btn" :class="{ on: currentSort === 'price_desc' }" @click="setSort('price_desc')">价格 ↓</button>
            </div>
            <select class="select" :value="moreSortValue" @change="onMoreSort($event)">
              <option value="" disabled>更多…</option>
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
        <div class="detail-nav" v-if="prevNextPhones.prev || prevNextPhones.next">
          <button class="btn ghost" :disabled="!prevNextPhones.prev" @click="prevDetail" title="上一款">
            ← {{ prevNextPhones.prev?.model || '—' }}
          </button>
          <span class="nav-pos">{{ navPos }} / {{ resultCount }}</span>
          <button class="btn ghost" :disabled="!prevNextPhones.next" @click="nextDetail" title="下一款">
            {{ prevNextPhones.next?.model || '—' }} →
          </button>
        </div>
      </section>

      <section class="spec-blocks">
        <div class="panel spec-block">
          <h4>核心参数</h4>
          <div class="spec-rows">
            <div class="spec-row"><div class="k">入网型号</div><div class="v">{{ detailPhone.network_model || '—' }}</div></div>
            <div class="spec-row"><div class="k">处理器</div><div class="v">{{ detailPhone.processor || '—' }}</div></div>
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
          </div>
        </div>

        <div class="panel spec-block camera-block" v-if="cameraModules(detailPhone).modules.length">
          <h4>影像系统</h4>

          <div class="cam-section" v-if="cameraModules(detailPhone).rear.length">
            <div class="cam-section-title">
              <span class="cam-section-icon">📸</span>
              <span>后置摄像头</span>
              <span class="cam-section-count">{{ cameraModules(detailPhone).rear.length }} 颗</span>
            </div>
            <div class="cam-module-grid">
              <div
                v-for="(m, idx) in cameraModules(detailPhone).rear"
                :key="'r' + m.key + idx"
                class="cam-module"
                :class="'role-' + m.key"
              >
                <div class="cam-module-head">
                  <span class="cam-role">{{ m.label }}</span>
                  <span class="cam-mp" v-if="m.mp">{{ m.mp }}</span>
                </div>
                <div class="cam-summary">{{ m.summary }}</div>
                <div class="cam-chips" v-if="m.chips?.length">
                  <span v-for="c in m.chips" :key="c.k" class="cam-chip">
                    <em>{{ c.k }}</em>{{ c.v }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="cam-section cam-section-front" v-if="cameraModules(detailPhone).front.length">
            <div class="cam-section-title front">
              <span class="cam-section-icon">🤳</span>
              <span>前置摄像头</span>
              <span class="cam-section-count">{{ cameraModules(detailPhone).front.length }} 颗</span>
            </div>
            <div class="cam-module-grid" :class="{ single: cameraModules(detailPhone).front.length === 1 }">
              <div
                v-for="(m, idx) in cameraModules(detailPhone).front"
                :key="'f' + m.key + idx"
                class="cam-module role-front"
              >
                <div class="cam-module-head">
                  <span class="cam-role">{{ m.label }}</span>
                  <span class="cam-mp" v-if="m.mp">{{ m.mp }}</span>
                </div>
                <div class="cam-summary">{{ m.summary }}</div>
                <div class="cam-chips" v-if="m.chips?.length">
                  <span v-for="c in m.chips" :key="c.k" class="cam-chip">
                    <em>{{ c.k }}</em>{{ c.v }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="cam-raw" v-if="detailPhone.detailed_camera">
            <span class="k">原始参数</span>
            <span class="v">{{ detailPhone.detailed_camera }}</span>
          </div>
        </div>
        <div class="panel spec-block" v-else>
          <h4>影像系统</h4>
          <div class="spec-rows">
            <div class="spec-row full">
              <div class="k">影像</div>
              <div class="v">{{ detailPhone.camera_desc || detailPhone.detailed_camera || '—' }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- COMPARE -->
    <div v-else-if="view === 'compare'" class="compare-page">
      <div class="panel compare-shell">
        <div class="compare-head">
          <div>
            <h2>规格对比</h2>
            <p class="compare-sub">已选 {{ comparePhones.length }} / 4 款 · 差异项高亮</p>
          </div>
          <div class="compare-head-actions">
            <button class="btn" :class="{ active: compareDiffOnly }" @click="compareDiffOnly = !compareDiffOnly" v-if="comparePhones.length >= 2">
              {{ compareDiffOnly ? '显示全部' : '只看差异' }}
            </button>
            <button class="btn" @click="clearCompare">清空</button>
            <button class="btn ghost" @click="openList">返回</button>
          </div>
        </div>

        <div v-if="comparePhones.length < 2" class="empty">
          <div class="big">📊</div>
          至少选择 2 款机型才能对比
          <div style="margin-top:12px">
            <button class="btn primary" @click="openList">去列表添加</button>
          </div>
        </div>

        <template v-else>
          <!-- 已选机型条：移动端横向滚动 -->
          <div class="compare-phones-bar">
            <div v-for="p in comparePhones" :key="p.id" class="compare-phone-chip">
              <div class="chip-brand" :style="{ background: brandColor(p.brand) }">{{ p.brand }}</div>
              <div class="chip-name">{{ brief(p).name }}</div>
              <div class="chip-price">{{ priceText(p) }}</div>
              <div class="chip-actions">
                <button class="mini-btn" @click="openDetail(p.id)">详情</button>
                <button class="mini-btn" @click="toggleCompare(p.id)">移除</button>
              </div>
            </div>
          </div>

          <!-- 桌面：宽表 -->
          <div class="compare-table-wrap desktop-only">
            <table class="compare">
              <thead>
                <tr>
                  <th>参数</th>
                  <th v-for="p in comparePhones" :key="p.id">
                    <div class="phone-col-title">{{ brief(p).name }}</div>
                    <div class="phone-col-sub">{{ priceText(p) }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in visibleCompareRows" :key="row.l" :class="{ 'row-diff': !row.same }">
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

          <!-- 移动端：按参数分行的卡片对比 -->
          <div class="compare-cards mobile-only">
            <div
              v-for="row in visibleCompareRows"
              :key="row.l"
              class="compare-card"
              :class="{ same: row.same, diff: !row.same }"
            >
              <div class="compare-card-label">
                <span>{{ row.l }}</span>
                <span class="tag" v-if="!row.same">有差异</span>
                <span class="tag same-tag" v-else>相同</span>
              </div>
              <div class="compare-card-values" :style="{ '--cols': comparePhones.length }">
                <div
                  v-for="(val, idx) in row.values"
                  :key="idx"
                  class="compare-card-cell"
                  :class="row.same ? 'same' : 'diff'"
                >
                  <div class="cell-phone">{{ brief(comparePhones[idx]).name }}</div>
                  <div class="cell-val">{{ val }}</div>
                </div>
              </div>
            </div>
            <div v-if="!visibleCompareRows.length" class="empty" style="padding:28px 12px">
              当前没有差异项
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 移动端底部对比入口 -->
    <div class="compare-dock" v-if="view === 'list' && compareList.length">
      <div class="dock-info">
        <strong>已选 {{ compareList.length }} 款</strong>
        <span>最多 4 款</span>
      </div>
      <div class="dock-actions">
        <button class="btn ghost" @click="clearCompare">清空</button>
        <button class="btn primary" :disabled="compareList.length < 2" @click="openCompare">
          {{ compareList.length < 2 ? '再选一款' : '去对比' }}
        </button>
      </div>
    </div>

    <footer>
      机选 · 浅色通透目录风 · 列表 / 详情 / 对比<br>
      数据来源：各品牌官网 · 截至 2026-07-19 · 共计 {{ resultCount }} 款<br>
      Made with ❤️ by Lumi
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  phones, loading, error, setPhones, view, viewMode, searchQuery, currentSort,
  selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes, selectedProtocols,
  priceMin, priceMax, sliderMaxPrice, brandList, compareList, resultCount, sortedPhones,
  detailPhone, comparePhones, openList, openDetail, openCompare, setViewMode, toggleCompare,
  clearCompare, isCompared, clearAllFilters, updateHash, restoreStateFromHash, brandColor, cardBrief,
  featureTags, protocolTags, cpuTags, screenTypes, screenSizeRanges, getFoldableScreenDisplay, getCameraSpecs, getCameraModules,
  prevNextPhones, prevDetail, nextDetail
} from './composables/useApp.js'

const navPos = computed(() => {
  const list = sortedPhones.value
  const dp = detailPhone.value
  if (!dp) return 0
  const idx = list.findIndex(p => p.id === dp.id)
  return idx >= 0 ? idx + 1 : 0
})
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
function cameraModules(p) {
  return getCameraModules(p)
}
function cameraFull(p) {
  const mods = getCameraModules(p)
  if (mods.lines?.length) return mods.lines.join('\n')
  return p.camera_desc || p.detailed_camera || '—'
}

function onSearch(e) { searchQuery.value = e.target.value; updateHash() }
function setSort(sort) { currentSort.value = sort; updateHash() }
function onMoreSort(e) { if (e.target.value) setSort(e.target.value); e.target.value = ''; }
const moreSortValue = ref('')
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

const compareDiffOnly = ref(false)

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

const visibleCompareRows = computed(() => {
  const rows = compareRows.value
  return compareDiffOnly.value ? rows.filter(r => !r.same) : rows
})

const theme = ref(localStorage.getItem('ps-theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('ps-theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', theme.value)
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
