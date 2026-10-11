import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase/firestore', () => ({
  doc:        vi.fn((_db, ...path) => path.join('/')),
  setDoc:     vi.fn(() => Promise.resolve()),
  getDoc:     vi.fn(), onSnapshot: vi.fn(), collection: vi.fn(), query: vi.fn(),
  orderBy:    vi.fn(), limit: vi.fn(), getDocs: vi.fn(),
}))
vi.mock('../services/firebase', () => ({ db: {} }))

import { setDoc } from 'firebase/firestore'
import { syncLocale, deviceTimeZone, setProfileAutoCreate } from '../services/focusTriggerService'

beforeEach(() => {
  localStorage.clear()
  setDoc.mockClear()
  setDoc.mockImplementation(() => Promise.resolve())
  setProfileAutoCreate(true)
})

describe('syncLocale — lang + tz on users/{uid}', () => {
  it('writes lang and tz to users/{uid} with merge', async () => {
    expect(await syncLocale('u1', 'en', 'America/New_York')).toBe(true)
    expect(setDoc).toHaveBeenCalledWith('users/u1', { lang: 'en', tz: 'America/New_York' }, { merge: true })
  })

  it("doesn't write again when nothing changed", async () => {
    await syncLocale('u1', 'he', 'Asia/Jerusalem')
    expect(await syncLocale('u1', 'he', 'Asia/Jerusalem')).toBe(false)
    expect(setDoc).toHaveBeenCalledTimes(1)
  })

  it('writes again when the language or time zone changes', async () => {
    await syncLocale('u1', 'he', 'Asia/Jerusalem')
    await syncLocale('u1', 'en', 'Asia/Jerusalem')
    await syncLocale('u1', 'en', 'Europe/London')
    expect(setDoc).toHaveBeenCalledTimes(3)
    expect(setDoc).toHaveBeenLastCalledWith('users/u1', { lang: 'en', tz: 'Europe/London' }, { merge: true })
  })

  it('writes lang only when the time zone is unknown', async () => {
    await syncLocale('u1', 'he', null)
    expect(setDoc).toHaveBeenCalledWith('users/u1', { lang: 'he' }, { merge: true })
  })

  it('skips guests and accounts being deleted', async () => {
    expect(await syncLocale(null, 'he', 'Asia/Jerusalem')).toBe(false)
    setProfileAutoCreate(false)
    expect(await syncLocale('u1', 'he', 'Asia/Jerusalem')).toBe(false)
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('retries next time if the write failed', async () => {
    setDoc.mockImplementationOnce(() => Promise.reject(new Error('offline')))
    expect(await syncLocale('u1', 'he', 'Asia/Jerusalem')).toBe(false)
    expect(await syncLocale('u1', 'he', 'Asia/Jerusalem')).toBe(true)
  })

  it('deviceTimeZone returns a zone name the rules accept', () => {
    const tz = deviceTimeZone()
    if (tz !== null) expect(tz).toMatch(/^[A-Za-z0-9_+/-]{1,64}$/)
  })
})
