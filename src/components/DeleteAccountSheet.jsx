import { useState } from 'react'
import { signInMethod, reauthenticate, deleteAccount } from '../services/accountDeletionService'

// Confirm → re-authenticate → delete all data → delete the account. Nothing is deleted
// until the user types "מחק" and signs in again.

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

  const canDelete = typed.trim() === CONFIRM_WORD && (method !== 'password' || password.length > 0) && !busy

  async function handleDelete() {
    if (!canDelete) return
    setBusy(true); setError(null)
    try {
      await reauthenticate({ password })
    } catch {
      setError(method === 'password' ? 'הסיסמה לא נכונה — נסה שוב' : 'ההתחברות מחדש לא הושלמה — נסה שוב')
      setBusy(false)
      return
    }
    try {
      await deleteAccount()
      onDeleted()
    } catch (e) {
      setError(e?.message === 'data-not-deleted'
        ? 'חלק מהנתונים לא נמחקו, והחשבון נשאר כדי שתוכל לנסות שוב. אם זה חוזר — פנה אלינו (פרטים בעמוד "משפטי ותמיכה").'
        : 'המחיקה לא הושלמה — נסה שוב')
      setBusy(false)
    }
  }

  return (
    <div onClick={busy ? undefined : onClose} style={{ position: 'fixed', inset: 0, zIndex: 5200, background: 'rgba(5,5,12,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div dir="rtl" role="dialog" aria-label="מחיקת חשבון" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', direction: 'rtl',
        background: C.bg, borderRadius: '20px 20px 0 0', borderTop: `1px solid ${C.border}`, padding: '1.5rem 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.75rem)',
      }}>
        <div style={{ color: C.text, fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.6rem' }}>למחוק את החשבון?</div>
        <div style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.65 }}>
          זה ימחק מיד את החשבון ואת כל המידע שלו: היומן, המשימות, ההרגלים, ההערות, ההתקדמות והתמונות.
          <strong style={{ color: C.text }}> אי אפשר לשחזר.</strong>
        </div>

        <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '1.1rem 0 0.4rem' }}>
          כדי לאשר, כתוב <span style={{ color: C.text }}>{CONFIRM_WORD}</span>
        </label>
        <input value={typed} onChange={e => setTyped(e.target.value)} dir="rtl" aria-label="אישור מחיקה" style={field} disabled={busy} />

        {method === 'password' && (
          <>
            <label style={{ display: 'block', color: C.muted, fontSize: '0.8rem', fontWeight: 700, margin: '0.9rem 0 0.4rem' }}>הסיסמה שלך (אימות לפני מחיקה)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-label="סיסמה" style={field} disabled={busy} />
          </>
        )}
        {method !== 'password' && (
          <div style={{ color: C.faint, fontSize: '0.78rem', marginTop: '0.6rem' }}>נבקש ממך להתחבר שוב עם Google לפני המחיקה.</div>
        )}

        {error && <div role="alert" style={{ color: C.danger, fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5, marginTop: '0.8rem' }}>{error}</div>}

        <button onClick={handleDelete} disabled={!canDelete} style={{
          width: '100%', minHeight: 50, marginTop: '1.1rem', borderRadius: 12, border: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 800,
          cursor: canDelete ? 'pointer' : 'default', background: canDelete ? C.danger : 'rgba(229,72,77,0.25)', color: '#fff',
        }}>{busy ? 'מוחק…' : 'מחק את החשבון לצמיתות'}</button>
        <button onClick={onClose} disabled={busy} style={{
          width: '100%', minHeight: 46, marginTop: '0.6rem', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent',
          color: C.muted, fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: busy ? 'default' : 'pointer',
        }}>ביטול</button>
      </div>
    </div>
  )
}
