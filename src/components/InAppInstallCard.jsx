// Two cards for guests who arrive from Instagram/TikTok (see utils/guestHandoff):
//   • InAppInstallCard — inside the in-app browser, once they have a habit: why to move to the real
//     browser + 3 visual steps, and a bouncing pointer at the top corner where the ⋯ menu is.
//   • HandoffArrivedCard — in Safari/Chrome right after the move: "your habits are here" + the last
//     step (Add to Home Screen). Hidden once installed or dismissed.

import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { isIOS } from '../utils/inAppBrowser'
import { clearHandoffArrived } from '../utils/guestHandoff'

const KEY = 'prime_inapp_install_dismissed'
const GOLD = '#D9B34C'

const KEYFRAMES = `
@keyframes prime-point { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
`

function ShareIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 24 26" fill="none" aria-hidden="true">
      <path d="M12 1v16M6 7l6-6 6 6" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="10" width="20" height="14" rx="3" stroke="#60a5fa" strokeWidth="2"/>
    </svg>
  )
}

function Step({ n, icon, text, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.55rem 0' }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: GOLD, color: '#111', fontWeight: 900, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <div style={{ minWidth: 40, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', fontWeight: 900, fontSize: '1.05rem', flexShrink: 0, padding: '0 0.4rem' }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.35 }}>{text}</div>
        {sub && <div style={{ color: 'rgba(241,245,249,0.5)', fontSize: '0.74rem', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

const cardStyle = { background: 'linear-gradient(135deg,rgba(217,179,76,0.14),rgba(217,179,76,0.05))', border: '1px solid rgba(217,179,76,0.4)', borderRadius: 16, padding: '1rem 1.1rem', marginBottom: '0.875rem' }
const laterStyle = { marginTop: '0.35rem', background: 'none', border: 'none', color: 'rgba(241,245,249,0.45)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: '0.4rem 0', minHeight: 36, fontFamily: 'inherit' }

export default function InAppInstallCard() {
  const { t } = useLang()
  const s = t.home.inAppInstall
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(KEY) === '1' } catch { return false } })
  if (hidden) return null
  const ios = isIOS()
  return (
    <>
      <style>{KEYFRAMES}</style>
      {/* Pointer to Instagram's ⋯ menu — it sits above the page, in the top corner (right side on phones) */}
      <div aria-hidden="true" style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 6px)', right: 10, zIndex: 4000, pointerEvents: 'none', animation: 'prime-point 1.1s ease-in-out infinite', direction: 'ltr' }}>
        <div style={{ textAlign: 'right', color: GOLD, fontSize: '1.6rem', lineHeight: 1, fontWeight: 900 }}>↑</div>
        <div style={{ background: GOLD, color: '#111', fontWeight: 900, fontSize: '0.78rem', borderRadius: 10, padding: '0.35rem 0.6rem', boxShadow: '0 6px 20px rgba(0,0,0,0.45)', direction: 'rtl', whiteSpace: 'nowrap' }}>{s.pointer}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '1rem', marginBottom: '0.35rem' }}>{s.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
          {s.why.map(w => (
            <span key={w} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, padding: '0.25rem 0.6rem', color: 'rgba(241,245,249,0.8)', fontSize: '0.74rem', fontWeight: 700 }}>{w}</span>
          ))}
        </div>
        <Step n={1} icon="⋯" text={s.step1} sub={s.step1sub} />
        <Step n={2} icon="🧭" text={s.step2} sub={ios ? s.step2subIos : s.step2subAndroid} />
        <Step n={3} icon={ios ? <ShareIcon /> : '⋮'} text={ios ? s.step3ios : s.step3android} sub={s.step3sub} />
        <button onClick={() => { try { localStorage.setItem(KEY, '1') } catch {} setHidden(true) }} style={laterStyle}>{s.later}</button>
      </div>
    </>
  )
}

export function HandoffArrivedCard() {
  const { t } = useLang()
  const s = t.home.handoffArrived
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  const ios = isIOS()
  return (
    <div style={cardStyle}>
      <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '1rem', marginBottom: '0.3rem' }}>{s.title}</div>
      <div style={{ color: 'rgba(241,245,249,0.7)', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '0.2rem' }}>{s.body}</div>
      <Step n={'✓'} icon={ios ? <ShareIcon /> : '⋮'} text={ios ? s.stepIos : s.stepAndroid} sub={ios ? s.subIos : s.subAndroid} />
      <button onClick={() => { clearHandoffArrived(); setHidden(true) }} style={laterStyle}>{s.done}</button>
    </div>
  )
}
