<template>
  <div class="compare-page">
    <div class="panel compare-shell">
      <div class="compare-head">
        <div>
          <h2>规格对比</h2>
          <p class="compare-sub">
            已选 {{ comparePhones.length }} / 4 款
            <template v-if="comparePhones.length >= 2">
              · <b class="diff-count">{{ diffCount }}</b> 项有差异
            </template>
          </p>
        </div>
        <div class="compare-head-actions">
          <button class="btn" :class="{ active: compareDiffOnly }" @click="compareDiffOnly = !compareDiffOnly" v-if="comparePhones.length >= 2">
            {{ compareDiffOnly ? '显示全部' : '仅看差异' }}
          </button>
          <button class="btn" @click="copyShareLink" v-if="comparePhones.length >= 2">🔗 分享对比</button>
          <button class="btn" @click="clearCompare">清空</button>
          <button class="btn ghost" @click="openList">返回</button>
        </div>
      </div>

      <div v-if="comparePhones.length < 2" class="empty">
        <div class="big">📊</div>
        至少选择 2 款机型才能对比
        <div style="margin-top:12px">
          <button class="btn primary" @click="openList">去列表添加</button>
        </div>
      </div>

      <template v-else>
        <!-- 已选机型条 -->
        <div class="compare-phones-bar">
          <div v-for="p in comparePhones" :key="p.id" class="compare-phone-chip">
            <div class="chip-brand" :style="{ background: brandColor(p.brand) }">{{ p.brand }}</div>
            <div class="chip-name">{{ cardBrief(p).name }}</div>
            <div class="chip-price">{{ priceText(p) }}</div>
            <div class="chip-actions">
              <button class="mini-btn" @click="openDetail(p.id)">详情</button>
              <button class="mini-btn" @click="toggleCompare(p.id)">移除</button>
            </div>
          </div>
        </div>

        <!-- 桌面端: 横向表格 -->
        <div class="compare-table-wrap desktop-only">
          <table class="compare">
            <thead>
              <tr>
                <th style="width:120px">参数</th>
                <th v-for="p in comparePhones" :key="p.id">
                  <div class="chip-brand" :style="{ background: brandColor(p.brand) }" style="display:inline-block;padding:3px 10px;border-radius:999px;color:#fff;font-size:.7rem">{{ p.brand }}</div>
                  <div style="margin-top:4px">{{ cardBrief(p).name }}</div>
                  <div style="color:var(--accent);font-size:.86rem">{{ priceText(p) }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in visibleCompareRows" :key="row.l" :class="{ 'row-diff': !row.same }">
                <td>{{ row.l }}</td>
                <td v-for="(v, i) in row.values" :key="i" :class="row.same ? 'same' : 'diff'">{{ v || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!visibleCompareRows.length" style="text-align:center;padding:32px;color:var(--muted)">当前没有差异项</div>
        </div>

        <!-- 移动端: 竖排卡片 -->
        <div class="compare-cards mobile-only">
          <div
            v-for="row in visibleCompareRows"
            :key="row.l"
            class="compare-card"
            :class="{ same: row.same, diff: !row.same }"
          >
            <div class="compare-card-label">
              <span>{{ row.l }}</span>
              <span class="tag" v-if="!row.same">有差异</span>
              <span class="tag same-tag" v-else>相同</span>
            </div>
            <div class="compare-card-values" :style="{ '--cols': comparePhones.length }">
              <div
                v-for="(val, idx) in row.values"
                :key="idx"
                class="compare-card-cell"
                :class="row.same ? 'same' : 'diff'"
              >
                <div class="cell-phone">{{ cardBrief(comparePhones[idx]).name }}</div>
                <div class="cell-val">{{ val }}</div>
              </div>
            </div>
          </div>
          <div v-if="!visibleCompareRows.length" class="empty" style="padding:28px 12px">
            当前没有差异项
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  comparePhones, cardBrief, priceText, brandColor,
  openList, openDetail, toggleCompare, clearCompare,
} from '../composables/useApp.js'
import { compareDiffOnly, visibleCompareRows, diffCount } from '../composables/useCompare.js'
import { copyShareLink } from '../composables/useShare.js'
</script>
