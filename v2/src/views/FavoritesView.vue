<template>
  <div class="section" style="margin-top: 4px">
    <div class="section-head">
      <h2 class="section-title">我的收藏</h2>
      <span class="section-desc">已收藏 {{ favPhones.length }} 款 · 保存在本地浏览器</span>
      <button v-if="favPhones.length" class="btn btn-sm" style="margin-left: auto" @click="clearAll">
        清空收藏
      </button>
    </div>

    <div v-if="favPhones.length" class="grid-cards">
      <PhoneCard v-for="p in favPhones" :key="p.id" :phone="p" :score="profile(p)" />
    </div>
    <div v-else class="empty-state">
      <p>还没有收藏的机型。</p>
      <p style="margin-top:8px;font-size:13px">在参数库或详情页点「☆ 收藏」，这里就能随时回看。</p>
      <div style="margin-top:16px"><a class="btn btn-primary" href="#/list">去参数库逛逛 →</a></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PhoneCard from '../components/PhoneCard.vue'
import { state, clearFavorites, flash } from '../lib/store.js'
import { scoreOf } from '../lib/derive.js'

const favPhones = computed(() => state.phones.filter(p => state.favorites.has(p.id)))
function profile(p) { return scoreOf(state.profiles, p) }

function clearAll() {
  if (!window.confirm('确定清空所有收藏？')) return
  clearFavorites()
  flash('已清空收藏')
}
</script>
