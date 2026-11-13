<template>
  <div v-if="items.length >= 2">
    <div class="section-head">
      <h2 class="section-title">规格对比</h2>
      <span class="section-desc">已选 {{ items.length }} / 4 · 高亮项为该项更优</span>
      <a class="section-link" href="#/list">+ 继续添加</a>
    </div>

    <div class="compare-conclusion">💡 {{ conclusion }}</div>

    <div class="compare-grid">
      <table class="compare-table">
        <thead>
          <tr>
            <th>参数</th>
            <th v-for="it in items" :key="it.p.id">
              <div style="display:flex;align-items:center;gap:8px">
                <a :href="'#/phone/' + encodeURIComponent(it.p.id)">{{ displayName(it.p) }}</a>
                <button
                  class="btn btn-sm" style="padding:2px 7px;font-size:11px;margin-left:auto"
                  :aria-label="'移除 ' + displayName(it.p)" @click="toggleCompare(it.p.id)"
                >×</button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td>{{ row.label }}</td>
            <td v-for="(it, i) in items" :key="it.p.id" :class="{ win: winner[row.key] === i }">
              <div>{{ row.fmt(it.p, it.s) }}</div>
              <div v-if="row.bar" class="bar"><i :style="{ width: barWidth(row, it) + '%' }"></i></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="compare-foot">
      <button
        class="btn btn-sm btn-primary"
        :disabled="generating"
        :aria-busy="generating"
        :style="generating ? { opacity: 0.65, cursor: 'progress' } : null"
        @click="downloadImage"
      >{{ generating ? '生成中…' : '生成对比图' }}</button>
      <button class="btn btn-sm btn-primary" @click="share">复制对比链接</button>
      <a class="btn btn-sm" href="#/list">继续挑选</a>
      <button class="btn btn-sm btn-ghost" style="margin-left:auto" @click="clear">清空对比</button>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>选 2–4 台机型，才能看到差异和结论。</p>
    <p style="margin-top:8px;font-size:13px">在参数库或详情页点「+ 对比」即可加入。</p>
    <div style="margin-top:16px"><a class="btn btn-primary" href="#/list">去参数库挑选 →</a></div>
  </div>

  <div v-if="preview" class="share-modal" role="dialog" aria-modal="true" aria-label="对比图预览" @click.self="preview = ''">
    <div class="share-panel">
      <div class="share-panel-head">
        <h3>对比图已生成</h3>
        <button class="icon-btn" aria-label="关闭预览" @click="preview = ''">×</button>
      </div>
      <p class="share-hint">手机端可长按图片保存；电脑端点击「下载图片」。</p>
      <img class="share-preview-img" :src="preview" alt="机型对比图预览">
      <div class="share-actions">
        <button class="btn btn-primary" @click="doDownload">下载图片</button>
        <button class="btn" @click="preview = ''">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { route } from '../lib/router.js'
import { state, toggleCompare, clearCompare, flash } from '../lib/store.js'
import { renderCompareImage, downloadCompareImage } from '../lib/shareImage.js'
import {
  COMPARE_ROWS, compareConclusion, displayName, scoreOf,
} from '../lib/derive.js'

const items = computed(() => state.compare
  .map(id => state.phones.find(p => p.id === id))
  .filter(Boolean)
  .map(p => ({ p, s: scoreOf(state.profiles, p) })))

const rows = COMPARE_ROWS

onMounted(() => {
  const ids = route.query.ids
  if (ids) {
    const list = ids.split(',').map(s => state.phones.find(p => String(p.id) === s)).filter(Boolean).map(p => p.id)
    if (list.length) {
      state.compare = list.slice(0, 4)
      localStorage.setItem('ps2-compare', JSON.stringify(state.compare))
    }
  }
})

const winner = computed(() => {
  const out = {}
  for (const row of rows) {
    if (!row.better) continue
    const vals = items.value.map(it => row.get(it.p, it.s)).filter(v => typeof v === 'number' && !Number.isNaN(v))
    if (!vals.length) continue
    const target = row.better === 'high' ? Math.max(...vals) : Math.min(...vals)
    out[row.key] = items.value.findIndex(it => row.get(it.p, it.s) === target)
  }
  return out
})

const conclusion = computed(() => compareConclusion(items.value))

function barWidth(row, it) {
  const vals = items.value.map(x => row.get(x.p, x.s)).filter(v => typeof v === 'number' && v > 0)
  if (!vals.length) return 0
  const v = row.get(it.p, it.s)
  if (!v) return 0
  if (row.key === 'weight') {
    const min = Math.min(...vals)
    return Math.round((min / v) * 100)
  }
  return Math.round((v / Math.max(...vals)) * 100)
}

async function share() {
  const url = location.origin + location.pathname + '#/compare?ids=' + state.compare.join(',')
  try { await navigator.clipboard.writeText(url); flash('对比链接已复制') } catch (e) { flash('复制失败，请手动复制地址') }
}

const generating = ref(false)
const preview = ref('')

async function downloadImage() {
  if (generating.value) return
  if (items.value.length < 2) {
    flash('至少选择 2 台机型才能生成对比图')
    return
  }
  generating.value = true
  try {
    const canvas = renderCompareImage(items.value)
    preview.value = canvas.toDataURL('image/png')
  } catch (e) {
    console.error('[compare] 生成对比图失败', e)
    flash(e && e.message ? '生成对比图失败：' + e.message : '生成对比图失败，请重试')
  } finally {
    generating.value = false
  }
}

async function doDownload() {
  try {
    await downloadCompareImage(items.value)
    flash('对比图已开始下载')
  } catch (e) {
    console.error('[compare] 下载对比图失败', e)
    flash('下载失败，可长按预览图保存')
  }
}

function clear() {
  clearCompare()
  flash('已清空对比')
}
</script>
