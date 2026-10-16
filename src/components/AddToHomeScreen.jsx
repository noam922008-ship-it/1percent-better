import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { needsConsentChoice } from '../services/analytics'
import { CONSENT_CHOICE_EVENT } from './ConsentBanner'

// "Add to Home Screen" banner. Shown on the welcome page and in the app, on phones, until the user
// installs or dismisses it (it comes back after DISMISS_DAYS). Hidden once the app runs installed.
//   iOS:     no install API → show the Share → "Add to Home Screen" steps.
//   Android: the browser fires `beforeinstallprompt` once per page load. That can happen while the
//            user is still on the welcome page, so it is captured here at import time (the app is
//            a single page, so the event is not lost when the user moves on to the dashboard).

const DISMISSED_KEY = 'prime_a2hs_dismissed'
const DISMISS_DAYS  = 14

let deferredPrompt = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach(fn => fn())
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    listeners.forEach(fn => fn())
  })
}

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export function wasDismissedRecently(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const at = Number(storage.getItem(DISMISSED_KEY))
    return Number.isFinite(at) && at > 0 && now - at < DISMISS_DAYS * 86400000
  } catch { return false }
}

export default function AddToHomeScreen({ bottom = 80 }) {
  const { t } = useLang()
  const ti = t.install
  const [show, setShow] = useState(false)
  const [ios,  setIOS]  = useState(false)
  // The analytics consent bar comes first; this banner waits until it's answered
  const [consentPending, setConsentPending] = useState(needsConsentChoice)

  useEffect(() => {
    if (!consentPending) return undefined
    const done = () => setConsentPending(false)
    window.addEventListener(CONSENT_CHOICE_EVENT, done)
    return () => window.removeEventListener(CONSENT_CHOICE_EVENT, done)
  }, [consentPending])

  useEffect(() => {
    if (consentPending) return undefined
    if (isStandalone()) return undefined
    if (wasDismissedRecently()) return undefined
    const ua = navigator.userAgent
    if (!/iPhone|iPad|iPod|Android/i.test(ua)) return undefined

    const onIOS = /iPhone|iPad|iPod/i.test(ua)
    setIOS(onIOS)
    if (onIOS) { setShow(true); return undefined }

    const sync = () => setShow(!!deferredPrompt)
    listeners.add(sync)
    sync()
    return () => { listeners.delete(sync) }
  }, [consentPending])

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch { /* ignore */ }
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    const evt = deferredPrompt
    deferredPrompt = null
    evt.prompt()
    const { outcome } = await evt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom, left: 12, right: 12, zIndex: 4000,
      background: '#1a1a2e', border: '1px solid rgba(196,121,90,0.35)',
      borderRadius: 16, padding: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      animation: 'slide-up 0.28s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: 2 }} aria-hidden="true">📲</span>

        <div style={{ flex: 1 }}>
          <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem', margin: '0 0 0.2rem' }}>
            {ti.title}
          </p>

          {ios ? (
            <p style={{ color: 'rgba(241,245,249,0.55)', fontSize: '0.75rem', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
              {ti.iosTap}{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 5, padding: '1px 5px', fontSize: '0.8rem' }}>
                <svg width="12" height="14" viewBox="0 0 24 26" fill="none" style={{ display: 'inline' }} aria-hidden="true">
                  <path d="M12 1v16M6 7l6-6 6 6" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="10" width="20" height="14" rx="3" stroke="#60a5fa" strokeWidth="2"/>
                </svg>
                {ti.share}
              </span>
              {' '}{ti.iosThen}{' '}
              <strong style={{ color: 'rgba(241,245,249,0.8)' }}>{ti.addToHome}</strong>
              {' '}{ti.iosWhy}
            </p>
          ) : (
            <p style={{ color: 'rgba(241,245,249,0.55)', fontSize: '0.75rem', margin: '0 0 0.75rem' }}>
              {ti.androidWhy}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!ios && (
              <button
                onClick={install}
                className="btn-primary btn-tactile"
                style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800 }}
              >
                {ti.installNow}
              </button>
            )}
            <button
              onClick={dismiss}
              className="btn-tactile"
              style={{
                flex: ios ? 1 : 'none',
                padding: '0.55rem 0.9rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(241,245,249,0.4)', cursor: 'pointer',
              }}
            >
              {ios ? ti.gotIt : ti.later}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
