<template>
  <div class="filter-panel">
    <!-- Search -->
    <div class="filter-search">
      <span class="search-icon">🔍</span>
      <input class="search-input" type="text" v-model="searchQuery" @input="onSearchInput" placeholder="搜索机型、品牌、处理器…" />
      <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
    </div>
    <!-- Brand -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('brand') }">
      <div class="filter-label" @click="toggle('brand')">🏢 品牌 <span class="arrow">▼</span></div>
      <div class="filter-tags">
        <span v-for="b in brandList" :key="b" :class="brandTagClass(b)"
          @click="toggleBrand(b)">{{ getEnglishBrand(b) }}</span>
      </div>
    </div>
    <!-- Screen -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('screen') }">
      <div class="filter-label" @click="toggle('screen')">📱 屏幕形态 <span class="arrow">▼</span> <span style="font-weight:400;text-transform:none;color:#94a3b8">（单选）</span></div>
      <div class="filter-tags">
        <span v-for="s in screenTypes" :key="s" :class="['tag', 'screen', { active: selectedScreen === s }]"
          @click="selectScreen(s)">{{ s }}</span>
      </div>
    </div>
    <!-- CPU -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('cpu') }">
      <div class="filter-label" @click="toggle('cpu')">⚡ 处理器 <span class="arrow">▼</span></div>
      <div class="filter-tags">
        <span v-for="t in cpuTags" :key="t" :class="['tag', 'cpu', { active: selectedCpu.has(t) }]"
          @click="toggleCpu(t)">{{ t }}</span>
      </div>
    </div>
    <!-- Features -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('feat') }">
      <div class="filter-label" @click="toggle('feat')">🏷️ 特性标签 <span class="arrow">▼</span> <span style="font-weight:400;text-transform:none;color:#94a3b8">（可多选叠加）</span></div>
      <div class="filter-tags">
        <span v-for="t in featureTags" :key="t" :class="['tag', { active: selectedTags.has(t) }]"
          @click="toggleTag(t)">{{ t }}</span>
      </div>
    </div>
    <!-- Charge Protocol -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('proto') }">
      <div class="filter-label" @click="toggle('proto')">🔌 充电协议 <span class="arrow">▼</span> <span style="font-weight:400;text-transform:none;color:#94a3b8">（需全部满足·可多选）</span></div>
      <div class="filter-tags">
        <span v-for="t in protocolTags" :key="t" :class="['tag', 'proto', { active: selectedProtocols.has(t) }]"
          @click="toggleProto(t)">{{ t }}</span>
      </div>
    </div>
    <!-- Price -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('price') }">
      <div class="filter-label" @click="toggle('price')">💰 价格区间 <span class="arrow">▼</span></div>
      <PriceSlider />
    </div>
    <!-- Screen Size -->
    <div class="filter-section" :class="{ collapsed: collapsed.has('screensize') }">
      <div class="filter-label" @click="toggle('screensize')">📐 屏幕尺寸 <span class="arrow">▼</span></div>
      <div class="filter-tags">
        <span v-for="r in screenSizeRanges" :key="r.name" :class="['tag', { active: selectedScreenSizes.has(r.name) }]"
          @click="toggleScreenSize(r.name)">{{ r.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes, selectedProtocols, searchQuery, brandList, updateHash } from '../composables/useFilters.js'

import { featureTags, screenTypes, screenSizeRanges, cpuTags, getEnglishBrand, protocolTags } from '../utils.js'
import PriceSlider from './PriceSlider.vue'

const collapsed = ref(new Set())

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
