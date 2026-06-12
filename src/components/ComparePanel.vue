<template>
  <div class="compare-panel" id="comparePanel" style="display:none">
    <div class="compare-panel-overlay" id="comparePanelOverlay" @click="close"></div>
    <div class="compare-panel-content">
      <div class="compare-panel-header">
        <h3>📊 机型对比</h3>
        <button class="compare-panel-close" @click="close">✕</button>
      </div>
      <div class="compare-panel-body" id="comparePanelBody">
        <table class="compare-table" v-if="selected.length >= 2">
          <thead>
            <tr>
              <th><span class="param-label">参数</span></th>
              <th v-for="p in selected" :key="p.id">
                <div class="phone-name-badge">{{ p.model }}</div>
                <small style="opacity:.8;display:block;margin-top:4px">{{ p.brand }}</small>
                <button class="compare-remove" @click="removeFromCompare(p.id)">✕ 移除</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(field, fi) in fields" :key="fi">
              <th>{{ field.l }}</th>
              <td v-for="(p, pi) in selected" :key="p.id"
                :class="getCellClass(field, pi)">
                {{ getFieldValue(field, p) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div id="radarChartContainer" style="display:none">
          <canvas id="radarChart" width="400" height="400"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { compareList, toggleCompareSelection } from '../composables/useCompare.js'
import { phones } from '../composables/useFilters.js'
import { getFoldableScreenDisplay, getFoldableResolutionDisplay, getFoldableRefreshDisplay, getCameraSpecs } from '../utils.js'

const selected = computed(() => phones.value.filter(p => compareList.value.includes(p.id)))

const fields = [
  { l: '💰 价格', v: p => p.price ? '¥' + p.price : '—' },
  { l: '⚡ 处理器', v: p => p.processor || '—' },
  { l: '🧠 内存', v: p => p.ram || '—' },
  { l: '💾 存储', v: p => p.storage || '—' },
  { l: '📺 屏幕', v: p => getFoldableScreenDisplay(p) || '—' },
  { l: '🎨 分辨率', v: p => getFoldableResolutionDisplay(p) || '—' },
  { l: '🔄 刷新率', v: p => getFoldableRefreshDisplay(p) || '—' },
  { l: '🔋 电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—' },
  { l: '🔌 有线充电', v: p => p.charging_w ? p.charging_w + 'W' : '—' },
  { l: '📶 无线充电', v: p => p.wireless_charging_w ? p.wireless_charging_w + 'W' : '不支持' },
  { l: '🔗 USB', v: p => p.usb_version || '—' },
  { l: '⚖️ 重量', v: p => p.weight_g ? p.weight_g + 'g' : '—' },
  { l: '📱 屏幕形态', v: p => p.screen_form || '—' },
  { l: '📷 后置', v: p => { const s = getCameraSpecs(p); const r = s.find(x => x.l === '后置'); return r ? r.v.replace(/\n/g, ' | ') : '—' } },
  { l: '📷 前置', v: p => { const s = getCameraSpecs(p); const r = s.find(x => x.l === '前置'); return r ? r.v : '—' } },
  { l: '📷 潜望长焦', v: p => p.has_tele ? '✅ 支持' : '—' },
  { l: '💧 防尘抗水', v: p => {
    const feats = p.features || [];
    if (feats.some(f => /IP\d{2}/.test(f))) {
      const ipFeat = feats.find(f => /IP\d{2}/.test(f));
      const ips = ipFeat.match(/IP\d{2}K?/g);
      return ips ? ips.join('/') : '✅ 支持';
    }
    return p.tags?.includes('防尘抗水') ? '✅ 支持' : '—';
  }},
  { l: '📡 NFC', v: p => (p.tags?.includes('NFC') || (p.features || []).some(f => f.includes('NFC'))) ? '✅ 支持' : '—' },
  { l: '🔴 红外', v: p => (p.tags?.includes('红外') || (p.features || []).some(f => f.includes('红外'))) ? '✅ 支持' : '—' },
  { l: '🖥️ 有线投屏', v: p => (p.tags?.includes('有线投屏') || (p.features || []).some(f => f.includes('有线投屏'))) ? '✅ 支持' : '—' },
  { l: '📐 屏幕尺寸', v: p => p.screen_size ? p.screen_size + '英寸' : '—' },
  { l: '📅 发布日期', v: p => p.release_date || '—' },
]

function getFieldValue(field, phone) {
  return field.v(phone)
}

function getCellClass(field, idx) {
  const values = selected.value.map(p => field.v(p))
  const allSame = values.every(v => v === values[0])
  const val = values[idx]
  if (val === '不支持' || val === '—') return 'unsupported'
  if (!allSame && selected.value.length >= 2) return 'diff-highlight'
  return ''
}

function removeFromCompare(id) {
  toggleCompareSelection(id)
}

function close() {
  document.getElementById('comparePanel').style.display = 'none'
}
</script>
