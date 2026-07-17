<template>
  <div class="hero-strip">
    <div class="hero-copy">
      <h2>找到适合你的手机</h2>
      <p>国行在售 · 官方参数 · 多维筛选对比</p>
    </div>
    <div class="hero-pills">
      <div class="hero-pill"><strong>{{ phones.length }}</strong> <span>款机型</span></div>
      <div class="hero-pill"><strong>{{ brandCount }}</strong> <span>个品牌</span></div>
      <div class="hero-pill"><span>数据截至 2026-07-14</span></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { phones } from '../composables/useFilters.js'
const brandCount = computed(() => new Set(phones.value.map(p => p.brand)).size)
</script>
