<template>
  <div class="filter-panel">
    <!-- Search always open -->
    <div class="filter-search">
      <span class="search-icon">🔍</span>
      <input class="search-input" type="text" v-model="searchQuery" @input="onSearchInput" placeholder="搜索机型、品牌、处理器…" />
      <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
    </div>

    <!-- Brand (default open) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('brand') }">
      <div class="filter-label" @click="toggle('brand')">
        🏢 品牌
        <span v-if="selectedBrands.size" class="filter-count">({{ selectedBrands.size }})</span>
        <span class="arrow">▼</span>
      </div>
      <div class="filter-tags">
        <span v-for="b in brandList" :key="b" :class="brandTagClass(b)"
          @click="toggleBrand(b)">{{ getEnglishBrand(b) }}</span>
      </div>
    </div>

    <!-- Price (default open) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('price') }">
      <div class="filter-label" @click="toggle('price')">
        💰 价格区间
        <span v-if="priceActive" class="filter-count">(已设)</span>
        <span class="arrow">▼</span>
      </div>
      <PriceSlider />
    </div>

    <!-- Screen (default collapsed) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('screen') }">
      <div class="filter-label" @click="toggle('screen')">
        📱 屏幕形态
        <span v-if="selectedScreen" class="filter-count">(1)</span>
        <span class="arrow">▼</span>
        <span class="filter-hint">单选</span>
      </div>
      <div class="filter-tags">
        <span v-for="s in screenTypes" :key="s" :class="['tag', 'screen', { active: selectedScreen === s }]"
          @click="selectScreen(s)">{{ s }}</span>
      </div>
    </div>

    <!-- CPU (default collapsed) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('cpu') }">
      <div class="filter-label" @click="toggle('cpu')">
        ⚡ 处理器
        <span v-if="selectedCpu.size" class="filter-count">({{ selectedCpu.size }})</span>
        <span class="arrow">▼</span>
      </div>
      <div class="filter-tags">
        <span v-for="t in cpuTags" :key="t" :class="['tag', 'cpu', { active: selectedCpu.has(t) }]"
          @click="toggleCpu(t)">{{ t }}</span>
      </div>
    </div>

    <!-- Features (default collapsed) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('feat') }">
      <div class="filter-label" @click="toggle('feat')">
        🏷️ 特性标签
        <span v-if="selectedTags.size" class="filter-count">({{ selectedTags.size }})</span>
        <span class="arrow">▼</span>
        <span class="filter-hint">可多选</span>
      </div>
      <div class="filter-tags">
        <span v-for="t in featureTags" :key="t" :class="['tag', { active: selectedTags.has(t) }]"
          @click="toggleTag(t)">{{ t }}</span>
      </div>
    </div>

    <!-- Charge Protocol (default collapsed) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('proto') }">
      <div class="filter-label" @click="toggle('proto')">
        🔌 充电协议
        <span v-if="selectedProtocols.size" class="filter-count">({{ selectedProtocols.size }})</span>
        <span class="arrow">▼</span>
        <span class="filter-hint">需全部满足</span>
      </div>
      <div class="filter-tags">
        <span v-for="t in protocolTags" :key="t" :class="['tag', 'proto', { active: selectedProtocols.has(t) }]"
          @click="toggleProto(t)">{{ t }}</span>
      </div>
    </div>

    <!-- Screen Size (default collapsed) -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('screensize') }">
      <div class="filter-label" @click="toggle('screensize')">
        📐 屏幕尺寸
        <span v-if="selectedScreenSizes.size" class="filter-count">({{ selectedScreenSizes.size }})</span>
        <span class="arrow">▼</span>
      </div>
      <div class="filter-tags">
        <span v-for="r in screenSizeRanges" :key="r.name" :class="['tag', { active: selectedScreenSizes.has(r.name) }]"
          @click="toggleScreenSize(r.name)">{{ r.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes,
  selectedProtocols, searchQuery, brandList, updateHash, priceMin, priceMax, sliderMaxPrice
} from '../composables/useFilters.js'
import { featureTags, screenTypes, screenSizeRanges, cpuTags, getEnglishBrand, protocolTags } from '../utils.js'
import PriceSlider from './PriceSlider.vue'

// 默认只展开品牌 + 价格；其余折叠，首屏露出机型
const collapsed = ref(new Set(['screen', 'cpu', 'feat', 'proto', 'screensize']))

const priceActive = computed(() => priceMin.value > 0 || priceMax.value < sliderMaxPrice.value)

function toggle(name) {
  const s = new Set(collapsed.value)
  s.has(name) ? s.delete(name) : s.add(name)
  collapsed.value = s
}

function toggleBrand(b) {
  selectedBrands.has(b) ? selectedBrands.delete(b) : selectedBrands.add(b)
  updateHash()
}

function toggleTag(t) {
  selectedTags.has(t) ? selectedTags.delete(t) : selectedTags.add(t)
  updateHash()
}

function toggleCpu(t) {
  selectedCpu.has(t) ? selectedCpu.delete(t) : selectedCpu.add(t)
  updateHash()
}

function selectScreen(s) {
  selectedScreen.value = selectedScreen.value === s ? null : s
  if (selectedScreen.value === '🔄 折叠屏') selectedScreenSizes.clear()
  updateHash()
}

function toggleScreenSize(name) {
  selectedScreenSizes.has(name) ? selectedScreenSizes.delete(name) : selectedScreenSizes.add(name)
  if (selectedScreen.value === '🔄 折叠屏') selectedScreen.value = null
  updateHash()
}

function toggleProto(t) {
  selectedProtocols.has(t) ? selectedProtocols.delete(t) : selectedProtocols.add(t)
  updateHash()
}

function brandTagClass(b) {
  return ['tag', { active: selectedBrands.has(b) }, selectedBrands.has(b) ? 'brand-active-' + b : '']
}

function onSearchInput() {
  updateHash()
}

function clearSearch() {
  searchQuery.value = ''
  updateHash()
}
</script>
