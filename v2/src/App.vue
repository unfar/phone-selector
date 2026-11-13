<template>
  <div class="app">
    <AppHeader />
    <main class="page">
      <div class="container">
        <div v-if="state.loading" class="grid-cards">
          <div v-for="i in 6" :key="i" class="skeleton-card"></div>
        </div>
        <div v-else-if="state.error" class="error-wrap">
          <p>⚠ {{ state.error }}</p>
          <button class="btn btn-primary" style="margin-top:14px" @click="reload">重新加载</button>
        </div>
        <template v-else>
          <HomeView v-if="route.name === 'home'" />
          <WizardView v-else-if="route.name === 'wizard'" />
          <ListView v-else-if="route.name === 'list'" />
          <DetailView v-else-if="route.name === 'detail'" :id="route.id" />
          <CompareView v-else-if="route.name === 'compare'" />
          <FavoritesView v-else-if="route.name === 'favorites'" />
        </template>
      </div>
    </main>
    <footer class="site-footer">
      <div class="container">机选 V2 · 数据来自品牌官网人工整理（{{ state.phones.length }} 款）· 评分为规则推导，仅供参考</div>
    </footer>
    <BottomNav />
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { route } from './lib/router.js'
import { state, loadPhones } from './lib/store.js'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import Toast from './components/Toast.vue'
import HomeView from './views/HomeView.vue'
import WizardView from './views/WizardView.vue'
import ListView from './views/ListView.vue'
import DetailView from './views/DetailView.vue'
import CompareView from './views/CompareView.vue'
import FavoritesView from './views/FavoritesView.vue'

onMounted(() => {
  if (!state.phones.length) loadPhones()
})
function reload() {
  loadPhones()
}
</script>
