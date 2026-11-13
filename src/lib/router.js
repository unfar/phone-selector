import { reactive } from 'vue'

export const route = reactive({ name: 'home', id: null, query: {} })

/** 兼容旧版（V1）分享链接：#view=detail&id=1 → #/phone/1；返回 true 表示已发起跳转 */
function handleLegacyHash() {
  const legacy = location.hash
  if (!legacy.startsWith('#view=')) return false
  const params = new URLSearchParams(legacy.slice(1))
  const view = params.get('view')
  if (view === 'detail' && params.get('id')) {
    location.replace('#/phone/' + encodeURIComponent(params.get('id')))
    return true
  }
  if (view === 'compare' && params.get('cmp')) {
    location.replace('#/compare?ids=' + params.get('cmp'))
    return true
  }
  if (view === 'favorites') {
    location.replace('#/favorites')
    return true
  }
  return false
}

function parse() {
  if (handleLegacyHash()) return
  const hash = location.hash.replace(/^#/, '') || '/'
  const [path, qs] = hash.split('?')
  const query = Object.fromEntries(new URLSearchParams(qs || ''))
  const segs = path.split('/').filter(Boolean)
  if (!segs.length) {
    route.name = 'home'
    route.id = null
  } else if (segs[0] === 'wizard') {
    route.name = 'wizard'
    route.id = null
  } else if (segs[0] === 'list') {
    route.name = 'list'
    route.id = null
  } else if (segs[0] === 'compare') {
    route.name = 'compare'
    route.id = null
  } else if (segs[0] === 'favorites') {
    route.name = 'favorites'
    route.id = null
  } else if (segs[0] === 'phone' && segs[1]) {
    route.name = 'detail'
    route.id = decodeURIComponent(segs[1])
  } else {
    route.name = 'home'
    route.id = null
  }
  route.query = query
}

export function navigate(path, query) {
  const entries = query ? Object.entries(query).filter(([, v]) => v !== null && v !== undefined && v !== '') : []
  const qs = entries.length ? '?' + new URLSearchParams(entries).toString() : ''
  const next = '#' + path + qs
  if (location.hash === next) return
  history.pushState(null, '', next)
  parse()
}

export function replaceRoute(path, query) {
  const entries = query ? Object.entries(query).filter(([, v]) => v !== null && v !== undefined && v !== '') : []
  const qs = entries.length ? '?' + new URLSearchParams(entries).toString() : ''
  location.replace('#' + path + qs)
}

export function startRouter() {
  window.addEventListener('hashchange', parse)
  window.addEventListener('popstate', parse)

  if (!location.hash) location.replace('#/')
  parse()
}

export function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
}
