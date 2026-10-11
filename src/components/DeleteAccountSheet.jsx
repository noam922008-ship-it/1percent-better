import { useState } from 'react'
import { signInMethod, deleteAccount, finishDeleteAfterReauth, cancelDeletion } from '../services/accountDeletionService'
import { useLang } from '../context/LangContext'

// Type the confirm word ("מחק" / "DELETE") → delete all data → delete the account. Nothing is deleted before that.
// Only if Firebase answers auth/requires-recent-login do we ask the user to sign in again
// (password, or Google) and then finish deleting the account.

const C = { bg: '#18181b', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A', danger: '#E5484D', border: 'rgba(255,255,255,0.1)' }

const field = {
  width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '0.7rem 0.9rem', borderRadius: 12,
  border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.05)', color: C.text, fontSize: '1rem', fontFamily: 'inherit',
}

// The confirm word of the current language; case and surrounding spaces don't matter
const isConfirmWord = (typed, word) => typed.trim().toLowerCase() === word.toLowerCase()

export default function DeleteAccountSheet({ onClose, onDeleted }) {
  const { t } = useLang()
  const td = t.deleteAccount
  const method = signInMethod()
  const [typed,    setTyped]    = useState('')
  const [password, setPassword] = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState(null)
  const [needsReauth, setNeedsReauth] = useState(false)   // Firebase asked for a recent sign-in

  const canDelete = isConfirmWord(typed, td.confirmWord) && !busy
  const canFinish = !busy && (method !== 'password' || password.length > 0)

  async function handleDelete() {
    if (!canDelete) return
    setBusy(true); setError(null)
    try {
      const result = await deleteAccount()
      if (result === 'needs-reauth') { setNeedsReauth(true); setBusy(false); return }
      onDeleted()
    } catch (e) {
      setError(e?.message === 'data-not-deleted' ? td.errorData : td.errorGeneric)
      setBusy(false)
    }
  }

  async function handleFinish() {
    if (!canFinish) return
    setBusy(true); setError(null)
    try {
      await finishDeleteAfterReauth({ password })
      onDeleted()
    } catch {
      setError(method === 'password' ? td.errorPassword : td.errorReauth)
      setBusy(false)
    }
  }

  function handleClose() {
    if (busy) return
    if (needsReauth) cancelDeletion()
    onClose()
  }

  return (
    <div onClick={handleClose} style={{ position: 'fixed', inset: 0, zIndex: 5200, background: 'rgba(5,5,12,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div role="dialog" aria-label={td.aria} onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box',
        background: C.bg, borderRadius: '20px 20px 0 0', borderTop: `1px solid ${C.border}`, padding: '1.5rem 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.75rem)',
      }}>
        <div style={{ color: C.text, fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.6rem' }}>{td.title}</div>
        <div style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.65 }}>
          {td.body}
          <strong style={{ color: C.text }}>{td.noUndo}</strong>
        </div>

        {!needsReauth ? (
          <>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '1.1rem 0 0.4rem' }}>
              {td.confirmLabel}<span style={{ color: C.text }}>{td.confirmWord}</span>
            </label>
            <input value={typed} onChange={e => setTyped(e.target.value)} aria-label={td.confirmAria} style={field} disabled={busy} />
          </>
        ) : (
          <div role="status" style={{ marginTop: '1.1rem' }}>
            <div style={{ color: C.text, fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.6 }}>
              {td.reauth}
            </div>
            {method === 'password' ? (
              <>
                <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '0.9rem 0 0.4rem' }}>{td.password}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-label={td.passwordAria} style={field} disabled={busy} />
              </>
            ) : (
              <div style={{ color: C.faint, fontSize: '0.8rem', marginTop: '0.5rem' }}>{td.googleNote}</div>
            )}
          </div>
        )}

        {error && <div role="alert" style={{ color: C.danger, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5, marginTop: '0.8rem' }}>{error}</div>}

        {!needsReauth ? (
          <button onClick={handleDelete} disabled={!canDelete} style={{
            width: '100%', minHeight: 50, marginTop: '1.1rem', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800,
            cursor: canDelete ? 'pointer' : 'default', background: canDelete ? C.danger : 'rgba(229,72,77,0.25)', color: '#fff',
          }}>{busy ? td.deleting : td.deleteBtn}</button>
        ) : (
          <button onClick={handleFinish} disabled={!canFinish} style={{
            width: '100%', minHeight: 50, marginTop: '1.1rem', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800,
            cursor: canFinish ? 'pointer' : 'default', background: canFinish ? C.danger : 'rgba(229,72,77,0.25)', color: '#fff',
          }}>{busy ? td.deleting : method === 'password' ? td.finishPassword : td.finishGoogle}</button>
        )}
        <button onClick={handleClose} disabled={busy} style={{
          width: '100%', minHeight: 46, marginTop: '0.6rem', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent',
          color: C.muted, fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: busy ? 'default' : 'pointer',
        }}>{td.cancel}</button>
      </div>
    </div>
  )
}
