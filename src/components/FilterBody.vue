<template>
  <div class="filter-body">
    <div class="section" :class="{ open: sectionOpen.brand }">
      <button class="section-title" @click="toggleSection('brand')" :aria-expanded="sectionOpen.brand">
        品牌 <span v-if="selectedBrands.size" class="count">({{ selectedBrands.size }})</span>
      </button>
      <div class="chips">
        <button v-for="b in brandList" :key="b" class="chip brand" :class="{ on: selectedBrands.has(b) }" :style="{ '--bcolor': brandColor(b) }" @click="toggleBrand(b)" :aria-pressed="selectedBrands.has(b)">{{ b }}</button>
      </div>
    </div>

    <div class="section open">
      <div class="section-title static">价格 <span v-if="priceActive" class="count">(已设)</span></div>
      <div class="price-box"><PriceSlider /></div>
    </div>

    <div class="section" :class="{ open: sectionOpen.screen }">
      <button class="section-title" @click="toggleSection('screen')" :aria-expanded="sectionOpen.screen">
        屏幕形态 <span v-if="selectedScreen" class="count">(1)</span>
      </button>
      <div class="chips">
        <button v-for="s in screenTypes" :key="s" class="chip" :class="{ on: selectedScreen === s }" @click="selectScreen(s)" :aria-pressed="selectedScreen === s">{{ s }}</button>
      </div>
    </div>

    <div class="section" :class="{ open: sectionOpen.cpu }">
      <button class="section-title" @click="toggleSection('cpu')" :aria-expanded="sectionOpen.cpu">
        处理器 <span v-if="selectedCpu.size" class="count">({{ selectedCpu.size }})</span>
      </button>
      <div class="chips">
        <button v-for="t in cpuTags" :key="t" class="chip" :class="{ on: selectedCpu.has(t) }" @click="toggleCpu(t)" :aria-pressed="selectedCpu.has(t)">{{ t }}</button>
      </div>
    </div>

    <div class="section" :class="{ open: sectionOpen.tags }">
      <button class="section-title" @click="toggleSection('tags')" :aria-expanded="sectionOpen.tags">
        特性 <span v-if="selectedTags.size" class="count">({{ selectedTags.size }})</span>
      </button>
      <div class="chips">
        <button v-for="t in featureTags" :key="t" class="chip" :class="{ on: selectedTags.has(t) }" @click="toggleTag(t)" :aria-pressed="selectedTags.has(t)">{{ t }}</button>
      </div>
    </div>

    <div class="section" :class="{ open: sectionOpen.proto }">
      <button class="section-title" @click="toggleSection('proto')" :aria-expanded="sectionOpen.proto">
        充电协议 <span v-if="selectedProtocols.size" class="count">({{ selectedProtocols.size }})</span>
      </button>
      <div class="chips">
        <button v-for="t in protocolTags" :key="t" class="chip" :class="{ on: selectedProtocols.has(t) }" @click="toggleProtocol(t)" :aria-pressed="selectedProtocols.has(t)">{{ t }}</button>
      </div>
    </div>

    <div class="section" :class="{ open: sectionOpen.size }">
      <button class="section-title" @click="toggleSection('size')" :aria-expanded="sectionOpen.size">
        屏幕尺寸 <span v-if="selectedScreenSizes.size" class="count">({{ selectedScreenSizes.size }})</span>
      </button>
      <div class="chips">
        <button v-for="r in screenSizeRanges" :key="r.name" class="chip" :class="{ on: selectedScreenSizes.has(r.name) }" @click="toggleScreenSize(r.name)" :aria-pressed="selectedScreenSizes.has(r.name)">{{ r.name }}</button>
      </div>
    </div>

    <!-- 移动端抽屉：结果要关掉抽屉才看得到，所以需要确认按钮；PC 侧栏实时可见，不需要 -->
    <button v-if="isNarrow" class="btn primary filter-done" @click="showFilterDrawer = false">
      查看 · {{ resultCount }} 款 ✨
    </button>
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
  isNarrow, showFilterDrawer, sectionOpen, toggleSection, priceActive,
  toggleBrand, toggleTag, toggleCpu, toggleProtocol, toggleScreenSize, selectScreen,
} from '../composables/useFilterUI.js'
</script>
