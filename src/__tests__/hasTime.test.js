import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'
import {
  DAILY_CAP, MINUTE_CHOICES, OPTIONS, optionsFor, loadState, remainingCap, payoutFor, claim, showHasTimeButton,
} from '../utils/hasTime'
import { loadTimer, saveTimer, removeTimer } from '../utils/timerSession'

const memory = () => {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}
const opt = id => OPTIONS.find(o => o.id === id)
const DAY = '2026-10-16'

describe('"יש לי זמן" — options by time', () => {
  it('5 minutes shows only the 5-minute options', () => {
    expect(optionsFor(5).map(o => o.id)).toEqual(['journalStep', 'breathing'])
  })
  it('15 minutes adds lesson, reading, podcast and workout', () => {
    const ids = optionsFor(15).map(o => o.id)
    expect(ids).toEqual(expect.arrayContaining(['lesson', 'reading', 'podcast', 'workout']))
    expect(ids).not.toContain('focus')
  })
  it('30 minutes shows everything and stays a short list', () => {
    expect(optionsFor(30)).toHaveLength(OPTIONS.length)
    expect(OPTIONS.length).toBeLessThanOrEqual(7)
  })
  it('reading (15 min) and focus (30 min) run a timer before they can be claimed', () => {
    expect(opt('reading').timer).toBe(15)
    expect(opt('focus').timer).toBe(30)
  })
  it('every choice has at least 2 options', () => {
    MINUTE_CHOICES.forEach(m => expect(optionsFor(m).length).toBeGreaterThanOrEqual(2))
  })
})

describe('"יש לי זמן" — XP rules', () => {
  it('no option pays more than a workout (so the menu never out-pays it)', () => {
    OPTIONS.forEach(o => expect(o.xp).toBeLessThan(30))
  })
  it('the daily cap is lower than one workout', () => {
    expect(DAILY_CAP).toBeLessThan(30 + 1)
  })
  it('claiming pays the option XP and remembers it', () => {
    const s = memory()
    const { amount, state } = claim(DAY, opt('reading'), s)
    expect(amount).toBe(5)
    expect(state).toEqual({ xp: 5, done: ['reading'] })
    expect(loadState(DAY, s)).toEqual(state)
  })
  it('the same option pays once a day', () => {
    const s = memory()
    claim(DAY, opt('reading'), s)
    expect(claim(DAY, opt('reading'), s).amount).toBe(0)
    expect(loadState(DAY, s).xp).toBe(5)
  })
  it('the cap stops the bonus and still marks the option done', () => {
    const s = memory()
    claim(DAY, opt('focus'), s)       // 10
    claim(DAY, opt('reading'), s)     // 15
    claim(DAY, opt('podcast'), s)     // 20
    claim(DAY, opt('lesson'), s)      // 25
    claim(DAY, opt('journalStep'), s) // 30
    expect(remainingCap(loadState(DAY, s))).toBe(0)
    const last = claim(DAY, opt('breathing'), s)
    expect(last.amount).toBe(0)
    expect(last.state.done).toContain('breathing')
    expect(last.state.xp).toBe(DAILY_CAP)
  })
  it('a partial payout is trimmed to what is left under the cap', () => {
    expect(payoutFor({ xp: 28, done: [] }, opt('reading'))).toBe(2)
  })
  it('the workout option never pays from the menu', () => {
    expect(claim(DAY, opt('workout'), memory()).amount).toBe(0)
  })
  it('a new day starts fresh', () => {
    const s = memory()
    claim(DAY, opt('reading'), s)
    expect(loadState('2026-10-17', s)).toEqual({ xp: 0, done: [] })
  })
  it('unreadable or broken storage falls back to a fresh day', () => {
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    expect(loadState(DAY, broken)).toEqual({ xp: 0, done: [] })
    expect(claim(DAY, opt('reading'), broken).amount).toBe(5)
    const junk = { getItem: () => '{"xp":"x"}', setItem: () => {} }
    expect(loadState(DAY, junk)).toEqual({ xp: 0, done: [] })
  })
})

describe('"יש לי זמן" — when the button shows', () => {
  it('only once today\'s main work is finished', () => {
    expect(showHasTimeButton('all-done')).toBe(true)
    expect(showHasTimeButton('no-tasks')).toBe(true)
    expect(showHasTimeButton('track')).toBe(false)
    expect(showHasTimeButton('habit')).toBe(false)
  })
})

describe('"יש לי זמן" — copy', () => {
  it('every option has a name and description in both languages', () => {
    OPTIONS.forEach(o => {
      expect(he.hasTime.options[o.id].name).toBeTruthy()
      expect(he.hasTime.options[o.id].desc).toBeTruthy()
      expect(en.hasTime.options[o.id].name).toBeTruthy()
      expect(en.hasTime.options[o.id].desc).toBeTruthy()
    })
  })
})

describe('"יש לי זמן" — timer survives closing the app', () => {
  const NOW = 1_800_000_000_000
  const t0  = { id: 'focus', startedAt: NOW, endsAt: NOW + 30 * 60000 }
  it('a saved timer comes back with the same end time', () => {
    const s = memory()
    saveTimer(t0, s)
    expect(loadTimer(NOW + 10 * 60000, s)).toEqual(t0)
  })
  it('a timer that already ended is still returned (so "done" can be pressed)', () => {
    const s = memory()
    saveTimer(t0, s)
    expect(loadTimer(NOW + 45 * 60000, s)).toEqual(t0)
  })
  it('a timer forgotten for more than 12 hours is dropped', () => {
    const s = memory()
    saveTimer(t0, s)
    expect(loadTimer(NOW + 14 * 3600 * 1000, s)).toBeNull()
  })
  it('removeTimer clears it', () => {
    const s = { ...memory(), removeItem() {} }
    const m = new Map()
    const store = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }
    saveTimer(t0, store)
    removeTimer(store)
    expect(loadTimer(NOW, store)).toBeNull()
    expect(s).toBeTruthy()
  })
  it('broken or junk storage means no timer', () => {
    const broken = { getItem: () => { throw new Error('blocked') } }
    expect(loadTimer(NOW, broken)).toBeNull()
    expect(loadTimer(NOW, { getItem: () => '{"id":5}' })).toBeNull()
  })
})
