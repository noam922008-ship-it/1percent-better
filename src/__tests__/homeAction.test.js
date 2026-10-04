import { describe, it, expect } from 'vitest'
import { homeActionType } from '../utils/homeAction'

const base = { activeTrack: null, trackDoneToday: false, firstUndoneHabit: null, dailyHabitCount: 0 }

describe('homeActionType — the top card on Home', () => {
  it('no habits at all → no card', () => {
    expect(homeActionType(base)).toBe('no-tasks')
  })

  it('only weekly habits (new user with "3 times a week") → no "all done"', () => {
    expect(homeActionType({ ...base, dailyHabitCount: 0 })).toBe('no-tasks')
  })

  it('a daily habit not done yet → that habit', () => {
    expect(homeActionType({ ...base, dailyHabitCount: 1, firstUndoneHabit: { id: 't1' } })).toBe('habit')
  })

  it('all daily habits done → "all done"', () => {
    expect(homeActionType({ ...base, dailyHabitCount: 2 })).toBe('all-done')
  })

  it('active track not done today → track; done and no daily habits → "all done"', () => {
    expect(homeActionType({ ...base, activeTrack: { id: 'x' } })).toBe('track')
    expect(homeActionType({ ...base, activeTrack: { id: 'x' }, trackDoneToday: true })).toBe('all-done')
  })
})
