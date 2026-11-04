import { useState } from 'react'
import { useLang } from '../context/LangContext'

// Copies this page's address (with the guest hand-off in #h=…) so it can be pasted in Safari/Chrome.
// For in-app browsers that have no "open in browser" menu (TikTok on iPhone).
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* fall back below */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok
  } catch { return false }
}

export default function CopyLinkButton({ style }) {
  const { t } = useLang()
  const s = t.copyLink
  const [state, setState] = useState('idle')   // idle | done | failed
  async function onCopy() {
    setState((await copyText(window.location.href)) ? 'done' : 'failed')
  }
  return (
    <div>
      <button
        type="button"
        className="btn-tactile"
        onClick={onCopy}
        style={{
          width: '100%', minHeight: 44, borderRadius: 11, border: 'none', cursor: 'pointer',
          background: state === 'done' ? '#3FAF7A' : '#D9B34C', color: '#111', fontWeight: 900, fontSize: '0.9rem', fontFamily: 'inherit',
          ...style,
        }}
      >{state === 'done' ? s.done : s.button}</button>
      {state === 'failed' && <div role="status" style={{ color: 'rgba(241,245,249,0.7)', fontSize: '0.74rem', marginTop: '0.4rem', wordBreak: 'break-all', direction: 'ltr', textAlign: 'start' }}>{s.failed} {window.location.href.split('#')[0]}</div>}
    </div>
  )
}
