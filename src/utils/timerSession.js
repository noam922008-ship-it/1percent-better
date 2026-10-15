// A running "I have time" timer (reading, focus) that survives closing the screen or the app,
// plus a lock-screen "Now Playing" card and an end-of-timer notification.
//
// The card is a Media Session trick: a silent looping audio keeps the page "playing", so iOS and
// Android show title + progress on the lock screen. It is best effort — the system may stop the
// audio, and then the timer still works because it is stored as an end time, not a countdown.
// The end notification fires only while the page is alive. A phone that fully suspended the app
// gets no notification (that would need a server push).

const KEY = 'prime_hastime_timer'
const MAX_AGE_MS = 12 * 3600 * 1000   // an old forgotten timer is dropped

// { id, endsAt, startedAt } or null
export function loadTimer(now = Date.now(), storage = globalThis.localStorage) {
  try {
    const t = JSON.parse(storage.getItem(KEY))
    if (t && typeof t.id === 'string' && Number.isFinite(t.endsAt) && Number.isFinite(t.startedAt)
        && now - t.endsAt < MAX_AGE_MS) return t
  } catch { /* unreadable → no timer */ }
  return null
}

export function saveTimer(timer, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(timer)) } catch { /* private mode */ }
}

export function removeTimer(storage = globalThis.localStorage) {
  try { storage.removeItem(KEY) } catch { /* ignore */ }
}

// ── Lock-screen card + end notification (browser only) ─────────────

let audio = null
let endTimeout = null
let silentUrl = null

// One second of 8-bit silence as a WAV blob.
function getSilentUrl() {
  if (silentUrl) return silentUrl
  const rate = 8000
  const bytes = new Uint8Array(44 + rate).fill(128)
  const view = new DataView(bytes.buffer)
  const text = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)) }
  text(0, 'RIFF'); view.setUint32(4, 36 + rate, true); text(8, 'WAVE'); text(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, rate, true); view.setUint32(28, rate, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true)
  text(36, 'data'); view.setUint32(40, rate, true)
  silentUrl = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
  return silentUrl
}

function notifyEnd({ title, body }) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    navigator.serviceWorker?.ready
      ?.then(reg => reg.showNotification(title, { body, tag: 'has-time-timer' }))
      .catch(() => {})
  } catch { /* ignore */ }
}

export function stopMedia() {
  if (endTimeout) { clearTimeout(endTimeout); endTimeout = null }
  try { audio?.pause() } catch { /* ignore */ }
  audio = null
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.metadata = null
      navigator.mediaSession.setActionHandler('pause', null)
    }
  } catch { /* ignore */ }
}

// Call from a tap handler (browsers only allow audio to start after a gesture).
// onStop: user pressed pause on the lock screen. end: { title, body } for the notification.
export function startMedia({ title, artist, startedAt, endsAt, onStop, end }) {
  stopMedia()
  try {
    audio = new Audio(getSilentUrl())
    audio.loop = true
    audio.play().catch(() => {})
  } catch { /* no audio → the timer still works */ }
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title, artist })
      navigator.mediaSession.playbackState = 'playing'
      navigator.mediaSession.setActionHandler('pause', () => { stopMedia(); onStop?.() })
      navigator.mediaSession.setPositionState({
        duration: Math.max(1, (endsAt - startedAt) / 1000),
        position: Math.min((Date.now() - startedAt) / 1000, (endsAt - startedAt) / 1000),
        playbackRate: 1,
      })
    }
  } catch { /* ignore */ }
  endTimeout = setTimeout(() => { stopMedia(); notifyEnd(end) }, Math.max(0, endsAt - Date.now()))
}
