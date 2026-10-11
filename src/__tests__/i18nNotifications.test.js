import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../services/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ doc: () => ({}), getDoc: async () => ({}), setDoc: async () => {} }))

import { fireEveningRecap, fireTriggerNotif, fireNudge, checkNotifications } from '../services/notificationService'
import he from '../i18n/he'
import en from '../i18n/en'
import { readFileSync } from 'node:fs'

const HEBREW = /[֐-׿]/
let shown

beforeEach(() => {
  shown = []
  localStorage.clear()
  globalThis.Notification = class {
    static permission = 'granted'
    constructor(title, opts) { shown.push({ title, ...opts }) }
  }
})
afterEach(() => { vi.useRealTimers(); delete globalThis.Notification })

const today = () => new Date().toISOString().slice(0, 10)
const checkIn = ids => localStorage.setItem(`ft_checkins_${today()}`, JSON.stringify(Object.fromEntries(ids.map(i => [i, true]))))
const recap = (triggers, lang, name = 'דנה') => {
  localStorage.removeItem(`ft_recap_${today()}`)
  shown = []
  fireEveningRecap({ name }, triggers, lang)
  return shown[0]
}
const T = ids => ids.map(id => ({ id }))

describe('evening recap', () => {
  it('Hebrew: new wording, habits instead of triggers, singular for one habit', () => {
    expect(recap([], 'he')).toMatchObject({ title: '🌙 סיכום יומי', body: 'לא הגדרת הרגלים להיום. מחר מתחילים מחדש 💪' })
    checkIn(['a'])
    expect(recap(T(['a']), 'he').body).toBe('כל הכבוד, דנה! 🎉 השלמת את ההרגל של היום.\nאיך אתה מרגיש?')
    checkIn(['a', 'b'])
    expect(recap(T(['a', 'b']), 'he').body).toBe('כל הכבוד, דנה! 🎉 השלמת את כל 2 ההרגלים היום.\nאיך אתה מרגיש?')
    expect(recap(T(['a', 'b', 'c']), 'he').body).toBe('השלמת 2 מתוך 3 הרגלים היום, דנה.\nאיך אתה מרגיש?')
    checkIn([])
    expect(recap(T(['a']), 'he').body).toBe('עדיין לא השלמת הרגלים היום, דנה. עוד לא מאוחר מדי 🌙\nאיך אתה מרגיש?')
  })

  it('Hebrew is the default when no lang is passed', () => {
    fireEveningRecap({}, [])
    expect(shown[0].body).toBe(he.notify.recap.none)
  })

  it('English: every case, no Hebrew', () => {
    const bodies = []
    bodies.push(recap([], 'en', 'Sam'))
    checkIn(['a']);      bodies.push(recap(T(['a']), 'en', 'Sam'))
    checkIn(['a', 'b']); bodies.push(recap(T(['a', 'b']), 'en', 'Sam'), recap(T(['a', 'b', 'c']), 'en', 'Sam'))
    checkIn([]);         bodies.push(recap(T(['a']), 'en', 'Sam'))
    for (const n of bodies) {
      expect(n.title).toBe('🌙 Daily recap')
      expect(n.body).not.toMatch(HEBREW)
    }
    expect(bodies[1].body).toBe("Well done, Sam! 🎉 You completed today's habit.\nHow do you feel?")
    expect(bodies[3].body).toBe('You completed 2 of 3 habits today, Sam.\nHow do you feel?')
  })
})

describe('habit reminder', () => {
  it('title and goal line in each language', () => {
    fireTriggerNotif({ id: 'h1', cue: 'cue', habit: 'habit' }, { focusGoal: 'fitness' }, 'he')
    fireTriggerNotif({ id: 'h2', cue: 'cue', habit: 'habit' }, { focusGoal: 'fitness' }, 'en')
    expect(shown[0]).toMatchObject({ title: '⚡ זמן להרגל שלך', body: 'cue\n→ habit\n\nיעד: כושר 💪' })
    expect(shown[1]).toMatchObject({ title: '⚡ Time for your habit', body: 'cue\n→ habit\n\nGoal: Fitness 💪' })
  })

  it('goal labels exist for the same ids in both languages', () => {
    expect(Object.keys(en.notify.goals)).toEqual(Object.keys(he.notify.goals))
  })
})

describe('check-in nudge', () => {
  it('gap line and action buttons follow the language', async () => {
    const showNotification = vi.fn()
    Object.defineProperty(navigator, 'serviceWorker', { value: { ready: Promise.resolve({ showNotification }) }, configurable: true })
    try {
      await fireNudge('run', { the_gap: 'gap' }, 'u1', 'en')
      await fireNudge('read', { the_gap: 'gap' }, 'u1', 'he')
    } finally {
      delete navigator.serviceWorker
    }
    const [enCall, heCall] = showNotification.mock.calls
    expect(enCall[1].body).toBe('run\nThe gap: gap')
    expect(enCall[1].actions.map(a => a.title)).toEqual(['✅ Done', '⏰ In an hour', '🆘 I need help'])
    expect(heCall[1].body).toBe('read\nהפער: gap')
    expect(heCall[1].actions.map(a => a.title)).toEqual(['✅ עשיתי', '⏰ בעוד שעה', '🆘 צריך עזרה'])
  })
})

describe('checkNotifications passes the language on', () => {
  it('morning nudge, habit reminder and recap in English', () => {
    vi.useFakeTimers()
    const profile = { name: 'Sam', streak: { count: 0 } }
    const triggers = [{ id: 'h1', cue: 'After coffee', habit: 'Read', time: '09:15' }]
    for (const t of ['08:00', '09:15', '20:00']) {
      vi.setSystemTime(new Date(`2026-10-11T${t}:00`))
      checkNotifications(triggers, profile, '20:00', '08:00', {}, 'en')
    }
    expect(shown).toHaveLength(3)
    for (const n of shown) {
      expect(n.title).not.toMatch(HEBREW)
      expect(n.body).not.toMatch(HEBREW)
    }
  })
})

describe('notify strings', () => {
  it('English has no Hebrew; no old wording in Hebrew', () => {
    expect(JSON.stringify(en.notify)).not.toMatch(HEBREW)
    expect(JSON.stringify(he.notify)).not.toMatch(/טריגר|מונק|1%/)
  })

  it('notificationService.js has no Hebrew of its own', () => {
    expect(readFileSync('src/services/notificationService.js', 'utf8')).not.toMatch(HEBREW)
  })
})
