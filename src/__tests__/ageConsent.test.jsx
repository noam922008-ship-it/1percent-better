import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import t from '../i18n/translations'

// Plain stubs (not vi.fn) — see journalReflection.test.js
const calls = []
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({
  user: null, authLoading: false,
  loginWithGoogle: async () => { calls.push('google') },
  loginWithEmail: async () => { calls.push('email') },
  registerWithEmail: async () => { calls.push('register') },
  loginAsGuest: () => { calls.push('guest') },
}) }))
vi.mock('../context/LangContext', () => ({ useLang: () => ({ lang: 'he', setLang: () => {}, t: t.he }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../services/focusTriggerService', () => ({ loadProfile: async () => null }))

import WelcomeScreen from '../pages/WelcomeScreen'

beforeEach(() => { calls.length = 0 })

const google = () => screen.getByText(t.he.welcome.signIn).closest('button')
const guest  = () => screen.getByText('👁 המשך כאורח').closest('button')
const box    = () => screen.getByRole('checkbox')

describe('signup — one 18+ / terms checkbox', () => {
  it('shows the exact consent text with both documents linked', () => {
    render(<WelcomeScreen />)
    expect(box().closest('label').textContent).toBe('אני מעל 18 ומסכים לתנאי השימוש ולמדיניות הפרטיות')
    expect(screen.queryByText(/בהמשך אתה/)).toBeNull()        // the old implicit line is gone
  })

  it('a tap before ticking does nothing but point at the box', () => {
    render(<WelcomeScreen />)
    expect(box()).not.toBeChecked()
    expect(screen.queryByText(t.he.welcome.ageTap)).toBeNull()
    fireEvent.click(google()); fireEvent.click(guest())
    expect(calls).toEqual([])
    expect(screen.getByText(t.he.welcome.ageTap)).toBeInTheDocument()
    fireEvent.click(box())
    expect(screen.queryByText(t.he.welcome.ageTap)).toBeNull()
    fireEvent.click(guest())
    expect(calls).toEqual(['guest'])
  })

  it('email sign-up is blocked too until checked', () => {
    render(<WelcomeScreen />)
    fireEvent.click(screen.getByText(/כניסה עם אימייל/))
    const submit = screen.getByText('כניסה').closest('button')
    fireEvent.submit(submit.closest('form'))
    expect(calls).toEqual([])
    expect(screen.getByText(t.he.welcome.ageTap)).toBeInTheDocument()
  })

  it('opening the terms from the checkbox text does not tick it', () => {
    render(<WelcomeScreen />)
    fireEvent.click(screen.getByText('תנאי השימוש'))
    expect(box()).not.toBeChecked()
    expect(screen.getByText(/📄 תנאי שימוש/)).toBeInTheDocument()   // the terms window opened
  })

  it('once checked, sign-in works', () => {
    render(<WelcomeScreen />)
    fireEvent.click(box())
    fireEvent.click(google())
    expect(calls).toEqual(['google'])
  })
})
