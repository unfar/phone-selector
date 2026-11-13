/* ------------------------------------------------------------------
 * V2 派生数据层：把原始参数（官网手工录入）转成「决策语言」
 *  - 五个维度评分：影像 / 性能 / 续航 / 屏幕 / 手感
 *  - 一句话结论、适合谁、优缺点
 *  - 向导权重打分、同价位竞品、对比结论
 * 所有评分都是规则推导（0–100），不修改源数据，仅用于排序和文案。
 * ---------------------------------------------------------------- */

export const DIMS = ['camera', 'performance', 'battery', 'display', 'portability']
export const DIM_LABELS = {
  camera: '影像',
  performance: '性能',
  battery: '续航',
  display: '屏幕',
  portability: '手感',
}
export const DIM_ICONS = {
  camera: '📷',
  performance: '⚡',
  battery: '🔋',
  display: '🖥',
  portability: '🪶',
}

export function displayName(p) {
  const brand = p.brand || ''
  const model = p.model || ''
  const m = model.toLowerCase()
  const b = brand.toLowerCase()
  if (m.startsWith(b)) return model
  const CN = {
    Huawei: '华为', HONOR: '荣耀', Xiaomi: '小米', REDMI: '红米', OPPO: 'OPPO',
    vivo: 'vivo', iQOO: 'iQOO', OnePlus: '一加', realme: '真我', Samsung: '三星',
    NUBIA: '努比亚', Motorola: 'moto', Apple: '苹果', Lenovo: '联想',
  }
  const cn = CN[brand] || brand
  if (m.startsWith(cn.toLowerCase())) return model
  return brand + ' ' + model
}

export function fmtPrice(p) {
  return p.price ? '¥' + Number(p.price).toLocaleString('zh-CN') : '待公布'
}
export function fmtBattery(p) {
  return p.battery_mah ? p.battery_mah + 'mAh' : '—'
}
export function fmtWeight(p) {
  return p.weight_g ? p.weight_g + 'g' : '—'
}
export function fmtScreen(p) {
  return [p.screen_size ? p.screen_size + '″' : null, p.refresh_hz ? p.refresh_hz + 'Hz' : null]
    .filter(Boolean).join(' ')
}
export function shortChip(p) {
  return String(p.processor || '—').replace(/移动平台/g, '').replace(/\s*\(for Galaxy\)/i, '').trim()
}

/* ---------------- 基础评分 ---------------- */

const CHIP_RULES = [
  [/骁龙8\s*Elite\s*Extreme|骁龙8\s*Elite\s*6|第五代骁龙8|天玑9600|天玑9500|麒麟9030|A19/i, 96],
  [/骁龙8\s*Elite\s*5|天玑9400|麒麟9020|A18|Exynos\s*2500/i, 92],
  [/骁龙8\s*Elite\s*1|骁龙8\s*Gen\s*3|骁龙8s\s*Gen\s*4|天玑9300|麒麟9010|Exynos\s*2400/i, 86],
  [/骁龙8s\s*Gen\s*3|骁龙8\s*Gen\s*2|天玑9200|麒麟9000|Exynos\s*2200/i, 80],
  [/骁龙7\+\s*Gen\s*3|天玑8400|天玑8350|天玑8300|麒麟8020|麒麟8000/i, 72],
  [/骁龙7\s*Gen\s*4|骁龙7s\s*Gen\s*3|骁龙7\s*Gen\s*3|天玑7300|天玑7200/i, 63],
  [/骁龙6\s*Gen|天玑6360|天玑6300|天玑6080|麒麟7100/i, 50],
]

function chipScore(p) {
  const proc = String(p.processor || '')
  let base = 55
  for (const [re, score] of CHIP_RULES) {
    if (re.test(proc)) { base = score; break }
  }
  if (/电竞芯片|Q\d/.test(proc)) base = Math.min(100, base + 3)
  return base
}

export function mainMp(p) {
  if (p.camera_main_mp) return Number(p.camera_main_mp)
  const text = `${p.camera_desc || ''} ${p.detailed_camera || ''}`
  const yi = text.match(/(\d+(?:\.\d+)?)\s*亿/)
  if (yi) return Math.round(Number(yi[1]) * 100)
  const mp = text.match(/(\d+)\s*MP/i)
  return mp ? Number(mp[1]) : null
}

function sensorDenom(p) {
  const text = `${p.detailed_camera || ''} ${p.camera_desc || ''}`
  const m = text.match(/1\/(\d+(?:\.\d+)?)\s*[”"]/)
  return m ? Number(m[1]) : null
}

function cameraScore(p) {
  let s = 28
  const mp = mainMp(p)
  if (mp >= 200) s += 24
  else if (mp >= 50) s += 18
  else if (mp >= 48) s += 15
  else if (mp >= 32) s += 10
  else if (mp >= 12) s += 6
  else s += 2

  const d = sensorDenom(p)
  if (d !== null) {
    if (d <= 1.12) s += 20
    else if (d <= 1.28) s += 18
    else if (d <= 1.3) s += 16
    else if (d <= 1.4) s += 13
    else if (d <= 1.56) s += 9
    else if (d <= 1.8) s += 5
    else s += 2
  }

  const text = `${p.camera_desc || ''} ${p.detailed_camera || ''}`
  const hasTele = p.has_tele || (p.tags || []).includes('潜望长焦')
  const periscope = /潜望/.test(text) || (p.tags || []).includes('潜望长焦')
  if (hasTele) s += 8
  if (periscope) s += 4
  if (/超广/.test(text)) s += 5
  if (/f\/1\.[0-6]/.test(text)) s += 4
  return clamp(s)
}

function batteryScore(p) {
  const mah = Number(p.battery_mah || 0)
  let s = mah ? 15 + mah / 130 : 40
  const w = Number(p.charging_w || 0)
  if (w >= 120) s += 9
  else if (w >= 100) s += 8
  else if (w >= 80) s += 6
  else if (w >= 65) s += 4
  else if (w >= 45) s += 2
  if (Number(p.wireless_charging_w || 0) > 0) s += 4
  return clamp(s)
}

function displayScore(p) {
  let s = 45
  const hz = Number(p.refresh_hz || 0)
  if (hz >= 165) s += 18
  else if (hz >= 144) s += 15
  else if (hz >= 120) s += 10
  else if (hz >= 90) s += 4
  const res = String(p.resolution || '')
  const nums = res.match(/(\d{3,4})\s*[×xX]\s*(\d{3,4})/)
  const longSide = nums ? Math.max(Number(nums[1]), Number(nums[2])) : 0
  if (longSide >= 1400) s += 20
  else if (longSide >= 1260) s += 14
  else if (longSide >= 1080) s += 8
  const panel = `${p.screen_type || ''} ${p.screen_detail || ''}`
  if (/LTPO/i.test(panel)) s += 9
  else if (/AMOLED|OLED/i.test(panel)) s += 6
  if (/2K/i.test(panel) || longSide >= 1400) s += 3
  return clamp(s)
}

function portabilityScore(p) {
  const w = Number(p.weight_g || 0)
  if (!w) return 55
  if (w <= 165) return 98
  if (w <= 175) return 92
  if (w <= 185) return 84
  if (w <= 195) return 76
  if (w <= 205) return 68
  if (w <= 215) return 60
  if (w <= 225) return 50
  if (w <= 240) return 38
  return 25
}

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

/* ---------------- 汇总 ---------------- */

export function computeProfiles(phones) {
  const profiles = new Map()
  const raws = new Map()
  for (const p of phones) {
    const s = {
      performance: chipScore(p),
      camera: cameraScore(p),
      battery: batteryScore(p),
      display: displayScore(p),
      portability: portabilityScore(p),
    }
    profiles.set(p.id, s)
    if (p.price) {
      raws.set(p.id, (s.performance * 0.35 + s.camera * 0.25 + s.battery * 0.2 + s.display * 0.2)
        / Math.pow(p.price / 1000, 0.65))
    }
  }
  const vals = [...raws.values()]
  const min = vals.length ? Math.min(...vals) : 0
  const max = vals.length ? Math.max(...vals) : 1
  for (const p of phones) {
    const s = profiles.get(p.id)
    s.value = raws.has(p.id) ? clamp(8 + 92 * (raws.get(p.id) - min) / (max - min || 1)) : 45
    s.overall = clamp(
      s.performance * 0.25 + s.camera * 0.27 + s.battery * 0.18 + s.display * 0.15 + s.portability * 0.15
    )
  }
  return profiles
}

export function scoreOf(profiles, p) {
  return profiles.get(p.id) || { camera: 50, performance: 50, battery: 50, display: 50, portability: 50, overall: 50, value: 50 }
}

/* ---------------- 文案 ---------------- */

export function cameraBrief(p) {
  const mp = mainMp(p)
  const base = mp ? (mp >= 200 ? '2亿主摄' : mp + 'MP主摄') : '影像待补'
  const hasTele = p.has_tele || (p.tags || []).includes('潜望长焦')
  return hasTele ? base + ' · 长焦' : base
}

function strongText(p, dim) {
  const s = {
    camera: () => `影像强（${cameraBrief(p)}）`,
    performance: () => `性能强（${shortChip(p)}）`,
    battery: () => `续航强（${fmtBattery(p)}${p.charging_w ? ' + ' + p.charging_w + 'W' : ''}）`,
    display: () => `屏幕好（${fmtScreen(p)}）`,
    portability: () => `手感轻（${fmtWeight(p)}）`,
  }
  return s[dim] ? s[dim]() : ''
}

function weakText(p, dim) {
  const s = {
    camera: () => '影像相对普通',
    performance: () => `性能一般（${shortChip(p)}）`,
    battery: () => `续航一般（${fmtBattery(p)}）`,
    display: () => `屏幕一般（${fmtScreen(p)}）`,
    portability: () => `机身偏重（${fmtWeight(p)}）`,
  }
  return s[dim] ? s[dim]() : ''
}

export function verdict(p, s) {
  if (!s) return ''
  const desc = [...DIMS].sort((a, b) => s[b] - s[a])
  const top = desc[0]
  const weak = [...DIMS].sort((a, b) => s[a] - s[b])[0]
  const parts = []
  parts.push(s[top] >= 72 ? strongText(p, top) : '配置均衡，没有明显短板')
  if (s[weak] < 62 && weak !== top) parts.push(weakText(p, weak))
  if (!p.price) parts.push('价格待公布')
  return parts.join('，') + '。'
}

export function prosCons(p, s) {
  const pros = []
  DIMS.forEach(d => { if (s[d] >= 76) pros.push(strongText(p, d)) })
  if ((p.tags || []).includes('潜望长焦')) pros.push('潜望长焦，远景更实用')
  if (Number(p.wireless_charging_w || 0) > 0) pros.push(`支持 ${p.wireless_charging_w}W 无线充`)
  if (/IP6[89]/.test(p.ip_rating || '')) pros.push(p.ip_rating + ' 防尘防水')

  const cons = []
  if (s.portability < 62) cons.push(weakText(p, 'portability'))
  if (s.battery < 62) cons.push(weakText(p, 'battery'))
  if (s.camera < 62) cons.push(weakText(p, 'camera'))
  if (!Number(p.wireless_charging_w || 0)) cons.push('无无线充电')
  if (!p.price) cons.push('价格尚未公布')

  return { pros: [...new Set(pros)].slice(0, 3), cons: [...new Set(cons)].slice(0, 2) }
}

export function audience(p, s) {
  const desc = [...DIMS].sort((a, b) => s[b] - s[a])
  const weak = [...DIMS].sort((a, b) => s[a] - s[b])[0]
  return {
    fit: `看重${DIM_LABELS[desc[0]]}和${DIM_LABELS[desc[1]]}的人`,
    notFit: `对${DIM_LABELS[weak]}要求很高的人`,
  }
}

export function cameraModules(p) {
  const text = p.detailed_camera || p.camera_desc || p.camera_rear || ''
  if (!text) return []
  const out = []
  for (const seg of String(text).split('|')) {
    const t = seg.trim()
    if (!t) continue
    const m = t.match(/^([^:：]{1,6})[:：]\s*(.+)$/)
    if (m) out.push({ label: m[1].trim(), value: m[2].trim() })
    else out.push({ label: '镜头', value: t })
  }
  return out.slice(0, 6)
}

/* ---------------- 向导 ---------------- */

export const BUDGETS = [
  { id: 'u2000', label: '2000 元以内', min: 0, max: 2000 },
  { id: '2-3k', label: '2000 – 3000', min: 2000, max: 3000 },
  { id: '3-4.5k', label: '3000 – 4500', min: 3000, max: 4500 },
  { id: '4.5-6k', label: '4500 – 6000', min: 4500, max: 6000 },
  { id: '6k+', label: '6000 元以上', min: 6000, max: Infinity },
]

export const PRIORITIES = [
  { id: 'camera', label: '拍照影像', desc: '主摄、长焦、夜景' },
  { id: 'performance', label: '游戏性能', desc: '芯片与散热' },
  { id: 'battery', label: '续航充电', desc: '电池与快充' },
  { id: 'display', label: '屏幕素质', desc: '高刷、分辨率、护眼' },
  { id: 'portability', label: '轻薄手感', desc: '重量与尺寸' },
]

export const MUST_HAVES = [
  { id: 'ip', label: 'IP68 防水', test: p => /IP6[89]|IP69/.test(`${p.ip_rating || ''} ${(p.features || []).join(' ')}`) },
  { id: 'wireless', label: '无线充电', test: p => Number(p.wireless_charging_w || 0) > 0 },
  { id: 'light', label: '≤ 200g', test: p => p.weight_g && p.weight_g <= 200 },
  { id: 'tele', label: '潜望长焦', test: p => (p.tags || []).includes('潜望长焦') || /潜望/.test(p.detailed_camera || '') },
  { id: 'fold', label: '折叠屏', test: p => /折叠/.test(p.screen_form || '') },
  { id: 'flat', label: '直屏', test: p => !/折叠|曲面|微曲/.test(p.screen_form || '') },
  { id: 'nfc', label: 'NFC', test: p => p.has_nfc || (p.tags || []).includes('NFC') || (p.features || []).some(f => /NFC/i.test(f)) },
]

export function recommend(phones, profiles, { budget, priorities = [], musts = [], brands = [] } = {}) {
  const b = BUDGETS.find(x => x.id === budget)
  let list = phones.filter(p => p.price && (!b || (p.price >= b.min && p.price <= b.max)))
  if (brands.length) list = list.filter(p => brands.includes(p.brand))
  const mustFns = musts.map(id => MUST_HAVES.find(m => m.id === id)).filter(Boolean)
  let filtered = list.filter(p => mustFns.every(m => m.test(p)))
  const relaxed = filtered.length === 0
  if (relaxed) filtered = list

  const weights = {}
  DIMS.forEach(d => { weights[d] = 0.6 })
  priorities.forEach((id, i) => { if (weights[id] !== undefined) weights[id] = i === 0 ? 2.4 : 1.8 })
  const wsum = Object.values(weights).reduce((a, c) => a + c, 0)

  const scored = filtered.map(p => {
    const s = scoreOf(profiles, p)
    const weighted = Object.entries(weights).reduce((acc, [d, w]) => acc + s[d] * w, 0) / wsum
    const match = clamp(weighted * 0.88 + s.value * 0.12)
    const reasons = []
    priorities.forEach(id => { if (s[id] >= 68) reasons.push(strongText(p, id)) })
    if (!reasons.length) {
      const best = [...DIMS].sort((x, y) => s[y] - s[x])[0]
      if (s[best] >= 60) reasons.push(strongText(p, best))
    }
    const weak = [...DIMS].sort((x, y) => s[x] - s[y])[0]
    const tradeoff = s[weak] < 66 ? weakText(p, weak) : ''
    return { p, s, match, reasons: reasons.slice(0, 2), tradeoff, relaxed }
  })
  scored.sort((a, c) => c.match - a.match)
  return scored.slice(0, 6)
}

/* ---------------- 竞品 / 对比 ---------------- */

export function similarPhones(p, phones, profiles, n = 3) {
  if (!p.price) return []
  const cands = phones.filter(x => x.id !== p.id && x.price && Math.abs(x.price - p.price) <= Math.max(600, p.price * 0.22))
  cands.sort((a, c) => scoreOf(profiles, c).overall - scoreOf(profiles, a).overall)
  return cands.slice(0, n)
}

export const COMPARE_ROWS = [
  { key: 'price', label: '参考价', get: p => p.price, fmt: p => fmtPrice(p), better: 'low' },
  { key: 'performance', label: '性能', get: (p, s) => s.performance, fmt: p => shortChip(p), better: 'high' },
  { key: 'camera', label: '影像', get: (p, s) => s.camera, fmt: p => cameraBrief(p), better: 'high' },
  { key: 'battery', label: '电池', get: p => p.battery_mah, fmt: p => fmtBattery(p), better: 'high', bar: true },
  { key: 'charge', label: '充电', get: p => p.charging_w, fmt: p => (p.charging_w ? p.charging_w + 'W' : '—'), better: 'high', bar: true },
  { key: 'screen', label: '屏幕', get: (p, s) => s.display, fmt: p => fmtScreen(p), better: 'high' },
  { key: 'weight', label: '重量', get: p => p.weight_g, fmt: p => fmtWeight(p), better: 'low', bar: true },
  { key: 'wireless', label: '无线充', get: p => Number(p.wireless_charging_w || 0), fmt: p => (p.wireless_charging_w ? p.wireless_charging_w + 'W' : '—'), better: 'high' },
  { key: 'ip', label: '防水', get: p => (p.ip_rating || ''), fmt: p => p.ip_rating || ((p.features || []).some(f => /IP6[89]|IP69/.test(f)) ? '支持' : '—'), better: null },
  { key: 'storage', label: '存储', get: () => null, fmt: p => p.storage || '—', better: null },
]

export function compareConclusion(items) {
  if (items.length < 2) return ''
  const winners = DIMS.map(d => ({
    d,
    best: [...items].sort((a, c) => a.s[d] - c.s[d])[items.length - 1],
  }))
  const byPhone = new Map(items.map(it => [it.p.id, []]))
  winners.forEach(w => { if (byPhone.has(w.best.p.id)) byPhone.get(w.best.p.id).push(DIM_LABELS[w.d]) })
  const parts = []
  for (const it of items) {
    const ws = byPhone.get(it.p.id) || []
    if (ws.length >= 2) parts.push(`更看重${ws.slice(0, 3).join('、')}选 ${displayName(it.p)}`)
  }
  if (!parts.length) return '几台机型各有取舍，按下面的差异逐项看即可。'
  return parts.slice(0, 2).join('；') + '。'
}

/* 排序 */
export const SORTS = [
  { id: 'recommend', label: '综合推荐' },
  { id: 'value', label: '性价比' },
  { id: 'camera', label: '拍照优先' },
  { id: 'battery', label: '续航优先' },
  { id: 'newest', label: '最新发布' },
  { id: 'price-asc', label: '价格从低到高' },
  { id: 'price-desc', label: '价格从高到低' },
]

export function sortPhones(list, sort, profiles) {
  const arr = [...list]
  const sc = p => scoreOf(profiles, p)
  switch (sort) {
    case 'value': return arr.sort((a, c) => sc(c).value - sc(a).value)
    case 'camera': return arr.sort((a, c) => sc(c).camera - sc(a).camera)
    case 'battery': return arr.sort((a, c) => sc(c).battery - sc(a).battery)
    case 'newest': return arr.sort((a, c) => String(c.release_date || '').localeCompare(String(a.release_date || '')))
    case 'price-asc': return arr.sort((a, c) => (a.price || 1e9) - (c.price || 1e9))
    case 'price-desc': return arr.sort((a, c) => (c.price || 0) - (a.price || 0))
    default: return arr.sort((a, c) => sc(c).overall - sc(a).overall)
  }
}
