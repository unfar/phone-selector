// CPU 标签清单标签配置:置顶项与排除规则
// ⚠️ 这里的名字必须是 normalizeProcessor() 归一化后的形式 —— 归一化会把变体折叠到系列名
//   (天玑9500s/Super/Monster → 天9500;麒麟9030S/Pro → 麒麟9030;第五代骁龙8至尊版 → 骁龙8 Elite 5)
// 用户要求(2026-09-16):同一系列在筛选里只出现一个标签,细则看页面(详情页/卡片显示原始 processor)

export const PINNED_CPU = [
  '麒麟9030', '麒麟9050', '骁龙8 Elite 5', '天玑9500', '天玑9400', 'A19', 'A20',
]

// 排除:中低端系列不进标签云(用户 2026-09-10 定的规则)
export const EXCLUDE_CPU_RE = /骁龙([4-7]|7s|7\+|8s)|天玑[678]|麒麟(90[01]\d|8\d)/i
export const EXCLUDE_CPU_EXACT = new Set(['Q2电竞芯片', '电竞芯片'])