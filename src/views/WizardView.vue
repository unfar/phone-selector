<template>
  <div class="wizard-wrap">
    <div v-if="!results" class="wizard-card">
      <div class="wizard-progress" aria-hidden="true">
        <i :class="{ on: step >= 1 }"></i><i :class="{ on: step >= 2 }"></i><i :class="{ on: step >= 3 }"></i>
      </div>

      <template v-if="step === 1">
        <h2 class="step-title">你的预算大概是多少？</h2>
        <p class="step-desc">只影响筛选范围，之后随时可以改。</p>
        <div class="option-grid">
          <button
            v-for="b in BUDGETS" :key="b.id" class="option-card" :class="{ on: budget === b.id }"
            @click="budget = b.id"
          >
            <b>{{ b.label }}</b>
            <span>{{ budgetHint(b) }}</span>
          </button>
        </div>
        <div class="wizard-nav">
          <a class="btn btn-ghost" href="#/">取消</a>
          <button class="btn btn-primary" @click="step = 2">下一步</button>
          <span class="hint">1 / 3</span>
        </div>
      </template>

      <template v-else-if="step === 2">
        <h2 class="step-title">你最看重什么？</h2>
        <p class="step-desc">选 2 个，第一个权重更高。之后会按这个给你算匹配度。</p>
        <div class="option-grid">
          <button
            v-for="p in PRIORITIES" :key="p.id" class="option-card"
            :class="{ on: priorities.includes(p.id) }"
            @click="togglePriority(p.id)"
          >
            <span v-if="priorities.includes(p.id)" class="idx">{{ priorities.indexOf(p.id) + 1 }}</span>
            <b>{{ p.label }}</b>
            <span>{{ p.desc }}</span>
          </button>
        </div>
        <div class="wizard-nav">
          <button class="btn" @click="step = 1">上一步</button>
          <button class="btn btn-primary" :disabled="!priorities.length" @click="step = 3">下一步</button>
          <span class="hint">2 / 3</span>
        </div>
      </template>

      <template v-else>
        <h2 class="step-title">有什么必须满足的？</h2>
        <p class="step-desc">可以都不选；条件太苛刻时会自动放宽并提示。</p>
        <div class="chips" style="margin-bottom:18px">
          <button
            v-for="m in MUST_HAVES" :key="m.id" class="chip"
            :class="{ on: musts.includes(m.id) }" @click="toggleMust(m.id)"
          >{{ m.label }}</button>
        </div>
        <p class="step-desc" style="margin-bottom:8px">限定品牌（可选）</p>
        <div class="chips">
          <button
            v-for="b in topBrands" :key="b" class="chip"
            :class="{ on: brands.includes(b) }" @click="toggleBrand(b)"
          >{{ b }}</button>
        </div>
        <div class="wizard-nav">
          <button class="btn" @click="step = 2">上一步</button>
          <button class="btn btn-primary" @click="showResults">看推荐结果</button>
          <span class="hint">3 / 3</span>
        </div>
      </template>
    </div>

    <div v-if="results" class="section" style="margin-top:6px">
      <div class="section-head">
        <h2 class="section-title">为你找到 {{ results.length }} 台候选</h2>
        <span class="section-desc">预算 {{ budgetLabel }} · 看重 {{ priorityLabel }}</span>
        <button class="btn btn-sm" style="margin-left:auto" @click="reset">重新选</button>
      </div>
      <div class="result-list">
        <div v-for="r in results" :key="r.p.id" class="result-row">
          <div class="match-ring" :style="{ '--pct': r.match }"><span>{{ r.match }}%</span></div>
          <div class="result-main">
            <b>{{ displayName(r.p) }}</b>
            <div class="sub">{{ fmtPrice(r.p) }} · {{ r.p.processor }}</div>
            <div class="reason-tags">
              <em v-for="t in r.reasons" :key="t">{{ t }}</em>
              <em v-if="r.tradeoff" class="warn">取舍：{{ r.tradeoff }}</em>
            </div>
          </div>
          <div class="result-actions">
            <button class="btn btn-sm" @click="openDetail(r.p.id)">详情</button>
            <button class="btn btn-sm btn-primary" @click="toggleCompare(r.p.id)">
              {{ isComparing(r.p.id) ? '已选' : '+ 对比' }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="relaxed" class="step-desc" style="margin-top:10px">⚠ 没有完全符合条件的机型，已自动放宽「必须项」。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { navigate } from '../lib/router.js'
import { state, isComparing, toggleCompare } from '../lib/store.js'
import {
  BUDGETS, PRIORITIES, MUST_HAVES, recommend, displayName, fmtPrice,
} from '../lib/derive.js'

const step = ref(1)
const BUDGET_LABELS = Object.fromEntries(BUDGETS.map(b => [b.id, b.label]))
const PRIORITY_LABELS = Object.fromEntries(PRIORITIES.map(p => [p.id, p.label]))
const budget = ref('3-4.5k')
const priorities = ref([])
const musts = ref([])
const brands = ref([])
const results = ref(null)
const budgetLabel = computed(() => BUDGET_LABELS[budget.value] || '')
const priorityLabel = computed(() => priorities.value.map(id => PRIORITY_LABELS[id]).join(' · '))

const topBrands = computed(() => {
  const counts = new Map()
  state.phones.forEach(p => counts.set(p.brand, (counts.get(p.brand) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0])
})

function budgetHint(b) {
  const count = state.phones.filter(p => p.price && p.price >= b.min && p.price <= b.max).length
  return count + ' 款可选'
}

function togglePriority(id) {
  const i = priorities.value.indexOf(id)
  if (i >= 0) priorities.value.splice(i, 1)
  else if (priorities.value.length < 2) priorities.value.push(id)
  else priorities.value[1] = id
}

function toggleMust(id) {
  const i = musts.value.indexOf(id)
  if (i >= 0) musts.value.splice(i, 1)
  else musts.value.push(id)
}

function toggleBrand(b) {
  const i = brands.value.indexOf(b)
  if (i >= 0) brands.value.splice(i, 1)
  else brands.value.push(b)
}

const relaxed = ref(false)
function showResults() {
  const list = recommend(state.phones, state.profiles, {
    budget: budget.value,
    priorities: priorities.value,
    musts: musts.value,
    brands: brands.value,
  })
  results.value = list
  relaxed.value = list.length > 0 && list[0].relaxed
  step.value = 4
}

function reset() {
  results.value = null
  step.value = 1
  priorities.value = []
  musts.value = []
  brands.value = []
}

function openDetail(id) {
  navigate('/phone/' + encodeURIComponent(id))
}
</script>
