<template>
  <div class="table-wrap panel">
    <table class="list">
      <thead>
        <tr>
          <th>机型</th><th>价格</th><th>芯片</th><th>电池</th><th>充电</th><th>屏幕</th><th>重量</th><th>防水</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in phones" :key="p.id">
          <td class="name-cell" role="button" tabindex="0" @click="openDetail(p.id)" @keydown.enter.prevent="openDetail(p.id)" @keydown.space.prevent="openDetail(p.id)" :aria-label="'查看 ' + cardBrief(p).name + ' 详情'">{{ cardBrief(p).name }}</td>
          <td>{{ priceText(p) }}</td>
          <td>{{ p.processor || '—' }}</td>
          <td>{{ p.battery_mah ? p.battery_mah + 'mAh' : '—' }}</td>
          <td>{{ cardBrief(p).charge }}</td>
          <td>{{ cardBrief(p).screen }}</td>
          <td>{{ p.weight_g ? p.weight_g + 'g' : '—' }}</td>
          <td>{{ cardBrief(p).ip }}</td>
          <td>
            <button class="mini-btn" :class="{ on: isFavorite(p.id) }" @click="toggleFavorite(p.id)" :aria-pressed="isFavorite(p.id)" :aria-label="isFavorite(p.id) ? '取消收藏' : '收藏'" :title="isFavorite(p.id) ? '取消收藏' : '收藏'">{{ isFavorite(p.id) ? '★' : '☆' }}</button>
            <button class="mini-btn" @click="openDetail(p.id)">详情</button>
            <button class="mini-btn" :class="{ on: isCompared(p.id) }" @click="toggleCompare(p.id)" :disabled="compareFull(p.id)" :aria-pressed="isCompared(p.id)" :title="compareFull(p.id) ? '对比栏已满 4 款' : (isCompared(p.id) ? '从对比中移除' : '加入对比')">
              {{ compareBtnText(p.id) }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import {
  cardBrief, priceText, openDetail, toggleCompare, isCompared, toggleFavorite, isFavorite,
  compareList,
} from '../composables/useApp.js'

defineProps({ phones: { type: Array, required: true } })

/** 已满 4 款且该机未入选 → 禁用。避免点了只弹 toast、看起来像没反应 */
function compareFull(id) { return compareList.value.length >= 4 && !isCompared(id) }
function compareBtnText(id) {
  if (isCompared(id)) return '已选'
  return compareFull(id) ? '已满' : '对比'
}
</script>
