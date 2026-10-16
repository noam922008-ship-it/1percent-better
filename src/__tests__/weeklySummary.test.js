import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'
import { weeklySummary, weekStartOf, isSummaryDay, readWorkoutDays, wasDismissed, dismiss } from '../utils/weeklySummary'

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) } }
// 2026-10-18 is a Sunday
const SUN = '2026-10-18'
const MON = '2026-10-19'

describe('week boundaries', () => {
  it('weeks start on Sunday', () => {
    expect(weekStartOf('2026-10-18')).toBe('2026-10-18')
    expect(weekStartOf('2026-10-24')).toBe('2026-10-18')
    expect(weekStartOf('2026-10-21')).toBe('2026-10-18')
  })
  it('shows on Sunday and Monday only', () => {
    expect(isSummaryDay(SUN)).toBe(true)
    expect(isSummaryDay(MON)).toBe(true)
    expect(isSummaryDay('2026-10-20')).toBe(false)
    expect(isSummaryDay('2026-10-24')).toBe(false)
  })
})

describe('weeklySummary — last week, Sunday → Saturday', () => {
  const log = ['2026-10-11', '2026-10-13', '2026-10-17', '2026-10-18', /* week before: */ '2026-10-05', '2026-10-07', '2026-10-08', '2026-10-09']
  it('counts last week on Sunday and on Monday the same way', () => {
    for (const today of [SUN, MON]) {
      const s = weeklySummary({ today, activityLog: log, streak: 2 })
      expect(s.weekStart).toBe('2026-10-11')
      expect(s.weekEnd).toBe('2026-10-17')
      expect(s.days.map(d => d.active)).toEqual([true, false, true, false, false, false, true])
      expect(s.activeDays).toBe(3)
      expect(s.prevActiveDays).toBe(4)
      expect(s.trend).toBe('down')
      expect(s.streak).toBe(2)
    }
  })
  it('today (Sunday) does not count toward last week', () => {
    expect(weeklySummary({ today: SUN, activityLog: ['2026-10-18'] }).activeDays).toBe(0)
  })
  it('trend up / same / first', () => {
    expect(weeklySummary({ today: SUN, activityLog: ['2026-10-12', '2026-10-13', '2026-10-06'] }).trend).toBe('up')
    expect(weeklySummary({ today: SUN, activityLog: ['2026-10-12', '2026-10-06'] }).trend).toBe('same')
    expect(weeklySummary({ today: SUN, activityLog: ['2026-10-12'] }).trend).toBe('first')
  })
  it('workouts only inside last week', () => {
    const s = weeklySummary({ today: SUN, workoutDays: ['2026-10-11', '2026-10-16', '2026-10-09', '2026-10-18'] })
    expect(s.workouts).toBe(2)
  })
  it('bad streak values → 0', () => {
    expect(weeklySummary({ today: SUN, streak: undefined }).streak).toBe(0)
    expect(weeklySummary({ today: SUN, streak: -3 }).streak).toBe(0)
  })
})

describe('storage helpers', () => {
  it('reads workout days from localStorage keys', () => {
    const s = memory()
    s.setItem('prime_workout_done_2026-10-16', 'true')
    s.setItem('prime_workout_done_2026-10-18', 'true')   // today — not "before today"
    expect(readWorkoutDays(SUN, s)).toEqual(['2026-10-16'])
  })
  it('dismissed per week', () => {
    const s = memory()
    expect(wasDismissed('2026-10-11', s)).toBe(false)
    dismiss('2026-10-11', s)
    expect(wasDismissed('2026-10-11', s)).toBe(true)
    expect(wasDismissed('2026-10-18', s)).toBe(false)
  })
})

describe('copy', () => {
  it('7 day labels and every trend in both languages', () => {
    for (const t of [he, en]) {
      expect(t.weekly.days).toHaveLength(7)
      for (const k of ['up', 'down', 'same', 'first']) expect(t.weekly.trend[k]).toBeTruthy()
    }
  })
})
