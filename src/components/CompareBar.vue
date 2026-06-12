<template>
  <div class="compare-bar" id="compareBar" v-show="compareList.length > 0">
    <div class="compare-bar-inner">
      <div class="compare-bar-info">
        <span>📊 机型对比</span>
        <span class="compare-bar-count">已选 <strong>{{ compareList.length }}</strong>/4 款</span>
      </div>
      <div class="compare-bar-selected">
        <span v-for="p in selectedPhones" :key="p.id" class="selected-chip">
          <span class="selected-chip-thumb">{{ (p.brand || '?').charAt(0) }}</span>
          <span class="selected-chip-name">{{ p.model.substring(0, 10) }}</span>
          <span class="remove" @click="remove(p.id)">✕</span>
        </span>
      </div>
      <div class="compare-bar-actions">
        <button class="compare-bar-start" id="compareBarStart" :disabled="compareList.length < 2"
          :title="compareList.length >= 2 ? '' : '至少选择 2 款才能对比'" @click="startCompare">
          查看对比 ({{ compareList.length }})
        </button>
        <button class="compare-bar-clear" @click="clearCompare">清空</button>
        <button class="compare-bar-close" @click="closeBar">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { compareList, toggleCompareSelection, clearCompareSelection } from '../composables/useCompare.js'
import { phones } from '../composables/useFilters.js'

const selectedPhones = computed(() => {
  return compareList.value.map(id => phones.value.find(p => p.id === id)).filter(Boolean)
})

function remove(id) {
  toggleCompareSelection(id)
}

function startCompare() {
  if (compareList.value.length < 2) return
  document.getElementById('comparePanel').style.display = 'flex'
}

function clearCompare() {
  clearCompareSelection()
  const panel = document.getElementById('comparePanel')
  if (panel) panel.style.display = 'none'
}

function closeBar() {
  clearCompareSelection()
  const panel = document.getElementById('comparePanel')
  if (panel) panel.style.display = 'none'
}
</script>
