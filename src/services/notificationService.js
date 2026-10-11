import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getEffectiveStreak } from '../utils/streak'
import { isWeekly, timesPerWeek, weekKeys, weeklyDone, doneOn, isReminderDay } from '../utils/habitSchedule'
import { getLocalDateKey } from '../utils/localDate'
import he from '../i18n/he'
import en from '../i18n/en'
import { fmt } from '../i18n/fmt'

const todayKey = () => new Date().toISOString().slice(0, 10)

// Notification copy for lang ('he' default — the app's language when nothing is passed)
const copyFor = lang => (lang === 'en' ? en : he)

// ── localStorage helpers ───────────────────────────────────────────

const getNotifSet = () => {
  try { return new Set(JSON.parse(localStorage.getItem(`ft_notified_${todayKey()}`)) || []) }
  catch { return new Set() }
}

const markNotified = id => {
  try {
    const s = getNotifSet()
    s.add(id)
    localStorage.setItem(`ft_notified_${todayKey()}`, JSON.stringify([...s]))
  } catch {}
}

const getCheckins = () => {
  try { return JSON.parse(localStorage.getItem(`ft_checkins_${todayKey()}`)) || {} }
  catch { return {} }
}

// ── Nudge cooldown / snooze ────────────────────────────────────────

const NUDGE_COOLDOWN_MS = 4 * 60 * 60 * 1000

function nudgeKey(nn) {
  return `nn_${nn.replace(/\s+/g, '_').slice(0, 30)}`
}

function getLastNudgeTime(key) {
  try { return parseInt(localStorage.getItem(`prime_nudge_ts_${key}`)) || 0 }
  catch { return 0 }
}

function setLastNudgeTime(key) {
  try { localStorage.setItem(`prime_nudge_ts_${key}`, String(Date.now())) }
  catch {}
}

function getSnoozedUntil(key) {
  try { return parseInt(localStorage.getItem(`prime_nudge_snooze_${key}`)) || 0 }
  catch { return 0 }
}

export function snoozeNudge(nn, ms = 60 * 60 * 1000) {
  const key = nudgeKey(nn)
  try { localStorage.setItem(`prime_nudge_snooze_${key}`, String(Date.now() + ms)) }
  catch {}
}

export function markNudgeDone(nn) {
  const key = nudgeKey(nn)
  try { localStorage.setItem(`prime_nudge_done_${todayKey()}_${key}`, '1') }
  catch {}
}

function isNudgeDoneToday(key) {
  try { return !!localStorage.getItem(`prime_nudge_done_${todayKey()}_${key}`) }
  catch { return false }
}

function canNudge(key) {
  if (isNudgeDoneToday(key)) return false
  const snoozed = getSnoozedUntil(key)
  if (snoozed > Date.now()) return false
  return Date.now() - getLastNudgeTime(key) >= NUDGE_COOLDOWN_MS
}

// ── Firebase ───────────────────────────────────────────────────────

export async function loadVisionProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'userPaths', uid))
    return snap.exists() ? (snap.data()?.vision_profile || null) : null
  } catch { return null }
}

export async function saveNudgeResponse(uid, habitLabel, response) {
  if (!uid || !habitLabel) return
  try {
    await setDoc(
      doc(db, 'nudgeResponses', `${uid}_${todayKey()}`),
      { uid, date: todayKey(), responses: [{ habitLabel, response, ts: Date.now() }] },
      { merge: true }
    )
  } catch {}
}

// ── Show notification (SW path for action buttons) ─────────────────

async function showNotification(title, options) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch {}
  }
  // fallback — no action buttons
  new Notification(title, { body: options.body, icon: options.icon, tag: options.tag })
}

// ── Prime Nudge ────────────────────────────────────────────────────

export async function fireNudge(nn, visionProfile, uid, lang = 'he') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const key = nudgeKey(nn)
  if (!canNudge(key)) return
  setLastNudgeTime(key)

  const vision = visionProfile?.three_year_vision || ''
  const gap    = visionProfile?.the_gap || ''

  const n_   = copyFor(lang).notify
  const trim = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s

  let body = nn
  if (vision) body += `\n\n💭 "${trim(vision, 65)}"`
  if (gap)    body += `\n${fmt(n_.gap, { gap: trim(gap, 55) })}`

  await showNotification(n_.checkinTitle, {
    body,
    icon: '/favicon.svg',
    tag:  `nudge_${key}`,
    data: { habitLabel: nn, uid: uid || '' },
    requireInteraction: true,
    actions: [
      { action: 'done',  title: n_.actions.done },
      { action: 'later', title: n_.actions.later },
      { action: 'help',  title: n_.actions.help },
    ],
  })
}

export function isNudgesEnabled() {
  try { return localStorage.getItem('prime_nudges_enabled') !== 'false' }
  catch { return true }
}

// ── Dev-only test hook ─────────────────────────────────────────────
// Call window.__primeFire() in the browser console. The next interval
// tick (within 60s) will fire the morning nudge as if it were 08:00,
// bypassing time and cooldown checks. Stripped from production builds.

let _devFireOnNextTick = false

export function __devQueueTestNudge() {
  if (import.meta.env.PROD) return
  _devFireOnNextTick = true
  try {
    const today = todayKey()
    localStorage.removeItem(`ft_nudge_${today}`)
    localStorage.removeItem(`ft_recap_${today}`)
    for (const k of Object.keys(localStorage)) {
      if (
        k.startsWith('prime_nudge_ts_') ||
        k.startsWith(`prime_nudge_done_${today}`) ||
        k.startsWith('prime_nudge_snooze_')
      ) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
  console.log('[PRIME DEV] Nudge queued — fires on next 60s interval tick')
}

// ── Check nudges (called every 60s from Dashboard) ─────────────────

export async function checkNudges(visionProfile, uid, lang = 'he') {
  if (!isNudgesEnabled()) return
  if (!visionProfile) return
  const nns = visionProfile.non_negotiables
  if (!Array.isArray(nns) || nns.length === 0) return

  const hour = new Date().getHours()
  // Nudge windows: 10:00–10:05 and 16:00–16:05
  if (hour !== 10 && hour !== 16) return

  for (const nn of nns) {
    if (typeof nn !== 'string' || !nn.trim()) continue
    await fireNudge(nn.trim(), visionProfile, uid, lang)
  }
}

// ── Existing exports (unchanged) ────────────────────────────────────

export function requestPermission() {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') Notification.requestPermission()
}

export function fireTriggerNotif(trigger, profile, lang = 'he') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const notified = getNotifSet()
  if (notified.has(trigger.id)) return
  markNotified(trigger.id)

  const n_        = copyFor(lang).notify
  const vision    = profile?.vision
  const goalLabel = n_.goals[profile?.focusGoal] || ''

  let body = `${trigger.cue}\n→ ${trigger.habit}`
  if (vision) {
    const snippet = vision.length > 55 ? vision.slice(0, 52) + '…' : vision
    body += `\n\n💭 "${snippet}"`
  } else if (goalLabel) {
    body += `\n\n${fmt(n_.goal, { goal: goalLabel })}`
  }

  new Notification(n_.habitTitle, { body, icon: '/favicon.svg', tag: trigger.id })
}

export function fireEveningRecap(profile, triggers, lang = 'he') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const recapKey = `ft_recap_${todayKey()}`
  if (localStorage.getItem(recapKey)) return
  localStorage.setItem(recapKey, '1')

  const checkins  = getCheckins()
  const doneCount = triggers.filter(t => checkins[t.id]).length
  const total     = triggers.length
  const name      = profile?.name ? `, ${profile.name}` : ''

  const n_   = copyFor(lang).notify
  const r    = total === 0 ? n_.recap.none
             : doneCount === total ? (total === 1 ? n_.recap.allOne : n_.recap.all)
             : doneCount === 0 ? n_.recap.zero
             : n_.recap.some
  const body = fmt(r, { name, total, done: doneCount })

  new Notification(n_.recapTitle, { body, icon: '/favicon.svg', tag: 'evening-recap' })
}

// lang: 'he' (default — the in-app nudge below) or 'en'. Copy lives in t.nudge.
export function getDailyNudgeMessage(name, streak, lang = 'he') {
  const m = copyFor(lang).nudge
  const vars = { n: streak, name: name ? `, ${name}` : '' }
  const pick = streak >= 30 ? m.d30 : streak >= 14 ? m.d14 : streak >= 7 ? m.d7 : streak >= 3 ? m.d3 : streak === 1 ? m.d1 : m.start
  return { title: fmt(pick.title, vars), body: fmt(pick.body, vars) }
}

// weekLog: weekly-habit check-ins for this local week ({ [localDate]: { [id]: true } }).
// Only runs while the app is open (foreground) — see CLAUDE.md for the iPhone limits.
export function checkNotifications(triggers, profile, recapTime = '20:00', nudgeTime = '08:00', weekLog = {}, lang = 'he') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const devFire = _devFireOnNextTick
  if (devFire) _devFireOnNextTick = false

  const now  = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const checkins = getCheckins()

  // Morning streak nudge
  if (hhmm === nudgeTime || devFire) {
    const nudgeKey = `ft_nudge_${todayKey()}`
    if (!localStorage.getItem(nudgeKey)) {
      localStorage.setItem(nudgeKey, '1')
      const streak  = getEffectiveStreak(profile)
      const { title, body } = getDailyNudgeMessage(profile?.name, streak, lang)
      new Notification(title, { body, icon: '/favicon.svg', tag: 'daily-nudge' })
    }
  }

  // Contextual trigger-time notifications
  const localToday = getLocalDateKey(now)
  triggers.forEach(tr => {
    if (!tr.time || tr.time !== hhmm) return
    if (isWeekly(tr)) {
      // Weekly: only on chosen days, not if done today, not once this week's target is reached
      if (!isReminderDay(tr, localToday)) return
      if (doneOn(tr, weekLog, localToday)) return
      if (weeklyDone(tr, weekLog, weekKeys(localToday)) >= timesPerWeek(tr)) return
    } else if (checkins[tr.id]) return
    fireTriggerNotif(tr, profile, lang)
  })

  // Evening recap
  if (hhmm === recapTime) {
    fireEveningRecap(profile, triggers.filter(tr => !isWeekly(tr)), lang)   // recap counts today's daily habits
  }
}
