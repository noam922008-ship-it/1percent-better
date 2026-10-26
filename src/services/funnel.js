// Funnel counters without cookies: funnel/{UTC date} = { open: n, guest_start: n, … }.
// Only whole-number counts per day. Nothing about the person: no id, no device storage, no
// text — so it works for everyone, including people who never turn Google Analytics on
// (GA only loads after consent, so most visitors never show up there).
// Each call adds 1 to one known counter; firestore.rules allow exactly that and no reads.
// Read the numbers in the Firebase console (Firestore → funnel).

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
]

export function funnelDate(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

/** Adds 1 to one counter. Never throws, never waits. Dev builds don't count unless `write` is given. */
export function countFunnel(key, { now, write } = {}) {
  if (!FUNNEL_KEYS.includes(key)) return false
  if (!write && (!import.meta.env.PROD || !db)) return false
  try {
    const w = write || ((date, data) => setDoc(doc(db, 'funnel', date), data, { merge: true }))
    Promise.resolve(w(funnelDate(now), { [key]: increment(1) })).catch(() => {})
    return true
  } catch { return false }
}

/** Counters for the app being loaded (main.jsx, once per page load). */
export function countOpen({ inApp = false, search = '', write } = {}) {
  countFunnel('open', { write })
  if (inApp) countFunnel('open_inapp', { write })
  try { if (new URLSearchParams(search).get('utm_medium') === 'dm') countFunnel('open_dm', { write }) } catch {}
}
