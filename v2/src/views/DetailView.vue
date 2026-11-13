<template>
  <div v-if="phone" class="detail-wrap">
    <div class="detail-hero">
      <div class="top">
        <span class="brand-pill">{{ phone.brand }}</span>
        <span v-if="phone.release_date" class="detail-sub">{{ phone.release_date }} 发布</span>
      </div>
      <h1 class="detail-title">{{ displayName(phone) }}</h1>
      <div class="detail-sub">{{ phone.processor }} · {{ fmtScreen(phone) }} · {{ fmtBattery(phone) }}</div>
      <div class="detail-price">{{ fmtPrice(phone) }}</div>
      <div class="detail-actions">
        <button class="btn btn-sm" :class="{ 'btn-primary': isFavorite(phone.id) }" @click="toggleFavorite(phone.id)">
          {{ isFavorite(phone.id) ? '★ 已收藏' : '☆ 收藏' }}
        </button>
        <button class="btn btn-sm" :class="{ 'btn-primary': isComparing(phone.id) }" @click="toggleCompare(phone.id)">
          {{ isComparing(phone.id) ? '已加入对比' : '+ 加入对比' }}
        </button>
        <button class="btn btn-sm" @click="share">分享</button>
        <a class="btn btn-sm btn-ghost" href="#/list">← 返回参数库</a>
      </div>
    </div>

    <section class="conclusion">
      <h3>一句话结论</h3>
      <p class="verdict">{{ verdictText }}</p>
      <div class="audience-line">
        <span>适合：<b>{{ aud.fit }}</b></span>
        <span>·</span>
        <span>不适合：<b>{{ aud.notFit }}</b></span>
      </div>
      <div class="pros-cons">
        <div class="box">
          <h4>优点</h4>
          <ul><li v-for="t in pc.pros" :key="t">{{ t }}</li></ul>
        </div>
        <div class="box">
          <h4>取舍</h4>
          <ul><li v-for="t in pc.cons" :key="t">{{ t }}</li></ul>
        </div>
      </div>
    </section>

    <section class="section-card">
      <h3>关键参数</h3>
      <div class="spec-grid">
        <div v-for="s in keySpecs" :key="s.k" class="spec-cell">
          <div class="k">{{ s.k }}</div>
          <div class="v">{{ s.v }}</div>
        </div>
      </div>
    </section>

    <section class="section-card">
      <h3>影像系统</h3>
      <div v-if="modules.length" class="camera-list">
        <div v-for="(m, i) in modules" :key="i" class="camera-item">
          <b>{{ m.label }}</b>
          <span>{{ m.value }}</span>
        </div>
      </div>
      <p v-else class="detail-sub">该机型影像详情暂未录入。</p>
    </section>

    <section v-if="sims.length" class="section-card">
      <h3>同价位还可以看</h3>
      <div class="similar-list">
        <a v-for="x in sims" :key="x.p.id" class="similar-row" :href="'#/phone/' + encodeURIComponent(x.p.id)">
          <div>
            <div class="nm">{{ displayName(x.p) }}</div>
            <div class="df">{{ diffText(x) }}</div>
          </div>
          <span class="pr">{{ fmtPrice(x.p) }}</span>
        </a>
      </div>
    </section>

    <section v-if="state.mode === 'pro'" class="section-card">
      <h3>完整规格（专业模式）</h3>
      <div v-for="g in specGroups" :key="g.title" class="filter-group" style="border-bottom:1px dashed var(--line);padding-top:10px">
        <div class="filter-title">{{ g.title }}</div>
        <div class="spec-grid">
          <div v-for="s in g.items" :key="s.k" class="spec-cell">
            <div class="k">{{ s.k }}</div>
            <div class="v">{{ s.v || '—' }}</div>
          </div>
        </div>
      </div>
    </section>

    <p class="meta-line">
      数据来源：{{ phone.source_url && !phone.source_url.includes('example.com') ? '品牌官网' : '人工整理（部分待补来源）' }}
      <template v-if="phone.verified_at"> · 更新于 {{ phone.verified_at }}</template>
      · 完整度 {{ phone.completeness_score ?? '—' }}%
      · 评分为规则推导，仅供参考。
    </p>
  </div>

  <div v-else class="empty-state">
    没有找到这台机型。 <a :href="'#/list'" style="color:var(--accent-ink)">返回参数库 →</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state, isFavorite, toggleFavorite, isComparing, toggleCompare, flash } from '../lib/store.js'
import {
  displayName, fmtPrice, fmtBattery, fmtScreen, fmtWeight, shortChip, cameraBrief,
  scoreOf, verdict, prosCons, audience, cameraModules, similarPhones,
} from '../lib/derive.js'

const props = defineProps({ id: { type: [String, Number], required: true } })

const phone = computed(() => state.phones.find(p => String(p.id) === String(props.id)))
const s = computed(() => phone.value ? scoreOf(state.profiles, phone.value) : null)
const verdictText = computed(() => phone.value ? verdict(phone.value, s.value) : '')
const pc = computed(() => phone.value ? prosCons(phone.value, s.value) : { pros: [], cons: [] })
const aud = computed(() => phone.value ? audience(phone.value, s.value) : { fit: '—', notFit: '—' })
const modules = computed(() => phone.value ? cameraModules(phone.value) : [])

const sims = computed(() => {
  if (!phone.value) return []
  return similarPhones(phone.value, state.phones, state.profiles).map(p => ({ p, s: scoreOf(state.profiles, p) }))
})

const keySpecs = computed(() => {
  const p = phone.value
  if (!p) return []
  return [
    { k: '处理器', v: shortChip(p) },
    { k: '内存 / 存储', v: [p.ram, p.storage].filter(Boolean).join(' / ') || '—' },
    { k: '屏幕', v: [fmtScreen(p), p.resolution].filter(Boolean).join(' · ') || '—' },
    { k: '电池 / 充电', v: [fmtBattery(p), p.charging_w ? p.charging_w + 'W' : null].filter(Boolean).join(' · ') },
    { k: '重量', v: fmtWeight(p) },
    { k: '主摄', v: cameraBrief(p) },
    { k: '防水', v: p.ip_rating || '—' },
    { k: '系统', v: p.os || '—' },
  ]
})

const specGroups = computed(() => {
  const p = phone.value
  if (!p) return []
  return [
    { title: '性能', items: [
      { k: '处理器', v: p.processor }, { k: '内存', v: p.ram }, { k: '存储', v: p.storage },
      { k: '系统', v: p.os }, { k: 'USB', v: p.usb_version }, { k: 'WiFi', v: p.wifi },
    ] },
    { title: '屏幕', items: [
      { k: '尺寸', v: fmtScreen(p) }, { k: '分辨率', v: p.resolution }, { k: '面板', v: p.screen_type },
      { k: '形态', v: p.screen_form }, { k: '刷新率', v: p.refresh_hz ? p.refresh_hz + 'Hz' : '' },
    ] },
    { title: '影像', items: [
      { k: '主摄', v: cameraBrief(p) }, { k: '影像系统', v: p.detailed_camera },
      { k: '前置', v: p.camera_front }, { k: '长焦', v: p.has_tele ? '有' : '无' },
    ] },
    { title: '续航', items: [
      { k: '电池', v: fmtBattery(p) }, { k: '有线充', v: p.charging_w ? p.charging_w + 'W' : '' },
      { k: '无线充', v: p.wireless_charging_w ? p.wireless_charging_w + 'W' : '' },
      { k: '反向充', v: p.reverse_charging_w ? p.reverse_charging_w + 'W' : '' },
      { k: '充电协议', v: (p.charge_protocols || []).join(' / ') },
    ] },
    { title: '其他', items: [
      { k: '重量', v: fmtWeight(p) }, { k: '防水', v: p.ip_rating }, { k: 'NFC', v: p.has_nfc ? '支持' : '' },
      { k: '红外', v: p.has_ir ? '支持' : '' }, { k: '入网型号', v: p.network_model },
      { k: '发布', v: p.release_date },
    ] },
  ]
})

function diffText(x) {
  const p = phone.value
  const out = []
  if (x.p.battery_mah && p.battery_mah) {
    const d = x.p.battery_mah - p.battery_mah
    if (Math.abs(d) >= 300) out.push(`电池 ${d > 0 ? '+' : ''}${d}mAh`)
  }
  if (x.p.weight_g && p.weight_g) {
    const d = x.p.weight_g - p.weight_g
    if (Math.abs(d) >= 8) out.push(`重量 ${d > 0 ? '+' : ''}${d}g`)
  }
  const dc = x.s.camera - s.value.camera
  if (Math.abs(dc) >= 8) out.push(dc > 0 ? '影像更强' : '影像更弱')
  return out.join(' · ') || '配置接近'
}

async function share() {
  const url = location.href
  try {
    if (navigator.share) await navigator.share({ title: displayName(phone.value), url })
    else { await navigator.clipboard.writeText(url); flash('链接已复制') }
  } catch (e) {
    try { await navigator.clipboard.writeText(url); flash('链接已复制') } catch (e2) { flash('复制失败，请手动复制地址') }
  }
}
</script>
