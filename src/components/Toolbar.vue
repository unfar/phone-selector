<template>
  <div class="toolbar">
    <div class="result-info">
      <template v-if="isFiltered">筛选后 <strong>{{ resultCount }}</strong> / {{ totalCount }} 款</template>
      <template v-else>共 <strong>{{ resultCount }}</strong> 款机型</template>
    </div>
    <div class="toolbar-right">
      <div class="view-toggle" title="视图切换">
        <button type="button" :class="{ active: viewMode === 'grid' }" @click="setView('grid')">卡片</button>
        <button type="button" :class="{ active: viewMode === 'list' }" @click="setView('list')">列表</button>
      </div>
      <button type="button" :class="['ghost-btn', { active: compareList.length > 0 }]" @click="openCompare">
        📊 对比 <span v-if="compareList.length">({{ compareList.length }})</span>
      </button>
      <select class="sort-select" v-model="currentSort" @change="onSortChange">
        <option value="newest">最新发布</option>
        <option value="price_asc">价格从低到高</option>
        <option value="price_desc">价格从高到低</option>
        <option value="battery_desc">电池容量</option>
        <option value="weight_asc">重量更轻</option>
        <option value="screen_desc">屏幕更大</option>
        <option value="charging_desc">快充功率</option>
        <option value="brand_asc">品牌 A-Z</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import {
  resultCount, currentSort, updateHash, phones,
  selectedBrands, selectedScreen, selectedCpu, selectedTags,
  selectedScreenSizes, selectedProtocols, searchQuery, priceMin, priceMax, sliderMaxPrice
} from '../composables/useFilters.js'
import { compareList } from '../composables/useCompare.js'

const viewMode = inject('viewMode')
const setViewMode = inject('setViewMode')

const totalCount = computed(() => phones.value.length)
const isFiltered = computed(() => !!(
  searchQuery.value || selectedBrands.size || selectedScreen.value || selectedCpu.size ||
  selectedTags.size || selectedScreenSizes.size || selectedProtocols.size ||
  priceMin.value > 0 || priceMax.value < sliderMaxPrice.value
))

function setView(mode) { setViewMode(mode) }
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
      ? '请先点卡片右下角「+ 对比」选择机型'
      : '再选 1 款即可开始对比'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2500)
  }
}
</script>
