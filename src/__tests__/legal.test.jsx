import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LegalContent from '../components/LegalContent'
import { openLegalItems, LEGAL_CONFIG } from '../data/legal'

const text = type => { const { container, unmount } = render(<LegalContent type={type} />); const t = container.textContent; unmount(); return t }

describe('privacy policy covers what was asked', () => {
  const t = text('privacy')
  it.each([
    ['where data is stored', 'Google Firebase'],
    ['the journal goes to Gemini once AI launches', 'Google Gemini'],
    ['it is sent only after consent', 'רק אחרי שתאשר'],
    ['analytics', 'Google Analytics'],
    ['no text/name/email in analytics', 'לא שולחים ל-Google Analytics את מה שאתה כותב'],
    ['ad personalization and signals off', 'Google Signals כבויים'],
    ['how to delete the account and all data', 'איך מוחקים את החשבון וכל המידע'],
    ['minimum age', 'גיל'],
    ['guests stay on the device', 'רק בדפדפן במכשיר שלך'],
  ])('%s', (_, phrase) => expect(t).toContain(phrase))
})

describe('terms cover what was asked', () => {
  const t = text('terms')
  it.each([
    ['not therapy or professional advice', 'לא מחליפה טיפול נפשי'],
    ['consult a doctor', 'התייעץ עם רופא'],
    ['train at your own risk', 'האימונים הם באחריותך'],
    ['crisis lines', 'ער״ן 1201'],
    ['minimum age', 'מגיל'],
  ])('%s', (_, phrase) => expect(t).toContain(phrase))
})

describe('open items are clearly marked', () => {
  it('unfilled placeholders show a marker, never an empty gap', () => {
    render(<LegalContent type="privacy" />)
    if (LEGAL_CONFIG.contactEmail === null) expect(screen.getAllByText(/להשלים: אימייל ליצירת קשר/).length).toBeGreaterThan(0)
    expect(screen.queryAllByText(/להחלטה שלך/)).toHaveLength(0)   // all decisions made
  })
  it('lists every open item for the owner (only the contact email is left)', () => {
    const items = openLegalItems()
    expect(items.every(i => !i.includes('שם המפעיל') && !i.includes('גיל מינימלי'))).toBe(true)
    if (LEGAL_CONFIG.contactEmail === null) expect(items).toEqual(['להשלים: אימייל ליצירת קשר'])
  })
})

describe("owner's decisions are reflected", () => {
  const p = text('privacy'), t = text('terms')
  it('minimum age 18 (Gemini API terms)', () => {
    expect(p).toContain('מגיל 18 ומעלה')
    expect(t).toContain('מגיל 18 ומעלה')
    expect(p).toContain('פיצ׳רים של AI מיועדים לגיל 18 ומעלה')
  })
  it('Gemini only with a paid key, no training on the data', () => expect(p).toContain('מפתח API בתשלום'))
  it('names hidden from the leaderboard by default, nickname opt-in', () => {
    expect(p).toContain('כברירת מחדל השם שלך לא מופיע בטבלת המובילים')
    expect(p).toContain('כינוי')
  })
  it('in-app account deletion, 30 days by email as fallback', () => {
    expect(p).toContain('"מחק חשבון"')
    expect(p).toContain('תוך 30 ימים')
  })
  it('operator and court city filled in', () => {
    expect(p).toContain('נועם כהן')
    expect(t).toContain('בירושלים')
  })
})
