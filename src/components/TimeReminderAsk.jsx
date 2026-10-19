// Setup, habit screen: once a time is picked for the habit, offer the reminder right there.
// That's the moment the user understands why we ask ("remind me at 20:00"), unlike a bare
// browser prompt. Shown only while the permission is undecided; on iPhone only in the installed
// app (Safari has no notifications). The Home reminders card covers anyone who skips this.

import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'

const canAsk = () =>
  typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default'

export default function TimeReminderAsk({ uid, time }) {
  const { lang, t } = useLang()
  const s = t.onboarding
  const [state, setState] = useState(() => (canAsk() ? 'ask' : 'hidden'))   // 'ask' | 'on' | 'hidden'

  if (!time || !uid || state === 'hidden') return null

  async function turnOn() {
    try {
      const perm = await window.Notification.requestPermission()
      if (perm === 'granted') {
        // Loaded on demand: setup shouldn't pull in Firebase Messaging just to render
        const { registerFcmToken } = await import('../services/fcmService')
        await registerFcmToken(uid, lang)
        setState('on')
        return
      }
    } catch { /* ignore */ }
    setState('hidden')
  }

  return (
    <div style={{
      marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: 12,
      background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.25)',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ flex: 1, color: '#f1f5f9', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {state === 'on' ? fmt(s.remindOn, { time }) : fmt(s.remindAt, { time })}
      </span>
      {state === 'ask' && (
        <button onClick={turnOn} style={{
          flexShrink: 0, minHeight: 40, padding: '0 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#e8b800,#facc15)', color: '#111', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'inherit',
        }}>{s.remindYes}</button>
      )}
    </div>
  )
}
