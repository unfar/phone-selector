// CPU 标签清单标签配置:置顶项与排除规则
// ⚠️ 这里的名字必须是 normalizeProcessor() 归一化后的形式 —— 归一化会把变体折叠到系列名
//   (天玑9500s/Super/Monster → 天9500;麒麟9030S/Pro → 麒麟9030;第五代骁龙8至尊版 → 骁龙8 Elite 5)
// 用户要求(2026-09-16):同一系列在筛选里只出现一个标签,细则看页面(详情页/卡片显示原始 processor)

// 置顶项:排在最前、不受台数影响(名字必须是归一化后的形式)
export const PINNED_CPU = [
  'A19', 'A20',            // Apple 当代(A 系排第一,当前在售的排最前)
  '麒麟9030', '麒麟9050',   // 华为
  '骁龙8 Elite 5',          // 高通
  '天玑9500', '天玑9400',    // 联发科
]

// 排除:中低端系列不进标签云(用户 2026-09-10 定的规则)
export const EXCLUDE_CPU_RE = /骁龙([4-7]|7s|7\+|8s)|天玑[678]|麒麟(90[01]\d|8\d)/i
export const EXCLUDE_CPU_EXACT = new Set(['Q2电竞芯片', '电竞芯片'])

// CPU 标签云按厂商分组排序(用户 2026-09-16 指定顺序):
//   Apple A 系 → 华为麒麟 → 高通骁龙 → 联发科天玑 → 三星猎户座 → 其它
// 组内按机型台数降序;每组至少保留 1 个代表(该组有数据时),其余按台数竞争剩余名额。
export const CPU_VENDORS = [
  { key: 'apple',  label: 'Apple A 系列',   test: /^A\d{2}$/ },
  { key: 'kirin',  label: '华为麒麟',        test: /^麒麟/ },
  { key: 'snap',   label: '高通骁龙',        test: /^骁龙/ },
  { key: 'dim',    label: '联发科天玑',      test: /^天/ },
  { key: 'exynos', label: '三星猎户座',      test: /^(Exynos|猎户座)/i },
  { key: 'other',  label: '其它',            test: /.*/ },
]

export function cpuVendorOrder(name) {
  const i = CPU_VENDORS.findIndex(v => v.test.test(String(name || '').trim()))
  return i < 0 ? CPU_VENDORS.length - 1 : i
}

/** 标签云最终排序:先按厂商分组,组内「PINNED_CPU 的顺序优先」,其余按台数降序 */
export function buildCpuTagOrder(entries) {
  // entries: [{ name, n }]
  const byGroup = new Map()
  for (const e of entries) {
    const g = cpuVendorOrder(e.name)
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g).push(e)
  }
  const out = []
  CPU_VENDORS.forEach((v, g) => {
    const list = byGroup.get(g)
    if (!list || !list.length) return
    const pinned = PINNED_CPU.filter(n => list.some(e => e.name === n))
    const rest = list.filter(e => !PINNED_CPU.includes(e.name)).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
    out.push(...pinned, ...rest.map(e => e.name))
  })
  return out
}