// First-run welcome — one screen, shown once to users with no XP (guests and new sign-ups).
// Start opens the journal for the first entry; Skip goes to Home.
// Replaces the legacy intro screens (PrimeOnboarding / InitiationFlow — hidden via FEATURES.legacyIntro).

import { useLang } from '../context/LangContext'

export default function FirstWelcome({ onStart, onSkip }) {
  const { t } = useLang()
  const s = t.firstWelcome
  return (
    <div style={{
      minHeight: '100vh', background: '#09090b', color: '#F4F1E8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top, 0px) + 1.5rem) 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
      boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', animation: 'fadeIn 0.6s ease both' }}>
        <img src="/prime-logo.svg" alt="PRIME" style={{ height: 28, display: 'block', margin: '0 auto 2.25rem' }} />

        <h1 style={{ margin: '0 0 1rem', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.3 }}>{s.title}</h1>
        <p style={{ margin: 0, color: '#A4A6AD', fontSize: '1rem', lineHeight: 1.7 }}>
          {s.line1}
          <br />
          {s.line2}
        </p>

        <button
          onClick={onStart}
          style={{
            width: '100%', minHeight: 52, marginTop: '2.5rem', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: '#D9B34C', color: '#09090b', fontSize: '1rem', fontWeight: 800, fontFamily: 'inherit',
          }}
        >{s.start}</button>

        <button
          onClick={onSkip}
          style={{
            display: 'block', margin: '0.75rem auto 0', minHeight: 44, padding: '0 1rem',
            background: 'none', border: 'none', color: '#71717A', fontSize: '0.85rem', fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer',
          }}
        >{s.skip}</button>
      </div>
    </div>
  )
}
