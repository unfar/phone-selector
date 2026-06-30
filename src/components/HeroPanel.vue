<template>
  <div class="hero-panel">
    <div class="hero-icon">📱</div>
    <h1>智能手机选购助手</h1>
    <div class="hero-subtitle">基于官方数据 · 多维度筛选 · 找到最适合你的手机</div>
    <div class="hero-stats">
      <div class="hero-stat">
        <span class="hero-stat-num" id="statPhones">{{ phones.length }}</span>
        <span class="hero-stat-label">款机型</span>
      </div>
      <div class="hero-stat">
        <span class="hero-stat-num" id="statBrands">{{ brandCount }}</span>
        <span class="hero-stat-label">个品牌</span>
      </div>
      <div class="hero-stat hero-stat-date">
        <span>📅</span>
        <span>数据截至 2026年6月30日</span>
      </div>
    </div>
    <div class="hero-notice">📌 本网站仅收录中国大陆国行在售机型，不涉及海外/港澳台版本</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { phones } from '../composables/useFilters.js'
const brandCount = computed(() => new Set(phones.value.map(p => p.brand)).size)
</script>
