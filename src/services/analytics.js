// Google Analytics 4 (via Firebase Analytics, property linked to better-de9aa).
// Privacy rules (see src/data/legal.js → אנליטיקה):
//   • Only the events and parameters in ALLOWED_EVENTS can be sent — anything else is dropped.
//   • Parameter values must be short tokens (utm values, 'daily'/'weekly'); user text,
//     names and emails can't pass sanitizeParams(). No user id is set.
//   • Google Signals and ad personalization are off.
// Runs only in production builds with VITE_FIREBASE_MEASUREMENT_ID set; otherwise a no-op.
//
// Consent (FEATURES.consentBanner — off = GA starts on landing, as before). No banner: the
// choice is the switch in Settings → Privacy, off until the user turns it on.
//   • Until the user turns it on, GA isn't loaded: no cookies, no requests, nothing written to
//     localStorage. Events are not kept either — nothing from before the choice is sent later.
//   • On → GA loads; only events from then on are sent.
//   • Off → nothing is sent. Turning it off also stops GA and deletes its cookies and the
//     return_next_day keys.
//   • Only the choice itself is stored (CONSENT_KEY).

import { initializeAnalytics, logEvent, isSupported, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { app } from './firebase'
import { getLocalDateKey } from '../utils/localDate'
import { FEATURES } from '../config/features'

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
let collecting = false   // GA loaded and allowed to send
let stopped = false      // GA was loaded, then turned off in Settings
let loading = null
const queue = []

export const CONSENT_KEY = 'prime_analytics_consent'
let choice = null        // this session's choice — still applies if localStorage can't be written

// 'granted' | 'denied' | null (not chosen yet). Flag off: always 'granted', as before.
export function getConsent(store) {
  if (!FEATURES.consentBanner) return 'granted'
  if (choice) return choice
  try {
    const v = (store || localStorage).getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch { return null }
}

export const needsConsentChoice = () => FEATURES.consentBanner && getConsent() === null

export function track(name, params) {
  if (!ALLOWED_EVENTS[name]) return
  if (getConsent() === 'denied') return
  const clean = sanitizeParams(name, params)
  if (collecting) logEvent(analytics, name, clean)
  else if (ENABLED && getConsent() === 'granted') queue.push([name, clean])   // allowed, GA still loading
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
  if (getConsent() !== 'granted') return   // not turned on: app_open is dropped, not kept
  await loadAnalytics()
}

function loadAnalytics() {
  if (checkReturnNextDay()) track('return_next_day')
  if (!ENABLED || !app) return Promise.resolve()
  if (!loading) {
    loading = (async () => {
      if (!(await isSupported())) return
      analytics = initializeAnalytics(app, {
        config: { allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: false },
      })
    })().catch(() => { analytics = null; loading = null })
  }
  return loading.then(() => {
    if (!analytics || getConsent() !== 'granted') return
    if (stopped) { setAnalyticsCollectionEnabled(analytics, true); stopped = false }
    collecting = true
    while (queue.length) { const [n, p] = queue.shift(); logEvent(analytics, n, p) }
  })
}

// The Settings switch. No-op with the flag off.
export async function setConsent(granted, store) {
  if (!FEATURES.consentBanner) return
  choice = granted ? 'granted' : 'denied'
  try { (store || localStorage).setItem(CONSENT_KEY, choice) } catch { /* the in-memory choice still applies */ }
  if (granted) return loadAnalytics()
  queue.length = 0
  if (analytics && !stopped) { setAnalyticsCollectionEnabled(analytics, false); stopped = true }
  collecting = false
  clearAnalyticsStorage(store)
}

// What GA and return_next_day leave on the device: the _ga cookies and our two localStorage keys.
function clearAnalyticsStorage(store) {
  try {
    const s = store || localStorage
    s.removeItem('prime_first_open')
    s.removeItem('prime_return_next_day_sent')
  } catch { /* ignore */ }
  if (typeof document === 'undefined') return
  const host = window.location.hostname
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    for (const domain of ['', `; domain=${host}`, `; domain=.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
    }
  }
}
