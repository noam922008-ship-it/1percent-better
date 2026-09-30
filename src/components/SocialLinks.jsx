// PRIME's social profiles — small gold icons, open in a new tab.
// Used in the signup screen footer, Settings and the legal pages (next to the contact email).
// Profiles live in src/config/social.js.

import { SOCIAL } from '../config/social'

function InstagramIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

const ICONS = { instagram: InstagramIcon }

export default function SocialLinks({ size = 18, align = 'center' }) {
  const links = SOCIAL.filter(s => s.url)
  if (!links.length) return null
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: align }}>
      {links.map(s => {
        const Icon = ICONS[s.id]
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`PRIME ב-${s.label}`}
            title={s.label}
            style={{
              width: 40, height: 40, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#D9B34C', border: '1px solid rgba(217,179,76,0.3)', background: 'rgba(217,179,76,0.06)',
            }}
          >
            <Icon size={size} />
          </a>
        )
      })}
    </div>
  )
}
