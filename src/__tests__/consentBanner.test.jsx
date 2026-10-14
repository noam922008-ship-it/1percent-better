import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'

// The Settings switch (no banner) and the privacy policy wording, with FEATURES.consentBanner on and off.
const state = vi.hoisted(() => ({ lang: 'he', flags: { consentBanner: true, dailyLesson: true }, consent: null, set: [] }))
vi.mock('../config/features', () => ({ FEATURES: state.flags }))
vi.mock('../services/analytics', () => ({
  needsConsentChoice: () => state.flags.consentBanner && state.consent === null,
  getConsent: () => (state.flags.consentBanner ? state.consent : 'granted'),
  setConsent: granted => { state.set.push(granted); state.consent = granted ? 'granted' : 'denied' },
}))
vi.mock('../context/LangContext', async () => {
  const t = (await import('../i18n/translations')).default
  return { useLang: () => ({ lang: state.lang, setLang: () => {}, t: t[state.lang], englishEnabled: false }) }
})
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null, isGuest: true, logout: async () => {} }) }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ prefs: {}, setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({
  useNavigate: () => () => {},
  Link: ({ to, children, ...rest }) => <a href={to} data-router-link {...rest}>{children}</a>,
}))

import Settings from '../components/Settings'

beforeEach(() => { state.lang = 'he'; state.flags.consentBanner = true; state.consent = null; state.set = [] })
afterEach(cleanup)

describe('Settings switch', () => {
  it('flag on: switch reflects the choice and changes it', () => {
    state.consent = 'granted'
    render(<Settings />)
    expect(screen.getByText(he.settings.analytics)).toBeInTheDocument()
    const row = screen.getByText(he.settings.analytics).parentElement.parentElement
    const toggle = row.querySelector('button[aria-pressed]')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(toggle)
    expect(state.set).toEqual([false])
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('flag off: no privacy section', () => {
    state.flags.consentBanner = false
    render(<Settings />)
    expect(screen.queryByText(he.settings.analytics)).toBeNull()
  })
})

describe('privacy policy', () => {
  async function policy(on) {
    state.flags.consentBanner = on
    vi.resetModules()
    const { LEGAL_DOCS, LEGAL_DOCS_EN } = await import('../data/legal')
    return { LEGAL_DOCS, LEGAL_DOCS_EN }
  }
  it('consent paragraph only with the flag on, in both languages', async () => {
    const text = docs => JSON.stringify(docs)
    const off = await policy(false)
    expect(text(off)).not.toContain('cookies')
    const on = await policy(true)
    expect(text(on)).toContain('נשלחים אליו רק אירועים מרגע ההפעלה')
    expect(text(on)).toContain('only events from that point on are sent')
  })
})
