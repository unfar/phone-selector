<template>
  <div class="price-slider-container">
    <div class="price-slider-track">
      <div class="price-slider-fill" :style="fillStyle"></div>
      <input type="range" class="price-slider price-slider-min" :min="0" :max="sliderMaxPrice" step="100" v-model.number="localMin" @input="onMinSlider">
      <input type="range" class="price-slider price-slider-max" :min="0" :max="sliderMaxPrice" step="100" v-model.number="localMax" @input="onMaxSlider">
    </div>
    <div class="price-slider-inputs">
      <div class="price-input-group">
        <span class="price-input-label">最低</span>
        <div class="price-input-wrap">
          <span class="price-input-currency">¥</span>
          <input type="number" class="price-input" :min="0" :max="sliderMaxPrice" step="100" v-model.number="localMin" @change="onMinChange" @blur="onBlurMin">
        </div>
      </div>
      <span class="price-separator">—</span>
      <div class="price-input-group">
        <span class="price-input-label">最高</span>
        <div class="price-input-wrap">
          <span class="price-input-currency">¥</span>
          <input type="number" class="price-input" :min="0" :max="sliderMaxPrice" step="100" v-model.number="localMax" @change="onMaxChange" @blur="onBlurMax">
        </div>
      </div>
    </div>
    <div class="price-slider-hint">拖动滑块或输入价格 · 未拖动 = 不限制</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { priceMin, priceMax, sliderMaxPrice, phones, updateHash } from '../composables/useFilters.js'

const localMin = ref(0)
const localMax = ref(sliderMaxPrice.value)

// Init
const prices = phones.value.filter(p => p.price).map(p => p.price)
const maxP = Math.ceil(Math.max(...prices) / 1000) * 1000
sliderMaxPrice.value = Math.max(maxP, 1000)
priceMax.value = sliderMaxPrice.value
localMin.value = 0
localMax.value = sliderMaxPrice.value

const fillStyle = computed(() => {
  const pctMin = (localMin.value / sliderMaxPrice.value) * 100
  const pctMax = (localMax.value / sliderMaxPrice.value) * 100
  return { left: pctMin + '%', width: (pctMax - pctMin) + '%' }
})

function syncToStore() {
  priceMin.value = localMin.value
  priceMax.value = localMax.value
  updateHash()
}

function onMinSlider() {
  if (localMin.value > localMax.value) { localMax.value = localMin.value }
  syncToStore()
}

function onMaxSlider() {
  if (localMax.value < localMin.value) { localMin.value = localMax.value }
  syncToStore()
}

function onMinChange() {
  let v = Math.max(0, Math.min(localMin.value, localMax.value, sliderMaxPrice.value))
  v = Math.round(v / 100) * 100
  localMin.value = v
  syncToStore()
}

function onMaxChange() {
  let v = Math.min(Math.max(localMax.value, localMin.value, 0), sliderMaxPrice.value)
  v = Math.round(v / 100) * 100
  localMax.value = v
  syncToStore()
}

function onBlurMin() { localMin.value = priceMin.value }
function onBlurMax() { localMax.value = priceMax.value }
</script>
