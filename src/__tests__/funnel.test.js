import { describe, it, expect } from 'vitest'
import { countFunnel, countOpen, funnelDate, FUNNEL_KEYS } from '../services/funnel'

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

  it('counter names match firestore.rules', async () => {
    const rules = (await import('fs')).readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8')
    for (const k of FUNNEL_KEYS) expect(rules).toContain(`'${k}'`)
    expect(funnelDate(new Date('2026-01-02T00:00:00Z'))).toBe('2026-01-02')
  })
})
