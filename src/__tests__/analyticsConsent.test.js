import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Analytics consent (FEATURES.consentBanner). Runs the service as in a production build
// (PROD + measurement id) and records everything that would reach Firebase Analytics.
const calls = { init: 0, logged: [], collection: [] }
vi.mock('firebase/analytics', () => ({
  initializeAnalytics: () => { calls.init++; return {} },
  logEvent: (_a, name, params) => calls.logged.push([name, params]),
  isSupported: async () => true,
  setAnalyticsCollectionEnabled: (_a, on) => calls.collection.push(on),
}))
vi.mock('../services/firebase', () => ({ app: {} }))
const flags = vi.hoisted(() => ({ consentBanner: false }))
vi.mock('../config/features', () => ({ FEATURES: flags }))

async function load(consentBanner) {
  flags.consentBanner = consentBanner
  vi.resetModules()
  return import('../services/analytics')
}

beforeEach(() => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST')
  calls.init = 0; calls.logged = []; calls.collection = []
  localStorage.clear()
  window.history.replaceState(null, '', '/?utm_source=tiktok')
})
afterEach(() => {
  vi.unstubAllEnvs()
  document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
})

describe('flag off: same as before', () => {
  it('GA starts on landing, app_open sent, no banner, no consent key', async () => {
    const a = await load(false)
    await a.startAnalytics()
    expect(calls.init).toBe(1)
    expect(calls.logged).toEqual([['app_open', { utm_source: 'tiktok' }]])
    expect(calls.collection).toEqual([])
    expect(a.needsConsentChoice()).toBe(false)
    expect(a.getConsent()).toBe('granted')
    expect(localStorage.getItem('prime_first_open')).not.toBeNull()
    await a.setConsent(false)                       // no-op with the flag off
    a.track('task_added')
    expect(calls.logged.at(-1)).toEqual(['task_added', {}])
    expect(localStorage.getItem(a.CONSENT_KEY)).toBeNull()
  })
})

describe('flag on, before a choice', () => {
  it('GA not loaded, nothing sent, nothing written to localStorage', async () => {
    const a = await load(true)
    await a.startAnalytics()
    a.track('welcome_start')
    a.track('task_added')
    expect(a.needsConsentChoice()).toBe(true)
    expect(calls.init).toBe(0)
    expect(calls.logged).toEqual([])
    expect(localStorage.length).toBe(0)
  })
})

describe('accept', () => {
  it('loads GA and sends this visit\'s waiting events in order, then live ones', async () => {
    const a = await load(true)
    await a.startAnalytics()
    a.track('welcome_start')
    await a.setConsent(true)
    expect(calls.init).toBe(1)
    expect(calls.logged).toEqual([['app_open', { utm_source: 'tiktok' }], ['welcome_start', {}]])
    a.track('task_added')
    expect(calls.logged.at(-1)).toEqual(['task_added', {}])
    expect(localStorage.getItem(a.CONSENT_KEY)).toBe('granted')
    expect(a.needsConsentChoice()).toBe(false)
  })

  it('return_next_day counts from the day of consent', async () => {
    const a = await load(true)
    await a.startAnalytics()
    expect(localStorage.getItem('prime_first_open')).toBeNull()
    await a.setConsent(true)
    expect(localStorage.getItem('prime_first_open')).not.toBeNull()
  })

  it('a later visit with consent saved: GA starts on landing', async () => {
    localStorage.setItem('prime_analytics_consent', 'granted')
    const a = await load(true)
    await a.startAnalytics()
    expect(calls.init).toBe(1)
    expect(calls.logged).toEqual([['app_open', { utm_source: 'tiktok' }]])
  })
})

describe('decline', () => {
  it('drops the waiting events and never loads GA', async () => {
    const a = await load(true)
    await a.startAnalytics()
    a.track('welcome_start')
    await a.setConsent(false)
    a.track('task_added')
    expect(calls.init).toBe(0)
    expect(calls.logged).toEqual([])
    expect(localStorage.getItem(a.CONSENT_KEY)).toBe('denied')
    expect(a.needsConsentChoice()).toBe(false)
  })

  it('a later visit with decline saved: nothing at all', async () => {
    localStorage.setItem('prime_analytics_consent', 'denied')
    const a = await load(true)
    await a.startAnalytics()
    a.track('task_added')
    expect(calls.init).toBe(0)
    expect(calls.logged).toEqual([])
  })

  it('the choice holds for the session even if localStorage can\'t be written', async () => {
    const a = await load(true)
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => {} }
    await a.setConsent(false, broken)
    expect(a.getConsent(broken)).toBe('denied')
    expect(a.needsConsentChoice()).toBe(false)
  })
})

describe('turning it off later in Settings', () => {
  it('stops GA, deletes _ga cookies and the return_next_day keys; can be turned back on', async () => {
    const a = await load(true)
    await a.setConsent(true)
    await a.startAnalytics()
    document.cookie = '_ga=GA1.1.123; path=/'
    expect(localStorage.getItem('prime_first_open')).not.toBeNull()

    await a.setConsent(false)
    expect(calls.collection).toEqual([false])
    expect(document.cookie).not.toMatch(/_ga=/)
    expect(localStorage.getItem('prime_first_open')).toBeNull()
    const sent = calls.logged.length
    a.track('task_added')
    expect(calls.logged.length).toBe(sent)

    await a.setConsent(true)
    expect(calls.collection).toEqual([false, true])
    expect(calls.init).toBe(1)                        // reused, not loaded twice
    a.track('task_added')
    expect(calls.logged.at(-1)).toEqual(['task_added', {}])
  })
})
