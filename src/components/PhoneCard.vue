<template>
  <article
    class="card" :class="{ selected: isCompared(phone.id) }"
    :style="{ '--bcolor': brandColor(phone.brand) }"
  >
    <div class="card-top">
      <div class="card-top-row">
        <span class="brand">{{ phone.brand }}</span>
        <span class="price" :class="{ future: isFuture(phone) }">{{ priceText(phone) }}</span>
      </div>
      <div class="name">{{ b.name }}</div>
      <div class="meta" v-if="phone.release_date">{{ phone.release_date }} 发布</div>
      <div class="future-badge" v-if="isFuture(phone)">未发布</div>
    </div>
    <div class="card-body">
      <div class="metrics">
        <div class="metric"><div class="k">芯片</div><div class="v">{{ phone.processor || '—' }}</div></div>
        <div class="metric"><div class="k">电池</div><div class="v">{{ phone.battery_mah ? phone.battery_mah + 'mAh' : '—' }}</div></div>
        <div class="metric"><div class="k">充电</div><div class="v">{{ b.charge }}</div></div>
        <div class="metric"><div class="k">重量</div><div class="v">{{ phone.weight_g ? phone.weight_g + 'g' : '—' }}</div></div>
        <div class="metric"><div class="k">屏幕</div><div class="v">{{ b.screen }}</div></div>
        <div class="metric"><div class="k">防水</div><div class="v">{{ b.ip }}</div></div>
      </div>
      <div class="cam">📸 {{ b.cam }}</div>
      <div class="score-bar" v-if="b.score > 0">
        <div class="score-fill" :style="{ width: b.score + '%' }"></div>
        <span class="score-label">数据完整度 {{ b.score }}%</span>
      </div>
      <div class="card-actions">
        <button class="btn fav-btn" :class="{ on: isFavorite(phone.id) }" @click="toggleFavorite(phone.id)" :title="isFavorite(phone.id) ? '取消收藏' : '收藏'">
          {{ isFavorite(phone.id) ? '★' : '☆' }}
        </button>
        <button class="btn" @click="openDetail(phone.id)">详情</button>
        <button class="btn primary" @click="toggleCompare(phone.id)">{{ isCompared(phone.id) ? '已加入' : '+ 对比' }}</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import {
  cardBrief, priceText, isFuturePhone as isFuture, brandColor,
  openDetail, toggleCompare, isCompared, toggleFavorite, isFavorite,
} from '../composables/useApp.js'

const props = defineProps({ phone: { type: Object, required: true } })
// cardBrief 内部有 WeakMap 缓存，重复取字段不会重复解析影像串
const b = computed(() => cardBrief(props.phone))
</script>
