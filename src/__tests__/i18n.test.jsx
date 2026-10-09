import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import t from '../i18n/translations'
import he from '../i18n/he'
import en from '../i18n/en'
import { detectLang } from '../i18n/detectLang'
import { FEATURES } from '../config/features'
import { LangProvider, useLang } from '../context/LangContext'

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null, isGuest: true, logout: async () => {} }) }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ prefs: {}, setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../services/accountDeletionService', () => ({ deleteGuestData: () => {} }))

import Settings from '../components/Settings'

// Every key path (arrays: their length), so he and en can be compared shape for shape
function shape(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k
    if (Array.isArray(v)) return [`${path}[${v.length}]`]
    if (v && typeof v === 'object') return shape(v, path)
    return [path]
  }).sort()
}

const store = (saved) => ({ getItem: () => saved })
const device = (...languages) => ({ languages, language: languages[0] })

describe('translations — one file per language', () => {
  it('he.js and en.js have the same keys', () => {
    expect(shape(en)).toEqual(shape(he))
  })
  it('translations.js still exposes both', () => {
    expect(t.he).toBe(he)
    expect(t.en).toBe(en)
  })
})

describe('detectLang', () => {
  it('English off: always Hebrew, whatever is saved or the device says', () => {
    expect(detectLang({ enabled: false, storage: store('en'), nav: device('en-US') })).toBe('he')
  })
  it('saved choice wins over the device', () => {
    expect(detectLang({ enabled: true, storage: store('he'), nav: device('en-US') })).toBe('he')
    expect(detectLang({ enabled: true, storage: store('en'), nav: device('he-IL') })).toBe('en')
  })
  it('no saved choice: Hebrew device → he, anything else → en', () => {
    expect(detectLang({ enabled: true, storage: store(null), nav: device('he-IL') })).toBe('he')
    expect(detectLang({ enabled: true, storage: store(null), nav: device('iw') })).toBe('he')
    expect(detectLang({ enabled: true, storage: store(null), nav: device('en-GB') })).toBe('en')
    expect(detectLang({ enabled: true, storage: store(null), nav: device('fr-FR', 'he') })).toBe('en')
    expect(detectLang({ enabled: true, storage: store(null), nav: {} })).toBe('en')
  })
  it('ignores an unknown saved value and unreadable storage', () => {
    expect(detectLang({ enabled: true, storage: store('fr'), nav: device('he-IL') })).toBe('he')
    const broken = { getItem: () => { throw new Error('blocked') } }
    expect(detectLang({ enabled: true, storage: broken, nav: device('en-US') })).toBe('en')
  })
})

function Probe() {
  const { lang, setLang, t: tr } = useLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{tr.onboarding.name.title}</span>
      <button onClick={() => setLang('en')}>to-en</button>
      <button onClick={() => setLang('he')}>to-he</button>
    </div>
  )
}

describe('LangProvider — <html dir> and <html lang>', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('dir')
    document.documentElement.removeAttribute('lang')
  })
  afterEach(() => {
    FEATURES.english = false
    vi.unstubAllEnvs()
  })

  it('English on (production build): switching flips dir/lang and remembers the choice', () => {
    vi.stubEnv('DEV', false)
    FEATURES.english = true
    localStorage.setItem('ft_lang', 'he')
    render(<LangProvider><Probe /></LangProvider>)
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('he')

    fireEvent.click(screen.getByText('to-en'))
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(screen.getByTestId('title').textContent).toBe(en.onboarding.name.title)
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('ft_lang')).toBe('en')

    fireEvent.click(screen.getByText('to-he'))
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('he')
  })

  it('English off (production build): Hebrew + rtl even with English saved, and switching does nothing', () => {
    vi.stubEnv('DEV', false)
    localStorage.setItem('ft_lang', 'en')
    render(<LangProvider><Probe /></LangProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('he')

    act(() => { fireEvent.click(screen.getByText('to-en')) })
    expect(screen.getByTestId('lang').textContent).toBe('he')
    expect(document.documentElement.dir).toBe('rtl')
    expect(localStorage.getItem('ft_lang')).toBe('en') // untouched, not overwritten
  })

  it('ships with English off', () => {
    expect(FEATURES.english).toBe(false)
  })
})

describe('Settings — language picker', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllEnvs())

  it('hidden in a production build with English off', () => {
    vi.stubEnv('DEV', false)
    render(<LangProvider><Settings /></LangProvider>)
    expect(screen.queryByText('שפה / Language')).toBeNull()
    expect(screen.queryByText('English')).toBeNull()
  })

  it('shown in dev, and picking English switches the page to ltr', () => {
    vi.stubEnv('DEV', true)
    localStorage.setItem('ft_lang', 'he')
    render(<LangProvider><Settings /></LangProvider>)
    expect(screen.getByText('שפה / Language')).toBeInTheDocument()
    fireEvent.click(screen.getByText('English'))
    expect(screen.getByText('English').closest('button')).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
  })
})
