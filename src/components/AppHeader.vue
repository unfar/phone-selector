<template>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="#/" aria-label="机选首页">
        <span class="logo-mark">选</span>
        <span>
          <span class="logo-name">机选</span>
          <span class="logo-sub">3 步找到适合你的手机</span>
        </span>
      </a>

      <nav class="nav">
        <a href="#/" :class="{ on: route.name === 'home' }">首页</a>
        <a href="#/list" :class="{ on: route.name === 'list' }">参数库</a>
        <a href="#/compare" :class="{ on: route.name === 'compare' }">对比{{ state.compare.length ? '(' + state.compare.length + ')' : '' }}</a>
        <a href="#/favorites" :class="{ on: route.name === 'favorites' }">收藏{{ state.favorites.size ? '(' + state.favorites.size + ')' : '' }}</a>
      </nav>

      <span class="header-spacer"></span>

      <label class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input
          v-model="q"
          type="search"
          placeholder="搜索机型 / 品牌 / 芯片"
          aria-label="搜索机型"
          @keyup.enter="submitSearch"
        >
      </label>

      <div class="mode-switch" role="group" aria-label="配色">
        <button :class="{ on: state.theme === 'light' }" :aria-pressed="state.theme === 'light'" @click="setTheme('light')">☀ <span class="theme-label">浅色</span></button>
        <button :class="{ on: state.theme === 'dark' }" :aria-pressed="state.theme === 'dark'" @click="setTheme('dark')">☾ <span class="theme-label">深色</span></button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { route, navigate } from '../lib/router.js'
import { state, setTheme } from '../lib/store.js'

const q = ref('')
function submitSearch() {
  navigate('/list', { q: q.value.trim() })
}
</script>
