import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import he from '../i18n/he'
import en from '../i18n/en'
import { PILLARS } from '../data/pillars'

// Phase 5: the Progress and Profile tabs (Settings, growth pillars, delete account) have no Hebrew UI in English.
// Dates and numbers follow the language (he-IL / en-US). Hebrew output is unchanged.
const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))
const auth = { user: { uid: 'u1', email: 'test@example.com', displayName: 'Noa' }, isGuest: false, logout: async () => {} }
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../context/UserContext', () => ({ useUserPrefs: () => ({ prefs: { learnTopics: ['money'], prefDuration: '5' }, setPrefs: () => {} }) }))
vi.mock('react-router-dom', () => ({ useNavigate: () => () => {} }))
vi.mock('../services/accountDeletionService', () => ({
  deleteGuestData: () => {}, signInMethod: () => 'password',
  deleteAccount: async () => 'deleted', finishDeleteAfterReauth: async () => {}, cancelDeletion: () => {},
}))

import AnalyticsTab from '../pages/AnalyticsTab'
import Settings from '../components/Settings'
import GrowthPillarSelector from '../components/GrowthPillarSelector'
import DeleteAccountSheet from '../components/DeleteAccountSheet'
import { getDailyNudgeMessage } from '../services/notificationService'
import { keywordMatches, detectNicheRecs } from '../utils/nicheKeywords'

const HEBREW = /[֐-׿]/

// Same check as i18nHome / i18nWorkouts: visible text plus placeholder / aria-label / title.
// Elements with a lang attribute (the language picker's "עברית") are left out.
function hebrewIn(container) {
  const found = []
  const copy = container.cloneNode(true)
  copy.querySelectorAll('[lang]').forEach(el => el.remove())
  if (HEBREW.test(copy.textContent)) found.push(copy.textContent.match(/[֐-׿][^\n]{0,40}/)[0])
  copy.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => {
    for (const a of ['placeholder', 'aria-label', 'title']) {
      const v = el.getAttribute(a)
      if (v && HEBREW.test(v)) found.push(`${a}="${v}"`)
    }
  })
  return found
}

const todayKey = () => new Date().toISOString().slice(0, 10)
// Four Sundays → the peak day is Sunday whatever today is
const SUNDAYS = ['2026-09-06', '2026-09-13', '2026-09-20', '2026-09-27']
const profile = (streak = 8) => ({ name: 'Noa', xp: 12345, activityLog: SUNDAYS, challenges: {}, streak: { count: streak, lastDate: todayKey() } })

beforeEach(() => { lang.current = 'en'; auth.isGuest = false })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('Progress tab (AnalyticsTab)', () => {
  it('English: no Hebrew, en-US numbers and weekday', () => {
    const { container } = render(<AnalyticsTab profile={profile()} />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('Your progress')).toBeInTheDocument()
    expect(screen.getByText('12,345')).toBeInTheDocument()
    expect(screen.getByText('8 days')).toBeInTheDocument()
    expect(screen.getByText(/Sunday is your strongest day/)).toBeInTheDocument()
    expect(screen.getByText('4 active days in total')).toBeInTheDocument()
    // Day letters of the 14-day chart come from en-US
    expect(container.textContent).toMatch(/[SMTWF]/)
  })

  it('English while loading, with no streak, and singular forms', () => {
    const { container } = render(<AnalyticsTab profile={null} />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('No streak')).toBeInTheDocument()
    cleanup()
    render(<AnalyticsTab profile={{ ...profile(1), activityLog: [todayKey()] }} />)
    expect(screen.getByText('1 day')).toBeInTheDocument()
    expect(screen.getByText('1 active day in total')).toBeInTheDocument()
  })

  it('Hebrew unchanged: copy, day names, day letters, numbers', () => {
    lang.current = 'he'
    const { container } = render(<AnalyticsTab profile={profile()} />)
    expect(screen.getByText('ההתקדמות שלך')).toBeInTheDocument()
    expect(screen.getByText('רצף של 8 ימים! אתה בטריטוריה של העילית. יום ראשון הוא היום החזק ביותר שלך — שמור על העוגן הזה.')).toBeInTheDocument()
    expect(screen.getByText('12,345')).toBeInTheDocument()
    expect(screen.getByText('8 ימים')).toBeInTheDocument()
    expect(screen.getByText('4 ימים פעילים סה״כ')).toBeInTheDocument()
    expect(screen.getByText('8 ימים ברצף')).toBeInTheDocument()
    expect(screen.getByText('תזכורת יומית · 08:00')).toBeInTheDocument()
    const letters = [...container.querySelectorAll('div')].map(d => d.textContent).filter(s => /^[א-ת]׳$/.test(s))
    expect(letters.length).toBe(13)   // 14 days, today shows a dot
    expect(letters.every(l => ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].includes(l))).toBe(true)
  })

  it('Hebrew "peak day" insight reads exactly as before', () => {
    lang.current = 'he'
    render(<AnalyticsTab profile={profile(0)} />)
    expect(screen.getByText('אתה מגיע הכי הרבה ביום ראשון. בנה סביב זה — תזמן את המשימות הקשות ליום הטוב ביותר שלך.')).toBeInTheDocument()
    expect(screen.getByText('אין רצף')).toBeInTheDocument()
  })
})

describe('Daily nudge copy', () => {
  // The function before Phase 5, kept here to prove Hebrew didn't change
  function oldNudge(name, streak) {
    const n = name ? `, ${name}` : ''
    if (streak >= 30) return { title: `🔥 ${streak} ימים${n}`,       body: `אגדה. עוד יום אחד שומר את הלהבה דולקת. אל תשבור את מה שבנית.` }
    if (streak >= 14) return { title: `💪 רצף של ${streak} ימים${n}!`, body: `שבועיים של נוכחות. היום זה עוד צעד אחד. אל תשבור את השרשרת.` }
    if (streak >= 7)  return { title: `⚡ שבוע ברצף${n}!`,            body: `7+ ימים ברצף. אתה כבר בין 10% הטובים. אל תיתן ליום הזה לשבור את הרצף.` }
    if (streak >= 3)  return { title: `🚀 ${streak} ימים ברצף${n}`,   body: `הרצף שלך בונה. הרגל אחד היום שומר על המומנטום. מוכן?` }
    if (streak === 1) return { title: `✅ יום 1 הושלם${n}`,           body: `התחלה טובה. ביום 2 רוב האנשים מוותרים. תגיע שוב היום.` }
    return              { title: `⚡ ההרגלים שלך מחכים${n}`,         body: `כל יום שאתה מגיע הוא הצבעה עבור האדם שאתה הופך להיות. תתחיל היום.` }
  }

  it('Hebrew (the default) is unchanged for every streak band, with and without a name', () => {
    for (const s of [0, 1, 2, 3, 7, 14, 30, 45]) {
      for (const name of ['', 'נועה']) {
        expect(getDailyNudgeMessage(name, s)).toEqual(oldNudge(name, s))
        expect(getDailyNudgeMessage(name, s, 'he')).toEqual(oldNudge(name, s))
      }
    }
  })

  it('English has no Hebrew', () => {
    for (const s of [0, 1, 3, 7, 14, 30]) {
      const { title, body } = getDailyNudgeMessage('Noa', s, 'en')
      expect(title + body).not.toMatch(HEBREW)
    }
    expect(getDailyNudgeMessage('Noa', 14, 'en').title).toBe('💪 14-day streak, Noa!')
  })
})

describe('Profile tab', () => {
  it('Settings in English (signed in, notifications granted): no Hebrew except the language name', () => {
    vi.stubGlobal('Notification', Object.assign(function Notification() {}, { permission: 'granted' }))
    const { container } = render(<Settings leaderboardOptIn leaderboardNickname="noa" />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('עברית').closest('button')).toHaveAttribute('lang', 'he')
    expect(screen.getByText('Send a test notification')).toBeInTheDocument()
    expect(screen.getByText('5 min')).toBeInTheDocument()
    expect(screen.getByText(en.lesson.topics.money)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your nickname')).not.toHaveAttribute('dir')
  })

  it('Settings in English as a guest', () => {
    auth.isGuest = true
    const { container } = render(<Settings />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('Delete data from this device')).toBeInTheDocument()
  })

  it('Settings in Hebrew unchanged (label is now just "שפה")', () => {
    lang.current = 'he'
    vi.stubGlobal('Notification', Object.assign(function Notification() {}, { permission: 'default' }))
    render(<Settings />)
    for (const s of ['⚙ הגדרות', 'שפה', 'התנתקות', 'מחק חשבון', 'תזכורות PRIME', 'נדרש אישור חד-פעמי כדי לקבל תזכורות', '5 דקות', 'מדיניות פרטיות', 'PRIME ברשתות']) {
      expect(screen.getAllByText(s).length, s).toBeGreaterThan(0)
    }
  })

  it('growth pillars: labels by id in English, Hebrew = data', () => {
    const { container } = render(<GrowthPillarSelector selected={['body', 'discipline']} onChange={() => {}} />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('2/3 selected')).toBeInTheDocument()
    expect(screen.getByLabelText('Body — selected')).toBeInTheDocument()
    expect(Object.keys(en.pillars.labels).sort()).toEqual(PILLARS.map(p => p.id).sort())
    for (const p of PILLARS) expect(he.pillars.labels[p.id]).toBe(p.label)
  })
})

describe('Delete account sheet', () => {
  const del = word => screen.getByText(word === 'en' ? 'Delete my account permanently' : 'מחק את החשבון לצמיתות')

  it('English: no Hebrew; confirm word is DELETE, any case; the Hebrew word does nothing', () => {
    const { container } = render(<DeleteAccountSheet onClose={() => {}} onDeleted={() => {}} />)
    expect(hebrewIn(container)).toEqual([])
    const input = screen.getByLabelText('Confirm deletion')
    fireEvent.change(input, { target: { value: 'מחק' } })
    expect(del('en')).toBeDisabled()
    fireEvent.change(input, { target: { value: ' delete ' } })
    expect(del('en')).not.toBeDisabled()
    fireEvent.change(input, { target: { value: 'DELETE' } })
    expect(del('en')).not.toBeDisabled()
  })

  it('Hebrew: still "מחק"; DELETE does nothing', () => {
    lang.current = 'he'
    render(<DeleteAccountSheet onClose={() => {}} onDeleted={() => {}} />)
    const input = screen.getByLabelText('אישור מחיקה')
    fireEvent.change(input, { target: { value: 'DELETE' } })
    expect(del('he')).toBeDisabled()
    fireEvent.change(input, { target: { value: 'מחק' } })
    expect(del('he')).not.toBeDisabled()
  })
})

describe('PathBuilder keywords (hidden behind FEATURES.pathBuilder)', () => {
  it('English keywords match whole words only', () => {
    expect(keywordMatches('i build ai tools', 'ai')).toBe(true)
    expect(keywordMatches('daily training again', 'ai')).toBe(false)
    expect(keywordMatches('i am happy', 'app')).toBe(false)
    expect(keywordMatches('two apps', 'app')).toBe(true)
    expect(keywordMatches('marketing', 'market')).toBe(false)
    expect(keywordMatches('real estate deals', 'real estate')).toBe(true)
  })

  it('Hebrew keywords still match inside words (prefixes)', () => {
    expect(keywordMatches('בכושר טוב', 'כושר')).toBe(true)
    expect(keywordMatches('והשקעות', 'השקעות')).toBe(true)
  })

  it('English vision text picks the right tracks', () => {
    expect(detectNicheRecs({ three_year_vision: 'Build software and AI apps, keep coding daily' })).toContain('ai-beginners')
    expect(detectNicheRecs({ three_year_vision: 'Invest in stocks and real estate, grow my portfolio' })).toContain('capital-markets')
    expect(detectNicheRecs({ three_year_vision: 'Get fit: gym, running and better nutrition' })).toContain('self-discipline')
    expect(detectNicheRecs({ three_year_vision: 'בניית עסק ומותג, לקוחות ומכירות' })).toContain('deal-closer')
  })
})

describe('Phase 5 files', () => {
  it('no hard-coded rtl or physical right/left', () => {
    for (const f of ['pages/AnalyticsTab', 'components/Settings', 'components/GrowthPillarSelector', 'components/DeleteAccountSheet']) {
      // Settings' toggle knob slides left → right in both languages (physical on purpose)
      const src = readFileSync(`src/${f}.jsx`, 'utf8').replace("position: 'absolute', top: 3, left: on ? 23 : 3,", '')
      expect(src, f).not.toMatch(/dir="rtl"|direction: 'rtl'|textAlign: '(right|left)'|border(Right|Left):|margin(Right|Left):/)
    }
  })

  it('every Phase 5 key exists in both languages', () => {
    const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    for (const g of ['progress', 'nudge', 'pillars', 'settings', 'deleteAccount']) {
      expect(keys(en[g]).sort(), g).toEqual(keys(he[g]).sort())
    }
  })
})
