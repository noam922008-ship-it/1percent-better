import { describe, it, expect, vi } from 'vitest'
import { nextHabitStreak, saveHabitStreak } from '../utils/habitStreak'

const NOW = new Date('2026-10-04T12:00:00Z')

describe('nextHabitStreak', () => {
  it('starts at 1, continues from yesterday or the day before, resets after a longer gap', () => {
    expect(nextHabitStreak(undefined, NOW)).toEqual({ count: 1, lastDate: '2026-10-04' })
    expect(nextHabitStreak({ count: 4, lastDate: '2026-10-03' }, NOW)).toEqual({ count: 5, lastDate: '2026-10-04' })
    expect(nextHabitStreak({ count: 4, lastDate: '2026-10-02' }, NOW)).toEqual({ count: 5, lastDate: '2026-10-04' })
    expect(nextHabitStreak({ count: 4, lastDate: '2026-10-01' }, NOW)).toEqual({ count: 1, lastDate: '2026-10-04' })
  })

  it('counts once per day', () => {
    expect(nextHabitStreak({ count: 2, lastDate: '2026-10-04' }, NOW)).toBeNull()
  })
})

describe('saveHabitStreak', () => {
  const deps = () => ({ saveProfile: vi.fn(async () => {}), syncCompletionStatus: vi.fn(async () => {}) })
  const streak = { count: 1, lastDate: '2026-10-04' }

  it('guest (no uid): skips the server and does not throw', () => {
    const d = deps()
    expect(() => saveHabitStreak(null, streak, d)).not.toThrow()
    expect(saveHabitStreak(null, streak, d)).toBe(false)
    expect(d.saveProfile).not.toHaveBeenCalled()
    expect(d.syncCompletionStatus).not.toHaveBeenCalled()
  })

  it('signed-in user: saves the streak and syncs completion', () => {
    const d = deps()
    expect(saveHabitStreak('u1', streak, d)).toBe(true)
    expect(d.saveProfile).toHaveBeenCalledWith('u1', { streak })
    expect(d.syncCompletionStatus).toHaveBeenCalledWith('u1', '2026-10-04')
  })
})
