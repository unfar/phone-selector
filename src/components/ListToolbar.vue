<template>
  <div class="panel toolbar">
    <div class="stats">
      <template v-if="hasFilters">筛选后 <b>{{ resultCount }}</b> / {{ phones.length }} 款</template>
      <template v-else>共 <b>{{ resultCount }}</b> 款机型</template>
    </div>
    <div class="toolbar-right">
      <button class="sort-btn fav-toggle" :class="{ on: showFavoritesOnly }" @click="showFavoritesOnly = !showFavoritesOnly" :title="showFavoritesOnly ? '显示全部' : '只看收藏'">
        ★ 收藏{{ favorites.length ? `(${favorites.length})` : '' }}
      </button>
      <div class="seg">
        <button :class="{ on: viewMode === 'cards' }" @click="setViewMode('cards')">卡片</button>
        <button :class="{ on: viewMode === 'table' }" @click="setViewMode('table')">表格</button>
      </div>
      <div class="sort-btns">
        <button class="sort-btn" :class="{ on: currentSort === 'newest' }" @click="setSort('newest')">最新</button>
        <button class="sort-btn" :class="{ on: currentSort === 'price_asc' }" @click="setSort('price_asc')">价格 ↑</button>
        <button class="sort-btn" :class="{ on: currentSort === 'price_desc' }" @click="setSort('price_desc')">价格 ↓</button>
      </div>
      <select class="select" :value="moreSortValue" @change="onMoreSort($event)" aria-label="更多排序方式">
        <option value="" disabled>更多…</option>
        <option value="battery_desc">电池 ↓</option>
        <option value="weight_asc">重量 ↑</option>
        <option value="screen_desc">屏幕 ↓</option>
        <option value="charging_desc">快充 ↓</option>
        <option value="brand_asc">品牌 A-Z</option>
      </select>
    </div>
    <div class="sort-status" v-if="currentSort !== 'newest'" :title="'当前排序：' + sortLabel">
      当前：{{ sortLabel }}
    </div>
  </div>

  <div class="active-line" v-if="activePills.length">
    <span class="pill" v-for="(p,i) in activePills" :key="i">
      {{ p.label }} <button @click="p.clear" :aria-label="'移除筛选条件 ' + p.label">✕</button>
    </span>
    <button class="btn ghost" style="height:30px" @click="clearAllFilters">全部清空</button>
  </div>
</template>

<script setup>
import {
  phones, viewMode, currentSort, resultCount, setViewMode, clearAllFilters,
  favorites, showFavoritesOnly,
} from '../composables/useApp.js'
import {
  hasFilters, activePills, setSort, onMoreSort, moreSortValue, sortLabel,
} from '../composables/useFilterUI.js'
</script>
