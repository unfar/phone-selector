/* 机选 V2 Service Worker：安装时预缓存当前构建的页面/JS/CSS/数据，离线可完整打开 */
const CACHE = 'jixuan-v2'
const SHELL = [
  '/phone-selector/',
  '/phone-selector/manifest.webmanifest',
  '/phone-selector/favicon.svg',
  '/phone-selector/icon-192.png',
]

async function precache() {
  const cache = await caches.open(CACHE)
  await cache.addAll(SHELL)

  // 解析当前构建的 index.html，把本次构建的 JS/CSS/图标一并缓存（文件名带 hash）
  try {
    const res = await fetch('/phone-selector/', { cache: 'reload' })
    if (res.ok) {
      await cache.put('/phone-selector/', res.clone())
      const html = await res.text()
      const urls = new Set()
      for (const m of html.matchAll(/(?:src|href)="(\/phone-selector\/(?:assets|icon-|apple-touch)[^"]*)"/g)) {
        urls.add(m[1])
      }
      await Promise.all([...urls].map((u) =>
        fetch(u).then((r) => (r.ok ? cache.put(u, r) : null)).catch(() => null)
      ))
    }
  } catch (e) { /* 离线安装时忽略，运行时再补 */ }

  // 预缓存数据（离线也能出列表）
  try {
    const data = await fetch('/phone-selector/data/phones.json', { cache: 'reload' })
    if (data.ok) await cache.put('/phone-selector/data/phones.json', data)
  } catch (e) { /* ignore */ }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // 页面导航：网络优先，离线回退缓存的首页
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/phone-selector/', copy))
          return res
        })
        .catch(() => caches.match('/phone-selector/'))
    )
    return
  }

  // 数据：网络优先，离线回退最近一次缓存
  if (url.pathname.endsWith('/data/phones.json')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req))
    )
    return
  }

  // 静态资源（带 hash 的 js/css/图片）：缓存优先，未命中再请求并缓存
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
      }
      return res
    }))
  )
})
