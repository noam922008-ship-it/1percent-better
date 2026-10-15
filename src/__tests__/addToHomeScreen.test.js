import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'
import { wasDismissedRecently } from '../components/AddToHomeScreen'

const store = value => ({ getItem: () => value })
const NOW = 1_800_000_000_000
const DAY = 86400000

describe('add to home screen banner', () => {
  it('never dismissed → shows', () => {
    expect(wasDismissedRecently(store(null), NOW)).toBe(false)
  })
  it('dismissed a day ago → stays hidden', () => {
    expect(wasDismissedRecently(store(String(NOW - DAY)), NOW)).toBe(true)
  })
  it('dismissed more than two weeks ago → comes back', () => {
    expect(wasDismissedRecently(store(String(NOW - 15 * DAY)), NOW)).toBe(false)
  })
  it('the old "1" flag from before is treated as long ago, so existing users see it again', () => {
    expect(wasDismissedRecently(store('1'), NOW)).toBe(false)
  })
  it('unreadable storage → shows', () => {
    expect(wasDismissedRecently({ getItem: () => { throw new Error('blocked') } }, NOW)).toBe(false)
  })
  it('has copy in both languages', () => {
    for (const k of Object.keys(he.install)) {
      expect(he.install[k]).toBeTruthy()
      expect(en.install[k]).toBeTruthy()
    }
  })
})
