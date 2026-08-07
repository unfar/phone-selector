<template>
  <div class="price-slider">
    <div class="price-slider-track">
      <div class="price-slider-fill" :style="fillStyle"></div>
      <input type="range" class="ps-range ps-min" :min="0" :max="sliderMaxPrice" step="100" v-model.number="minVal" @input="onMinInput">
      <input type="range" class="ps-range ps-max" :min="0" :max="sliderMaxPrice" step="100" v-model.number="maxVal" @input="onMaxInput">
    </div>
    <div class="price-slider-values">
      <span class="pv-item" :class="{ on: minVal > 0 }">{{ minVal > 0 ? '¥' + minVal : '不限' }}</span>
      <span class="pv-sep">—</span>
      <span class="pv-item" :class="{ on: maxVal < sliderMaxPrice }">{{ maxVal < sliderMaxPrice ? '¥' + maxVal : '不限' }}</span>
      <span class="pv-hint">步进 ¥100</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { priceMin, priceMax, sliderMaxPrice, updateHash } from '../composables/useApp.js'

const minVal = ref(0)
const maxVal = ref(sliderMaxPrice.value)

// 外部变化(hash 恢复 / 全部清空 / 数据加载后 max 变化)同步到本地
watch([priceMin, priceMax, sliderMaxPrice], ([a, b, max]) => {
  minVal.value = Math.min(a, max)
  maxVal.value = Math.min(b, max)
})

// 初始化(数据可能已加载)
function init() {
  const max = sliderMaxPrice.value || 20000
  minVal.value = Math.min(priceMin.value, max)
  maxVal.value = Math.min(priceMax.value, max)
}
init()

const fillStyle = computed(() => {
  const max = sliderMaxPrice.value || 20000
  const pctMin = (minVal.value / max) * 100
  const pctMax = (maxVal.value / max) * 100
  return { left: pctMin + '%', width: Math.max(0, pctMax - pctMin) + '%' }
})

function sync() {
  priceMin.value = minVal.value
  priceMax.value = maxVal.value
  updateHash()
}

function onMinInput() {
  if (minVal.value > maxVal.value) maxVal.value = minVal.value
  sync()
}

function onMaxInput() {
  if (maxVal.value < minVal.value) minVal.value = maxVal.value
  sync()
}
</script>
