/* 电商参考价：读取 public/data/prices.json（人工/接口采集的快照），提供展示与比价链接 */

export const PLATFORM_ORDER = ['jd', 'tmall', 'pdd']

export function platformName(prices, key) {
  return prices?.platforms?.[key]?.name || key
}

export function searchUrl(prices, key, name) {
  const tpl = prices?.platforms?.[key]?.search_url
  if (!tpl) return '#'
  return tpl.replace('{q}', encodeURIComponent(name || ''))
}

/** 某机型的电商价格行（按平台顺序，只返回有数据的） */
export function priceRows(phone, prices) {
  const bucket = prices?.items?.[String(phone?.id)] || {}
  return PLATFORM_ORDER
    .filter((k) => bucket[k])
    .map((k) => ({
      key: k,
      platform: platformName(prices, k),
      ...bucket[k],
    }))
}

export function lowestEcom(phone, prices) {
  const rows = priceRows(phone, prices).filter((r) => Number(r.price) > 0)
  if (!rows.length) return null
  return rows.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
}

/** 与官方参考价的差：负数=更便宜，正数=更贵 */
export function priceDelta(price, official) {
  if (!Number(official) || !Number(price)) return null
  return Math.round(Number(price) - Number(official))
}

export function deltaText(delta) {
  if (delta === null || delta === undefined) return ''
  if (delta === 0) return '与官价一致'
  return delta < 0 ? '比官价低 ¥' + Math.abs(delta) : '比官价高 ¥' + delta
}

export function shortDate(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 10)
}
