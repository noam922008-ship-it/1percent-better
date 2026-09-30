import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import t from '../i18n/translations'

// Plain stubs (not vi.fn) — see journalReflection.test.js
const saves = []
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'new1' } }) }))
vi.mock('../context/LangContext', () => ({ useLang: () => ({ t: t.he, lang: 'he' }) }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../services/coachService', () => ({ suggestChallenge: async () => 'self-discipline' }))
vi.mock('../services/focusTriggerService', () => ({
  loadProfile: async () => ({ tier: 'free' }),          // brand-new user
  saveProfile: async (uid, data) => { saves.push(data) },
}))

import OnboardingFlow from '../pages/OnboardingFlow'

beforeEach(() => {
  saves.length = 0
  localStorage.clear()
  // Resume at the first habit step with the name and focus already chosen
  localStorage.setItem('ft_ob_progress', JSON.stringify({ step: 'trigger1', name: 'חדש', goal: 'fitness' }))
})

describe('setup — habits can be weekly', () => {
  it('offers "every day / X times a week" and saves the weekly schedule', async () => {
    render(<OnboardingFlow />)
    fireEvent.change(await screen.findByPlaceholderText(t.he.onboarding.cuePh), { target: { value: 'אחרי העבודה' } })
    fireEvent.change(screen.getByPlaceholderText(t.he.onboarding.habitPh), { target: { value: 'ריצה' } })
    fireEvent.click(screen.getByText('כמה פעמים בשבוע'))
    fireEvent.click(screen.getByText('א׳'))
    fireEvent.click(screen.getByText('ה׳'))
    fireEvent.click(screen.getByText(t.he.onboarding.next))         // → habit 2
    fireEvent.click(await screen.findByText(t.he.onboarding.done.skip)) // skip habit 2
    expect(await screen.findByText(/3 פעמים בשבוע · א׳ ה׳/)).toBeInTheDocument()   // shown on the done screen
    fireEvent.click(screen.getByText(t.he.onboarding.done.btn))
    await waitFor(() => expect(saves).toHaveLength(1))
    expect(saves[0].triggers).toEqual([{
      id: 't1', cue: 'אחרי העבודה', habit: 'ריצה', note: '',
      frequency: { type: 'weekly', timesPerWeek: 3 }, days: [0, 4], time: null,
    }])
  })

  it('daily stays the default', async () => {
    render(<OnboardingFlow />)
    fireEvent.change(await screen.findByPlaceholderText(t.he.onboarding.cuePh), { target: { value: 'כשאני קם' } })
    fireEvent.change(screen.getByPlaceholderText(t.he.onboarding.habitPh), { target: { value: 'כוס מים' } })
    fireEvent.click(screen.getByText(t.he.onboarding.next))
    fireEvent.click(await screen.findByText(t.he.onboarding.done.skip))
    fireEvent.click(await screen.findByText(t.he.onboarding.done.btn))
    await waitFor(() => expect(saves).toHaveLength(1))
    expect(saves[0].triggers[0]).toMatchObject({ frequency: { type: 'daily' }, days: [] })
  })
})
