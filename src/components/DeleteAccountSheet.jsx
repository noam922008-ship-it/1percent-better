import { useState } from 'react'
import { signInMethod, deleteAccount, finishDeleteAfterReauth, cancelDeletion } from '../services/accountDeletionService'

// Type "מחק" → delete all data → delete the account. Nothing is deleted before "מחק".
// Only if Firebase answers auth/requires-recent-login do we ask the user to sign in again
// (password, or Google) and then finish deleting the account.

const C = { bg: '#18181b', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A', danger: '#E5484D', border: 'rgba(255,255,255,0.1)' }
const CONFIRM_WORD = 'מחק'

const field = {
  width: '100%', boxSizing: 'border-box', minHeight: 48, padding: '0.7rem 0.9rem', borderRadius: 12,
  border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.05)', color: C.text, fontSize: '1rem', fontFamily: 'inherit',
}

export default function DeleteAccountSheet({ onClose, onDeleted }) {
  const method = signInMethod()
  const [typed,    setTyped]    = useState('')
  const [password, setPassword] = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState(null)
  const [needsReauth, setNeedsReauth] = useState(false)   // Firebase asked for a recent sign-in

  const canDelete = typed.trim() === CONFIRM_WORD && !busy
  const canFinish = !busy && (method !== 'password' || password.length > 0)

  async function handleDelete() {
    if (!canDelete) return
    setBusy(true); setError(null)
    try {
      const result = await deleteAccount()
      if (result === 'needs-reauth') { setNeedsReauth(true); setBusy(false); return }
      onDeleted()
    } catch (e) {
      setError(e?.message === 'data-not-deleted'
        ? 'חלק מהנתונים לא נמחקו, והחשבון נשאר כדי שתוכל לנסות שוב. אם זה חוזר — פנה אלינו (פרטים בעמוד "משפטי ותמיכה").'
        : 'המחיקה לא הושלמה — נסה שוב')
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
      setError(method === 'password' ? 'הסיסמה לא נכונה — נסה שוב' : 'ההתחברות מחדש לא הושלמה — נסה שוב')
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
      <div dir="rtl" role="dialog" aria-label="מחיקת חשבון" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', direction: 'rtl',
        background: C.bg, borderRadius: '20px 20px 0 0', borderTop: `1px solid ${C.border}`, padding: '1.5rem 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.75rem)',
      }}>
        <div style={{ color: C.text, fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.6rem' }}>למחוק את החשבון?</div>
        <div style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.65 }}>
          זה ימחק מיד את החשבון ואת כל המידע שלו: היומן, המשימות, ההרגלים, ההערות, ההתקדמות והתמונות.
          <strong style={{ color: C.text }}> אי אפשר לשחזר.</strong>
        </div>

        {!needsReauth ? (
          <>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '1.1rem 0 0.4rem' }}>
              כדי לאשר, כתוב <span style={{ color: C.text }}>{CONFIRM_WORD}</span>
            </label>
            <input value={typed} onChange={e => setTyped(e.target.value)} dir="rtl" aria-label="אישור מחיקה" style={field} disabled={busy} />
          </>
        ) : (
          <div role="status" style={{ marginTop: '1.1rem' }}>
            <div style={{ color: C.text, fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.6 }}>
              כל המידע נמחק. כדי לסיים ולמחוק גם את החשבון, צריך להתחבר שוב.
            </div>
            {method === 'password' ? (
              <>
                <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '0.9rem 0 0.4rem' }}>הסיסמה שלך</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-label="סיסמה" style={field} disabled={busy} />
              </>
            ) : (
              <div style={{ color: C.faint, fontSize: '0.8rem', marginTop: '0.5rem' }}>ייפתח חלון התחברות של Google.</div>
            )}
          </div>
        )}

        {error && <div role="alert" style={{ color: C.danger, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5, marginTop: '0.8rem' }}>{error}</div>}

        {!needsReauth ? (
          <button onClick={handleDelete} disabled={!canDelete} style={{
            width: '100%', minHeight: 50, marginTop: '1.1rem', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800,
            cursor: canDelete ? 'pointer' : 'default', background: canDelete ? C.danger : 'rgba(229,72,77,0.25)', color: '#fff',
          }}>{busy ? 'מוחק…' : 'מחק את החשבון לצמיתות'}</button>
        ) : (
          <button onClick={handleFinish} disabled={!canFinish} style={{
            width: '100%', minHeight: 50, marginTop: '1.1rem', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800,
            cursor: canFinish ? 'pointer' : 'default', background: canFinish ? C.danger : 'rgba(229,72,77,0.25)', color: '#fff',
          }}>{busy ? 'מוחק…' : method === 'password' ? 'התחבר ומחק את החשבון' : 'התחבר עם Google ומחק'}</button>
        )}
        <button onClick={handleClose} disabled={busy} style={{
          width: '100%', minHeight: 46, marginTop: '0.6rem', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent',
          color: C.muted, fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: busy ? 'default' : 'pointer',
        }}>ביטול</button>
      </div>
    </div>
  )
}
