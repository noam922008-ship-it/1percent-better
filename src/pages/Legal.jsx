import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { LEGAL_CONFIG } from '../data/legal'

// /legal — hub: privacy policy, terms of use, and how to reach us. Content lives in src/data/legal.js.

const linkRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 52,
  padding: '0 1rem', color: '#F4F1E8', fontSize: '0.92rem', fontWeight: 700, textDecoration: 'none',
}

export default function Legal() {
  const navigate = useNavigate()
  const email = LEGAL_CONFIG.contactEmail

  return (
    <div dir="rtl" style={{ minHeight: '100svh', background: '#09090b', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 'calc(env(safe-area-inset-top, 0px) + 0.5rem) 0.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} aria-label="חזור" style={{ background: 'none', border: 'none', color: '#A4A6AD', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <ChevronRight size={22} />
        </button>
        <span style={{ color: '#F4F1E8', fontSize: '1rem', fontWeight: 800 }}>משפטי ותמיכה</span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem 1rem 2.5rem' }}>
        <div style={{ background: '#111317', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <a href="/privacy" style={linkRow}>מדיניות פרטיות <ChevronLeft size={18} color="#71717A" /></a>
          <a href="/terms" style={{ ...linkRow, borderTop: '1px solid rgba(255,255,255,0.05)' }}>תנאי שימוש <ChevronLeft size={18} color="#71717A" /></a>
        </div>

        <h2 style={{ color: '#D9B34C', fontSize: '0.95rem', fontWeight: 800, margin: '1.75rem 0 0.5rem' }}>יצירת קשר</h2>
        <p style={{ color: 'rgba(244,241,232,0.78)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
          לשאלות, בעיות או בקשה למחיקת החשבון:{' '}
          {email
            ? <a href={`mailto:${email}`} style={{ color: '#D9B34C', fontWeight: 700 }}>{email}</a>
            : <span style={{ background: 'rgba(217,179,76,0.12)', border: '1px dashed rgba(217,179,76,0.6)', color: '#D9B34C', borderRadius: 6, padding: '0 0.3rem', fontWeight: 700 }}>📝 להשלים: אימייל ליצירת קשר</span>}
        </p>
      </div>
    </div>
  )
}
