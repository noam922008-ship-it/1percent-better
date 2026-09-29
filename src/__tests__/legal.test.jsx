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
    expect(screen.getAllByText(/להחלטה שלך/).length).toBeGreaterThan(0)
  })
  it('lists every open item for the owner', () => {
    const items = openLegalItems()
    expect(items.some(i => i.includes('שם המפעיל'))).toBe(true)
    expect(items.some(i => i.includes('גיל מינימלי'))).toBe(true)
    expect(items.some(i => i.includes('מחק חשבון'))).toBe(true)
  })
})
