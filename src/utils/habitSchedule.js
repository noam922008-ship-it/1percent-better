// Weekly habits — pure helpers. A habit (trigger) is weekly when
// frequency = { type: 'weekly', timesPerWeek: 1..6 }; no frequency means daily (existing habits).
// Weeks run Sunday → Saturday on local date keys (getLocalDateKey, like My Tasks).
// days: optional [0..6] (0 = Sunday) — only decides on which days a reminder fires.

import { getLocalDateKey } from './localDate'
import he from '../i18n/he'
import { plural } from '../i18n/fmt'

export const MAX_TIMES_PER_WEEK = 6
export const MAX_ACTIVE_HABITS  = 5
export const DAY_LABELS = he.habitSchedule.days   // Hebrew; screens use t.habitSchedule.days

const parseKey = key => {
  const [y, m, d] = String(key).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isWeekly(tr) {
  return tr?.frequency?.type === 'weekly'
}

export function timesPerWeek(tr) {
  const n = Math.round(Number(tr?.frequency?.timesPerWeek) || 0)
  return Math.min(Math.max(n, 1), MAX_TIMES_PER_WEEK)
}

// The 7 local date keys (Sunday → Saturday) of the week that contains dateKey.
export function weekKeys(dateKey = getLocalDateKey()) {
  const d = parseKey(dateKey)
  d.setDate(d.getDate() - d.getDay())            // back to Sunday (setDate is DST-safe)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i)
    return getLocalDateKey(day)
  })
}

// log: { [dateKey]: { [triggerId]: true } }
export function weeklyDone(tr, log, keys = weekKeys()) {
  return keys.filter(k => log?.[k]?.[tr.id] === true).length
}

export function doneOn(tr, log, dateKey = getLocalDateKey()) {
  return log?.[dateKey]?.[tr.id] === true
}

export function isReminderDay(tr, dateKey = getLocalDateKey()) {
  const days = Array.isArray(tr?.days) ? tr.days : []
  if (!days.length) return true
  return days.includes(parseKey(dateKey).getDay())
}

// "כל יום" / "3 פעמים בשבוע" (+ days, e.g. "· א׳ ג׳ ה׳"). s = t.habitSchedule (default Hebrew).
export function frequencyLabel(tr, s = he.habitSchedule) {
  if (!isWeekly(tr)) return s.everyDay
  const base = plural(s.perWeek, timesPerWeek(tr))
  const days = normalizeDays(tr.days)
  return days.length ? `${base} · ${days.map(i => s.days[i]).join(' ')}` : base
}

export function normalizeDays(days) {
  if (!Array.isArray(days)) return []
  return [...new Set(days.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 6))].sort()
}

export function normalizeTime(t) {
  return typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : null
}

// Clean schedule fields from the creation/edit form. Daily habits drop days.
export function normalizeSchedule({ weekly, times, days, time }) {
  return weekly
    ? { frequency: { type: 'weekly', timesPerWeek: timesPerWeek({ frequency: { timesPerWeek: times } }) }, days: normalizeDays(days), time: normalizeTime(time) }
    : { frequency: { type: 'daily' }, days: [], time: normalizeTime(time) }
}
