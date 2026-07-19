<template>
  <div :class="['phone-card', 'brand-border-' + phone.brand, { 'compare-selected': isSelected }]">
    <div :class="['card-header', 'brand-header-' + phone.brand]">
      <span class="brand-badge">
        <img v-if="!textLogoBrands.has(phone.brand)" class="brand-logo" :style="logoStyle" :src="brandLogos[phone.brand]" :alt="phone.brand">
        <span v-else class="brand-text-logo">{{ phone.brand }}</span>
      </span>
      <span :class="['price-badge', { 'release-badge': isFutureRelease }]" v-if="headerBadge">{{ headerBadge }}</span>
      <div class="phone-name">{{ displayName }}</div>
    </div>

    <div class="card-body">
      <!-- 决策参数常显（对标商城列表：扫一眼可决策） -->
      <div class="kv-grid">
        <div class="kv"><div class="k">芯片</div><div class="v">{{ phone.processor || '—' }}</div></div>
        <div class="kv"><div class="k">电池</div><div class="v">{{ phone.battery_mah ? phone.battery_mah + 'mAh' : '—' }}</div></div>
        <div class="kv"><div class="k">充电</div><div class="v">{{ chargeSummary }}</div></div>
        <div class="kv"><div class="k">重量</div><div class="v">{{ phone.weight_g ? phone.weight_g + 'g' : '—' }}</div></div>
        <div class="kv"><div class="k">屏幕</div><div class="v">{{ screenSummary }}</div></div>
        <div class="kv"><div class="k">防水</div><div class="v">{{ ipSummary }}</div></div>
        <div class="kv"><div class="k">内存</div><div class="v">{{ phone.ram ? simplifyCapacity(phone.ram) : '—' }}</div></div>
        <div class="kv"><div class="k">存储</div><div class="v">{{ phone.storage ? simplifyCapacity(phone.storage) : '—' }}</div></div>
      </div>

      <div class="cam-line" v-if="cameraSummary">📸 {{ cameraSummary }}</div>

      <div v-if="expanded" class="detail-grid">
        <template v-for="s in detailRows" :key="s.l">
          <div :class="['spec-cell', { 'colspan-2': s.colspan }]">
            <div class="label">{{ s.l }}</div>
            <div :class="['value', { unsupported: s.v === '不支持' || s.v === '—', 'camera-value': /前置|后置|影像/.test(s.l) || s.proto }]">{{ s.v }}</div>
          </div>
        </template>
      </div>

      <div class="card-actions">
        <button class="expand-link" type="button" @click="expanded = !expanded">
          {{ expanded ? '收起参数' : '更多参数' }}
        </button>
        <button
          type="button"
          :class="['compare-check', { on: isSelected }]"
          @click="toggleCompare"
          :title="isSelected ? '取消对比' : '加入对比'"
        >
          {{ isSelected ? '✓ 已选对比' : '+ 对比' }}
        </button>
      </div>
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

const today = new Date().toISOString().split('T')[0]
const isFutureRelease = computed(() => {
  const rd = props.phone.release_date
  return rd && rd.length >= 10 && rd > today
})
const headerBadge = computed(() => {
  if (isFutureRelease.value) {
    const p = props.phone.release_date.split('-')
    return p[1] + '/' + p[2]
  }
  return props.phone.price ? '¥' + props.phone.price : ''
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
    const first = rear.v.split('\n')[0]
    return first + (rear.v.includes('\n') ? ' · …' : '')
  }
  const img = cams.find(s => s.l === '影像')
  return img?.v || (props.phone.camera_desc || '').split('|')[0].trim() || ''
})

function toggleCompare() {
  toggleCompareSelection(props.phone.id)
}

const detailRows = computed(() => {
  const phone = props.phone
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
    { l: '🛡️ 防尘抗水', v: getIpRating(phone) },
    { l: '🖥️ 尺寸/类型', v: getFoldableScreenDisplay(phone) || '—' },
    { l: '🎯 分辨率/刷新率', v: ((phone.resolution || '') + ' · ' + (phone.refresh_hz ? phone.refresh_hz + 'Hz' : '')).replace(/^ · /, '').replace(/ · $/, '') || '—' },
    { l: '⚡ 充电', v: chargeParts.length ? chargeParts.join(' + ') : '—', colspan: true },
    ...(phone.charge_protocols?.length
      ? [{ l: '🔌 充电协议', v: phone.charge_protocols.join(' · '), colspan: true, proto: true }]
      : []),
  ]
  const camSpecs = getCameraSpecs(phone)
  // 明确分区：先后置，再前置，避免混在一起
  const rearSpec = camSpecs.find(s => s.l === '后置')
  const frontSpec = camSpecs.find(s => s.l === '前置')
  const otherCam = camSpecs.filter(s => s.l !== '后置' && s.l !== '前置')
  if (rearSpec) {
    sc.push({ ...rearSpec, l: '📸 后置摄像头', colspan: true })
  }
  if (frontSpec) {
    sc.push({ ...frontSpec, l: '🤳 前置摄像头' })
  }
  otherCam.forEach(s => sc.push(s))
  return sc
})
</script>
