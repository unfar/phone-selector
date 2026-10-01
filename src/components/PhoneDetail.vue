<template>
  <div class="detail">
    <section class="detail-hero" :style="{ '--bcolor': brandColor(detailPhone.brand) }">
      <div class="brand">{{ detailPhone.brand }}</div>
      <h2>{{ b.name }}</h2>
      <div class="price-lg" :class="{ future: isFuture(detailPhone) }">{{ priceText(detailPhone) }}</div>
      <div class="meta" style="margin-top:8px">
        <span v-if="isFuture(detailPhone)" class="future-inline">⚠ {{ detailPhone.release_date }} 发布,尚未开售 · 官方未公布价格</span>
        <template v-else-if="!detailPhone.price && detailPhone.price_note"><span class="future-inline">⚠ 官方未公布价格:{{ detailPhone.price_note }}</span></template>
        <template v-else>{{ detailPhone.release_date || '—' }} 发布 · {{ detailPhone.os || '系统待补' }}</template>
      </div>
      <div class="detail-actions">
        <button class="btn fav-btn" :class="{ on: isFavorite(detailPhone.id) }" @click="toggleFavorite(detailPhone.id)">
          {{ isFavorite(detailPhone.id) ? '★ 已收藏' : '☆ 收藏' }}
        </button>
        <button class="btn primary" @click="toggleCompare(detailPhone.id)">
          {{ isCompared(detailPhone.id) ? '已加入对比' : '+ 加入对比' }}
        </button>
        <button class="btn" @click="openCompare" v-if="compareList.length >= 2">去对比页</button>
        <button class="btn" @click="copyShareLink">🔗 分享</button>
      </div>
      <div class="detail-nav" v-if="prevNextPhones.prev || prevNextPhones.next">
        <button class="btn ghost" :disabled="!prevNextPhones.prev" @click="prevDetail" title="上一款">
          ← {{ prevNextPhones.prev?.model || '—' }}
        </button>
        <span class="nav-pos">{{ navPos }} / {{ resultCount }}</span>
        <button class="btn ghost" :disabled="!prevNextPhones.next" @click="nextDetail" title="下一款">
          {{ prevNextPhones.next?.model || '—' }} →
        </button>
      </div>
    </section>

    <section class="spec-blocks">
      <div class="panel spec-block">
        <h4>核心参数</h4>
        <div class="spec-rows">
          <div class="spec-row"><div class="k">入网型号</div><div class="v">{{ detailPhone.network_model || '—' }}</div></div>
          <div class="spec-row">
            <div class="k">处理器</div>
            <div class="v">
              {{ detailPhone.processor || '—' }}
              <span class="proc-note" v-if="detailPhone.processor_note">{{ detailPhone.processor_note }}</span>
            </div>
          </div>
          <div class="spec-row"><div class="k">内存</div><div class="v">{{ b.ram }}</div></div>
          <div class="spec-row"><div class="k">存储</div><div class="v">{{ b.storage }}</div></div>
          <div class="spec-row"><div class="k">电池</div><div class="v">{{ detailPhone.battery_mah ? detailPhone.battery_mah + 'mAh' : '—' }}</div></div>
          <div class="spec-row"><div class="k">重量</div><div class="v">{{ detailPhone.weight_g ? detailPhone.weight_g + 'g' : '—' }}</div></div>
          <div class="spec-row"><div class="k">充电</div><div class="v">{{ b.charge }}</div></div>
          <div class="spec-row"><div class="k">USB</div><div class="v">{{ detailPhone.usb_version || '—' }}</div></div>
          <div class="spec-row"><div class="k">屏幕</div><div class="v">{{ getFoldableScreenDisplay(detailPhone) || b.screen }}</div></div>
          <div class="spec-row"><div class="k">分辨率</div><div class="v">{{ getResolutionDisplay(detailPhone) }}</div></div>
          <div class="spec-row"><div class="k">刷新率</div><div class="v">{{ detailPhone.refresh_hz ? detailPhone.refresh_hz + 'Hz' : '—' }}</div></div>
          <div class="spec-row"><div class="k">防尘抗水</div><div class="v">{{ b.ip }}</div></div>
          <div class="spec-row"><div class="k">系统</div><div class="v">{{ detailPhone.os || '—' }}</div></div>
          <div class="spec-row"><div class="k">NFC</div><div class="v">{{ b.hasNfc ? '✅ 支持' : '—' }}</div></div>
          <div class="spec-row"><div class="k">红外遥控</div><div class="v">{{ b.hasIr ? '✅ 支持' : '—' }}</div></div>
          <div class="spec-row full" v-if="detailPhone.charge_protocols?.length">
            <div class="k">充电协议</div><div class="v">{{ detailPhone.charge_protocols.join(' · ') }}</div>
          </div>
        </div>
      </div>

      <div class="panel spec-block camera-block" v-if="cams.modules.length">
        <h4>影像系统</h4>

        <div class="cam-section" v-if="cams.rear.length">
          <div class="cam-section-title">
            <span class="cam-section-icon">📸</span>
            <span>后置摄像头</span>
            <span class="cam-section-count">{{ cams.rear.length }} 颗</span>
          </div>
          <div class="cam-module-grid">
            <div
              v-for="(m, idx) in cams.rear"
              :key="'r' + m.key + idx"
              class="cam-module"
              :class="'role-' + m.key"
            >
              <div class="cam-module-head">
                <span class="cam-role">{{ m.label }}</span>
                <span class="cam-mp" v-if="m.mp">{{ m.mp }}</span>
              </div>
              <div class="cam-summary">{{ m.summary }}</div>
              <div class="cam-chips" v-if="m.chips?.length">
                <span v-for="c in m.chips" :key="c.k" class="cam-chip">
                  <em>{{ c.k }}</em>{{ c.v }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="cam-section cam-section-front" v-if="cams.front.length">
          <div class="cam-section-title front">
            <span class="cam-section-icon">🤳</span>
            <span>前置摄像头</span>
            <span class="cam-section-count">{{ cams.front.length }} 颗</span>
          </div>
          <div class="cam-module-grid" :class="{ single: cams.front.length === 1 }">
            <div
              v-for="(m, idx) in cams.front"
              :key="'f' + m.key + idx"
              class="cam-module role-front"
            >
              <div class="cam-module-head">
                <span class="cam-role">{{ m.label }}</span>
                <span class="cam-mp" v-if="m.mp">{{ m.mp }}</span>
              </div>
              <div class="cam-summary">{{ m.summary }}</div>
              <div class="cam-chips" v-if="m.chips?.length">
                <span v-for="c in m.chips" :key="c.k" class="cam-chip">
                  <em>{{ c.k }}</em>{{ c.v }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="cam-raw" v-if="detailPhone.detailed_camera">
          <span class="k">原始参数</span>
          <span class="v">{{ detailPhone.detailed_camera }}</span>
        </div>
      </div>
      <div class="panel spec-block" v-else>
        <h4>影像系统</h4>
        <div class="spec-rows">
          <div class="spec-row full">
            <div class="k">影像</div>
            <div class="v">{{ detailPhone.camera_desc || detailPhone.detailed_camera || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="panel spec-block">
        <h4>同价位竞品</h4>
        <div class="rivals">
          <div
            v-for="r in rivalPhones"
            :key="r.id"
            class="rival-chip"
            @click="openDetail(r.id)"
          >
            <span class="rival-brand">{{ r.brand }}</span>
            <span class="rival-name">{{ cardBrief(r).name }}</span>
            <span class="rival-price">{{ priceText(r) }}</span>
          </div>
          <div v-if="!rivalPhones.length" class="empty-mini">暂无相近价位机型</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  detailPhone, sortedPhones, resultCount, compareList,
  cardBrief, priceText, isFuturePhone as isFuture, brandColor,
  openDetail, openCompare, toggleCompare, isCompared, toggleFavorite, isFavorite,
  prevNextPhones, prevDetail, nextDetail, rivalPhones,
  getFoldableScreenDisplay, getCameraModules,
} from '../composables/useApp.js'
import { copyShareLink } from '../composables/useShare.js'
import { getResolutionDisplay } from '../utils.js'

const b = computed(() => cardBrief(detailPhone.value))
const cams = computed(() => getCameraModules(detailPhone.value))
/** 当前机型在"筛选后的列表"里的位次，用于详情页的 n / total 指示 */
const navPos = computed(() => {
  const idx = sortedPhones.value.findIndex(p => p.id === detailPhone.value?.id)
  return idx >= 0 ? idx + 1 : 0
})
</script>
