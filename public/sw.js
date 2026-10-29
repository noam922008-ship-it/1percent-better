const CACHE = 'prime-v25'

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── FCM background push handler ──────────────────────────────────────
// Cloud Function sends webpush.data (flat JSON). Browser delivers a push
// event here when the app is in the background or closed.
self.addEventListener('push', e => {
  let payload = {}
  try { payload = e.data ? e.data.json() : {} } catch { payload = {} }
  // Firebase Console / FCM "notification" messages nest title+body; Cloud Function sends flat data
  if (payload.notification) payload = { ...(payload.data || {}), ...payload.notification }
  else if (payload.data && !payload.title) payload = { ...payload.data }

  const title = payload.title || 'PRIME'
  e.waitUntil(
    self.registration.showNotification(title, {
      body:  payload.body  || '',
      icon:  payload.icon  || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag:   payload.tag   || 'prime-push',
      data:  { url: payload.url || '/' },
    })
  )
})

// If the browser refreshes the push subscription, signal the client to re-register
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list =>
      list.forEach(c => c.postMessage({ type: 'FCM_TOKEN_REFRESH' }))
    )
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const action = e.action   // 'done' | 'later' | 'help' | '' (body click)
  const data   = e.notification.data || {}
  const target = data.url || '/'

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // In-app nudge notifications carry habitLabel; FCM background pushes carry url
      if (data.habitLabel) {
        const msg = { type: 'NUDGE_RESPONSE', action: action || 'open', data }
        if (list.length > 0) { list[0].postMessage(msg); list[0].focus() }
        else clients.openWindow('/').then(c => c && c.postMessage(msg))
      } else {
        if (list.length > 0) { list[0].navigate(target); list[0].focus() }
        else clients.openWindow(target)
      }
    })
  )
})

// Network first, cache as offline fallback — for the app's own files only.
// Other origins (Firestore streams, Google APIs, the pose-model CDN) go straight to the network:
// caching them failed on every streamed response ("Cache.put() encountered a network error")
// and would have kept API data in the cache. Not active on localhost (Vite dev server).
self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/__/')) return   // Firebase sign-in handler and config: always live
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') return

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('/') : Response.error())))
  )
})
