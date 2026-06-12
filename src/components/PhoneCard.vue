<template>
  <div :class="['phone-card', 'brand-border-' + phone.brand, { 'compare-selected': isSelected }]"
    :data-id="phone.id" @click="onCardClick">
    <div :class="['card-header', 'brand-header-' + phone.brand]">
      <div class="card-header-top">
        <span class="brand-badge">
          <img v-if="!textLogoBrands.has(phone.brand)" class="brand-logo" :style="logoStyle" :src="brandLogos[phone.brand]" :alt="phone.brand">
          <span v-else class="brand-text-logo">{{ phone.brand }}</span>
        </span>
        <span class="price-badge" v-if="phone.price">¥{{ phone.price }}</span>
      </div>
      <div class="phone-name">{{ displayName }}</div>
    </div>
    <div class="card-body">
      <div class="spec-grid">
        <div v-for="s in specRows" :key="s.l" :class="['spec-cell', { 'colspan-2': s.colspan }]">
          <div class="label">{{ s.l }}</div>
          <div :class="['value', { unsupported: s.v === '不支持' || s.v === '—', 'camera-value': ['后置','前置','影像'].includes(s.l) }]">{{ s.v }}</div>
        </div>
      </div>
    </div>
    <div class="card-footer" v-if="featureTagsList.length > 0">
      <span v-for="(ft, i) in featureTagsList" :key="i" :class="['feature-tag', ft.c]">{{ ft.t }}</span>
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

function onCardClick(e) {
  if (e.target.closest('.compare-bar') || e.target.closest('.compare-panel')) return
  console.log('Card clicked:', props.phone.id)
  toggleCompareSelection(props.phone.id)
}

// Spec rows
const specRows = computed(() => {
  const phone = props.phone
  const sc = [
    { l: '处理器', v: phone.processor || '—' },
    { l: '内存/存储', v: (phone.ram && phone.storage) ? simplifyCapacity(phone.ram) + ' + ' + simplifyCapacity(phone.storage) : (simplifyCapacity(phone.ram) || simplifyCapacity(phone.storage) || '—') },
    { l: '屏幕', v: getFoldableScreenDisplay(phone) || '—' },
    { l: '电池', v: phone.battery_mah ? phone.battery_mah + 'mAh' : '—' },
    { l: '有线充电', v: phone.charging_w ? phone.charging_w + 'W' : '—' },
    { l: '无线充电', v: phone.wireless_charging_w ? phone.wireless_charging_w + 'W' : '不支持' },
    { l: 'USB', v: phone.usb_version || '—' },
    { l: '重量', v: phone.weight_g ? phone.weight_g + 'g' : '—' }
  ]
  const camSpecs = getCameraSpecs(phone)
  const rearSpec = camSpecs.find(s => s.l === '后置')
  const otherSpecs = camSpecs.filter(s => s.l !== '后置')
  otherSpecs.forEach(s => sc.push(s))
  // 防尘抗水
  const ipFeat = (phone.features || []).find(f => /IP\d{2}/.test(f))
  let ipVal = '—'
  if (ipFeat) {
    const ipLevels = ipFeat.match(/IP\d{2}K?/g)
    if (ipLevels) ipVal = ipLevels.join(' ')
  } else if (phone.tags?.includes('防尘抗水')) {
    ipVal = '支持'
  }
  sc.push({ l: '防尘抗水', v: ipVal })
  // 后置放到最底部
  if (rearSpec) sc.push(rearSpec)
  return sc
})

// Feature tags
const featureTagsList = computed(() => {
  const phone = props.phone
  const ft = []
  if (phone.has_tele) ft.push({ t: '🔭 潜望长焦', c: 'purple' })
  if (phone.tags.includes('无线充电')) ft.push({ t: '🔋 无线充电', c: 'green' })
  if (phone.tags.includes('散热风扇')) ft.push({ t: '🌀 散热风扇', c: 'red' })
  if (phone.tags.includes('NFC') || (phone.features || []).some(f => f.includes('NFC'))) ft.push({ t: '📡 NFC', c: '' })
  if (phone.tags.includes('红外') || (phone.features || []).some(f => f.includes('红外'))) ft.push({ t: '🔴 红外', c: 'amber' })
  if (phone.tags.includes('USB3.0') || (phone.features || []).includes('USB3.0')) ft.push({ t: '🔌 USB 3.0', c: '' })
  if (phone.tags.includes('6500mAh+') || (phone.features || []).includes('6500mAh+')) ft.push({ t: '🔋 6500mAh+', c: 'green' })
  if (phone.tags.includes('≤200g') || (phone.features || []).includes('≤200g')) ft.push({ t: '🪶 ≤200g', c: 'green' })
  if (phone.tags.includes('有线投屏') || (phone.features || []).includes('有线投屏')) ft.push({ t: '🖥️ 有线投屏', c: '' })
  return ft
})
</script>
