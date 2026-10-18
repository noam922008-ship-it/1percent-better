// "Turn on reminders" card on Home.
// Until now the only place that asked for notification permission was Settings, so almost no
// one had push on (stats: 1 device) and the server reminders never reached new users.
// Shown while the permission is still undecided ('default'). The browser prompt only opens on a
// tap here (iPhone requires a tap, and asking out of the blue gets "Block"). On iPhone the
// Notification API exists only in the installed app, so in Safari the card simply isn't shown.
// "Later" hides it for 7 days on this device.

import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { registerFcmToken } from '../services/fcmService'

const LATER_KEY  = 'prime_reminders_later'
const LATER_DAYS = 7

export function laterRecently(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const at = Number(storage.getItem(LATER_KEY))
    return Number.isFinite(at) && at > 0 && now - at < LATER_DAYS * 86400000
  } catch { return false }
}

export function shouldShowReminders({ uid, isGuest } = {}, storage, now) {
  if (!uid || isGuest) return false
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (window.Notification.permission !== 'default') return false
  return !laterRecently(storage, now)
}

export default function RemindersCard({ uid, isGuest }) {
  const { lang, t } = useLang()
  const s = t.reminders
  const [hidden, setHidden] = useState(false)
  const [busy,   setBusy]   = useState(false)

  if (hidden || !shouldShowReminders({ uid, isGuest })) return null

  async function turnOn() {
    setBusy(true)
    try {
      const perm = await window.Notification.requestPermission()
      if (perm === 'granted') await registerFcmToken(uid, lang)
    } catch { /* ignore — the card just goes away */ }
    setHidden(true)
  }

  function later() {
    try { localStorage.setItem(LATER_KEY, String(Date.now())) } catch { /* ignore */ }
    setHidden(true)
  }

  return (
    <div style={{
      background: 'rgba(217,179,76,0.08)', border: '1px solid rgba(217,179,76,0.4)', borderRadius: 14,
      padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.875rem',
    }}>
      <div style={{ color: '#F4F1E8', fontSize: '0.95rem', fontWeight: 800, textAlign: 'start' }}>{s.title}</div>
      <div style={{ color: '#A4A6AD', fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'start' }}>{s.body}</div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn-tactile"
          onClick={turnOn}
          disabled={busy}
          style={{
            flex: 1, minHeight: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#D9B34C', color: '#09090b', fontSize: '0.92rem', fontWeight: 800, fontFamily: 'inherit',
          }}
        >{s.turnOn}</button>
        <button
          className="btn-tactile"
          onClick={later}
          style={{
            minHeight: 44, padding: '0 1rem', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#71717A', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
          }}
        >{s.later}</button>
      </div>
    </div>
  )
}
