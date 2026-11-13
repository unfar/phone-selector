<template>
  <nav class="bottom-nav" aria-label="底部导航">
    <a href="#/" :class="{ on: route.name === 'home' }"><span class="n">◎</span>首页</a>
    <a href="#/wizard" :class="{ on: route.name === 'wizard' }"><span class="n">✦</span>3 步选机</a>
    <a href="#/list" :class="{ on: route.name === 'list' }"><span class="n">▦</span>参数库</a>
    <a href="#/compare" :class="{ on: route.name === 'compare' }"><span class="n">⇄</span>对比{{ state.compare.length ? '(' + state.compare.length + ')' : '' }}</a>
    <a href="#/favorites" :class="{ on: route.name === 'favorites' }"><span class="n">☆</span>收藏</a>
  </nav>
</template>

<script setup>
import { route } from '../lib/router.js'
import { state } from '../lib/store.js'
</script>
