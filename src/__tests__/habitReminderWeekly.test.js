import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../services/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({ doc: () => ({}), getDoc: async () => ({}), setDoc: async () => {} }))

import { checkNotifications } from '../services/notificationService'

const shown = []
class FakeNotification {
  static permission = 'granted'
  constructor(title, opts) { shown.push({ title, tag: opts?.tag }) }
}

// 2026-09-29 is a Tuesday (day 2); week = 2026-09-27 .. 2026-10-03
const TUE_0700 = new Date(2026, 8, 29, 7, 0, 0)
const run = { id: 'run', cue: 'אחרי העבודה', habit: 'ריצה', time: '07:00', frequency: { type: 'weekly', timesPerWeek: 3 }, days: [0, 2, 4] }
const daily = { id: 't1', cue: 'כשאני מתעורר', habit: 'מודה אני', time: '07:00' }

beforeEach(() => {
  shown.length = 0
  localStorage.clear()
  vi.stubGlobal('Notification', FakeNotification)
  vi.useFakeTimers()
  vi.setSystemTime(TUE_0700)
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

const tags = () => shown.map(n => n.tag)

describe('weekly habit reminders (in-app)', () => {
  it('fires at the chosen time on a chosen day', () => {
    checkNotifications([run], {}, '20:00', '08:00', {})
    expect(tags()).toContain('run')
  })

  it('does not fire on a day that was not chosen', () => {
    vi.setSystemTime(new Date(2026, 8, 28, 7, 0, 0))   // Monday
    checkNotifications([run], {}, '20:00', '08:00', {})
    expect(tags()).not.toContain('run')
  })

  it('fires every day when no days were chosen', () => {
    vi.setSystemTime(new Date(2026, 8, 28, 7, 0, 0))   // Monday
    checkNotifications([{ ...run, days: [] }], {}, '20:00', '08:00', {})
    expect(tags()).toContain('run')
  })

  it('does not fire if already done today', () => {
    checkNotifications([run], {}, '20:00', '08:00', { '2026-09-29': { run: true } })
    expect(tags()).not.toContain('run')
  })

  it("does not fire once this week's target is reached", () => {
    const log = { '2026-09-27': { run: true }, '2026-09-28': { run: true }, '2026-09-26': { run: true } }
    checkNotifications([run], {}, '20:00', '08:00', log)          // only 2 this week → still fires
    expect(tags()).toContain('run')
    shown.length = 0; localStorage.clear()
    const reached = { '2026-09-27': { run: true }, '2026-09-28': { run: true }, '2026-09-30': { run: true } }
    checkNotifications([run], {}, '20:00', '08:00', reached)      // 3 this week → no reminder
    expect(tags()).not.toContain('run')
  })

  it('leaves daily habits exactly as before', () => {
    checkNotifications([daily], {}, '20:00', '08:00', {})
    expect(tags()).toContain('t1')
    shown.length = 0; localStorage.clear()
    localStorage.setItem(`ft_checkins_${new Date().toISOString().slice(0, 10)}`, JSON.stringify({ t1: true }))
    checkNotifications([daily], {}, '20:00', '08:00', {})
    expect(tags()).not.toContain('t1')
  })

  it('fires each reminder at most once a day', () => {
    checkNotifications([run], {}, '20:00', '08:00', {})
    checkNotifications([run], {}, '20:00', '08:00', {})
    expect(tags().filter(t => t === 'run').length).toBe(1)
  })
})
