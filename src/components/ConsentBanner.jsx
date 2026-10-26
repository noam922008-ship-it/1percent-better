import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { needsConsentChoice, setConsent } from '../services/analytics'
import { useLang } from '../context/LangContext'

// Analytics consent (FEATURES.consentBanner) — a small cookie bar at the bottom of the screen (one short
// line + two equal buttons, so it doesn't cover the welcome screen),
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
    flex: 1, minHeight: 40, borderRadius: 9, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <section
      role="dialog"
      aria-label={tc.aria}
      style={{
        position: 'fixed', left: 8, right: 8, bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))', zIndex: 4500,
        maxWidth: 480, margin: '0 auto',
        background: '#111317', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '0.6rem 0.75rem',
        boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
      }}
    >
      <p style={{ color: '#e8eaf0', fontSize: '0.74rem', lineHeight: 1.45, margin: 0 }}>
        {tc.short}{' '}
        <Link to="/privacy" style={{ color: 'rgba(245,197,24,0.8)', fontWeight: 700, textDecoration: 'underline' }}>{tc.privacy}</Link>
      </p>
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => choose(true)}
          className="btn-tactile"
          style={{ ...btn, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.3)', color: '#F4F1E8' }}
        >
          {tc.accept}
        </button>
        <button
          onClick={() => choose(false)}
          className="btn-tactile"
          style={{ ...btn, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.3)', color: '#F4F1E8' }}
        >
          {tc.decline}
        </button>
      </div>
    </section>
  )
}
