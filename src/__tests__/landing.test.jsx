import { render, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { hasGuestData, shouldOpenApp } from '../utils/landingEligibility'
import LandingRoute from '../components/LandingRoute'

let authState
vi.mock('../context/AuthContext', () => ({ useAuth: () => authState }))
function Welcome() { return <p>Welcome{useLocation().search}</p> }
function mount() {
  return render(<MemoryRouter initialEntries={['/?utm_source=test']}><Routes>
    <Route path="/" element={<LandingRoute />} />
    <Route path="/welcome" element={<Welcome />} />
  </Routes></MemoryRouter>)
}
beforeEach(() => {
  localStorage.clear()
  authState = { user: null, isGuest: false, authLoading: false }
  window.matchMedia = vi.fn(() => ({ matches: false }))
  Object.defineProperty(navigator, 'standalone', { value: false, configurable: true })
  document.documentElement.className = 'landing-pending'
})
afterEach(cleanup)

describe('landing eligibility and existing entry path', () => {
  it('shows landing only after authentication resolves', () => {
    authState.authLoading = true
    const result = mount()
    expect(document.documentElement).not.toHaveClass('landing-visible')
    authState.authLoading = false
    result.rerender(<MemoryRouter><LandingRoute /></MemoryRouter>)
    expect(document.documentElement).toHaveClass('landing-visible')
  })
  it.each(['signed-in', 'guest-session', 'guest-record', 'installed', 'ios-installed'])(
    'keeps %s users on the original welcome path and preserves attribution', async kind => {
      if (kind === 'signed-in') authState.user = { uid: 'existing-user' }
      if (kind === 'guest-session') authState.isGuest = true
      if (kind === 'guest-record') localStorage.setItem('prime_guest_triggers', '[]')
      if (kind === 'installed') window.matchMedia = () => ({ matches: true })
      if (kind === 'ios-installed') Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
      const result = mount()
      await waitFor(() => expect(result.getByText('Welcome?utm_source=test')).toBeInTheDocument())
      expect(document.documentElement).not.toHaveClass('landing-visible')
    })
  it.each(['prime_guest_triggers','prime_my_tasks_guest','prime_journal_guest','prime_lesson_notes_guest','prime_habit_log_guest','prime_welcome_v2','ft_checkins_2026-10-29'])(
    'recognizes %s even if empty or malformed', key => {
      localStorage.setItem(key, 'invalid')
      expect(hasGuestData(localStorage)).toBe(true)
    })
  it('does not treat preferences or migration markers as guest data', () => {
    for (const key of ['prime_lang', '_v2_init', '_v3_init', 'prime_consent']) localStorage.setItem(key, '1')
    expect(hasGuestData(localStorage)).toBe(false)
    expect(shouldOpenApp({})).toBe(false)
  })
})

it.each(['he', 'en'])('ships crawlable %s content, matching metadata and five FAQ entries without JS', lang => {
  const file = readFileSync(new URL(lang === 'he' ? '../../index.html' : '../../en/index.html', import.meta.url), 'utf8')
  const doc = new DOMParser().parseFromString(file, 'text/html')
  const description = lang === 'he'
    ? 'PRIME Daily: אפליקציה חינמית להתחיל הרגל טוב או להפסיק הרגל רע. צעד אחד ברור כל יום.'
    : 'PRIME Daily: a free app to start a good habit or quit a bad one. One clear step a day.'
  expect(doc.title).toBe(description)
  expect(doc.querySelector('meta[name="description"]').content).toBe(description)
  expect(doc.querySelector('h1').textContent).toBe(description)
  const graph = JSON.parse(doc.querySelector('[type="application/ld+json"]').textContent)['@graph']
  expect(graph[0].description).toBe(description)
  expect(graph[1].mainEntity).toHaveLength(5)
  const articles = doc.querySelectorAll('.landing-faq article')
  graph[1].mainEntity.forEach((q, i) => expect(articles[i].textContent).toContain(q.name))
  expect(doc.querySelector('.landing-cta').getAttribute('href')).toBe('/welcome')
  expect(doc.querySelectorAll('link[hreflang]')).toHaveLength(3)
})
