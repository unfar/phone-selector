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

// 等待数据加载后重新计算最大价格
function recalcMaxPrice() {
  if (!phones.value || phones.value.length === 0) return
  const prices = phones.value.filter(p => p.price).map(p => p.price)
  if (prices.length === 0) return
  const maxP = Math.ceil(Math.max(...prices) / 1000) * 1000
  sliderMaxPrice.value = Math.max(maxP, 1000)
  // 如果之前 priceMax 还是默认值，同步更新
  if (priceMax.value === 20000 || priceMax.value > sliderMaxPrice.value) {
    priceMax.value = sliderMaxPrice.value
  }
  if (priceMin.value === 0 && priceMax.value === sliderMaxPrice.value) {
    localMin.value = 0
    localMax.value = sliderMaxPrice.value
  } else {
    // 从 hash 恢复的值需要同步到本地
    localMin.value = Math.min(priceMin.value, sliderMaxPrice.value)
    localMax.value = Math.min(priceMax.value, sliderMaxPrice.value)
  }
}

// 数据加载后触发
watch(() => phones.value.length, (n) => {
  if (n > 0) recalcMaxPrice()
}, { immediate: false })

// 组件挂载后也尝试一次（如果数据已经加载了）
recalcMaxPrice()

const fillStyle = computed(() => {
  const max = sliderMaxPrice.value || 20000
  const pctMin = (localMin.value / max) * 100
  const pctMax = (localMax.value / max) * 100
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
