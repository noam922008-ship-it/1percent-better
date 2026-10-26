// "Quit a bad habit" — a habit (trigger) with frequency = { type: 'quit' }.
// No daily check-in: the clean-day count goes up on its own from quitStart (local YYYY-MM-DD).
// "I slipped" restarts the count from today and keeps the best run (quitBest) and a slip count.
// Quit habits are not part of "done today", the daily streak or the habit reminders.

import { getLocalDateKey } from './localDate'

export const isQuit = tr => tr?.frequency?.type === 'quit'

const parseKey = key => {
  const [y, m, d] = String(key).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days since quitStart (0 on the first day). */
export function quitDays(tr, today = getLocalDateKey()) {
  if (!tr?.quitStart) return 0
  const n = Math.round((parseKey(today) - parseKey(tr.quitStart)) / 86400000)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Best run so far, the current one included. */
export function quitBest(tr, today = getLocalDateKey()) {
  return Math.max(Number(tr?.quitBest) || 0, quitDays(tr, today))
}

/** "בלי " + text, unless the text already starts with the prefix. */
export function quitTitle(text, prefix) {
  const s = String(text || '').trim()
  if (!s) return ''
  const p = String(prefix || '').trim()
  return p && s.toLowerCase().startsWith(p.toLowerCase()) ? s : `${prefix}${s}`
}

export function newQuitHabit(title, today = getLocalDateKey()) {
  return {
    cue: title, habit: title, source: 'quit', createdAt: today,
    frequency: { type: 'quit' }, days: [], time: null,
    quitStart: today, quitBest: 0, slips: 0,
  }
}

export function slipQuit(tr, today = getLocalDateKey()) {
  return { ...tr, quitBest: quitBest(tr, today), quitStart: today, slips: (Number(tr?.slips) || 0) + 1 }
}
