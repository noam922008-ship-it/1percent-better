import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'
import { combatAvailable } from '../utils/combatLang'

const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))

import WorkoutsScreen from '../pages/WorkoutsScreen'

describe('boxing / Muay Thai while their content is Hebrew only', () => {
  beforeEach(() => { lang.current = 'en' })

  it('combatAvailable: Hebrew yes, English no', () => {
    expect(combatAvailable('he')).toBe(true)
    expect(combatAvailable('en')).toBe(false)
  })

  it('English Workouts tab has no combat category', () => {
    render(<WorkoutsScreen onStartWorkout={() => {}} />)
    expect(screen.queryByText(en.workouts.categories.combat.label)).toBeNull()
    expect(screen.queryByLabelText(`Start ${en.workouts.exercises.boxing.name}`)).toBeNull()
    expect(screen.getByLabelText('Start Dips')).toBeTruthy()
  })

  it('Hebrew Workouts tab still has it', () => {
    lang.current = 'he'
    render(<WorkoutsScreen onStartWorkout={() => {}} />)
    expect(screen.getByText(he.workouts.categories.combat.label)).toBeTruthy()
  })
})
