import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'
import { LEGAL_DOCS, LEGAL_DOCS_EN, legalConfig } from '../data/legal'

// Legal pages in English: a faithful translation of the Hebrew (same sections and items), no Hebrew UI,
// ltr layout and chevrons that follow the reading direction. Hebrew output is unchanged.
const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))

import LegalContent from '../components/LegalContent'
import LegalDoc from '../pages/LegalDoc'
import Legal from '../pages/Legal'

const HEBREW = /[֐-׿]/

function hebrewIn(container) {
  const copy = container.cloneNode(true)
  const found = []
  if (HEBREW.test(copy.textContent)) found.push(copy.textContent.match(/[֐-׿][^\n]{0,40}/)[0])
  copy.querySelectorAll('[aria-label],[title],[alt]').forEach(el => {
    for (const a of ['aria-label', 'title', 'alt']) {
      const v = el.getAttribute(a)
      if (v && HEBREW.test(v)) found.push(`${a}="${v}"`)
    }
  })
  return found
}

const shape = doc => doc.sections.map(s => s.paras.map(p => (p?.list ? p.list.length : p?.decide ? 'decide' : 'p')))
const placeholders = doc => JSON.stringify(doc).match(/\{[a-zA-Z]+\}/g).sort()

afterEach(() => { cleanup(); lang.current = 'en' })

describe('English text mirrors the Hebrew', () => {
  it.each(['privacy', 'terms'])('%s: same sections, paragraphs, list items and placeholders', type => {
    expect(shape(LEGAL_DOCS_EN[type])).toEqual(shape(LEGAL_DOCS[type]))
    expect(placeholders(LEGAL_DOCS_EN[type])).toEqual(placeholders(LEGAL_DOCS[type]))
  })
  it('English config overrides only the language-dependent values', () => {
    const h = legalConfig('he'), e = legalConfig('en')
    expect(e.operatorName).toBe('Noam Cohen')
    expect(e.courtCity).toBe('Jerusalem')
    for (const k of ['contactEmail', 'minAge', 'deletionDays']) expect(e[k]).toBe(h[k])
    expect(HEBREW.test(Object.values(e).join(' '))).toBe(false)
  })
})

describe('LegalContent in English', () => {
  it.each(['privacy', 'terms'])('%s: no Hebrew, ltr', type => {
    const { container } = render(<LegalContent type={type} />)
    expect(hebrewIn(container)).toEqual([])
    expect(container.firstChild.getAttribute('dir')).toBe('ltr')
  })

  it('privacy keeps the Hebrew promises, no more', () => {
    const t = render(<LegalContent type="privacy" />).container.textContent
    for (const phrase of [
      'Google Firebase', 'Google Gemini', 'only after you approve', 'Google Analytics',
      'Ad personalization and Google Signals are off', "We don't sell your data", 'paid API key',
      "By default your name doesn't appear on the leaderboard", '"Delete account"', 'within 30 days',
      'ages 18 and up', 'only in the browser on your device', 'Noam Cohen', 'prime.daily.app@gmail.com',
      'Last updated: October 15, 2026',
    ]) expect(t).toContain(phrase)
  })

  it('terms point users outside Israel to a local line, in both languages', () => {
    expect(render(<LegalContent type="terms" />).container.textContent)
      .toContain('Outside Israel: your local emergency number, or findahelpline.com for a helpline in your country.')
    cleanup(); lang.current = 'he'
    expect(render(<LegalContent type="terms" />).container.textContent)
      .toContain('מחוץ לישראל: מספר החירום המקומי, או findahelpline.com לקו תמיכה במדינה שלך.')
  })

  it('terms keep Israeli law, Jerusalem courts and the crisis lines', () => {
    const t = render(<LegalContent type="terms" />).container.textContent
    for (const phrase of ['Israeli law', 'the courts of Jerusalem', 'ERAN 1201', 'consult a doctor', 'your own responsibility', 'ages 18 and up'])
      expect(t).toContain(phrase)
  })
})

describe('Hebrew is unchanged', () => {
  it('rtl, Hebrew title and date line', () => {
    lang.current = 'he'
    const { container } = render(<LegalContent type="privacy" />)
    expect(container.firstChild.getAttribute('dir')).toBe('rtl')
    expect(container.textContent).toContain('מדיניות פרטיות')
    expect(container.textContent).toContain('עודכן לאחרונה: 15.10.2026')
    expect(container.textContent).toContain('נועם כהן (Noam Cohen)')
  })
})

describe('legal pages: direction and chevrons', () => {
  const chevron = (container, which) => container.querySelector(`[data-dir-chevron="${which}"]`)

  it.each([
    ['en', 'ltr', 'lucide-chevron-left', 'lucide-chevron-right'],
    ['he', 'rtl', 'lucide-chevron-right', 'lucide-chevron-left'],
  ])('%s: /legal is %s, back and row chevrons point the right way', (l, dir, backIcon, fwdIcon) => {
    lang.current = l
    const { container } = render(<Legal />)
    expect(container.firstChild.getAttribute('dir')).toBe(dir)
    expect(chevron(container, 'back').getAttribute('class')).toContain(backIcon)
    const rows = container.querySelectorAll('[data-dir-chevron="forward"]')
    expect(rows).toHaveLength(2)
    rows.forEach(r => expect(r.getAttribute('class')).toContain(fwdIcon))
    if (l === 'en') expect(hebrewIn(container)).toEqual([])
    else expect(container.textContent).toContain('משפטי ותמיכה')
  })

  it.each([
    ['en', 'ltr', 'lucide-chevron-left'],
    ['he', 'rtl', 'lucide-chevron-right'],
  ])('%s: /privacy page is %s with a back chevron', (l, dir, backIcon) => {
    lang.current = l
    const { container } = render(<LegalDoc type="privacy" />)
    expect(container.firstChild.getAttribute('dir')).toBe(dir)
    expect(chevron(container, 'back').getAttribute('class')).toContain(backIcon)
    if (l === 'en') expect(hebrewIn(container)).toEqual([])
  })
})
