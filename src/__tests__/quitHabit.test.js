import { describe, it, expect } from 'vitest'
import { isQuit, quitDays, quitBest, quitTitle, newQuitHabit, slipQuit } from '../utils/quitHabit'
import { isWeekly } from '../utils/habitSchedule'
import he from '../i18n/he'
import en from '../i18n/en'

describe('quit habits', () => {
  it('a new quit habit starts today at day 0 and is neither daily nor weekly', () => {
    const h = newQuitHabit('בלי סוכר', '2026-10-26')
    expect(isQuit(h)).toBe(true)
    expect(isWeekly(h)).toBe(false)
    expect(quitDays(h, '2026-10-26')).toBe(0)
    expect(quitDays(h, '2026-10-31')).toBe(5)
    expect(isQuit({ frequency: { type: 'daily' } })).toBe(false)
  })

  it('counts across a DST change and month ends', () => {
    const h = newQuitHabit('x', '2026-03-25')
    expect(quitDays(h, '2026-04-02')).toBe(8)
  })

  it('slipping restarts from today, keeps the best run and counts slips', () => {
    const h = newQuitHabit('x', '2026-10-01')
    const s1 = slipQuit(h, '2026-10-13')           // 12 clean days
    expect(quitDays(s1, '2026-10-13')).toBe(0)
    expect(s1.quitBest).toBe(12)
    expect(s1.slips).toBe(1)
    const s2 = slipQuit(s1, '2026-10-16')          // only 3 — best stays 12
    expect(s2.quitBest).toBe(12)
    expect(s2.slips).toBe(2)
    expect(quitBest(s2, '2026-11-05')).toBe(20)    // current run beats it
  })

  it('a missing or future start counts 0', () => {
    expect(quitDays({}, '2026-10-26')).toBe(0)
    expect(quitDays({ quitStart: '2026-11-01' }, '2026-10-26')).toBe(0)
  })

  it('title gets the prefix once', () => {
    expect(quitTitle('סוכר', 'בלי ')).toBe('בלי סוכר')
    expect(quitTitle('בלי סוכר', 'בלי ')).toBe('בלי סוכר')
    expect(quitTitle('Sugar', 'No ')).toBe('No Sugar')
    expect(quitTitle('no sugar', 'No ')).toBe('no sugar')
    expect(quitTitle('   ', 'No ')).toBe('')
  })

  it('he and en have the same quit copy', () => {
    expect(he.habitFlow.quitSuggestions.length).toBe(en.habitFlow.quitSuggestions.length)
    expect(Object.keys(he.home.quit).sort()).toEqual(Object.keys(en.home.quit).sort())
  })
})
