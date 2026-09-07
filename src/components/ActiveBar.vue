<template>
  <div class="active-bar" v-if="hasActiveFilters" style="display:flex">
    <span class="label">当前筛选：</span>
    <div id="activeBadges" style="display:flex;flex-wrap:wrap;gap:6px">
      <span v-for="(badge, i) in badges" :key="i" class="active-badge">
        {{ badge.label }} <span class="x" @click="badge.onRemove">✕</span>
      </span>
    </div>
    <button class="clear-btn" @click="clearAll">清空全部</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes, priceMin, priceMax, sliderMaxPrice, clearAllFilters } from '../composables/useFilters.js'
import { getEnglishBrand } from '../utils.js'
import { clearCompareSelection } from '../composables/useCompare.js'

function removeBrand(b) { selectedBrands.delete(b) }
function removeScreen() { selectedScreen.value = null }
function removeCpu(c) { selectedCpu.delete(c) }
function removeTag(t) { selectedTags.delete(t) }
function removeScreenSize(s) { selectedScreenSizes.delete(s) }
function removePrice() { priceMin.value = 0; priceMax.value = sliderMaxPrice.value }

function clearAll() {
  clearAllFilters()
  clearCompareSelection()
}

const hasActiveFilters = computed(() => {
  return selectedBrands.size > 0 || selectedScreen.value || selectedCpu.size > 0 || selectedTags.size > 0 ||
    selectedScreenSizes.size > 0 || priceMin.value > 0 || priceMax.value < sliderMaxPrice.value
})

const badges = computed(() => {
  const result = []
  selectedBrands.forEach(b => result.push({ label: getEnglishBrand(b), onRemove: () => removeBrand(b) }))
  if (selectedScreen.value) result.push({ label: selectedScreen.value, onRemove: removeScreen })
  selectedCpu.forEach(c => result.push({ label: c, onRemove: () => removeCpu(c) }))
  selectedTags.forEach(t => result.push({ label: t, onRemove: () => removeTag(t) }))
  if (priceMin.value > 0 || priceMax.value < sliderMaxPrice.value) {
    let label = '💰 '
    if (priceMin.value > 0 && priceMax.value < sliderMaxPrice.value) label += '¥' + priceMin.value + ' – ¥' + priceMax.value
    else if (priceMin.value > 0) label += '¥' + priceMin.value + '+'
    else label += '≤ ¥' + priceMax.value
    result.push({ label, onRemove: removePrice })
  }
  selectedScreenSizes.forEach(s => result.push({ label: s, onRemove: () => removeScreenSize(s) }))
  return result
})
</script>
