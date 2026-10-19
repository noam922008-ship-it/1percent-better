import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'
import { fmt } from '../i18n/fmt'

const lang = { current: 'he' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he }),
}))
const register = vi.fn(async () => 'tok')
vi.mock('../services/fcmService', () => ({ registerFcmToken: (...a) => register(...a) }))

import TimeReminderAsk from '../components/TimeReminderAsk'

function stub(permission, answer = 'granted') {
  const N = { permission, requestPermission: vi.fn(async () => { N.permission = answer; return answer }) }
  window.Notification = N
  return N
}

describe('setup: offer the reminder when a habit time is picked', () => {
  beforeEach(() => { lang.current = 'he'; register.mockClear() })
  afterEach(() => { delete window.Notification })

  it('no time picked → nothing', () => {
    stub('default')
    const { container } = render(<TimeReminderAsk uid="u1" time="" />)
    expect(container.innerHTML).toBe('')
  })

  it('asks with the picked time, turns push on in the device language', async () => {
    stub('default', 'granted')
    lang.current = 'en'
    render(<TimeReminderAsk uid="u1" time="20:00" />)
    expect(screen.getByText(fmt(en.onboarding.remindAt, { time: '20:00' }))).toBeInTheDocument()
    fireEvent.click(screen.getByText(en.onboarding.remindYes))
    await waitFor(() => expect(register).toHaveBeenCalledWith('u1', 'en'))
    expect(await screen.findByText(fmt(en.onboarding.remindOn, { time: '20:00' }))).toBeInTheDocument()
  })

  it('already allowed, or no notifications on this browser → nothing', () => {
    stub('granted')
    expect(render(<TimeReminderAsk uid="u1" time="08:00" />).container.innerHTML).toBe('')
    delete window.Notification
    expect(render(<TimeReminderAsk uid="u1" time="08:00" />).container.innerHTML).toBe('')
  })
})
