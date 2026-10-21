// Shown to a guest inside Instagram/TikTok's built-in browser once they have a habit:
// there they can't install the app or get reminders, so show the 3 steps to Safari/Chrome.
// Their habits come along (utils/guestHandoff keeps them in the address).

import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { isIOS } from '../utils/inAppBrowser'

const KEY = 'prime_inapp_install_dismissed'

export default function InAppInstallCard() {
  const { t } = useLang()
  const s = t.home.inAppInstall
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(KEY) === '1' } catch { return false } })
  if (hidden) return null
  const steps = [s.step1, s.step2, isIOS() ? s.step3ios : s.step3android]
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(217,179,76,0.14),rgba(217,179,76,0.05))', border: '1px solid rgba(217,179,76,0.4)', borderRadius: 16, padding: '1rem 1.1rem', marginBottom: '0.875rem' }}>
      <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '0.98rem', marginBottom: '0.3rem' }}>{s.title}</div>
      <div style={{ color: 'rgba(241,245,249,0.7)', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '0.7rem' }}>{s.body}</div>
      <ol style={{ margin: 0, paddingInlineStart: '1.2rem', color: '#f1f5f9', fontSize: '0.86rem', lineHeight: 1.8, fontWeight: 700 }}>
        {steps.map(x => <li key={x}>{x}</li>)}
      </ol>
      <button
        onClick={() => { try { localStorage.setItem(KEY, '1') } catch {} setHidden(true) }}
        style={{ marginTop: '0.6rem', background: 'none', border: 'none', color: 'rgba(241,245,249,0.45)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '0.4rem 0', minHeight: 36, fontFamily: 'inherit' }}
      >{s.later}</button>
    </div>
  )
}
