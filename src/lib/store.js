import { reactive } from 'vue'
import { computeProfiles } from './derive.js'

export const state = reactive({
  phones: [],
  profiles: new Map(),
  loading: true,
  error: null,
  theme: (() => {
    const saved = localStorage.getItem('ps2-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return localStorage.getItem('ps2-mode') === 'pro' ? 'dark' : 'light'
  })(),
  favorites: new Set(JSON.parse(localStorage.getItem('ps2-fav') || '[]')),
  compare: JSON.parse(localStorage.getItem('ps2-compare') || '[]'),
  dataDate: '',
})

export async function loadPhones() {
  state.loading = true
  state.error = null
  try {
    const resp = await fetch(import.meta.env.BASE_URL + 'data/phones.json')
    if (!resp.ok) throw new Error(resp.status === 404 ? '数据文件不存在' : `HTTP ${resp.status}`)
    const list = await resp.json()
    state.phones = list.filter(p => p.processor)
    state.profiles = computeProfiles(state.phones)
    const dates = state.phones.map(p => p.verified_at).filter(Boolean).sort()
    state.dataDate = dates[dates.length - 1] || ''
  } catch (e) {
    state.error = e && e.message ? e.message : '数据加载失败'
  } finally {
    state.loading = false
  }
}

export function setTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light'
  localStorage.setItem('ps2-theme', state.theme)
  document.documentElement.setAttribute('data-theme', state.theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', state.theme === 'dark' ? '#0d1017' : '#f6f2e9')
}

export function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id)
  else state.favorites.add(id)
  localStorage.setItem('ps2-fav', JSON.stringify([...state.favorites]))
  flash(state.favorites.has(id) ? '已收藏' : '已取消收藏')
}

export function isFavorite(id) {
  return state.favorites.has(id)
}

export function toggleCompare(id) {
  const i = state.compare.indexOf(id)
  if (i >= 0) {
    state.compare.splice(i, 1)
    flash('已移出对比')
  } else if (state.compare.length >= 4) {
    flash('最多同时对比 4 款')
  } else {
    state.compare.push(id)
    flash('已加入对比')
  }
  persistCompare()
}

function persistCompare() {
  localStorage.setItem('ps2-compare', JSON.stringify(state.compare))
}

export function clearCompare() {
  state.compare = []
  persistCompare()
}

export function isComparing(id) {
  return state.compare.includes(id)
}

export function flash(msg) {
  window.dispatchEvent(new CustomEvent('ps2-toast', { detail: msg }))
}

export function clearFavorites() {
  state.favorites.clear()
  localStorage.setItem('ps2-fav', '[]')
}

export function favList() {
  return state.phones.filter(p => state.favorites.has(p.id))
}

export function comparePhones() {
  return state.compare
    .map(id => state.phones.find(p => p.id === id))
    .filter(Boolean)
}
