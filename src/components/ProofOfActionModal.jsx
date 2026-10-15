import { useState } from 'react'
import { saveProof } from '../services/proofService'
import { logEnergy, ENERGY_TAGS } from '../services/energyLogService'
import { useLang } from '../context/LangContext'

const PLACEHOLDERS = [
  { he: 'נקרעתי אבל סגרתי פינה 🔥', en: 'Torn, but I closed the corner 🔥' },
  { he: 'לא רצה — עשיתי בכל מקרה.', en: 'Didn’t want to — did it anyway.' },
  { he: 'בדיוק עכשיו. עשיתי.', en: 'Right now. Done.' },
  { he: 'יצא טוב מהמצופה.', en: 'Went better than expected.' },
  { he: 'קצר, ממוקד, סגור.', en: 'Short, focused, closed.' },
  { he: 'עייף אבל לא עצר.', en: 'Tired, but didn’t stop.' },
]

export default function ProofOfActionModal({
  title,
  taskDesc,
  emoji       = '⚡',
  accentColor = '#F5C518',
  taskId,
  type        = 'task',
  uid,
  onConfirm,
  onClose,
}) {
  const { lang } = useLang()
  // Text only: no photo upload (live camera only, no workout media is stored — see data/legal.js)
  const [note,      setNote]      = useState('')
  const [uploading, setUploading] = useState(false)
  const placeholderItem = PLACEHOLDERS[Date.now() % PLACEHOLDERS.length]
  const placeholder = lang === 'en' ? placeholderItem.en : placeholderItem.he
  const hasContent  = note.trim().length > 0

  async function handleConfirm() {
    if (uploading) return
    setUploading(true)
    try {
      await saveProof(uid, { taskId, taskTitle: title, type, text: note.trim(), imageFile: null })
    } catch {}
    setUploading(false)
    onConfirm()
  }

  async function handleEnergyTag(tagId) {
    logEnergy(tagId)
    try {
      await saveProof(uid, { taskId, taskTitle: title, type, text: `energy:${tagId}`, imageFile: null })
    } catch {}
    onConfirm()
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && !uploading && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 3000,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#18181b',
        borderRadius: '20px 20px 0 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        animation: 'slide-up 0.22s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem 0.85rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{title}</div>
              <div style={{ color: accentColor, fontSize: '0.54rem', fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', fontFamily: "'SF Mono','Fira Code',monospace", marginTop: '0.1rem', opacity: 0.8 }}>{lang === 'en' ? 'Proof of action' : 'הוכחת עשייה'}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="btn-tactile"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(241,245,249,0.55)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44, flexShrink: 0 }}
          >✕</button>
        </div>

        <div style={{ padding: '1rem 1.25rem 2rem' }}>

          {/* Optional task context */}
          {taskDesc && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.6rem 0.8rem', marginBottom: '0.85rem' }}>
              <p style={{ color: 'rgba(241,245,249,0.55)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>{taskDesc}</p>
            </div>
          )}

          {/* Text note */}
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="glow-input"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.8rem 0.95rem', borderRadius: 11,
              border: `1px solid ${note.length > 0 ? accentColor + '55' : 'rgba(255,255,255,0.09)'}`,
              background: 'rgba(255,255,255,0.04)',
              color: '#f1f5f9', fontSize: '0.88rem',
              fontFamily: 'inherit', resize: 'none', lineHeight: 1.5,
              marginBottom: '0.75rem', transition: 'border 0.15s',
            }}
          />

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <button
              onClick={handleConfirm}
              disabled={uploading}
              className="btn-primary btn-tactile"
              style={{
                width: '100%', padding: '1rem', borderRadius: 13,
                fontSize: '0.97rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                opacity: uploading ? 0.7 : 1,
                background: hasContent
                  ? `linear-gradient(135deg,${accentColor}cc,${accentColor})`
                  : undefined,
                color: hasContent ? '#0e0e16' : undefined,
              }}
            >
              {uploading
                ? <><span className="anim-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%' }} /><span>{lang === 'en' ? 'Saving...' : 'שומר...'}</span></>
                : hasContent
                  ? (lang === 'en' ? '🔥 Save proof ✓' : '🔥 שמור הוכחה ✓')
                  : (lang === 'en' ? '✅ Done' : '✅ בוצע')
              }
            </button>

            {/* Energy tags — shown only when no text/photo yet */}
            {!hasContent && (
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {ENERGY_TAGS.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleEnergyTag(tag.id)}
                    className="btn-tactile"
                    style={{ padding: '0.4rem 0.75rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(232,232,232,0.5)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {lang === 'en' ? tag.labelEn : tag.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
