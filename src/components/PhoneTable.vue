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
          <td class="name-cell" @click="openDetail(p.id)">{{ cardBrief(p).name }}</td>
          <td>{{ priceText(p) }}</td>
          <td>{{ p.processor || '—' }}</td>
          <td>{{ p.battery_mah ? p.battery_mah + 'mAh' : '—' }}</td>
          <td>{{ cardBrief(p).charge }}</td>
          <td>{{ cardBrief(p).screen }}</td>
          <td>{{ p.weight_g ? p.weight_g + 'g' : '—' }}</td>
          <td>{{ cardBrief(p).ip }}</td>
          <td>
            <button class="mini-btn" :class="{ on: isFavorite(p.id) }" @click="toggleFavorite(p.id)" :title="isFavorite(p.id) ? '取消收藏' : '收藏'">{{ isFavorite(p.id) ? '★' : '☆' }}</button>
            <button class="mini-btn" @click="openDetail(p.id)">详情</button>
            <button class="mini-btn" :class="{ on: isCompared(p.id) }" @click="toggleCompare(p.id)">
              {{ isCompared(p.id) ? '已选' : '对比' }}
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
} from '../composables/useApp.js'

defineProps({ phones: { type: Array, required: true } })
</script>
