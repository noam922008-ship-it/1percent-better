import { describe, it, expect } from 'vitest'
import { countsAsWorkout, workoutDaySet, guestWorkoutDays, workoutDayStats } from '../utils/workoutRule'
import he from '../i18n/he'
import en from '../i18n/en'

describe('what counts as a workout', () => {
  it('2 minutes and out does not count', () => {
    expect(countsAsWorkout({ durationSeconds: 120 })).toBe(false)
  })
  it('5 minutes counts', () => {
    expect(countsAsWorkout({ durationSeconds: 300 })).toBe(true)
  })
  it('a finished workout counts even under 5 minutes (quick workouts end at ~4:50)', () => {
    expect(countsAsWorkout({ durationSeconds: 290, finished: true })).toBe(true)
  })
  it('nothing reported → does not count', () => {
    expect(countsAsWorkout()).toBe(false)
  })
})

describe('workout days', () => {
  it('joins the old combat claims and the new workout days, once per day', () => {
    const p = { dailyWorkoutClaims: { '2026-10-01': true, '2026-10-02': true }, workoutDays: { '2026-10-02': true, '2026-10-05': true, '2026-10-06': false } }
    expect([...workoutDaySet(p)].sort()).toEqual(['2026-10-01', '2026-10-02', '2026-10-05'])
  })
  it('guests: days from this device', () => {
    const m = new Map([['prime_workout_done_2026-10-18', '1'], ['prime_workout_day_2026-10-19', '1'], ['other', 'x']])
    const storage = { get length() { return m.size }, key: i => [...m.keys()][i] }
    expect([...guestWorkoutDays(storage)].sort()).toEqual(['2026-10-18', '2026-10-19'])
  })
  it('total, last 7 days and last 30 days', () => {
    const now = Date.parse('2026-10-19T12:00:00Z')
    const days = new Set(['2026-10-19', '2026-10-14', '2026-10-12', '2026-09-25', '2026-08-01'])
    expect(workoutDayStats(days, now)).toEqual({ total: 5, week: 2, month: 4 })
  })
  it('the progress screen has the same labels in both languages', () => {
    for (const k of ['workoutsTitle', 'workoutsTotal', 'workoutsWeek', 'workoutsMonth', 'workoutsRule']) {
      expect(typeof he.progress[k]).toBe('string')
      expect(typeof en.progress[k]).toBe('string')
    }
  })
})
