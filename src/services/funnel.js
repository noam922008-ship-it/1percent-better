// Funnel counters without cookies: funnel/{UTC date} = { open: n, guest_start: n, … }.
// Only whole-number counts per day. Nothing about the person: no id, no device storage, no
// text — so it works for everyone, including people who never turn Google Analytics on
// (GA only loads after consent, so most visitors never show up there).
// Each call adds 1 to one known counter; firestore.rules allow exactly that and no reads.
// Read the numbers in the Firebase console (Firestore → funnel).
//
// Two small local flags (localStorage, never sent anywhere):
//   prime_internal — this device is the owner's / a tester's: it counts nothing. Set it by opening
//                    any page with ?internal=1 (clear with ?internal=0).
//   prime_guest_since / prime_guest_seen — for return_guest: the day this device's guest first had a
//                    habit, and the last day a return was counted. Only dates, nothing about the person.

import { doc, setDoc, increment } from 'firebase/firestore'
import { db } from './firebase'

export const FUNNEL_KEYS = [
  'open',               // the app was loaded (any visit, including returning users)
  'open_inapp',         // …inside Instagram/TikTok/Facebook's browser
  'open_dm',            // …from the link in our Instagram DM (utm_medium=dm)
  'guest_start',        // tapped "start without signing up"
  'habit_first_guest',  // first habit created as a guest
  'habit_first_user',   // first habit created signed in
  'checkin_guest',      // a habit marked done (guest)
  'checkin_user',       // a habit marked done (signed in)
  'signup',             // a new account was created
  'guest_to_account',   // a guest signed in and their habits moved to the account
  'return_guest',       // a guest with a habit came back on a later day (once per device per day)
  'open_youtube',       // …from the link on the YouTube channel (utm_source=youtube)
]

const INTERNAL_KEY = 'prime_internal'

/** ?internal=1 marks this device as internal (owner/tester), ?internal=0 clears it. */
export function applyInternalParam(search = '', storage = globalThis.localStorage) {
  try {
    const v = new URLSearchParams(search).get('internal')
    if (v === '1') storage.setItem(INTERNAL_KEY, '1')
    else if (v === '0') storage.removeItem(INTERNAL_KEY)
  } catch { /* ignore */ }
}

/** Flips this device between internal and normal (Settings: 5 taps on the version line). Returns the new state. */
export function toggleInternalDevice(storage = globalThis.localStorage) {
  try {
    if (storage.getItem(INTERNAL_KEY) === '1') { storage.removeItem(INTERNAL_KEY); return false }
    storage.setItem(INTERNAL_KEY, '1'); return true
  } catch { return false }
}

export function isInternalDevice(storage = globalThis.localStorage) {
  try { return storage.getItem(INTERNAL_KEY) === '1' } catch { return false }
}

export function funnelDate(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

/** Adds 1 to one counter. Never throws, never waits. Dev builds and internal devices don't count unless `write` is given. */
export function countFunnel(key, { now, write, storage } = {}) {
  if (!FUNNEL_KEYS.includes(key)) return false
  if (isInternalDevice(storage)) return false
  if (!write && (!import.meta.env.PROD || !db)) return false
  try {
    const w = write || ((date, data) => setDoc(doc(db, 'funnel', date), data, { merge: true }))
    Promise.resolve(w(funnelDate(now), { [key]: increment(1) })).catch(() => {})
    return true
  } catch { return false }
}

/** Counters for the app being loaded (main.jsx, once per page load). */
export function countOpen({ inApp = false, search = '', write, storage } = {}) {
  applyInternalParam(search, storage)
  countFunnel('open', { write, storage })
  if (inApp) countFunnel('open_inapp', { write, storage })
  try {
    const q = new URLSearchParams(search)
    if (q.get('utm_medium') === 'dm') countFunnel('open_dm', { write, storage })
    if (q.get('utm_source') === 'youtube') countFunnel('open_youtube', { write, storage })
  } catch { /* ignore */ }
}

/** A guest who has a habit opens the app on a later day than the first one → return_guest, once a day. */
export function countGuestReturn({ hasHabit, now = new Date(), write, storage = globalThis.localStorage } = {}) {
  if (!hasHabit) return false
  try {
    const today = funnelDate(now)
    const since = storage.getItem('prime_guest_since')
    if (!since) { storage.setItem('prime_guest_since', today); return false }
    if (since >= today || storage.getItem('prime_guest_seen') === today) return false
    storage.setItem('prime_guest_seen', today)
    return countFunnel('return_guest', { now, write, storage })
  } catch { return false }
}
