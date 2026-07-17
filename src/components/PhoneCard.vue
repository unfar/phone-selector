<template>
  <div :class="['phone-card', 'brand-border-' + phone.brand, { 'compare-selected': isSelected, expanded }]"
    :data-id="phone.id" @click="onCardClick">
    <!-- left brand accent stripe -->
    <div :class="['brand-stripe', 'brand-stripe-' + phone.brand]"></div>

    <div class="card-header">
      <div class="card-header-top">
        <span class="brand-badge">
          <img v-if="!textLogoBrands.has(phone.brand)" class="brand-logo" :style="logoStyle" :src="brandLogos[phone.brand]" :alt="phone.brand">
          <span v-else class="brand-text-logo brand-text-dark">{{ phone.brand }}</span>
        </span>
        <span :class="['price-badge', { 'release-badge': isFutureRelease }]" v-if="headerBadge">{{ headerBadge }}</span>
      </div>
      <div class="phone-name">{{ displayName }}</div>
      <div class="card-meta" v-if="releaseLabel">{{ releaseLabel }}</div>
      <span v-if="isSelected" class="compare-index">{{ compareIndex }}</span>
    </div>

    <div class="card-body">
      <!-- Summary: decision fields only -->
      <div class="summary-grid">
        <div class="summary-item primary">
          <span class="s-label">芯片</span>
          <span class="s-value">{{ phone.processor || '—' }}</span>
        </div>
        <div class="summary-item primary">
          <span class="s-label">电池</span>
          <span class="s-value">{{ phone.battery_mah ? phone.battery_mah + 'mAh' : '—' }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">充电</span>
          <span class="s-value">{{ chargeSummary }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">重量</span>
          <span class="s-value">{{ phone.weight_g ? phone.weight_g + 'g' : '—' }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">屏幕</span>
          <span class="s-value">{{ screenSummary }}</span>
        </div>
        <div class="summary-item">
          <span class="s-label">防水</span>
          <span class="s-value">{{ ipSummary }}</span>
        </div>
      </div>

      <div class="camera-summary" v-if="cameraSummary">
        <span class="cam-icon">📸</span>
        <span class="cam-text">{{ cameraSummary }}</span>
      </div>

      <!-- Expanded full specs -->
      <div v-if="expanded" class="spec-grid detail-grid" @click.stop>
        <template v-for="s in specRows" :key="s.l">
          <div :class="['spec-cell', { 'colspan-2': s.colspan }]">
            <div class="label">{{ s.l }}</div>
            <div :class="['value', { unsupported: s.v === '不支持' || s.v === '—', 'camera-value': /前置|后置|影像/.test(s.l) || s.proto }]">{{ s.v }}</div>
          </div>
        </template>
      </div>

      <button class="expand-toggle" type="button" @click.stop="toggleExpand">
        {{ expanded ? '收起详情 ▲' : '展开详情 ▼' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { compareList, toggleCompareSelection } from '../composables/useCompare.js'
import {
  brandLogos, textLogoBrands, getLogoStyle, getDisplayName,
  getFoldableScreenDisplay, getCameraSpecs, simplifyCapacity, getIpRating
} from '../utils.js'

const props = defineProps({ phone: { type: Object, required: true } })

const displayName = getDisplayName(props.phone)
const logoStyle = getLogoStyle(props.phone.brand)
const expanded = ref(false)

const isSelected = computed(() => compareList.value.includes(props.phone.id))
const compareIndex = computed(() => {
  const i = compareList.value.indexOf(props.phone.id)
  return i >= 0 ? i + 1 : ''
})

const today = new Date().toISOString().split('T')[0]
const isFutureRelease = computed(() => {
  const rd = props.phone.release_date
  return rd && rd.length >= 10 && rd > today
})
const headerBadge = computed(() => {
  if (isFutureRelease.value) {
    const parts = props.phone.release_date.split('-')
    return parts[1] + '/' + parts[2]
  }
  return props.phone.price ? '¥' + props.phone.price : ''
})

const releaseLabel = computed(() => {
  const rd = props.phone.release_date
  if (!rd) return ''
  if (rd.length >= 10) {
    const [y, m, d] = rd.split('-')
    return `${y}.${Number(m)}.${Number(d)} 发布`
  }
  if (rd.length === 7) {
    const [y, m] = rd.split('-')
    return `${y}.${Number(m)} 发布`
  }
  return rd
})

const chargeSummary = computed(() => {
  const p = props.phone
  const parts = []
  if (p.charging_w) parts.push(p.charging_w + 'W')
  if (p.wireless_charging_w) parts.push(p.wireless_charging_w + 'W无线')
  return parts.length ? parts.join(' · ') : '—'
})

const screenSummary = computed(() => {
  const p = props.phone
  if (p.screen_form === '折叠屏') {
    const u = p.screen_unfolded?.size || p.screen_size
    return u ? u + '″折叠' : '折叠屏'
  }
  const size = p.screen_size ? p.screen_size + '″' : ''
  const hz = p.refresh_hz ? p.refresh_hz + 'Hz' : ''
  return [size, hz].filter(Boolean).join(' ') || '—'
})

const ipSummary = computed(() => getIpRating(props.phone, { join: ' ', empty: '—' }))

const cameraSummary = computed(() => {
  const cams = getCameraSpecs(props.phone)
  const rear = cams.find(s => s.l === '后置')
  if (rear?.v) {
    // first line only, compact
    const first = rear.v.split('\n')[0]
    const more = rear.v.includes('\n') ? ' · …' : ''
    return first + more
  }
  const img = cams.find(s => s.l === '影像')
  return img?.v || (props.phone.camera_desc || '').split('|')[0].trim() || ''
})

function toggleExpand() {
  expanded.value = !expanded.value
}

function onCardClick(e) {
  if (e.target.closest('.expand-toggle') || e.target.closest('.detail-grid')) return
  if (e.target.closest('.compare-bar') || e.target.closest('.compare-panel')) return
  toggleCompareSelection(props.phone.id)
}

const specRows = computed(() => {
  const phone = props.phone
  const ipVal = getIpRating(phone)
  const chargeParts = []
  if (phone.charging_w) chargeParts.push(phone.charging_w + 'W有线')
  if (phone.wireless_charging_w) chargeParts.push(phone.wireless_charging_w + 'W无线')

  const sc = [
    { l: '🔌 入网型号', v: phone.network_model || '—' },
    { l: '⚙️ 处理器', v: phone.processor || '—' },
    { l: '💾 运行内存', v: phone.ram ? simplifyCapacity(phone.ram) : '—' },
    { l: '📦 存储', v: phone.storage ? simplifyCapacity(phone.storage) : '—' },
    { l: '🔋 电池', v: phone.battery_mah ? phone.battery_mah + 'mAh' : '—' },
    { l: '⚖️ 重量', v: phone.weight_g ? phone.weight_g + 'g' : '—' },
    { l: '🔗 USB', v: phone.usb_version || '—' },
    { l: '🛡️ 防尘抗水', v: ipVal },
    { l: '🖥️ 尺寸/类型', v: getFoldableScreenDisplay(phone) || '—' },
    { l: '🎯 分辨率/刷新率', v: ((phone.resolution || '') + ' · ' + (phone.refresh_hz ? phone.refresh_hz + 'Hz' : '')).replace(/^ · /, '').replace(/ · $/, '') || '—' },
    { l: '⚡ 充电', v: chargeParts.length > 0 ? chargeParts.join(' + ') : '—', colspan: true },
    ...(phone.charge_protocols && phone.charge_protocols.length > 0
      ? [{ l: '🔌 充电协议', v: phone.charge_protocols.join(' · '), colspan: true, proto: true }]
      : []),
  ]
  const camSpecs = getCameraSpecs(phone)
  const rearSpec = camSpecs.find(s => s.l === '后置')
  const otherSpecs = camSpecs.filter(s => s.l !== '后置')
  otherSpecs.forEach(s => {
    if (s.l === '前置') s.l = '📷 前置'
    sc.push(s)
  })
  if (rearSpec) {
    rearSpec.l = '📸 后置'
    sc.push(rearSpec)
  }
  return sc
})
</script>
