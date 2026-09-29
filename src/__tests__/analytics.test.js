import { describe, it, expect, vi } from 'vitest'

// Record anything that would reach Firebase Analytics
const logged = []
vi.mock('firebase/analytics', () => ({
  initializeAnalytics: () => ({}),
  logEvent: (_a, name, params) => logged.push([name, params]),
  isSupported: async () => true,
}))
vi.mock('../services/firebase', () => ({ app: {} }))

import { ALLOWED_EVENTS, sanitizeParams, captureUtm, checkReturnNextDay, track, startAnalytics } from '../services/analytics'

function memoryStore() {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}

describe('only the six agreed events', () => {
  it('allowlist', () => {
    expect(Object.keys(ALLOWED_EVENTS).sort()).toEqual(
      ['app_open', 'first_entry', 'habit_created', 'return_next_day', 'task_added', 'welcome_start'])
  })
})

describe('never sends user text, names or emails', () => {
  it('drops unknown parameters', () => {
    expect(sanitizeParams('task_added', { text: 'לקנות חלב', name: 'נועם' })).toEqual({})
    expect(sanitizeParams('habit_created', { frequency: 'weekly', habit: 'ריצה' })).toEqual({ frequency: 'weekly' })
  })
  it('drops free text, emails and long values even in allowed keys', () => {
    expect(sanitizeParams('app_open', { utm_source: 'noam@gmail.com' })).toEqual({})
    expect(sanitizeParams('app_open', { utm_source: 'היומן שלי' })).toEqual({})
    expect(sanitizeParams('app_open', { utm_source: 'has space' })).toEqual({})
    expect(sanitizeParams('app_open', { utm_source: 'x'.repeat(101) })).toEqual({})
  })
  it('keeps normal utm values, lowercased', () => {
    expect(sanitizeParams('app_open', { utm_source: 'TikTok', utm_medium: 'bio', utm_campaign: 'launch_2026' }))
      .toEqual({ utm_source: 'tiktok', utm_medium: 'bio', utm_campaign: 'launch_2026' })
  })
})

describe('captureUtm', () => {
  it('reads utm parameters from the landing URL', () => {
    expect(captureUtm('?utm_source=tiktok&utm_campaign=launch&other=x')).toEqual({ utm_source: 'tiktok', utm_campaign: 'launch' })
    expect(captureUtm('')).toEqual({})
  })
})

describe('return_next_day', () => {
  it('fires once, only on the local day after the first open', () => {
    const s = memoryStore()
    expect(checkReturnNextDay('2026-09-29', s)).toBe(false)   // first open
    expect(checkReturnNextDay('2026-09-29', s)).toBe(false)   // same day
    expect(checkReturnNextDay('2026-09-30', s)).toBe(true)    // next day
    expect(checkReturnNextDay('2026-09-30', s)).toBe(false)   // only once
  })
  it('not on a later day, and handles month ends', () => {
    const s = memoryStore()
    checkReturnNextDay('2026-09-30', s)
    expect(checkReturnNextDay('2026-10-02', s)).toBe(false)
    const t = memoryStore()
    checkReturnNextDay('2026-09-30', t)
    expect(checkReturnNextDay('2026-10-01', t)).toBe(true)
  })
})

describe('off outside production', () => {
  it('sends nothing in tests/dev (no production build, no measurement id)', async () => {
    await startAnalytics()
    track('task_added')
    track('not_allowed_event', { a: 'b' })
    expect(logged).toEqual([])
  })
})
