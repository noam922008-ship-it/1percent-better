import { describe, it, expect } from 'vitest'
import { detectDistress, normalizeHebrew, DISTRESS_PHRASES } from '../utils/distress'

describe('detectDistress', () => {
  it('flags every listed phrase on its own', () => {
    for (const p of DISTRESS_PHRASES) expect(detectDistress(p), p).toBe(true)
  })

  it('catches phrases inside a sentence and with Hebrew prefixes', () => {
    expect(detectDistress('היום הרגשתי שאין טעם לחיות בכלל')).toBe(true)
    expect(detectDistress('ולא יכולה יותר עם כל זה')).toBe(true)
    expect(detectDistress('יש לי התקפי חרדה בלילה')).toBe(true)
  })

  it('ignores punctuation, niqqud and extra spaces', () => {
    expect(detectDistress('רוצה   למות!!!')).toBe(true)
    expect(detectDistress('לֹא רוֹצֶה לִחְיוֹת')).toBe(true)
    expect(detectDistress('אין-טעם-לחיות')).toBe(true)
  })

  it('checks all fields passed in', () => {
    expect(detectDistress('יום רגיל', '', 'אין לי אף אחד')).toBe(true)
  })

  it('does not flag everyday sadness or stress', () => {
    for (const t of [
      'עצוב לי היום', 'אני לחוץ מהמבחן', 'אין לי כוח לעבודה',
      'רוצה לסיים את זה מהר', 'יום קשה בעבודה אבל בסדר',
      'רוצה לחיות בריא יותר', 'אני יכול יותר ממה שחשבתי',
    ]) expect(detectDistress(t), t).toBe(false)
  })

  it('handles empty input', () => {
    expect(detectDistress()).toBe(false)
    expect(detectDistress('', null, undefined)).toBe(false)
  })

  it('normalizes text', () => {
    expect(normalizeHebrew('  שָׁלוֹם,  עוֹלָם! ')).toBe('שלום עולם')
  })
})
