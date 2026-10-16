import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'
import { cardTexts, APP_URL } from '../utils/shareCard'

describe('share card texts', () => {
  it('Hebrew: streak number, singular/plural label, week line, link', () => {
    const one = cardTexts({ streak: 1, activeDays: 1, copy: he.share.card })
    expect(one.big).toBe('1')
    expect(one.bigLabel).toBe(he.share.card.streakOne)
    const many = cardTexts({ streak: 7, activeDays: 5, copy: he.share.card })
    expect(many.bigLabel).toBe(he.share.card.streakMany)
    expect(many.week).toContain('5')
    expect(many.url).toBe(APP_URL)
  })
  it('English copy has no Hebrew', () => {
    const t = cardTexts({ streak: 3, activeDays: 2, copy: en.share.card })
    expect(/[֐-׿]/.test(Object.values(t).join(' ') + Object.values(en.share).join(' '))).toBe(false)
  })
  it('bad streak values become 0', () => {
    expect(cardTexts({ streak: -4, copy: he.share.card }).big).toBe('0')
    expect(cardTexts({ streak: undefined, copy: he.share.card }).big).toBe('0')
  })
  it('the card links to the live app', () => {
    expect(APP_URL).toBe('prime-app-84fe0.web.app')
  })
})
