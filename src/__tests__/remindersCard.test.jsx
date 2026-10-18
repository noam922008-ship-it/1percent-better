import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'

const lang = { current: 'he' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he }),
}))
const register = vi.fn(async () => 'tok')
vi.mock('../services/fcmService', () => ({ registerFcmToken: (...a) => register(...a) }))

import RemindersCard, { shouldShowReminders, laterRecently } from '../components/RemindersCard'

const memory = () => {
  const m = new Map()
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }
}

function stubNotification(permission, answer = 'granted') {
  const N = { permission, requestPermission: vi.fn(async () => { N.permission = answer; return answer }) }
  window.Notification = N
  return N
}

describe('reminders card on Home', () => {
  beforeEach(() => { lang.current = 'he'; register.mockClear(); localStorage.clear() })
  afterEach(() => { delete window.Notification })

  it('shows only for a signed-in user whose permission is still undecided', () => {
    stubNotification('default')
    expect(shouldShowReminders({ uid: 'u1', isGuest: false }, memory())).toBe(true)
    expect(shouldShowReminders({ uid: 'u1', isGuest: true }, memory())).toBe(false)
    expect(shouldShowReminders({ uid: null }, memory())).toBe(false)
    stubNotification('granted')
    expect(shouldShowReminders({ uid: 'u1' }, memory())).toBe(false)
    stubNotification('denied')
    expect(shouldShowReminders({ uid: 'u1' }, memory())).toBe(false)
  })

  it('hidden where the browser has no notifications (iPhone Safari outside the installed app)', () => {
    expect(shouldShowReminders({ uid: 'u1' }, memory())).toBe(false)
  })

  it('"Later" hides it for 7 days', () => {
    const store = memory()
    const now = Date.parse('2026-10-19T10:00:00Z')
    store.setItem('prime_reminders_later', String(now - 6 * 86400000))
    expect(laterRecently(store, now)).toBe(true)
    store.setItem('prime_reminders_later', String(now - 8 * 86400000))
    expect(laterRecently(store, now)).toBe(false)
  })

  it('asks the browser only on tap, then saves this device for push in its language', async () => {
    const N = stubNotification('default', 'granted')
    lang.current = 'en'
    render(<RemindersCard uid="u1" isGuest={false} />)
    expect(N.requestPermission).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Turn on reminders'))
    await waitFor(() => expect(register).toHaveBeenCalledWith('u1', 'en'))
    await waitFor(() => expect(screen.queryByText('Turn on reminders')).toBeNull())
  })

  it('a "Block" answer saves nothing and the card goes away', async () => {
    stubNotification('default', 'denied')
    render(<RemindersCard uid="u1" isGuest={false} />)
    fireEvent.click(screen.getByText(he.reminders.turnOn))
    await waitFor(() => expect(screen.queryByText(he.reminders.turnOn)).toBeNull())
    expect(register).not.toHaveBeenCalled()
  })

  it('Hebrew and English have the same keys', () => {
    expect(Object.keys(en.reminders)).toEqual(Object.keys(he.reminders))
  })
})
