import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { needsConsentChoice, setConsent } from '../services/analytics'
import { useLang } from '../context/LangContext'

// Analytics consent (FEATURES.consentBanner) — a cookie-style bar at the bottom of the screen,
// shown on the first visit on every page (welcome included) until the user picks.
// Not blocking: the app works behind it. Same choice as the switch in Settings → Privacy.
// Both buttons have the same size and weight — accepting must not be easier than declining (EU rules).
// GA isn't loaded before "Accept" and nothing from before the click is sent (services/analytics.js).
// Hidden on the legal pages so the policy can be read; it's back when the user returns.

export const CONSENT_CHOICE_EVENT = 'prime-consent-choice'
const LEGAL_PATHS = ['/privacy', '/terms', '/legal']

export default function ConsentBanner() {
  const { t } = useLang()
  const tc = t.consent
  const { pathname } = useLocation()
  const [open, setOpen] = useState(needsConsentChoice)
  if (!open || LEGAL_PATHS.includes(pathname)) return null

  const choose = granted => {
    setOpen(false)
    setConsent(granted)
    try { window.dispatchEvent(new Event(CONSENT_CHOICE_EVENT)) } catch { /* ignore */ }
  }
  const btn = {
    flex: 1, minHeight: 44, borderRadius: 10, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <section
      role="dialog"
      aria-label={tc.aria}
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', zIndex: 4500,
        maxWidth: 480, margin: '0 auto',
        background: '#111317', border: '1px solid rgba(245,197,24,0.3)', borderRadius: 16, padding: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p style={{ color: '#F4F1E8', fontSize: '0.92rem', fontWeight: 800, margin: '0 0 0.35rem' }}>{tc.title}</p>
      <p style={{ color: '#e8eaf0', fontSize: '0.8rem', lineHeight: 1.55, margin: 0 }}>{tc.text}</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button
          onClick={() => choose(true)}
          className="btn-tactile"
          style={{ ...btn, background: 'rgba(245,197,24,0.9)', border: '1px solid rgba(245,197,24,0.6)', color: '#0e0e16' }}
        >
          {tc.accept}
        </button>
        <button
          onClick={() => choose(false)}
          className="btn-tactile"
          style={{ ...btn, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.35)', color: '#F4F1E8' }}
        >
          {tc.decline}
        </button>
      </div>
      <Link
        to="/privacy"
        style={{ display: 'inline-flex', alignItems: 'center', minHeight: 32, marginTop: '0.4rem', color: 'rgba(245,197,24,0.7)', fontSize: '0.74rem', fontWeight: 600, textDecoration: 'none' }}
      >
        {tc.privacy}
      </Link>
    </section>
  )
}
