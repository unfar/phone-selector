<template>
  <article class="phone-card" @click="open">
    <div class="card-top">
      <span class="brand-pill">{{ phone.brand }}</span>
      <span class="price" :class="{ tbd: !phone.price }">
        <template v-if="phone.price"><span class="cur">¥</span>{{ phone.price }}</template>
        <template v-else>待公布</template>
      </span>
    </div>

    <div class="card-name">{{ displayName(phone) }}</div>
    <p class="card-verdict">{{ verdict(phone, score) }}</p>

    <dl class="card-specs">
      <div class="spec-item"><dt>性能</dt><dd>{{ shortChip(phone) }}</dd></div>
      <div class="spec-item"><dt>电池</dt><dd>{{ fmtBattery(phone) }}</dd></div>
      <div class="spec-item"><dt>影像</dt><dd>{{ cameraBrief(phone) }}</dd></div>
      <div class="spec-item"><dt>重量</dt><dd>{{ fmtWeight(phone) }}</dd></div>
    </dl>

    <div class="card-tags">
      <span v-for="t in tags" :key="t" class="mini-tag">{{ t }}</span>
    </div>

    <div class="card-foot">
      <span v-if="match !== undefined" class="match-badge">匹配 {{ match }}%</span>
      <button class="btn btn-sm" :class="{ 'btn-primary': isComparing(phone.id) }" @click.stop="toggleCompare(phone.id)">
        {{ isComparing(phone.id) ? '已选' : '+ 对比' }}
      </button>
      <button class="btn btn-sm" @click.stop="open">详情</button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { navigate } from '../lib/router.js'
import { isComparing, toggleCompare } from '../lib/store.js'
import {
  displayName, verdict, cameraBrief, fmtBattery, fmtWeight, shortChip,
} from '../lib/derive.js'

const props = defineProps({
  phone: { type: Object, required: true },
  score: { type: Object, default: null },
  match: { type: Number, default: undefined },
})

const tags = computed(() => {
  const out = []
  const p = props.phone
  if ((p.tags || []).includes('潜望长焦')) out.push('潜望长焦')
  if (Number(p.wireless_charging_w || 0) > 0) out.push(p.wireless_charging_w + 'W 无线')
  if (p.weight_g && p.weight_g <= 200) out.push('≤200g')
  if (/IP6[89]/.test(p.ip_rating || '')) out.push(p.ip_rating)
  return out.slice(0, 3)
})

function open() {
  navigate('/phone/' + encodeURIComponent(props.phone.id))
}
</script>
