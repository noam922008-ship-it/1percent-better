import { describe, it, expect } from 'vitest'
import { collectGuestState, encodeState, decodeState, applyState } from '../utils/guestHandoff'

function mem(init = {}) {
  const m = new Map(Object.entries(init))
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), _m: m }
}
const NOW = Date.parse('2026-10-21T10:00:00Z')

describe('guest hand-off', () => {
  it('collects guest habits and recent check-ins only', () => {
    const s = mem({
      prime_guest_triggers: JSON.stringify([{ id: 'a', title: '10 שכיבות שמיכה' }]),
      'ft_checkins_2026-10-21': '{"a":true}',
      'ft_checkins_2026-10-20': '{}',
      'ft_checkins_2026-01-01': '{"a":true}',
      unrelated: 'x',
    })
    const st = collectGuestState(s, NOW)
    expect(Object.keys(st.k).sort()).toEqual(['ft_checkins_2026-10-21', 'prime_guest_triggers'])
  })

  it('round-trips Hebrew through the URL-safe encoding', () => {
    const st = { v: 1, k: { prime_guest_triggers: JSON.stringify([{ title: 'קריאה 📚' }]) } }
    const enc = encodeState(st)
    expect(enc).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeState(enc)).toEqual(st)
  })

  it('rejects garbage', () => {
    expect(decodeState('%%%')).toBeNull()
    expect(decodeState(encodeState({ v: 2, k: {} }))).toBeNull()
  })

  it('writes known keys, never unknown ones, and never over existing data', () => {
    const s = mem({ prime_guest_triggers: JSON.stringify([{ id: 'mine' }]), 'ft_checkins_2026-10-20': '{}' })
    const wrote = applyState({ v: 1, k: {
      prime_guest_triggers: JSON.stringify([{ id: 'theirs' }]),
      'ft_checkins_2026-10-20': '{"a":true}',
      evil_key: 'x',
    } }, s)
    expect(wrote).toBe(1)
    expect(JSON.parse(s.getItem('prime_guest_triggers'))[0].id).toBe('mine')
    expect(s.getItem('ft_checkins_2026-10-20')).toBe('{"a":true}')
    expect(s.getItem('evil_key')).toBeNull()
  })
})
