import { useState } from 'react'
import { Link } from 'react-router-dom'
import { needsConsentChoice, setConsent } from '../services/analytics'
import { useLang } from '../context/LangContext'

// Analytics consent (FEATURES.consentBanner) — a card at the top of Home, never on the welcome
// screen and never blocking. Until the user picks, events wait in memory (services/analytics.js).
// The privacy link is a router Link so the page doesn't reload and lose the waiting events.
export default function ConsentBanner() {
  const { t } = useLang()
  const tc = t.consent
  const [open, setOpen] = useState(needsConsentChoice)
  if (!open) return null

  const choose = granted => { setOpen(false); setConsent(granted) }
  const btn = {
    flex: 1, minHeight: 44, borderRadius: 10, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
  }

  return (
    <section
      aria-label={tc.aria}
      style={{ background: '#111317', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 14, padding: '0.9rem 1rem', marginBottom: '0.875rem' }}
    >
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
          style={{ ...btn, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(241,245,249,0.75)' }}
        >
          {tc.decline}
        </button>
      </div>
      <Link
        to="/privacy"
        style={{ display: 'inline-flex', alignItems: 'center', minHeight: 32, marginTop: '0.4rem', color: 'rgba(245,197,24,0.6)', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none' }}
      >
        {tc.privacy}
      </Link>
    </section>
  )
}
