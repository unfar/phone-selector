<template>
  <div class="toolbar">
    <div class="result-info">共 <strong>{{ resultCount }}</strong> 款符合条件</div>
    <div class="toolbar-right">
      <button class="compare-mode-btn" @click="openCompare">📊 机型对比</button>
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
import { resultCount, currentSort, updateHash } from '../composables/useFilters.js'
import { compareList } from '../composables/useCompare.js'

function onSortChange() {
  updateHash()
}

function openCompare() {
  if (compareList.value.length >= 2) {
    // Emit event or trigger compare panel
    document.getElementById('comparePanel').style.display = 'flex'
  } else {
    const existing = document.querySelector('.compare-toast')
    if (existing) existing.remove()
    const toast = document.createElement('div')
    toast.className = 'compare-toast'
    toast.textContent = '请先选择至少 2 款手机进行对比'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2500)
  }
}
</script>
