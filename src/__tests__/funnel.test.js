import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { countFunnel, countOpen, funnelDate, FUNNEL_KEYS, countGuestReturn, isInternalDevice, toggleInternalDevice } from '../services/funnel'

function recorder() {
  const calls = []
  const write = (date, data) => { calls.push({ date, keys: Object.keys(data) }); return Promise.resolve() }
  return { calls, write }
}

describe('funnel counters', () => {
  it('adds to one known counter on the UTC date', () => {
    const { calls, write } = recorder()
    expect(countFunnel('guest_start', { write, now: new Date('2026-10-26T23:30:00Z') })).toBe(true)
    expect(calls).toEqual([{ date: '2026-10-26', keys: ['guest_start'] }])
  })

  it('ignores unknown counters', () => {
    const { calls, write } = recorder()
    expect(countFunnel('email', { write })).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('a failed write never throws', () => {
    expect(countFunnel('open', { write: () => Promise.reject(new Error('offline')) })).toBe(true)
    expect(countFunnel('open', { write: () => { throw new Error('boom') } })).toBe(false)
  })

  it('open counts the in-app browser and the DM link', () => {
    const { calls, write } = recorder()
    countOpen({ inApp: true, search: '?utm_source=instagram&utm_medium=dm&utm_campaign=noam', write })
    expect(calls.map(c => c.keys[0])).toEqual(['open', 'open_inapp', 'open_dm'])
    const r2 = recorder()
    countOpen({ inApp: false, search: '', write: r2.write })
    expect(r2.calls.map(c => c.keys[0])).toEqual(['open'])
  })

  it('counter names match firestore.rules', () => {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')
    for (const k of FUNNEL_KEYS) expect(rules).toContain(`'${k}'`)
    expect(funnelDate(new Date('2026-01-02T00:00:00Z'))).toBe('2026-01-02')
  })
})

function memStore() {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }
}

describe('internal devices and returning guests', () => {
  it('?internal=1 stops this device from counting, ?internal=0 starts again', () => {
    const storage = memStore(); const { calls, write } = recorder()
    countOpen({ search: '?internal=1', write, storage })
    expect(isInternalDevice(storage)).toBe(true)
    expect(calls).toHaveLength(0)
    expect(countFunnel('guest_start', { write, storage })).toBe(false)
    countOpen({ search: '?internal=0', write, storage })
    expect(calls.map(c => c.keys[0])).toEqual(['open'])
  })
  it('counts the YouTube link', () => {
    const { calls, write } = recorder()
    countOpen({ search: '?utm_source=youtube', write, storage: memStore() })
    expect(calls.map(c => c.keys[0])).toEqual(['open', 'open_youtube'])
  })
  it('a guest with a habit counts once per later day, never on the first day', () => {
    const storage = memStore(); const { calls, write } = recorder()
    const day = d => new Date(`2026-11-${d}T12:00:00Z`)
    expect(countGuestReturn({ hasHabit: true, now: day('05'), write, storage })).toBe(false)   // first day
    expect(countGuestReturn({ hasHabit: true, now: day('05'), write, storage })).toBe(false)
    expect(countGuestReturn({ hasHabit: true, now: day('06'), write, storage })).toBe(true)
    expect(countGuestReturn({ hasHabit: true, now: day('06'), write, storage })).toBe(false)   // once a day
    expect(countGuestReturn({ hasHabit: true, now: day('08'), write, storage })).toBe(true)
    expect(calls.map(c => c.keys[0])).toEqual(['return_guest', 'return_guest'])
    expect(countGuestReturn({ hasHabit: false, now: day('09'), write, storage: memStore() })).toBe(false)
  })
  it('toggleInternalDevice flips the internal flag', () => {
    const m = new Map(); const st = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }
    expect(toggleInternalDevice(st)).toBe(true)
    expect(isInternalDevice(st)).toBe(true)
    expect(toggleInternalDevice(st)).toBe(false)
    expect(isInternalDevice(st)).toBe(false)
  })
})
