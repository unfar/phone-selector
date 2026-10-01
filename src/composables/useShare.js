/** 分享链接复制：详情页与对比页共用 */
import { updateHash } from './useApp.js'

function toast(msg) {
  const old = document.querySelector('.toast'); if (old) old.remove()
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2200)
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy'); done() } catch {}
  document.body.removeChild(ta)
}

export function copyShareLink() {
  updateHash()
  const url = location.origin + location.pathname + location.hash
  const done = () => toast('链接已复制 ✅')
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done))
  } else {
    fallbackCopy(url, done)
  }
}
