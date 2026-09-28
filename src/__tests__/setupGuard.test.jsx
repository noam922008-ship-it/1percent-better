import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import t from '../i18n/translations'
import { hasCompletedSetup } from '../utils/setupGuard'

// Plain stubs (not vi.fn) — see journalReflection.test.js
let currentUser = { uid: 'u1' }
let profiles    = []          // successive loadProfile() results
const saves     = []
const navigations = []

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: currentUser }) }))
vi.mock('../context/LangContext', () => ({ useLang: () => ({ t: t.he, lang: 'he' }) }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => (to, opts) => navigations.push([to, opts]) }))
vi.mock('../services/coachService', () => ({ suggestChallenge: async () => 'self-discipline' }))
vi.mock('../services/focusTriggerService', () => ({
  loadProfile: async () => (profiles.length > 1 ? profiles.shift() : profiles[0]),
  saveProfile: async (uid, data) => { saves.push([uid, data]) },
}))

import OnboardingFlow from '../pages/OnboardingFlow'

const DONE_BTN = t.he.onboarding.done.btn
const EXISTING = { name: 'נועם', onboardingDone: true, xp: 1194, triggers: [{ id: 't1', cue: 'כשאני מתעורר', habit: 'מודה אני' }] }
const NEW_USER = { tier: 'free', createdAt: '2026-09-28T00:00:00.000Z' }

beforeEach(() => {
  currentUser = { uid: 'u1' }
  profiles = []
  saves.length = 0
  navigations.length = 0
  localStorage.clear()
})

describe('hasCompletedSetup', () => {
  it('is true for finished or active accounts', () => {
    expect(hasCompletedSetup({ onboardingDone: true })).toBe(true)
    expect(hasCompletedSetup({ xp: 10 })).toBe(true)
    expect(hasCompletedSetup({ triggers: [{ id: 't1' }] })).toBe(true)
    expect(hasCompletedSetup({ challenges: { a: { daysCompleted: 2 } } })).toBe(true)
  })
  it('is false for a brand-new profile', () => {
    expect(hasCompletedSetup(NEW_USER)).toBe(false)
    expect(hasCompletedSetup({ triggers: [], xp: 0, challenges: { a: { daysCompleted: 0 } } })).toBe(false)
    expect(hasCompletedSetup(null)).toBe(false)
  })
})

describe('/setup guard', () => {
  it('sends an existing user to the dashboard and never shows or saves the form', async () => {
    profiles = [EXISTING]
    render(<OnboardingFlow />)
    await waitFor(() => expect(navigations).toEqual([['/dashboard', { replace: true }]]))
    expect(screen.queryByText('איך נקרא לך?')).toBeNull()
    expect(saves).toEqual([])
  })

  it('also redirects when saved progress would jump straight to the last step', async () => {
    localStorage.setItem('ft_ob_progress', JSON.stringify({ step: 'done', name: 'בדיקה', t1: { cue: 'כשאני קם', habit: 'כוס מים', time: '', note: '' } }))
    profiles = [EXISTING]
    render(<OnboardingFlow />)
    await waitFor(() => expect(navigations.length).toBe(1))
    expect(screen.queryByText(DONE_BTN)).toBeNull()
    expect(saves).toEqual([])
  })

  it('fails closed when the profile cannot be read', async () => {
    profiles = [null]
    render(<OnboardingFlow />)
    await waitFor(() => expect(navigations).toEqual([['/dashboard', { replace: true }]]))
    expect(saves).toEqual([])
  })

  it('sends guests (no user) to the dashboard', async () => {
    currentUser = null
    render(<OnboardingFlow />)
    await waitFor(() => expect(navigations).toEqual([['/dashboard', { replace: true }]]))
  })

  it('lets a brand-new user through and saves at the end', async () => {
    profiles = [NEW_USER]
    localStorage.setItem('ft_ob_progress', JSON.stringify({ step: 'done', name: 'חדש', goal: 'fitness', t1: { cue: 'כשאני קם', habit: 'כוס מים', time: '', note: '' } }))
    render(<OnboardingFlow />)
    fireEvent.click(await screen.findByText(DONE_BTN))
    await waitFor(() => expect(saves.length).toBe(1))
    expect(saves[0][1].name).toBe('חדש')
    expect(navigations).toEqual([['/dashboard', { replace: true }]])
  })

  it('does not save if setup was finished meanwhile (e.g. in another tab)', async () => {
    profiles = [NEW_USER, EXISTING]     // first check passes, re-check before saving fails
    localStorage.setItem('ft_ob_progress', JSON.stringify({ step: 'done', name: 'חדש', goal: 'fitness' }))
    render(<OnboardingFlow />)
    fireEvent.click(await screen.findByText(DONE_BTN))
    await waitFor(() => expect(navigations).toEqual([['/dashboard', { replace: true }]]))
    expect(saves).toEqual([])
  })
})
