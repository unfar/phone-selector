/** 对比表的行数据生成（桌面横向表 + 移动竖排卡片共用） */
import { computed, ref } from 'vue'
import { comparePhones, cardBrief, priceText } from './useApp.js'
import { getCameraSpecs, getResolutionDisplay } from '../utils.js'

export const compareDiffOnly = ref(false)

/** 基础参数行：顺序即表格行序 */
const BASE_FIELDS = [
  { l: '价格', v: p => priceText(p) },
  { l: '处理器', v: p => p.processor || '—' },
  { l: '内存', v: p => cardBrief(p).ram },
  { l: '存储', v: p => cardBrief(p).storage },
  { l: '电池', v: p => p.battery_mah ? p.battery_mah + 'mAh' : '—' },
  { l: '充电', v: p => cardBrief(p).charge },
  { l: '屏幕', v: p => cardBrief(p).screen },
  { l: '分辨率', v: p => getResolutionDisplay(p) },
  { l: '刷新率', v: p => p.refresh_hz ? p.refresh_hz + 'Hz' : '—' },
  { l: '重量', v: p => p.weight_g ? p.weight_g + 'g' : '—' },
  { l: '防尘抗水', v: p => cardBrief(p).ip },
  { l: 'USB', v: p => p.usb_version || '—' },
  { l: '系统', v: p => p.os || '—' },
  { l: '发布日期', v: p => p.release_date || '—' },
]

/** 为对比表生成摄像头行：每颗镜头一行，行标签为「后置·主摄」等 */
function buildCameraCompareRows(prefix, camSpecsArray, group) {
  // 收集所有镜头 key（比如 main, uw, tele），潜望/超长焦统一归入 tele
  const allKeys = []
  const seenKeys = new Set()
  const mergeMap = { periscope: 'tele', super_tele: 'tele' }
  const groupLabel = group === 'rear' ? '后置' : '前置'
  for (const specs of camSpecsArray) {
    const spec = specs.find(s => s.modules && s.l === groupLabel)
    if (spec?.modules) {
      for (const m of spec.modules) {
        const k = mergeMap[m.key] || m.key
        if (!seenKeys.has(k)) {
          seenKeys.add(k)
          allKeys.push(k)
        }
      }
    }
  }
  if (!allKeys.length) return []

  // 按固定顺序排
  const order = group === 'rear'
    ? ['main', 'note', 'tele', 'macro', 'other']
    : ['front', 'front_inner', 'front_outer', 'front_aux']
  allKeys.sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b)
    return (ai >= 0 ? ai : 99) - (bi >= 0 ? bi : 99)
  })

  const rows = []
  for (const key of allKeys) {
    // 合并：同一 key 下所有原 key（tele 同时匹配 tele/periscope/super_tele）
    const matchKeys = key === 'tele' ? ['tele', 'periscope', 'super_tele'] : [key]
    const values = camSpecsArray.map(specs => {
      const spec = specs.find(s => s.modules && s.l === groupLabel)
      const mods = spec?.modules?.filter(m => matchKeys.includes(m.key)) || []
      // 如果合并后有多个镜头，拼在一起
      // summary 已包含像素(如 50MP / 2亿)，不再重复前缀 m.mp
      return mods.length ? mods.map(m => m.summary).join(';') : '—'
    })
    const same = values.every(v => v === values[0])
    const labelMap = {
      main: '主摄', note: '超广角', tele: '长焦',
      macro: '微距', other: '其他',
      front: '主自拍', front_inner: '内屏前置', front_outer: '外屏前置', front_aux: '副自拍',
    }
    const label = labelMap[key] || key
    rows.push({ l: `${prefix}·${label}`, values, same })
  }
  return rows
}

export const compareRows = computed(() => {
  const ps = comparePhones.value
  if (ps.length < 2) return []

  // 影像：将每个摄像头模块展开为独立行
  const camSpecs = ps.map(p => getCameraSpecs(p))
  const rearRows = buildCameraCompareRows('后置', camSpecs, 'rear')
  const frontRows = buildCameraCompareRows('前置', camSpecs, 'front')

  const build = (f) => {
    const values = ps.map(p => f.v(p))
    return { l: f.l, values, same: values.every(v => v === values[0]) }
  }

  // 解析不到模块时回退：只给一条影像摘要行
  if (!rearRows.length && !frontRows.length) {
    const rows = BASE_FIELDS.map(build)
    rows.push({ l: '影像', values: ps.map(p => cardBrief(p).cam), same: false })
    return rows
  }

  const rows = BASE_FIELDS.map(build)
  rows.push(...rearRows)
  if (frontRows.length) rows.push(...frontRows)
  return rows
})

export const visibleCompareRows = computed(() => {
  const rows = compareRows.value
  return compareDiffOnly.value ? rows.filter(r => !r.same) : rows
})

/** 差异项数量（供"仅看差异"徽标显示） */
export const diffCount = computed(() => compareRows.value.filter(r => !r.same).length)
