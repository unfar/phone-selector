<template>
  <div class="toolbar">
    <div class="result-info">
      <template v-if="isFiltered">
        筛选后 <strong>{{ resultCount }}</strong> / {{ totalCount }} 款
      </template>
      <template v-else>
        共 <strong>{{ resultCount }}</strong> 款机型
      </template>
      <span class="toolbar-hint">点击卡片加入对比</span>
    </div>
    <div class="toolbar-right">
      <button :class="['compare-mode-btn', { active: compareList.length > 0 }]" @click="openCompare">
        📊 对比
        <span v-if="compareList.length" class="compare-count-badge">{{ compareList.length }}</span>
      </button>
      <select class="sort-select" v-model="currentSort" @change="onSortChange">
        <option value="newest">🆕 最新发布</option>
        <option value="price_asc">💰 价格低 ↑</option>
        <option value="price_desc">💰 价格高 ↓</option>
        <option value="battery_desc">🔋 电池容量 ↓</option>
        <option value="weight_asc">⚖️ 重量轻 ↑</option>
        <option value="screen_desc">📐 屏幕大 ↓</option>
        <option value="charging_desc">⚡ 快充功率 ↓</option>
        <option value="brand_asc">🏢 品牌 A-Z</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  resultCount, currentSort, updateHash, phones,
  selectedBrands, selectedScreen, selectedCpu, selectedTags,
  selectedScreenSizes, selectedProtocols, searchQuery, priceMin, priceMax, sliderMaxPrice
} from '../composables/useFilters.js'
import { compareList } from '../composables/useCompare.js'

const totalCount = computed(() => phones.value.length)
const isFiltered = computed(() => !!(
  searchQuery.value || selectedBrands.size || selectedScreen.value || selectedCpu.size ||
  selectedTags.size || selectedScreenSizes.size || selectedProtocols.size ||
  priceMin.value > 0 || priceMax.value < sliderMaxPrice.value
))

function onSortChange() { updateHash() }
function openCompare() {
  if (compareList.value.length >= 2) {
    document.getElementById('comparePanel').style.display = 'flex'
  } else {
    const existing = document.querySelector('.compare-toast')
    if (existing) existing.remove()
    const toast = document.createElement('div')
    toast.className = 'compare-toast'
    toast.textContent = compareList.value.length === 0
      ? '点击卡片选择机型，至少 2 款才能对比'
      : '再选 1 款即可开始对比'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2500)
  }
}
</script>
