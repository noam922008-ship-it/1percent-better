// Google Analytics 4 (via Firebase Analytics, property linked to better-de9aa).
// Privacy rules (see src/data/legal.js → אנליטיקה):
//   • Only the events and parameters in ALLOWED_EVENTS can be sent — anything else is dropped.
//   • Parameter values must be short tokens (utm values, 'daily'/'weekly'); user text,
//     names and emails can't pass sanitizeParams(). No user id is set.
//   • Google Signals and ad personalization are off.
// Runs only in production builds with VITE_FIREBASE_MEASUREMENT_ID set; otherwise a no-op.

import { initializeAnalytics, logEvent, isSupported } from 'firebase/analytics'
import { app } from './firebase'
import { getLocalDateKey } from '../utils/localDate'

const MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
const ENABLED = import.meta.env.PROD && !!MEASUREMENT_ID

export const ALLOWED_EVENTS = {
  app_open:        ['utm_source', 'utm_medium', 'utm_campaign'],
  welcome_start:   [],
  first_entry:     [],
  task_added:      [],
  habit_created:   ['frequency'],
  return_next_day: [],
}

const TOKEN = /^[a-z0-9._-]{1,100}$/   // utm-style values only

export function sanitizeParams(name, params = {}) {
  const allowed = ALLOWED_EVENTS[name] || []
  const out = {}
  for (const key of allowed) {
    const v = typeof params[key] === 'string' ? params[key].trim().toLowerCase() : ''
    if (TOKEN.test(v) && !v.includes('@')) out[key] = v
  }
  return out
}

let analytics = null
const queue = []

export function track(name, params) {
  if (!ALLOWED_EVENTS[name]) return
  const clean = sanitizeParams(name, params)
  if (analytics) logEvent(analytics, name, clean)
  else if (ENABLED) queue.push([name, clean])
}

// UTM parameters from the landing URL — read before the router redirects '/' → '/welcome'
// (which drops the query string).
export function captureUtm(search = typeof window !== 'undefined' ? window.location.search : '') {
  const q = new URLSearchParams(search)
  return sanitizeParams('app_open', {
    utm_source: q.get('utm_source') || '', utm_medium: q.get('utm_medium') || '', utm_campaign: q.get('utm_campaign') || '',
  })
}

function nextDayKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return getLocalDateKey(new Date(y, m - 1, d + 1))
}

// Once per device: the first open on the local day right after the first-ever open.
export function checkReturnNextDay(today = getLocalDateKey(), store = localStorage) {
  try {
    const first = store.getItem('prime_first_open')
    if (!first) { store.setItem('prime_first_open', today); return false }
    if (store.getItem('prime_return_next_day_sent')) return false
    if (today !== nextDayKey(first)) return false
    store.setItem('prime_return_next_day_sent', '1')
    return true
  } catch { return false }
}

// Called once at startup (main.jsx), before the app renders.
export async function startAnalytics() {
  const utm = captureUtm()
  track('app_open', utm)
  if (checkReturnNextDay()) track('return_next_day')
  if (!ENABLED || !app) return
  try {
    if (!(await isSupported())) return
    analytics = initializeAnalytics(app, {
      config: { allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: false },
    })
    while (queue.length) { const [n, p] = queue.shift(); logEvent(analytics, n, p) }
  } catch { analytics = null }
}
