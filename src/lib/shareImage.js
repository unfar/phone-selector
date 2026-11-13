/* ------------------------------------------------------------------
 * V2 对比分享图：纯 Canvas 2D 生成 1080×1350 竖版海报
 *
 * 设计约定：
 *  - 只用 Canvas 2D API，不引第三方库、不加载网络字体/图片；
 *  - 中文字体走系统字体栈（PingFang SC / Microsoft YaHei / Noto Sans SC …）；
 *  - 海报固定浅色配色，不跟随页面「导购 / 专业」深浅主题，保证分享图稳定；
 *  - 所有文本都做单行截断或 2 行换行，避免超出卡片宽度。
 *
 * 导出：
 *  - renderCompareImage(items)  items = [{ p, s }]，返回 HTMLCanvasElement
 *  - downloadCompareImage(items, filename?)  toBlob 后触发 a[download]，返回 Blob
 * ---------------------------------------------------------------- */

import {
  DIMS, DIM_LABELS, displayName, fmtPrice, fmtBattery, fmtWeight,
  cameraBrief, shortChip, compareConclusion,
} from './derive.js'

export const SHARE_IMAGE_WIDTH = 1080
export const SHARE_IMAGE_HEIGHT = 1350
export const SHARE_IMAGE_FILENAME = 'phone-compare.png'

const W = SHARE_IMAGE_WIDTH
const H = SHARE_IMAGE_HEIGHT
const PAD = 64
const CONTENT_W = W - PAD * 2

const FONT_STACK = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Heiti SC", "Helvetica Neue", Arial, sans-serif'

/* 固定浅色配色（与 V2 导购模式同源，但硬编码，不读取 CSS 变量） */
const C = {
  bg: '#f7f3ea',
  card: '#fffdf8',
  cardLine: '#e8dfce',
  ink: '#1b1917',
  ink2: '#403a31',
  muted: '#6f6759',
  faint: '#9b9384',
  rowLine: '#f0e9da',
  accent: '#0f766e',
  accentInk: '#0b5f59',
  accentSoft: '#e3f1ec',
  conclusionBg: '#eaf3ee',
  conclusionLine: '#cfe3da',
  logoInk: '#fffdf8',
}

/* 每列强调色（按机型顺序取，最多 4 台） */
const COLUMN_COLORS = [
  { main: '#0f766e', soft: '#dcefe9' },
  { main: '#b45309', soft: '#f7e7d2' },
  { main: '#1d4ed8', soft: '#dfe8fb' },
  { main: '#be123c', soft: '#f8dde5' },
]

/* 布局常量 */
const CARD_TOP = 184
const CARD_H = 872
const CARD_BOTTOM = CARD_TOP + CARD_H // 1056
const CARD_RADIUS = 20

/* 2 / 3 / 4 台机型时卡片内字号与间距（列越少，字号越大） */
const CARD_METRICS = {
  2: { pad: 28, brandFont: 14, nameFont: 30, nameLineH: 39, priceFont: 34, chipFont: 16, labelFont: 13, valueFont: 17, barFont: 15, barLabelFont: 14, barH: 10 },
  3: { pad: 24, brandFont: 13, nameFont: 24, nameLineH: 32, priceFont: 28, chipFont: 14, labelFont: 12, valueFont: 15, barFont: 13.5, barLabelFont: 13, barH: 8 },
  4: { pad: 19, brandFont: 11.5, nameFont: 20, nameLineH: 27, priceFont: 24, chipFont: 12.5, labelFont: 11, valueFont: 13.5, barFont: 12.5, barLabelFont: 12, barH: 7 },
}

/* ------------------------------ 基础工具 ------------------------------ */

function setFont(ctx, weight, size) {
  ctx.font = `${weight} ${Math.round(size * 10) / 10}px ${FONT_STACK}`
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** 单行截断：超宽时按字符二分 + 省略号 */
function fitText(ctx, text, maxWidth) {
  const s = String(text == null ? '' : text)
  if (!s) return ''
  if (ctx.measureText(s).width <= maxWidth) return s
  const ell = '…'
  let lo = 0
  let hi = s.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (ctx.measureText(s.slice(0, mid) + ell).width <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return s.slice(0, Math.max(0, lo)).trimEnd() + ell
}

const TOKEN_RE = /[A-Za-z0-9]+(?:[.+@'’\-][A-Za-z0-9]+)*|\s+|[\s\S]/g

/** 多行换行：英文按词、中文按字，最多 maxLines 行，最后一行超出则省略号 */
function wrapLines(ctx, text, maxWidth, maxLines = 2) {
  const raw = String(text == null ? '' : text).replace(/\s+/g, ' ').trim()
  if (!raw) return ['']
  const fits = s => ctx.measureText(s).width <= maxWidth
  const tokens = raw.match(TOKEN_RE) || []
  const lines = []
  let line = ''
  let remaining = false

  const hardSplit = tk => {
    // 单个 token 就超宽：按字符硬切
    let rest = tk
    while (rest && lines.length < maxLines) {
      let cut = rest.length
      while (cut > 1 && !fits(rest.slice(0, cut))) cut--
      const head = rest.slice(0, cut)
      rest = rest.slice(cut)
      if (!rest) {
        line = head
        return
      }
      lines.push(head.trim())
      if (lines.length >= maxLines) {
        remaining = true
        return
      }
    }
    if (lines.length >= maxLines) remaining = true
  }

  for (const tk of tokens) {
    if (!tk) continue
    if (!line && !tk.trim()) continue // 行首不留空格
    if (fits(line + tk)) {
      line += tk
      continue
    }
    if (line) {
      lines.push(line.trim())
      line = ''
      if (lines.length >= maxLines) {
        remaining = true
        break
      }
      if (!tk.trim()) continue
      if (fits(tk)) line = tk
      else hardSplit(tk)
      if (lines.length >= maxLines) break
    } else {
      hardSplit(tk)
      if (lines.length >= maxLines) break
    }
  }
  if (line) lines.push(line.trim())
  if (!lines.length) lines.push('')
  if (remaining && lines.length >= maxLines) {
    let last = lines[lines.length - 1] || ''
    while (last.length && !fits(last + '…')) last = last.slice(0, -1)
    lines[lines.length - 1] = last.replace(/[\s,，.。;；:：\-]+$/, '') + '…'
  }
  return lines
}

/** 主摄规格：优先取 detailed_camera 里「主摄: …」段，否则回退像素数 */
function mainCameraBrief(p) {
  const text = String(p.detailed_camera || p.camera_desc || '')
  const seg = text.split('|').map(s => s.trim()).find(s => /^主摄/.test(s))
  if (seg) {
    const value = seg.replace(/^主摄\s*[:：]\s*/, '').trim()
    if (value) return value
  }
  if (p.camera_main_mp) return `${p.camera_main_mp}MP`
  return '—'
}

function chargingText(p) {
  return p.charging_w ? `${p.charging_w}W` : '—'
}

function formatDate(d = new Date()) {
  const pad2 = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
}

/* ------------------------------ 绘制 ------------------------------ */

function drawBackground(ctx) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  const top = ctx.createRadialGradient(W - 70, -60, 0, W - 70, -60, 560)
  top.addColorStop(0, 'rgba(15, 118, 110, 0.10)')
  top.addColorStop(1, 'rgba(15, 118, 110, 0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, W, H)

  const bottom = ctx.createRadialGradient(30, H - 60, 0, 30, H - 60, 620)
  bottom.addColorStop(0, 'rgba(180, 83, 9, 0.07)')
  bottom.addColorStop(1, 'rgba(180, 83, 9, 0)')
  ctx.fillStyle = bottom
  ctx.fillRect(0, 0, W, H)
}

function drawHeader(ctx, count) {
  // 品牌 logo 块
  roundRect(ctx, PAD, 56, 62, 62, 17)
  ctx.fillStyle = C.accent
  ctx.fill()

  ctx.save()
  ctx.fillStyle = C.logoInk
  setFont(ctx, 800, 32)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('机', PAD + 31, 56 + 33)
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = C.ink
  setFont(ctx, 800, 38)
  ctx.fillText('机选 · 手机对比', PAD + 84, 98)

  ctx.fillStyle = C.muted
  setFont(ctx, 400, 18)
  ctx.fillText('选手机，把差异画成一张图 · 横向对比', PAD + 84, 131)

  ctx.textAlign = 'right'
  ctx.fillStyle = C.ink2
  setFont(ctx, 700, 20)
  ctx.fillText(`共 ${count} 款机型`, W - PAD, 92)

  ctx.fillStyle = C.faint
  setFont(ctx, 400, 15)
  ctx.fillText(`生成于 ${formatDate()}`, W - PAD, 122)
  ctx.textAlign = 'left'

  ctx.fillStyle = C.cardLine
  ctx.fillRect(PAD, 158, CONTENT_W, 1)
}

function drawCard(ctx, it, x, cardW, colors, m) {
  const { p, s } = it
  const score = s || {}
  const innerX = x + m.pad
  const innerW = cardW - m.pad * 2
  const y = CARD_TOP

  // 卡片底色 + 阴影
  ctx.save()
  ctx.shadowColor = 'rgba(74, 58, 26, 0.12)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 8
  roundRect(ctx, x, y, cardW, CARD_H, CARD_RADIUS)
  ctx.fillStyle = C.card
  ctx.fill()
  ctx.restore()

  // 描边
  roundRect(ctx, x, y, cardW, CARD_H, CARD_RADIUS)
  ctx.strokeStyle = C.cardLine
  ctx.lineWidth = 1
  ctx.stroke()

  // 顶部强调色条（裁剪出圆角）
  ctx.save()
  roundRect(ctx, x, y, cardW, CARD_H, CARD_RADIUS)
  ctx.clip()
  ctx.fillStyle = colors.main
  ctx.fillRect(x, y, cardW, 8)
  ctx.restore()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // 品牌
  ctx.fillStyle = colors.main
  setFont(ctx, 700, m.brandFont)
  const brand = fitText(ctx, String(p.brand || '未知品牌').toUpperCase(), innerW)
  ctx.fillText(brand, innerX, y + 8 + m.pad + m.brandFont)

  // 机型名（固定预留 2 行，保证各列行位对齐）
  const nameTop = y + 8 + m.pad + m.brandFont + 10
  const nameLines = wrapLines(ctx, displayName(p), innerW, 2)
  ctx.fillStyle = C.ink
  setFont(ctx, 800, m.nameFont)
  const nameOffset = nameLines.length === 1 ? m.nameLineH / 2 : 0
  nameLines.forEach((line, i) => {
    ctx.fillText(line, innerX, nameTop + nameOffset + i * m.nameLineH + m.nameFont * 0.82)
  })

  // 价格 + 综合分胶囊
  const priceBaseline = nameTop + m.nameLineH * 2 + m.priceFont * 0.94 + 6
  ctx.fillStyle = C.ink
  setFont(ctx, 800, m.priceFont)
  const priceText = fmtPrice(p)
  ctx.fillText(priceText, innerX, priceBaseline)

  const overall = Math.round(Number(score.overall) || 0)
  if (overall > 0) {
    setFont(ctx, 700, m.chipFont)
    const chipText = `综合 ${overall}`
    const chipW = ctx.measureText(chipText).width + 18
    const chipH = m.chipFont + 14
    const priceRight = innerX + ctx.measureText(priceText).width
    if (innerX + innerW - chipW > priceRight + 8) {
      roundRect(ctx, innerX + innerW - chipW, priceBaseline - chipH + 5, chipW, chipH, chipH / 2)
      ctx.fillStyle = colors.soft
      ctx.fill()
      ctx.fillStyle = C.accentInk
      ctx.textAlign = 'right'
      ctx.fillText(chipText, innerX + innerW - 9, priceBaseline - 1)
      ctx.textAlign = 'left'
    }
  }

  // 分隔线
  const dividerY = priceBaseline + 17
  ctx.fillStyle = C.cardLine
  ctx.fillRect(innerX, dividerY, innerW, 1)

  // 下方统一分配行高：6 行参数 + 5 行评分，铺满卡片剩余高度
  const rowsTop = dividerY + 11
  const rowsBottom = y + CARD_H - m.pad
  const sectionLabelH = m.labelFont + 12
  const available = (rowsBottom - rowsTop) - sectionLabelH * 2
  const paramArea = 6 + 5 * 1.12
  const paramRowH = available / paramArea
  const barRowH = paramRowH * 1.12

  let cursor = rowsTop

  // 关键参数
  ctx.fillStyle = C.faint
  setFont(ctx, 700, m.labelFont)
  ctx.fillText('关键参数', innerX, cursor + m.labelFont + 2)
  cursor += sectionLabelH

  const params = [
    { label: '性能', value: shortChip(p) },
    { label: '影像', value: cameraBrief(p) },
    { label: '电池', value: fmtBattery(p) },
    { label: '充电', value: chargingText(p) },
    { label: '重量', value: fmtWeight(p) },
    { label: '主摄', value: mainCameraBrief(p) },
  ]

  params.forEach((row, i) => {
    ctx.fillStyle = C.faint
    setFont(ctx, 400, m.labelFont)
    ctx.fillText(row.label, innerX, cursor + m.labelFont + 2)

    ctx.fillStyle = C.ink2
    setFont(ctx, 700, m.valueFont)
    ctx.fillText(fitText(ctx, row.value, innerW), innerX, cursor + paramRowH - 13)

    if (i < params.length - 1) {
      ctx.fillStyle = C.rowLine
      ctx.fillRect(innerX, cursor + paramRowH - 1, innerW, 1)
    }
    cursor += paramRowH
  })

  // 五维评分
  ctx.fillStyle = C.faint
  setFont(ctx, 700, m.labelFont)
  ctx.fillText('五维评分', innerX, cursor + m.labelFont + 2)
  cursor += sectionLabelH

  DIMS.forEach((dim, i) => {
    const value = Math.max(0, Math.min(100, Math.round(Number(score[dim]) || 0)))

    ctx.fillStyle = C.muted
    setFont(ctx, 400, m.barLabelFont)
    ctx.fillText(DIM_LABELS[dim] || dim, innerX, cursor + m.barLabelFont + 2)

    ctx.fillStyle = colors.main
    setFont(ctx, 700, m.barFont)
    ctx.textAlign = 'right'
    ctx.fillText(String(value), innerX + innerW, cursor + m.barFont + 2)
    ctx.textAlign = 'left'

    const barTop = cursor + m.barLabelFont + 10
    const trackH = m.barH
    roundRect(ctx, innerX, barTop, innerW, trackH, trackH / 2)
    ctx.fillStyle = colors.soft
    ctx.fill()

    const fillW = Math.max(trackH, (innerW * value) / 100)
    if (fillW > 1) {
      roundRect(ctx, innerX, barTop, fillW, trackH, trackH / 2)
      ctx.fillStyle = colors.main
      ctx.fill()
    }

    if (i < DIMS.length - 1) {
      ctx.fillStyle = C.rowLine
      ctx.fillRect(innerX, cursor + barRowH - 1, innerW, 1)
    }
    cursor += barRowH
  })
}

function drawConclusion(ctx, items) {
  const text = compareConclusion(items)
  if (!text) return

  const boxX = PAD
  const boxW = CONTENT_W
  const boxY = 1082
  const boxH = 88

  roundRect(ctx, boxX, boxY, boxW, boxH, 18)
  ctx.fillStyle = C.conclusionBg
  ctx.fill()
  ctx.strokeStyle = C.conclusionLine
  ctx.lineWidth = 1
  ctx.stroke()

  roundRect(ctx, boxX + 18, boxY + 24, 6, boxH - 48, 3)
  ctx.fillStyle = C.accent
  ctx.fill()

  setFont(ctx, 700, 19)
  ctx.fillStyle = C.accentInk
  const lines = wrapLines(ctx, text, boxW - 74, 2)
  const lineH = 27
  const firstBaseline = boxY + boxH / 2 - ((lines.length - 1) * lineH) / 2 + 7
  lines.forEach((line, i) => {
    ctx.fillText(line, boxX + 40, firstBaseline + i * lineH)
  })
}

function drawFooter(ctx) {
  ctx.fillStyle = C.cardLine
  ctx.fillRect(PAD, 1238, CONTENT_W, 1)

  ctx.textAlign = 'left'
  ctx.fillStyle = C.ink
  setFont(ctx, 700, 15)
  ctx.fillText('机选 · 手机对比', PAD, 1272)

  ctx.textAlign = 'right'
  ctx.fillStyle = C.faint
  setFont(ctx, 400, 14)
  ctx.fillText(`生成于 ${formatDate()}`, W - PAD, 1272)

  ctx.textAlign = 'left'
  ctx.fillStyle = C.muted
  setFont(ctx, 400, 15)
  ctx.fillText('数据来自品牌官网人工整理 · 评分为规则推导，仅供参考', PAD, 1306)
}

function drawPoster(ctx, items) {
  const n = items.length
  const gap = n === 2 ? 32 : n === 3 ? 26 : 20
  const cardW = (CONTENT_W - gap * (n - 1)) / n
  const metrics = CARD_METRICS[n] || CARD_METRICS[4]

  drawBackground(ctx)
  drawHeader(ctx, n)

  items.forEach((it, i) => {
    const x = PAD + i * (cardW + gap)
    drawCard(ctx, it, x, cardW, COLUMN_COLORS[i % COLUMN_COLORS.length], metrics)
  })

  drawConclusion(ctx, items)
  drawFooter(ctx)
}

/* ------------------------------ 对外 API ------------------------------ */

/**
 * 生成对比海报 canvas。
 * @param {Array<{p: object, s: object}>} items 2–4 台机型（含评分）
 * @returns {HTMLCanvasElement}
 */
export function renderCompareImage(items) {
  const list = Array.isArray(items) ? items.filter(it => it && it.p) : []
  if (list.length < 2) throw new Error('至少选择 2 台机型才能生成对比图')
  if (typeof document === 'undefined') throw new Error('当前环境不支持生成图片')

  const picked = list.slice(0, 4)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('浏览器不支持 Canvas 2D')

  drawPoster(ctx, picked)
  return canvas
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      reject(new Error('当前浏览器不支持导出图片'))
      return
    }
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('图片导出失败，请重试'))
    }, 'image/png')
  })
}

/**
 * 生成对比海报并触发浏览器下载。
 * @param {Array<{p: object, s: object}>} items
 * @param {string} [filename]
 * @returns {Promise<Blob>} 生成的 PNG Blob（便于复用/分享）
 */
export async function downloadCompareImage(items, filename = SHARE_IMAGE_FILENAME) {
  const canvas = renderCompareImage(items)
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  return blob
}
