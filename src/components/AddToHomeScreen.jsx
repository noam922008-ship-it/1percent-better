import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import { needsConsentChoice } from '../services/analytics'
import { CONSENT_CHOICE_EVENT } from './ConsentBanner'

// "Add to Home Screen", in two forms so it never arrives as a second pop-up right after the
// analytics consent bar (people tap through two bars in a row without reading):
//   • InstallButton — a quiet button inside the welcome card. Opens the steps on tap. Always
//     there on phones until the app runs installed; nothing to dismiss.
//   • default (AddToHomeScreen) — a pop-up in the app, shown only after a win (`ready`: the user
//     finished something today) and after the consent bar was answered. Dismiss → back in 14 days.
//   iOS:     no install API → show the Share → "Add to Home Screen" steps.
//   Android: the browser fires `beforeinstallprompt` once per page load, possibly while the user
//            is still on the welcome page, so it is captured here at import time.

const DISMISSED_KEY = 'prime_a2hs_dismissed'
const DISMISS_DAYS  = 14
const POPUP_DELAY   = 1500

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

// { canInstall, ios }: canInstall = a phone, not installed yet, and (Android) the browser offered it
function useInstallState() {
  const [state, setState] = useState({ canInstall: false, ios: false })
  useEffect(() => {
    if (isStandalone()) return undefined
    const ua = navigator.userAgent
    if (!/iPhone|iPad|iPod|Android/i.test(ua)) return undefined
    if (/iPhone|iPad|iPod/i.test(ua)) { setState({ canInstall: true, ios: true }); return undefined }
    const sync = () => setState({ canInstall: !!deferredPrompt, ios: false })
    listeners.add(sync)
    sync()
    return () => { listeners.delete(sync) }
  }, [])
  return state
}

async function promptInstall() {
  if (!deferredPrompt) return false
  const evt = deferredPrompt
  deferredPrompt = null
  evt.prompt()
  const { outcome } = await evt.userChoice
  return outcome === 'accepted'
}

function IosSteps({ ti }) {
  return (
    <p style={{ color: 'rgba(241,245,249,0.6)', fontSize: '0.78rem', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
      {ti.iosTap}{' '}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 5, padding: '1px 5px', fontSize: '0.8rem' }}>
        <svg width="12" height="14" viewBox="0 0 24 26" fill="none" style={{ display: 'inline' }} aria-hidden="true">
          <path d="M12 1v16M6 7l6-6 6 6" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="2" y="10" width="20" height="14" rx="3" stroke="#60a5fa" strokeWidth="2"/>
        </svg>
        {ti.share}
      </span>
      {' '}{ti.iosThen}{' '}
      <strong style={{ color: 'rgba(241,245,249,0.85)' }}>{ti.addToHome}</strong>
      {' '}{ti.iosWhy}
    </p>
  )
}

// Quiet button for the welcome card. iOS: tap shows the steps inline. Android: tap opens the browser's install dialog.
export function InstallButton() {
  const { t } = useLang()
  const ti = t.install
  const { canInstall, ios } = useInstallState()
  const [open, setOpen] = useState(false)
  if (!canInstall) return null

  return (
    <div style={{ marginTop: '0.75rem', textAlign: 'start' }}>
      <button
        type="button"
        onClick={() => (ios ? setOpen(o => !o) : promptInstall())}
        aria-expanded={ios ? open : undefined}
        style={{
          width: '100%', minHeight: 44, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
          background: 'transparent', border: '1px dashed rgba(255,255,255,0.18)',
          color: 'rgba(241,245,249,0.7)', fontSize: '0.82rem', fontWeight: 700,
        }}
      >
        📲 {ti.button}
      </button>
      {ios && open && (
        <div style={{ marginTop: '0.6rem', padding: '0.75rem 0.85rem 0.1rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <IosSteps ti={ti} />
        </div>
      )}
    </div>
  )
}

// In-app pop-up, after a win. `ready`: the user finished something today.
export default function AddToHomeScreen({ bottom = 80, ready = false }) {
  const { t } = useLang()
  const ti = t.install
  const { canInstall, ios } = useInstallState()
  const [show, setShow] = useState(false)
  // The analytics consent bar comes first; this waits until it's answered
  const [consentPending, setConsentPending] = useState(needsConsentChoice)

  useEffect(() => {
    if (!consentPending) return undefined
    const done = () => setConsentPending(false)
    window.addEventListener(CONSENT_CHOICE_EVENT, done)
    return () => window.removeEventListener(CONSENT_CHOICE_EVENT, done)
  }, [consentPending])

  useEffect(() => {
    if (!ready || consentPending || !canInstall || wasDismissedRecently()) return undefined
    const id = setTimeout(() => setShow(true), POPUP_DELAY)
    return () => clearTimeout(id)
  }, [ready, consentPending, canInstall])

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch { /* ignore */ }
    setShow(false)
  }

  if (!show || !canInstall) return null

  return (
    <div role="dialog" aria-label={ti.winTitle} style={{
      position: 'fixed', bottom, left: 12, right: 12, zIndex: 4000, maxWidth: 480, margin: '0 auto',
      background: '#1a1a2e', border: '1px solid rgba(196,121,90,0.35)',
      borderRadius: 16, padding: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      animation: 'slide-up 0.28s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: 2 }} aria-hidden="true">📲</span>

        <div style={{ flex: 1 }}>
          <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.9rem', margin: '0 0 0.2rem' }}>
            {ti.winTitle}
          </p>

          {ios ? <IosSteps ti={ti} /> : (
            <p style={{ color: 'rgba(241,245,249,0.6)', fontSize: '0.78rem', margin: '0 0 0.75rem' }}>
              {ti.androidWhy}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!ios && (
              <button
                onClick={async () => { if (await promptInstall()) setShow(false) }}
                className="btn-primary btn-tactile"
                style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800, minHeight: 44 }}
              >
                {ti.installNow}
              </button>
            )}
            <button
              onClick={dismiss}
              className="btn-tactile"
              style={{
                flex: ios ? 1 : 'none', minHeight: 44,
                padding: '0.55rem 0.9rem', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(241,245,249,0.55)', cursor: 'pointer',
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
