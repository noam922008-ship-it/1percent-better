import { describe, it, expect } from 'vitest'
import {
  isWeekly, timesPerWeek, weekKeys, weeklyDone, doneOn, isReminderDay,
  frequencyLabel, normalizeSchedule, normalizeDays, normalizeTime,
} from '../utils/habitSchedule'

const run = { id: 'r1', cue: 'ריצה', frequency: { type: 'weekly', timesPerWeek: 3 }, days: [0, 2, 4] }
const old = { id: 't1', cue: 'כשאני מתעורר', habit: 'מודה אני' }   // existing habit, no frequency

describe('weekKeys', () => {
  it('runs Sunday to Saturday around the given day', () => {
    // 2026-09-28 is a Monday
    expect(weekKeys('2026-09-28')).toEqual([
      '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03',
    ])
  })
  it('a Sunday starts its own week, a Saturday ends it', () => {
    expect(weekKeys('2026-09-27')[0]).toBe('2026-09-27')
    expect(weekKeys('2026-10-03')[0]).toBe('2026-09-27')
    expect(weekKeys('2026-10-04')[0]).toBe('2026-10-04')
  })
  it('crosses month and year boundaries', () => {
    expect(weekKeys('2027-01-01')).toEqual([
      '2026-12-27', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02',
    ])
  })
  it('is stable across the Israel DST change (2026-10-25)', () => {
    expect(weekKeys('2026-10-26')).toEqual([
      '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31',
    ])
  })
})

describe('weekly progress', () => {
  const log = {
    '2026-09-26': { r1: true },          // previous Saturday — not this week
    '2026-09-27': { r1: true },
    '2026-09-29': { r1: true, t1: true },
  }
  it('counts only days in this week', () => {
    expect(weeklyDone(run, log, weekKeys('2026-09-30'))).toBe(2)
    expect(weeklyDone(run, log, weekKeys('2026-10-04'))).toBe(0)   // new week resets
  })
  it('knows whether it was done on a given day', () => {
    expect(doneOn(run, log, '2026-09-29')).toBe(true)
    expect(doneOn(run, log, '2026-09-30')).toBe(false)
  })
})

describe('habit type and reminders', () => {
  it('existing habits without frequency are daily', () => {
    expect(isWeekly(old)).toBe(false)
    expect(isWeekly({ frequency: { type: 'daily' } })).toBe(false)
    expect(isWeekly(run)).toBe(true)
    expect(frequencyLabel(old)).toBe('כל יום')
  })
  it('clamps times per week to 1..6', () => {
    expect(timesPerWeek({ frequency: { timesPerWeek: 0 } })).toBe(1)
    expect(timesPerWeek({ frequency: { timesPerWeek: 9 } })).toBe(6)
    expect(timesPerWeek(run)).toBe(3)
  })
  it('reminds only on chosen days, or every day when none are chosen', () => {
    expect(isReminderDay(run, '2026-09-27')).toBe(true)   // Sunday
    expect(isReminderDay(run, '2026-09-28')).toBe(false)  // Monday
    expect(isReminderDay({ ...run, days: [] }, '2026-09-28')).toBe(true)
    expect(isReminderDay(old, '2026-09-28')).toBe(true)
  })
  it('labels weekly habits in Hebrew', () => {
    expect(frequencyLabel(run)).toBe('3 פעמים בשבוע · א׳ ג׳ ה׳')
    expect(frequencyLabel({ frequency: { type: 'weekly', timesPerWeek: 2 } })).toBe('פעמיים בשבוע')
    expect(frequencyLabel({ frequency: { type: 'weekly', timesPerWeek: 1 } })).toBe('פעם בשבוע')
  })
})

describe('normalizing form input', () => {
  it('cleans days and time', () => {
    expect(normalizeDays([4, '2', 2, 9, -1, 'x'])).toEqual([2, 4])
    expect(normalizeTime('07:30')).toBe('07:30')
    expect(normalizeTime('7:30')).toBeNull()
    expect(normalizeTime('25:00')).toBeNull()
  })
  it('builds a weekly or daily schedule', () => {
    expect(normalizeSchedule({ weekly: true, times: 2, days: [5, 1], time: '18:00' }))
      .toEqual({ frequency: { type: 'weekly', timesPerWeek: 2 }, days: [1, 5], time: '18:00' })
    expect(normalizeSchedule({ weekly: false, times: 3, days: [1], time: '' }))
      .toEqual({ frequency: { type: 'daily' }, days: [], time: null })
  })
})
