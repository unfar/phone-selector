<template>
  <div class="filter-overlay" @click.self="showFilterDrawer = false">
    <div class="filter-drawer" role="dialog" aria-modal="true" aria-label="筛选条件">
      <div class="filter-drawer-head">
        <strong>筛选条件</strong>
        <button class="btn ghost" @click="showFilterDrawer = false" aria-label="关闭筛选">✕</button>
      </div>
      <div class="filter-drawer-body">
        <div class="section" :class="{ open: sectionOpen.brand }">
          <div class="section-title" @click="toggleSection('brand')">品牌 <span v-if="selectedBrands.size" class="count">({{ selectedBrands.size }})</span></div>
          <div class="chips"><button v-for="b in brandList" :key="b" class="chip brand" :class="{ on: selectedBrands.has(b) }" :style="{ '--bcolor': brandColor(b) }" @click="toggleBrand(b)">{{ b }}</button></div>
        </div>
        <div class="section open">
          <div class="section-title static">价格 <span v-if="priceActive" class="count">(已设)</span></div>
          <div class="price-box"><PriceSlider /></div>
        </div>
        <div class="section" :class="{ open: sectionOpen.screen }">
          <div class="section-title" @click="toggleSection('screen')">屏幕形态 <span v-if="selectedScreen" class="count">(1)</span></div>
          <div class="chips"><button v-for="s in screenTypes" :key="s" class="chip" :class="{ on: selectedScreen === s }" @click="selectScreen(s)">{{ s }}</button></div>
        </div>
        <div class="section" :class="{ open: sectionOpen.cpu }">
          <div class="section-title" @click="toggleSection('cpu')">处理器 <span v-if="selectedCpu.size" class="count">({{ selectedCpu.size }})</span></div>
          <div class="chips"><button v-for="t in cpuTags" :key="t" class="chip" :class="{ on: selectedCpu.has(t) }" @click="toggleCpu(t)">{{ t }}</button></div>
        </div>
        <div class="section" :class="{ open: sectionOpen.tags }">
          <div class="section-title" @click="toggleSection('tags')">特性 <span v-if="selectedTags.size" class="count">({{ selectedTags.size }})</span></div>
          <div class="chips"><button v-for="t in featureTags" :key="t" class="chip" :class="{ on: selectedTags.has(t) }" @click="toggleTag(t)">{{ t }}</button></div>
        </div>
        <div class="section" :class="{ open: sectionOpen.proto }">
          <div class="section-title" @click="toggleSection('proto')">充电协议 <span v-if="selectedProtocols.size" class="count">({{ selectedProtocols.size }})</span></div>
          <div class="chips"><button v-for="t in protocolTags" :key="t" class="chip" :class="{ on: selectedProtocols.has(t) }" @click="toggleProtocol(t)">{{ t }}</button></div>
        </div>
        <div class="section" :class="{ open: sectionOpen.size }">
          <div class="section-title" @click="toggleSection('size')">屏幕尺寸 <span v-if="selectedScreenSizes.size" class="count">({{ selectedScreenSizes.size }})</span></div>
          <div class="chips"><button v-for="r in screenSizeRanges" :key="r.name" class="chip" :class="{ on: selectedScreenSizes.has(r.name) }" @click="toggleScreenSize(r.name)">{{ r.name }}</button></div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:10px" @click="showFilterDrawer = false">查看 · {{ resultCount }} 款 ✨</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import PriceSlider from './PriceSlider.vue'
import {
  selectedBrands, selectedScreen, selectedCpu, selectedTags, selectedScreenSizes,
  selectedProtocols, brandList, resultCount, brandColor,
  featureTags, protocolTags, cpuTags, screenTypes, screenSizeRanges,
} from '../composables/useApp.js'
import {
  showFilterDrawer, sectionOpen, toggleSection, priceActive,
  toggleBrand, toggleTag, toggleCpu, toggleProtocol, toggleScreenSize, selectScreen,
} from '../composables/useFilterUI.js'
</script>
