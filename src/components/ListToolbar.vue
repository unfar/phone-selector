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
      <!-- 排序可叠加：已选中的键按优先级显示序号，点了就是主排序 -->
      <div class="sort-btns">
        <button
          v-for="k in QUICK_SORTS" :key="k"
          class="sort-btn"
          :class="{ on: sortKeys.includes(k), main: sortKeys[0] === k }"
          @click="setSort(k)"
          :aria-pressed="sortKeys.includes(k)"
          :title="sortTitle(k)"
        >{{ sortKeyLabel(k) }}<span v-if="multiSort && sortRank(k)" class="rank">{{ sortRank(k) }}</span></button>
      </div>
      <select class="select" :value="moreSortValue" @change="onMoreSort($event)" aria-label="更多排序方式">
        <option value="">默认排序</option>
        <option value="battery_desc">电池 ↓</option>
        <option value="weight_asc">重量 ↑</option>
        <option value="screen_desc">屏幕 ↓</option>
        <option value="charging_desc">快充 ↓</option>
        <option value="brand_asc">品牌 A-Z</option>
      </select>
    </div>
    <!-- 排序链：每一级都能单独移除，顺序即优先级（主 → 次） -->
    <div class="sort-status" v-if="hasCustomSort" :title="'当前排序（按优先级）：' + sortLabel">
      <span class="lbl">排序</span>
      <span v-for="(k, i) in sortKeys" :key="k" class="sort-chip" :class="{ main: i === 0 }">
        {{ sortKeyLabel(k) }}
        <button @click="removeSort(k)" :aria-label="'移除排序 ' + sortKeyLabel(k)" title="移除这一级">✕</button>
      </span>
      <button class="sort-reset" @click="resetSort" title="恢复默认排序（最新发布）">默认</button>
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
import { computed } from 'vue'
import {
  phones, viewMode, sortKeys, resultCount, setViewMode, clearAllFilters,
  favorites, showFavoritesOnly,
} from '../composables/useApp.js'
import {
  hasFilters, activePills, setSort, removeSort, resetSort, onMoreSort, moreSortValue,
  sortLabel, sortKeyLabel, sortRank, hasCustomSort,
} from '../composables/useFilterUI.js'

const QUICK_SORTS = ['newest', 'price_asc', 'price_desc']
/** 链里有两级以上时才显示优先级序号 */
const multiSort = computed(() => sortKeys.value.length > 1)

function sortTitle(k) {
  const r = sortRank(k)
  if (!r) return `加入排序：${sortKeyLabel(k)}`
  if (r === 1) return `主排序：${sortKeyLabel(k)}（再点一次取消）`
  return `第 ${r} 级排序：${sortKeyLabel(k)}（点击设为主排序）`
}
</script>
