import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import he from '../i18n/he'
import en from '../i18n/en'
import { fmt, plural } from '../i18n/fmt'
import { frequencyLabel } from '../utils/habitSchedule'

// Phase 2: the first-run flow (Welcome → Setup → Home) has no Hebrew left when English is on.
// The language is switched per test through this mocked context.
const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'new1' }, authLoading: false }) }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../services/coachService', () => ({ suggestChallenge: async () => 'self-discipline' }))
vi.mock('../services/focusTriggerService', () => ({ loadProfile: async () => ({ tier: 'free' }), saveProfile: async () => {} }))

import WelcomeScreen from '../pages/WelcomeScreen'
import OnboardingFlow from '../pages/OnboardingFlow'
import FirstWelcome from '../components/FirstWelcome'

const HEBREW = /[֐-׿]/

// Visible text plus the attributes a screen reader or the keyboard user meets.
// Elements marked lang="he" (the עב switch back to Hebrew) are Hebrew on purpose.
function hebrewIn(container) {
  const found = []
  const copy = container.cloneNode(true)
  copy.querySelectorAll('[lang="he"]').forEach(el => el.remove())
  if (HEBREW.test(copy.textContent)) found.push(copy.textContent.match(/[֐-׿][^\n]{0,40}/)[0])
  copy.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => {
    for (const a of ['placeholder', 'aria-label', 'title']) {
      const v = el.getAttribute(a)
      if (v && HEBREW.test(v)) found.push(`${a}="${v}"`)
    }
  })
  return found
}

beforeEach(() => {
  lang.current = 'en'
  localStorage.clear()
})

describe('English first-run flow has no Hebrew', () => {
  it('Welcome, with the email form open', () => {
    const { container } = render(<WelcomeScreen />)
    fireEvent.click(screen.getByText(en.welcome.emailMode, { exact: false }))
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText(en.welcome.guest, { exact: false })).toBeInTheDocument()
  })

  it('Setup: name, focus, habit (weekly) and done steps', async () => {
    localStorage.setItem('ft_ob_progress', JSON.stringify({ step: 'name' }))
    const { container } = render(<OnboardingFlow />)
    fireEvent.change(await screen.findByPlaceholderText(en.onboarding.name.placeholder), { target: { value: 'Sam' } })
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText(en.onboarding.next))
    expect(await screen.findByText(en.onboarding.goal.title)).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText(en.onboarding.goals.fitness))
    fireEvent.click(screen.getByText(en.onboarding.next))
    fireEvent.change(await screen.findByPlaceholderText(en.onboarding.cuePh), { target: { value: 'After work' } })
    fireEvent.change(screen.getByPlaceholderText(en.onboarding.habitPh), { target: { value: 'Run' } })
    fireEvent.click(screen.getByText(en.habitSchedule.someDays))
    fireEvent.click(screen.getByText('Su'))
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText(en.onboarding.next))
    fireEvent.click(await screen.findByText(en.onboarding.done.skip))
    expect(await screen.findByText(/3 times a week · Su/)).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
  })

  it('first welcome screen', () => {
    const { container } = render(<FirstWelcome onStart={() => {}} onSkip={() => {}} />)
    expect(screen.getByText(en.firstWelcome.title)).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
  })

  it('first-run screens no longer force dir="rtl" — <html dir> decides', () => {
    for (const C of [() => <FirstWelcome onStart={() => {}} onSkip={() => {}} />, WelcomeScreen]) {
      const { container, unmount } = render(<C />)
      expect(container.querySelector('[dir="rtl"]')).toBeNull()
      unmount()
    }
  })
})

describe('Hebrew stays as it was', () => {
  it('Welcome renders the same Hebrew copy', () => {
    lang.current = 'he'
    render(<WelcomeScreen />)
    expect(screen.getByText('👁 המשך כאורח')).toBeInTheDocument()
    expect(screen.getByText('או')).toBeInTheDocument()
  })
  it('first welcome', () => {
    lang.current = 'he'
    render(<FirstWelcome onStart={() => {}} onSkip={() => {}} />)
    expect(screen.getByText('מה יש לך בראש?')).toBeInTheDocument()
    expect(screen.getByText('בוא נתחיל')).toBeInTheDocument()
  })
  it('frequencyLabel defaults to Hebrew and takes English strings', () => {
    const tr = { frequency: { type: 'weekly', timesPerWeek: 2 }, days: [0, 4] }
    expect(frequencyLabel(tr)).toBe('פעמיים בשבוע · א׳ ה׳')
    expect(frequencyLabel(tr, en.habitSchedule)).toBe('Twice a week · Su Th')
    expect(frequencyLabel({}, en.habitSchedule)).toBe('Every day')
  })
  it('streak counts: Hebrew dual, English one/many', () => {
    expect([1, 2, 5].map(n => plural(he.home.streak, n))).toEqual(['יום אחד ברצף', 'יומיים ברצף', '5 ימים ברצף'])
    expect([1, 2, 5].map(n => plural(en.home.streak, n))).toEqual(['1 day in a row', '2 days in a row', '5 days in a row'])
  })
  it('greeting lines fill in name and count', () => {
    const vars = { greet: en.home.greet.morning, name: `${en.home.nameSep}Sam`, n: 3 }
    expect(fmt(en.home.greetLine.streak, vars)).toBe('Good morning, Sam. 3 days in a row.')
    expect(fmt(he.home.greetLine.fresh, { greet: he.home.greet.evening, name: '' })).toBe('ערב טוב. יום חדש, צעד חדש.')
  })
})

// Dashboard is Firebase-heavy to render; instead check every string it reads exists in both languages.
describe('Dashboard string keys', () => {
  const src = readFileSync('src/pages/Dashboard.jsx', 'utf8')
  const roots = { th: 'home', tw: 'home.workout', ss: 'home.setSummary', eh: 'home.editHabit', td: 'dashboard', to: 'onboarding' }
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
  const used = [...new Set([...src.matchAll(/\b(th|tw|ss|eh|td|to)\.([a-zA-Z][\w.]*)/g)].map(m => `${roots[m[1]]}.${m[2]}`))]

  it('reads a known set of keys', () => {
    expect(used.length).toBeGreaterThan(40)
  })
  it.each(used)('%s exists in he and en', key => {
    expect(get(he, key)).toBeDefined()
    expect(get(en, key)).toBeDefined()
  })
  it('every daily workout id, category and intensity has text in both languages', () => {
    const ids = [...src.matchAll(/\{ id: '(\w+)',\s+category: '(\w+)',\s+intensity: '(\w+)'/g)]
    expect(ids.length).toBe(7)
    for (const [, id, cat, level] of ids) {
      for (const L of [he, en]) {
        expect(L.home.workout.items[id]?.name).toBeTruthy()
        expect(L.home.workout.category[cat]).toBeTruthy()
        expect(L.home.workout.intensity[level]).toBeTruthy()
      }
    }
  })
})
