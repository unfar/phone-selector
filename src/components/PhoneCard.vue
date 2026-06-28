<template>
  <div :class="['phone-card', 'brand-border-' + phone.brand, { 'compare-selected': isSelected }]"
    :data-id="phone.id" @click="onCardClick">
    <div :class="['card-header', 'brand-header-' + phone.brand]">
      <div class="card-header-top">
        <span class="brand-badge">
          <img v-if="!textLogoBrands.has(phone.brand)" class="brand-logo" :style="logoStyle" :src="brandLogos[phone.brand]" :alt="phone.brand">
          <span v-else class="brand-text-logo">{{ phone.brand }}</span>
        </span>
        <span :class="['price-badge', { 'release-badge': isFutureRelease }]" v-if="headerBadge">{{ headerBadge }}</span>
      </div>
      <div class="phone-name">{{ displayName }}</div>
    </div>
    <div class="card-body">
      <div class="spec-grid">
        <template v-for="s in specRows" :key="s.l">
          <div v-if="s.section" class="spec-section-divider">
            <span>{{ s.l }}</span>
          </div>
          <div v-else :class="['spec-cell', { 'colspan-2': s.colspan }]">
            <div class="label">{{ s.l }}</div>
            <div :class="['value', { unsupported: s.v === '不支持' || s.v === '—', 'camera-value': ['后置','前置','影像'].includes(s.l) }]">{{ s.v }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { compareList, toggleCompareSelection } from '../composables/useCompare.js'
import { brandLogos, textLogoBrands, getLogoStyle, getDisplayName, getFoldableScreenDisplay, getCameraSpecs, simplifyCapacity } from '../utils.js'

const props = defineProps({ phone: { type: Object, required: true } })

const displayName = getDisplayName(props.phone)
const logoStyle = getLogoStyle(props.phone.brand)

const isSelected = computed(() => compareList.value.includes(props.phone.id))

// 判断是否为未发布机型，显示发布时间
const today = '2026-06-24'
const isFutureRelease = computed(() => {
  const rd = props.phone.release_date
  return rd && rd.length >= 10 && rd >= today
})
const headerBadge = computed(() => {
  if (isFutureRelease.value) {
    // format "2026-06-26" → "6月26日"
    const parts = props.phone.release_date.split('-')
    return parts[1] + '/' + parts[2]
  }
  return props.phone.price ? '¥' + props.phone.price : ''
})

function onCardClick(e) {
  if (e.target.closest('.compare-bar') || e.target.closest('.compare-panel')) return
  console.log('Card clicked:', props.phone.id)
  toggleCompareSelection(props.phone.id)
}

// Spec rows
const specRows = computed(() => {
  const phone = props.phone
  const ipFeats = (phone.features || []).filter(f => /IP[0-9XK]\d/.test(f))
  let ipVal = '—'
  if (ipFeats.length > 0) {
    const ipLevels = ipFeats.flatMap(f => f.match(/IP[0-9XK]+\dK?/g) || [])
    if (ipLevels.length > 0) ipVal = [...new Set(ipLevels)].join(' ')
  } else if (phone.tags?.includes('防尘抗水')) {
    ipVal = '支持'
  }
  const chargeParts = []
  if (phone.charging_w) chargeParts.push(phone.charging_w + 'W有线')
  if (phone.wireless_charging_w) chargeParts.push(phone.wireless_charging_w + 'W无线')

  const sc = [
    // 核心参数
    { l: '🔌 入网型号', v: phone.network_model || '—' },
    { l: '⚙️ 处理器', v: phone.processor || '—' },
    { l: '💾 运行内存', v: phone.ram ? simplifyCapacity(phone.ram) : '—' },
    { l: '📦 存储', v: phone.storage ? simplifyCapacity(phone.storage) : '—' },
    { l: '🔋 电池', v: phone.battery_mah ? phone.battery_mah + 'mAh' : '—' },
    { l: '⚖️ 重量', v: phone.weight_g ? phone.weight_g + 'g' : '—' },
    { l: '🔗 USB', v: phone.usb_version || '—' },
    { l: '🛡️ 防尘抗水', v: ipVal },
    // 屏幕
    { l: '🖥️ 尺寸/类型', v: getFoldableScreenDisplay(phone) || '—' },
    { l: '🎯 分辨率/刷新率', v: ((phone.resolution || '') + ' · ' + (phone.refresh_hz ? phone.refresh_hz + 'Hz' : '')).replace(/^ · /, '').replace(/ · $/, '') || '—' },
    // 充电（合并有线+无线）
    { l: '⚡ 充电', v: chargeParts.length > 0 ? chargeParts.join(' + ') : '—', colspan: true },
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
