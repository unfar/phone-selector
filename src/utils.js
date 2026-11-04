// ===== 配置数据 =====
// cpuTags 由 useApp.js 的 setPhones() 从数据动态生成（见 normalizeProcessor）

/** 处理器名称归一化 —— 只用于 **CPU 筛选标签的生成与匹配**。
 *  卡片/详情页/对比表仍渲染原始 processor,细则不丢(标签只显示一个系列名,细则看页面)。
 *  规则(逐条实测过全库 83 种写法):
 *  1) 去括号变体       "骁龙8 Elite 1 (for Galaxy)" → "骁龙8 Elite 1"
 *  2) Elite Gen N     "骁龙8 Elite Gen 5"          → "骁龙8 Elite 5"
 *     ⚠️ 但 Extreme 变体必须保留:"骁龙8 Elite Extreme Gen 6" 原样(第六代超级至尊版 SM8975),
 *        与 "骁龙8 Elite Gen 6"(第六代至尊版 SM8950)是两颗不同的芯片,用户明确要求区分
 *  3) 中文代次 → 阿拉伯 "第五代骁龙8至尊版VSeries"      → "骁龙8 Elite 5"、"第三代骁龙7" → "骁龙7"
 *  4) 去协处理器尾巴    "天玑 9500M+Q2电竞芯片"        → "天玑9500"
 *  5) 系列变体折叠      "天玑9500s/9500 Super/9500 Monster" → "天玑9500"
 *                     "麒麟9030S/9030Pro/9030 Pro"  → "麒麟9030"
 *  6) Apple A 系列去后缀 "A19 Pro" → "A19"、"A20 Pro" → "A20"(用户指定)
 *  7) 天玑 4 位数折叠到首位 "天玑9400+"、"天玑9400e" → "天玑9400"(用户指定:9400 系合并)
 *  ⚠️ 骁龙不折叠变体("骁龙8s Gen 3" ≠ "骁龙8"),只折叠 天玑/麒麟/A。
 *  ⚠️ 天 4 位数首位折叠仅对 9 系(9400+/9400e);7 系 天玑7300/7300e 保持区分。
 */
const DITAI_VARIANT = /^(天玑)\s*(\d{4})\s*(?:M|s|S|\+|Super|SUPER|Monster|Elite|Ultra|MAX|Max|竞速版|满血版)$/i
const KIRIN_VARIANT = /^(麒麟)\s*(\d{4})\s*(?:S|s|Pro\+?|Pro|\+)$/i
const APPLE_VARIANT = /^(A\d{2})\s*(?:Pro|Max|Plus|Bionic)$/i

export function normalizeProcessor(proc) {
  const CN = {一:'1',二:'2',三:'3',四:'4',五:'5',六:'6',七:'7',八:'8',九:'9',十:'10',两:'2'}
  let s = String(proc || '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/Elite\s*Gen\s*(\d+)/i, 'Elite $1')
    .replace(/第([一二三四五六七八九十两])代\s*骁龙\s*8\s*至尊版.*/i, '骁龙8 Elite 5')
    .replace(/骁龙\s*8\s*至尊版.*/i, '骁龙8 Elite 5')
    // "第五代骁龙8" 是非至尊版(骁龙8 Gen 5),不能归一成裸 "骁龙8" —— 否则与 骁龙8 Elite/Gen 系列子串撞车
    .replace(/第([一二三四五六七八九十两])代\s*骁龙\s*8(?!\s*Elite)/i, (m, n) => `骁龙8 Gen ${CN[n] || n}`)
    .replace(/第([一二三四五六七八九十两])代\s*骁龙\s*(\d+)/i, (m, cn, d) => `骁龙${d}`)
    .replace(/第[一二三四五六七八九十两]代\s*骁龙/i, '骁龙')
    .replace(/\s*\+.*$/, '')
    .replace(/\s*(电竞芯片|独显芯片|影像芯片).*$/, '')
    .trim()
  s = s.replace(DITAI_VARIANT, '$1$2').replace(KIRIN_VARIANT, '$1$2').replace(APPLE_VARIANT, '$1')
  // "麒麟9030 Pro/麒麟9030"、"天玑 9500M+Q2..." 这类复合写法的兜底
  const dup = s.match(/^(骁龙|天玑|麒麟)\s*(\d{3,4})\s*[A-Za-z+]*\s*\/.*$/)
  if (dup) s = dup[1] + dup[2]
  // 天玑 9 系 4 位数:去掉尾部小写字母变体(天玑9400e → 天玑9400)
  const dt = s.match(/^(天玑)\s*(9\d{3})[A-Za-z]*$/)
  if (dt) s = dt[1] + dt[2]
  return s.replace(/^(骁龙|天玑|麒麟)\s*(\d)/, '$1$2').trim()
}

export const featureTags = ["潜望长焦","≤200g","防尘抗水","NFC","红外","USB3.0","无线充电","DP","散热风扇","星闪","卫星通信","可变光圈"]

// 充电协议筛选（来自充电头网实测 charge_protocols 字段）
export const protocolTags = ["5A PPS","UFCS","PPS","PD","QC","SCP","FCP","VFCP","Qi"]

/**
 * 充电协议归一化：数据里既有标准枚举（PD / PPS / UFCS …），也有自由文本
 * （PD3.0、PD 3.0、Qi2、80W UFCS、55W PPS、13.5W PD、90W有线快充…）。
 * 之前筛选用 protos.includes(t) 精确相等，导致选「PD」漏掉 PD3.0、选「Qi」漏 Qi2。
 * 这里把每条协议转成协议标签集合，筛选时按集合包含判断；不改数据。
 */
export function normalizeProtocols(raw) {
  const list = Array.isArray(raw) ? raw : (raw ? [raw] : [])
  const out = new Set()
  for (const item of list) {
    // 统一大写并去空格/连字符，便于关键字归类（Qi 需要在最后按小写处理）
    const s = String(item || '').toUpperCase().replace(/[\s\-_]/g, '')
    if (!s) continue
    if (s === '5APPS') { out.add('5A PPS'); out.add('PPS'); continue }
    // 去掉功率前缀与有线/无线前缀：80WUFCS → UFCS、13.5WPD → PD、90W有线快充 → 快充
    const rest = s.replace(/^\d+(?:\.\d+)?W/, '').replace(/^(有线|无线)/, '')
    if (!rest) continue
    // ⚠️ VFCP 含 FCP 子串，必须先判 VFCP；5A PPS 已在上面单独处理
    if (/VFCP/.test(rest)) out.add('VFCP')
    else if (/UFCS/.test(rest)) out.add('UFCS')
    else if (/PPS/.test(rest)) out.add('PPS')
    else if (/QC/.test(rest)) out.add('QC')
    else if (/FCP/.test(rest)) out.add('FCP')
    else if (/SCP|SUPERCHARGE/.test(rest)) out.add('SCP')
    else if (/QI/.test(rest)) out.add('Qi')
    else if (/USBPD|PD/.test(rest)) out.add('PD')
  }
  return out
}

export const screenSizeRanges = [
  { name: "6.1-6.4英寸", min: 6.0, max: 6.449 },
  { name: "6.5-6.7英寸", min: 6.45, max: 6.749 },
  { name: "6.8-7.0英寸", min: 6.75, max: 7.049 },
  { name: "7.0英寸以上", min: 7.05, max: 99 }
]

/**
 * 屏幕形态归一化。
 *
 * 数据里 screen_form 实际出现过：直屏 / 折叠屏 / 微曲屏 / 曲面屏 / 折叠内折 / 缺失。
 * 之前筛选只有「直屏、折叠屏」两个选项且用严格相等比较，导致：
 *  - iPhone Duo（折叠内折）、Pocket 70 Pro（缺失）被「折叠屏」漏掉；
 *  - 曲面屏/微曲屏既不算直屏也不算折叠屏，任何筛选项都命中不了（6 台机型“消失”）。
 * 现在统一收敛成 flat / curved / foldable 三个稳定值，缺失按直屏处理，保证全覆盖。
 */
export function normalizeScreenForm(rawOrPhone) {
  const raw = rawOrPhone && typeof rawOrPhone === 'object' ? rawOrPhone.screen_form : rawOrPhone
  const rawStr = String(raw || '').trim()
  const lower = rawStr.toLowerCase()
  // 数据里也可能直接写成稳定 value（未来的数据清洗/接口）
  if (lower === 'flat' || lower === 'curved' || lower === 'foldable') return lower
  const s = rawStr.replace(/^[^\u4e00-\u9fff]+/, '').trim()
  if (!s) return 'flat'
  if (/折叠/.test(s)) return 'foldable'
  if (/曲面|微曲/.test(s)) return 'curved'
  if (/直屏|直板/.test(s)) return 'flat'
  return 'flat'
}

/**
 * URL 参数 / 旧链接兼容：把稳定 value、带 emoji 的旧展示名（如「🔄 折叠屏」）、
 * 中文原文（如「折叠内折」）统一转成稳定 value；识别不了返回 null。
 * ⚠️ 必须先判断稳定 value 再剥 emoji/非中文前缀 —— 'foldable' 全是拉丁字母，
 *    先剥前缀会被削成空串（曾导致 `#screen=foldable` 分享链接丢失筛选）。
 */
export function normalizeScreenFormValue(raw) {
  const rawStr = String(raw || '').trim()
  if (!rawStr) return null
  const lower = rawStr.toLowerCase()
  if (lower === 'flat' || lower === 'curved' || lower === 'foldable') return lower
  const s = rawStr.replace(/^[^\u4e00-\u9fff]+/, '').trim()
  if (!s) return null
  if (/折叠/.test(s)) return 'foldable'
  if (/曲面|微曲/.test(s)) return 'curved'
  if (/直屏|直板/.test(s)) return 'flat'
  return null
}

/** 屏幕形态筛选项：value 存 URL（稳定、无 emoji），label 只用于展示 */
export const screenTypes = [
  { value: 'flat', label: '📱 直屏' },
  { value: 'curved', label: '🌊 曲面屏' },
  { value: 'foldable', label: '🔄 折叠屏' },
]

/** 稳定 value → 展示文案（筛选胶囊、详情等共用） */
export function screenFormLabel(value) {
  return screenTypes.find(t => t.value === value)?.label || ''
}

// ===== 品牌标签颜色 =====
export const brandAccentColors = {
  'Apple':'#1a1a2e','Huawei':'#BC2D32','Xiaomi':'#FF4800',
  'OPPO':'#6DFB73','vivo':'#7C3AED','Samsung':'#2563eb',
  'HONOR':'#222222','REDMI':'#D82F44','iQOO':'#FFD700',
  'OnePlus':'#E73421','realme':'#EAB51D','Motorola':'#D43D2D',
  'Lenovo':'#D43D2D',
  // 数据里努比亚/红魔机型的 brand 是 NUBIA（15 台），之前漏配 → 全部回退成通用蓝
  'NUBIA':'#b91c1c','RedMagic':'#b91c1c',
}

// ===== 颜色对比度（WCAG）=====
function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (full.length !== 6 || !/^[0-9a-f]{6}$/i.test(full)) return null
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function channelLuminance(c) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** 相对亮度（WCAG 2.x 定义） */
export function relativeLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1
  const [r, g, b] = rgb.map(channelLuminance)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 两色对比度（1~21） */
export function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA)
  const lb = relativeLuminance(hexB)
  const hi = Math.max(la, lb)
  const lo = Math.min(la, lb)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * 品牌胶囊文字色：按背景色亮度在深/浅两种文字色里取对比度更高的那个，
 * 保证 WCAG AA（正常文字 ≥ 4.5:1）。白字在 OPPO/iQOO/realme 这类亮色底上只有 1.4~1.9:1，
 * 暗色模式下深底（HONOR/Apple）配深字又几乎看不见，所以必须按底色动态选。
 */
export function getContrastText(bgHex, light = '#ffffff', dark = '#111827') {
  return contrastRatio(bgHex, dark) >= contrastRatio(bgHex, light) ? dark : light
}

// ===== Helper functions =====
export function normDate(d) {
  if (!d) return ''
  if (d.length === 7) return d + '-01'
  return d
}

export function getSeriesName(model) {
  let s = model.trim()
  s = s.replace(/ (RS 非凡大师|RSR保时捷|风驰版|徕卡版|至尊版|元气版|保时捷设计|保时捷)$/, '')
  s = s.replace(/ 优享版$/, '')
  s = s.replace(/ \(\\d+GB\)$/, '')
  const engSuffixes = [
    ' Pro Max', ' Pro mini', ' Pro+', ' Ultra', ' Pro',
    ' Plus', ' Max', ' Mini', ' Lite', ' SE', ' FE', ' Note', ' Turbo'
  ]
  for (const suff of engSuffixes) {
    if (s.endsWith(suff)) { s = s.slice(0, -suff.length).trim(); break }
  }
  while (/[0-9][zTs+c]$/.test(s)) s = s.slice(0, -1)
  return s.trim()
}

export function simplifyCapacity(s) {
  if (!s) return ''
  const str = String(s).trim()
  const cap = '\\d+(?:\\.\\d+)?(?:GB|TB)'
  // RAM+ROM 组合档位（12GB+256GB/…）：内存那一栏只显示 RAM，存储那一栏要的是各档 ROM
  if (str.includes('+')) {
    const roms = [...str.matchAll(new RegExp('\\+\\s*(' + cap + ')', 'g'))].map((m) => m[1])
    if (roms.length) return [...new Set(roms)].join('/')
  }
  // 只取开头连续的容量列表，后面的 LPDDR5X / UFS4.0 之类标注丢掉；
  // 旧实现固定最多匹配两个容量，会把 1TB / 24GB 这类最高档吞掉。
  const run = str.match(new RegExp('^' + cap + '(?:\\s*[/、]\\s*' + cap + ')*'))
  if (!run) return str
  return run[0].split(/[/、]/).map((t) => t.trim()).join('/')
}

/**
 * 从 features 提取 IP 防尘抗水等级。
 * 兼容两种历史写法：
 *  - 原始码: "IP68", "IP69K", "IP5X", "IPX8"
 *  - 拆分标注: "防尘: IP6X", "防水: IPX8"
 * 返回去重后的等级数组，如 ["IP66","IP68","IP69K"]
 */
export function getIpLevels(phone) {
  const feats = phone?.features || []
  const levels = []
  for (const f of feats) {
    if (typeof f !== 'string') continue
    // 匹配 IP68 / IP69K / IP5X / IPX8 / IPX9 等
    const matches = f.match(/IP(?:\d{1,2}X?K?|X\d{1,2}K?)/gi)
    if (matches) {
      for (const m of matches) levels.push(m.toUpperCase())
    }
  }
  return [...new Set(levels)]
}

/** 卡片/对比用：返回展示字符串，无数据时回退 tags「防尘抗水」→「支持」 */
export function getIpRating(phone, { join = ' ', empty = '—', supportFallback = true } = {}) {
  const levels = getIpLevels(phone)
  if (levels.length > 0) return levels.join(join)
  if (supportFallback && phone?.tags?.includes('防尘抗水')) return '支持'
  return empty
}

export function getDisplayName(p) {
  const m = p.model, b = p.brand
  // 有自定义展示名时优先使用
  if (p.name && p.name !== m) return p.name
  if (m.toLowerCase().startsWith(b.toLowerCase())) return m
  if (m.startsWith('iPhone') || m.startsWith('Galaxy') || m.startsWith('moto') || m.startsWith('Moto')) return m
  // 红魔/REDMAGIC/NaviX 机型名已自成体系，不加品牌前缀
  if (m.startsWith('REDMAGIC') || m.startsWith('NaviX')) return m
  if (/^[\u4e00-\u9fff]/.test(m)) {
    const stripped = m.replace(/^[\u4e00-\u9fff\s]+/, '')
    return b + (stripped ? ' ' + stripped : '')
  }
  if (b === 'OPPO' || b === 'REDMI') return m
  return b + ' ' + m
}

/**
 * 分辨率展示串。
 * 折叠屏要同时给出内外屏（数据里既有 "A / B" 斜杠写法，也有单值写法），
 * 直屏原样返回。原先这段逻辑写在 App.vue 里，与 getFoldableScreenDisplay 割裂，
 * 拆组件后详情页和对比页都要用，统一收进 utils。
 */
export function getResolutionDisplay(p) {
  const res = p.resolution || ''
  // 折叠屏（含「折叠内折/折叠外折」等历史写法，统一走 normalizeScreenForm）
  if (normalizeScreenForm(p) === 'foldable') {
    // 有些用 / 分隔
    const parts = res.split('/').map(s => s.trim()).filter(Boolean)
    const main = p.screen_unfolded?.size || ''
    const outer = p.screen_folded?.size || ''
    if (parts.length >= 2) {
      if (outer && main) return `${outer}″ ${parts[0]} / ${main}″ ${parts[1]}`
      return parts.join(' / ')
    }
    if (parts.length === 1) {
      if (res.includes('双屏') || !/^\d/.test(res)) return (p.screen_size ? p.screen_size + '″ ' : '') + '—'
      return p.screen_size ? p.screen_size + '″ ' + res : res
    }
  }
  // 非折叠屏
  if (res && /^\d/.test(res)) return res
  if (res && /[×x]/.test(res)) return res
  return res || '—'
}

export function getFoldableScreenDisplay(phone) {
  if (phone.screen_unfolded && phone.screen_folded) {
    const unfolded = phone.screen_unfolded
    const folded = phone.screen_folded
    const foldType = phone.fold_type || '折叠屏'
    if (foldType === '三折叠') return `三折叠 ${unfolded.size}英寸/${folded.size}英寸`
    if (foldType === '横向折叠') return `横折 ${unfolded.size}英寸/${folded.size}英寸`
    if (foldType === '纵向折叠') return `竖折 ${unfolded.size}英寸/${folded.size}英寸`
    return `${unfolded.size}英寸/${folded.size}英寸`
  }
  return (phone.screen_size ? phone.screen_size + '英寸' : '') + (phone.screen_type ? ' ' + phone.screen_type : '') || '—'
}

/** 解析单段镜头文本，尽量抽出像素/传感器/CMOS/光圈/焦距/变焦/OIS/品牌 */
function parseCameraSegment(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim()
  if (!text) return null

  // 像素：优先 亿/万/MP
  let mp = ''
  let m
  if ((m = text.match(/(\d+(?:\.\d+)?)\s*亿/))) {
    const yi = parseFloat(m[1])
    mp = Number.isInteger(yi) ? `${yi}亿` : `${yi}亿`
  } else if ((m = text.match(/(\d+)\s*万(?:像素)?/))) {
    const wan = parseInt(m[1], 10)
    // 10000万 = 1亿；>=10000 万 转亿
    mp = wan >= 10000 ? `${wan / 10000}亿` : `${wan}万`
  } else if ((m = text.match(/(\d+)\s*MP/i))) {
    const n = parseInt(m[1], 10)
    // 200MP ≈ 2亿；50MP 保持 50MP
    mp = n >= 100 ? `${n / 100}亿` : `${n}MP`
  }

  // 传感器代号
  let sensor = ''
  if ((m = text.match(/(LYT-?\d+[A-Z]?|IMX\d+[A-Z]?|OV\d+[A-Z]?|HP[A-Z0-9]+|GN\d+|JN\d+[A-Z]?|JNL|SC\d+XS?|光影猎人\d*)/i))) {
    sensor = m[1].replace(/LYT(?!-)/i, 'LYT-')
  }

  // 传感器品牌线索（无具体代号时，注意 RYYB/XMAGE 不是型号）
  let brand = ''
  if (/索尼|Sony/i.test(text)) brand = '索尼'
  else if (/三星|Samsung/i.test(text)) brand = '三星'
  else if (/豪威|OmniVision|OV/i.test(text) && !sensor) brand = '豪威'
  else if (/思特威|SmartSens/i.test(text)) brand = '思特威'
  // 不再把 RYYB/XMAGE 拼进 brand

  // CMOS 尺寸
  let size = ''
  if ((m = text.match(/\b1["”]/))) size = '1"'
  else if ((m = text.match(/(1\/\d+(?:\.\d+)?)["”]?/))) size = m[1] + (/"/.test(m[0]) || /”/.test(m[0]) ? '"' : '"')
  // normalize 1/1.3" style
  size = size.replace(/”/g, '"')
  if (size && !size.endsWith('"') && /^1\//.test(size)) size += '"'

  // 光圈（支持可变 f/1.4-4.0）
  let aperture = ''
  if ((m = text.match(/f\s*\/?\s*(\d+(?:\.\d+)?)\s*[-~～到至]\s*f?\s*\/?\s*(\d+(?:\.\d+)?)/i))) {
    aperture = `f/${m[1]}-${m[2]}`
  } else if ((m = text.match(/[fF]\s*\/?\s*(\d+(?:\.\d+)?)/))) {
    aperture = `f/${m[1]}`
  }

  // 焦距 mm
  let focal = ''
  if ((m = text.match(/(\d{2,3})\s*mm/i))) focal = m[1] + 'mm'

  // 光学变焦（排除传感器尾号：SC585XS 不会误识别 585x；只匹配常见 2x~120x）
  let zoom = ''
  if ((m = text.match(/(\d+(?:\.\d+)?)\s*[xX×]/))) {
    const zv = parseFloat(m[1])
    if (zv <= 120) zoom = m[1] + 'x'
  } else if ((m = text.match(/\b(\d+(?:\.\d+)?)\s*[xX×]/))) {
    const zv = parseFloat(m[1])
    if (zv >= 1 && zv <= 120) zoom = m[1] + 'x'
  }

  // 视场角
  let fov = ''
  if ((m = text.match(/(\d{2,3})\s*°/))) fov = m[1] + '°'

  // 色彩滤镜阵列 CFA(不是传感器型号)
    let cfa = ''
    if (/RYYB/i.test(text)) cfa = 'RYYB'
    else if (/RGGB/i.test(text)) cfa = 'RGGB'

    // 影像品牌(华为XMAGE/OPPO LUMO等营销名称,非传感器型号)
    let imagingBrand = ''
    if (/XMAGE/i.test(text)) imagingBrand = 'XMAGE'
    else if (/LUMO/i.test(text)) imagingBrand = 'LUMO'

  const ois = /OIS|光学防抖|传感器位移/.test(text)
  const brandTune = []
  if (/徕卡|Leica/i.test(text)) brandTune.push('徕卡')
  if (/蔡司|Zeiss/i.test(text)) brandTune.push('蔡司')
  if (/哈苏|Hasselblad/i.test(text)) brandTune.push('哈苏')
  if (/理光|RICOH|GR/i.test(text)) brandTune.push('理光')

  // 摘要行
  const summaryParts = []
  if (mp) summaryParts.push(mp)
  if (sensor) summaryParts.push(sensor)
  else if (brand) summaryParts.push(brand)
  if (size) summaryParts.push(size)
  if (aperture) summaryParts.push(aperture)
  if (focal) summaryParts.push(focal)
  if (zoom) summaryParts.push(zoom)
  if (fov && !focal) summaryParts.push(fov)
  if (ois) summaryParts.push('OIS')
  if (cfa) summaryParts.push(cfa)
  if (imagingBrand) summaryParts.push(imagingBrand)
  if (brandTune.length) summaryParts.push(brandTune.join('/'))

  const chips = []
  if (mp) chips.push({ k: '像素', v: mp })
  if (sensor || brand) chips.push({ k: '传感器型号', v: sensor || brand })
  if (size) chips.push({ k: '传感器尺寸', v: size })
  if (aperture) chips.push({ k: '光圈', v: aperture })
  if (focal) chips.push({ k: '焦距', v: focal })
  if (zoom) chips.push({ k: '变焦', v: zoom })
  if (fov) chips.push({ k: '视角', v: fov })
  if (ois) chips.push({ k: '防抖', v: 'OIS' })
  if (cfa) chips.push({ k: '色彩滤镜', v: cfa })
  if (imagingBrand) chips.push({ k: '影像品牌', v: imagingBrand })
  if (brandTune.length) chips.push({ k: '调校', v: brandTune.join('/') })

  return {
    mp, sensor, brand, size, aperture, focal, zoom, fov, ois,
    brandTune,
    summary: summaryParts.join(' · ') || text.slice(0, 36),
    chips,
    raw: text,
  }
}

function detectCameraRole(sec) {
  const s = String(sec || '')
  if (/前置|内屏前置|外屏前置|selfie/i.test(s)) {
    if (/内屏/.test(s)) return { key: 'front_inner', label: '内屏前置', group: 'front' }
    if (/外屏/.test(s)) return { key: 'front_outer', label: '外屏前置', group: 'front' }
    return { key: 'front', label: '前置', group: 'front' }
  }
  if (/超长焦/.test(s)) return { key: 'super_tele', label: '超长焦', group: 'rear' }
  if (/潜望/.test(s)) return { key: 'periscope', label: '潜望长焦', group: 'rear' }
  if (/长焦|tele/i.test(s)) return { key: 'tele', label: '长焦', group: 'rear' }
  if (/超广|超广角|ultrawide/i.test(s)) return { key: 'uw', label: '超广角', group: 'rear' }
  if (/微距|macro/i.test(s)) return { key: 'macro', label: '微距', group: 'rear' }
  if (/主摄|广角|后置|wide/i.test(s)) return { key: 'main', label: '主摄', group: 'rear' }
  return { key: 'other', label: '镜头', group: 'rear' }
}

/**
 * 影像解析结果缓存。
 *
 * 每张卡片在模板里要取 6 个字段（name/charge/screen/ip/cam/score），
 * 全走 cardBrief → getCameraSpecs → getCameraModules，而这里头有十几个正则。
 * 296 台机 × 6 次 = 每次重渲染近 1800 次解析（实测约 16ms），筛选/排序/收藏都会触发。
 * 用 WeakMap 以 phone 对象为键缓存：数据重新 fetch 后旧对象自然被回收，不会泄漏。
 */
const cameraModulesCache = new WeakMap()
const cameraSpecsCache = new WeakMap()

const EMPTY_CAMERA_MODULES = Object.freeze({
  modules: [], rear: [], front: [], summary: '', lines: [],
})

/**
 * 结构化影像模块：供详情页卡片 / 列表摘要 / 对比页使用
 * @returns {{ modules: Array, rear: Array, front: Array, summary: string, lines: string[] }}
 */
export function getCameraModules(p) {
  if (!p || typeof p !== 'object') return EMPTY_CAMERA_MODULES
  const cached = cameraModulesCache.get(p)
  if (cached) return cached

  const dc = p?.detailed_camera || ''
  const cd = p?.camera_desc || ''
  const modules = []

  if (dc && dc.length > 3) {
    const sections = dc.split('|').map(s => s.trim()).filter(Boolean)
    for (const sec of sections) {
      // 兼容 “后置: A + B + C”
      if (/^后置/.test(sec) && sec.includes('+')) {
        const body = sec.replace(/^[^：:]*[：:]\s*/, '')
        for (const sub of body.split('+').map(x => x.trim()).filter(Boolean)) {
          const role = detectCameraRole(sub)
          const parsed = parseCameraSegment(sub)
          if (parsed) modules.push({ ...role, ...parsed })
        }
        continue
      }
      const role = detectCameraRole(sec)
      const body = sec.replace(/^[^：:]*[：:]\s*/, '').trim() || sec
      // 双前置 "60MP超广角+8MP人像"
      if (role.group === 'front' && body.includes('+') && /MP|万|亿/.test(body)) {
        const parts = body.split('+').map(x => x.trim()).filter(Boolean)
        if (parts.length >= 2) {
          parts.forEach((part, idx) => {
            const parsed = parseCameraSegment(part)
            if (parsed) {
              modules.push({
                key: idx === 0 ? 'front' : 'front_aux',
                label: idx === 0 ? '前置' : '前置副摄',
                group: 'front',
                ...parsed,
              })
            }
          })
          continue
        }
      }
      const parsed = parseCameraSegment(body)
      if (parsed) modules.push({ ...role, ...parsed })
    }
  } else if (cd) {
    // 退化：从 camera_desc 拆
    for (const sec of cd.split('|').map(s => s.trim()).filter(Boolean)) {
      const role = detectCameraRole(sec)
      const parsed = parseCameraSegment(sec)
      if (parsed) modules.push({ ...role, ...parsed })
    }
  }

  // 去重（label + 像素 + 传感器型号 作为 key，防止 summary 因格式变化漏判）
  const seen = new Set()
  const uniq = []
  for (const m of modules) {
    const k = m.label + '|' + (m.mp || '') + '|' + (m.sensor || '')
    if (seen.has(k)) continue
    seen.add(k)
    uniq.push(m)
  }

  const order = { main: 0, uw: 1, tele: 2, periscope: 3, super_tele: 4, macro: 5, other: 6, front: 10, front_inner: 11, front_outer: 12, front_aux: 13 }
  uniq.sort((a, b) => (order[a.key] ?? 50) - (order[b.key] ?? 50))

  const rear = uniq.filter(m => m.group === 'rear')
  const front = uniq.filter(m => m.group === 'front')
  const lines = uniq.map(m => `${m.label} ${m.summary}`)
  const summary = rear[0]?.summary || uniq[0]?.summary || cd || '—'

  const result = { modules: uniq, rear, front, summary, lines }
  cameraModulesCache.set(p, result)
  return result
}

export function getCameraSpecs(p) {
  if (!p || typeof p !== 'object') return []
  const cached = cameraSpecsCache.get(p)
  if (cached) return cached

  const { rear, front, lines, summary } = getCameraModules(p)
  const specs = []
  if (rear.length) {
    specs.push({
      l: '后置',
      v: rear.map(m => `${m.label} ${m.summary}`).join('\n'),
      colspan: true,
      modules: rear,
    })
  }
  if (front.length) {
    specs.push({
      l: '前置',
      v: front.map(m => front.length > 1 ? `${m.label} ${m.summary}` : m.summary).join('\n'),
      modules: front,
    })
  }
  if (!specs.length && summary && summary !== '—') {
    specs.push({ l: '影像', v: summary })
  }
  // 附加完整行，详情页可用
  if (lines.length) specs._lines = lines
  cameraSpecsCache.set(p, specs)
  return specs
}
