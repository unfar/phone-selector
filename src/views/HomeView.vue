<template>
  <section class="hero">
    <div class="hero-left">
      <span class="eyebrow">✦ 换手机，先回答 3 个问题</span>
      <h1>3 步找到<em>适合你</em>的手机</h1>
      <p class="hero-sub">
        不用懂参数。告诉它预算和你在意什么，从 {{ state.phones.length }} 款国行机型里拿到带理由的候选；
        在意细节可以切表格视图、在详情页展开完整规格。
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/wizard">开始 3 步选机</a>
        <a class="btn btn-ghost" href="#/list">直接逛参数库 →</a>
      </div>
      <div class="hero-stats">
        <div><b>{{ state.phones.length }}</b>在售 / 待发机型</div>
        <div><b>{{ brandCount }}</b>品牌</div>
        <div><b>{{ state.dataDate || '—' }}</b>数据更新</div>
      </div>
    </div>

    <aside class="hero-side">
      <h3>3 步之后你会得到</h3>
      <ol class="steps-mini">
        <li>
          <span class="num">1</span>
          <div><b>预算范围</b><span>先划区间，不浪费时间</span></div>
        </li>
        <li>
          <span class="num">2</span>
          <div><b>你在意什么</b><span>拍照 / 游戏 / 续航 / 屏幕 / 轻薄</span></div>
        </li>
        <li>
          <span class="num">3</span>
          <div><b>必须满足的条件</b><span>防水、无线充、折叠、直屏……</span></div>
        </li>
      </ol>
      <a class="btn btn-primary" style="width:100%;margin-top:20px" href="#/wizard">帮我选 →</a>
    </aside>
  </section>

  <section class="section">
    <div class="section-head">
      <h2 class="section-title">按场景找</h2>
      <span class="section-desc">先看你在意什么，再挑机器</span>
    </div>
    <div class="scene-grid">
      <a v-for="s in scenes" :key="s.id" class="scene-chip" :href="'#/list?scene=' + s.id">
        <span class="ico">{{ s.ico }}</span>
        <span><b>{{ s.title }}</b><span>{{ s.desc }}</span></span>
      </a>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <h2 class="section-title">编辑推荐</h2>
      <span class="section-desc">综合影像、性能、续航、屏幕与手感</span>
      <a class="section-link" href="#/list">全部 {{ state.phones.length }} 款 →</a>
    </div>
    <div class="grid-cards">
      <PhoneCard v-for="p in picks" :key="p.id" :phone="p" :score="profile(p)" />
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <h2 class="section-title">最新发布</h2>
      <span class="section-desc">先看新机，再看参数</span>
      <a class="section-link" href="#/list?sort=newest">按时间排序 →</a>
    </div>
    <div class="grid-cards">
      <PhoneCard v-for="p in newest" :key="p.id" :phone="p" :score="profile(p)" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PhoneCard from '../components/PhoneCard.vue'
import { state } from '../lib/store.js'
import { scoreOf } from '../lib/derive.js'

const scenes = [
  { id: 'camera', ico: '📷', title: '拍照优先', desc: '大底主摄 / 潜望长焦' },
  { id: 'performance', ico: '⚡', title: '游戏性能', desc: '旗舰芯片 / 散热' },
  { id: 'battery', ico: '🔋', title: '长续航', desc: '大电池 / 快充' },
  { id: 'light', ico: '🪶', title: '轻薄手感', desc: '200g 以内' },
  { id: 'fold', ico: '📐', title: '折叠屏', desc: '横向 / 竖向折叠' },
  { id: 'small', ico: '🤏', title: '小屏党', desc: '6.4 英寸以内' },
]

const brandCount = computed(() => new Set(state.phones.map(p => p.brand)).size)

function profile(p) {
  return scoreOf(state.profiles, p)
}

const picks = computed(() => {
  return state.phones
    .filter(p => p.price)
    .slice()
    .sort((a, b) => profile(b).overall - profile(a).overall)
    .slice(0, 8)
})

const newest = computed(() => {
  return state.phones
    .slice()
    .sort((a, b) => String(b.release_date || '').localeCompare(String(a.release_date || '')))
    .slice(0, 8)
})
</script>
