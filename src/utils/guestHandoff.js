// Guest hand-off: Instagram/TikTok's built-in browser can't install the app or send reminders, and
// what a guest saves there stays inside Instagram. While a guest uses PRIME in an in-app browser we
// keep a copy of their guest data in the page address (#h=…). When they tap ⋯ → "Open in external
// browser", Instagram opens that same address in Safari/Chrome, which reads it back on start-up
// (main.jsx → importHandoff) and continues as the same guest — habits and check-ins included.
// The hash never reaches the server.

import { inAppBrowser } from './inAppBrowser'

const FIXED_KEYS = ['prime_guest_triggers', 'prime_habit_log_guest', 'prime_welcome_v2']
const CHECKIN_PREFIX = 'ft_checkins_'
const CHECKIN_DAYS = 60
export const AUTO_GUEST_FLAG = 'prime_auto_guest'
const ARRIVED_KEY = 'prime_handoff_arrived'   // shows the "last step: add to home screen" card

function dayKey(daysAgo, now) {
  return new Date(now - daysAgo * 86400000).toISOString().slice(0, 10)
}

export function collectGuestState(storage = localStorage, now = Date.now()) {
  const k = {}
  for (const key of FIXED_KEYS) {
    const v = storage.getItem(key)
    if (v != null) k[key] = v
  }
  for (let i = 0; i < CHECKIN_DAYS; i++) {
    const key = CHECKIN_PREFIX + dayKey(i, now)
    const v = storage.getItem(key)
    if (v != null && v !== '{}') k[key] = v
  }
  return { v: 1, k }
}

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
}

export function encodeState(state) { return toBase64Url(JSON.stringify(state)) }

export function decodeState(s) {
  try {
    const st = JSON.parse(fromBase64Url(s))
    return st && st.v === 1 && st.k && typeof st.k === 'object' ? st : null
  } catch { return null }
}

// Only keys we know about, and never over data this browser already has
export function applyState(state, storage = localStorage) {
  let wrote = 0
  for (const [key, val] of Object.entries(state.k)) {
    if (typeof val !== 'string') continue
    if (!(FIXED_KEYS.includes(key) || /^ft_checkins_\d{4}-\d{2}-\d{2}$/.test(key))) continue
    const cur = storage.getItem(key)
    if (cur != null && cur !== '[]' && cur !== '{}') continue
    storage.setItem(key, val)
    wrote++
  }
  return wrote
}

let lastHash = ''
// Call while a guest is on screen; does nothing outside in-app browsers.
export function writeHandoffHash() {
  try {
    if (!inAppBrowser()) return
    const hash = '#h=' + encodeState(collectGuestState())
    if (hash === lastHash) return
    lastHash = hash
    history.replaceState(history.state, '', location.pathname + location.search + hash)
  } catch {}
}

// On start-up (main.jsx, before render): take the guest data from #h=… and continue as that guest.
export function importHandoff() {
  try {
    const m = /^#h=([A-Za-z0-9_-]+)$/.exec(location.hash || '')
    if (!m) return false
    const state = decodeState(m[1])
    history.replaceState(history.state, '', location.pathname + location.search)
    if (!state || inAppBrowser()) return false   // still inside Instagram: its own data is already here
    applyState(state)
    try { sessionStorage.setItem(AUTO_GUEST_FLAG, '1') } catch {}
    try { localStorage.setItem(ARRIVED_KEY, '1') } catch {}
    return true
  } catch { return false }
}

export function autoGuestPending() {
  try { return sessionStorage.getItem(AUTO_GUEST_FLAG) === '1' } catch { return false }
}
export function clearAutoGuest() {
  try { sessionStorage.removeItem(AUTO_GUEST_FLAG) } catch {}
}

export function handoffArrived() {
  try { return localStorage.getItem(ARRIVED_KEY) === '1' } catch { return false }
}
export function clearHandoffArrived() {
  try { localStorage.removeItem(ARRIVED_KEY) } catch {}
}
