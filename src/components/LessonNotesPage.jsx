import { useEffect, useState } from 'react'
import { ChevronRight, Pencil } from 'lucide-react'
import { subscribeNotes, firstLine } from '../services/lessonNotesService'
import LessonNotesForm from './LessonNotesForm'

// "מה למדתי" — full-screen list of past lessons with the user's own notes.
// Tap → the saved lesson + notes; notes can be edited. Rendered inside Dashboard's FullScreen.

const C = {
  bg: '#09090b', surface: '#111317', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A',
  accent: '#D9B34C', danger: '#D85C5C',
}

function formatDate(key) {
  const [y, m, d] = String(key || '').split('-').map(Number)
  if (!y) return ''
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
}

const sectionLabel = { color: C.accent, fontSize: '0.78rem', fontWeight: 700, margin: '1.25rem 0 0.4rem' }
const bodyText     = { margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: '0.92rem', lineHeight: 1.65, color: C.text }

// Lesson sections in the order they were shown.
const LESSON_SECTIONS = [
  ['ideaHe',        'הרעיון המרכזי'],
  ['explanationHe', 'ההסבר'],
  ['exampleHe',     'דוגמה מהחיים'],
  ['questionHe',    'שאלת הבנה'],
  ['answerHe',      'תשובה'],
  ['actionHe',      'פעולה קטנה'],
]

export default function LessonNotesPage({ uid, onClose }) {
  const [notes,   setNotes]   = useState([])
  const [openId,  setOpenId]  = useState(null)
  const [editing, setEditing] = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    return subscribeNotes(uid, list => { setNotes(list); setError(false) }, () => setError(true))
  }, [uid])

  const open = notes.find(n => n.id === openId)
  const view = !openId ? 'list' : editing ? 'edit' : 'entry'

  function goBack() {
    if (view === 'edit')       setEditing(false)
    else if (view === 'entry') setOpenId(null)
    else onClose()
  }

  const title = view === 'list' ? 'מה למדתי' : view === 'edit' ? 'עריכת ההערות' : (open?.lesson?.titleHe || '')

  return (
    <div dir="rtl" style={{ minHeight: '100%', background: C.bg, color: C.text, direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1, background: C.bg,
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        padding: 'calc(env(safe-area-inset-top, 0px) + 0.5rem) 0.5rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={goBack} aria-label="חזור" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <ChevronRight size={22} />
        </button>
        <span style={{ flex: 1, minWidth: 0, fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem 1rem calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
        {error && (
          <div role="alert" style={{ color: C.danger, fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.75rem' }}>לא הצלחנו לטעון את ההערות</div>
        )}

        {/* ── List ── */}
        {view === 'list' && (
          notes.length === 0 ? (
            <div style={{ color: C.faint, fontSize: '0.88rem', textAlign: 'center', marginTop: '2rem', lineHeight: 1.6 }}>
              עוד אין כאן כלום.<br />בסוף כל שיעור אפשר לכתוב מה למדת.
            </div>
          ) : (
            <div style={{ background: C.surface, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              {notes.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => { setOpenId(n.id); setEditing(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'right', cursor: 'pointer',
                    background: 'none', border: 'none', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    padding: '0.8rem 1rem', fontFamily: 'inherit', minHeight: 56,
                  }}
                >
                  <div style={{ color: C.accent, fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem' }}>{formatDate(n.date)}</div>
                  <div style={{ color: C.text, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.lesson?.titleHe}</div>
                  <div style={{ color: C.muted, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{firstLine(n.learned)}</div>
                </button>
              ))}
            </div>
          )
        )}

        {/* ── One lesson + notes ── */}
        {view === 'entry' && open && (
          <>
            <div style={{ color: C.accent, fontSize: '0.75rem', fontWeight: 700 }}>{formatDate(open.date)}</div>

            <div style={sectionLabel}>מה למדתי</div>
            <p style={bodyText}>{open.learned}</p>
            {open.apply && (
              <>
                <div style={sectionLabel}>איך אני משתמש בזה</div>
                <p style={bodyText}>{open.apply}</p>
              </>
            )}

            <button
              onClick={() => setEditing(true)}
              style={{ width: '100%', minHeight: 48, marginTop: '1.25rem', borderRadius: 12, background: 'transparent', border: '1px solid rgba(217,179,76,0.35)', color: C.accent, fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Pencil size={15} /> ערוך את ההערות</span>
            </button>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1.75rem 0 0.25rem' }} />
            <div style={{ color: C.faint, fontSize: '0.72rem', fontWeight: 700, marginTop: '1rem' }}>השיעור</div>
            {open.lesson?.summaryHe && <p style={{ ...bodyText, color: C.muted, fontStyle: 'italic', marginTop: '0.4rem' }}>{open.lesson.summaryHe}</p>}
            {LESSON_SECTIONS.map(([key, label]) => open.lesson?.[key] ? (
              <div key={key}>
                <div style={{ ...sectionLabel, color: C.muted }}>{label}</div>
                <p style={{ ...bodyText, color: 'rgba(244,241,232,0.8)' }}>{open.lesson[key]}</p>
              </div>
            ) : null)}
          </>
        )}

        {/* ── Edit notes ── */}
        {view === 'edit' && open && (
          <LessonNotesForm
            uid={uid}
            lesson={{ id: open.lessonId, topicId: open.topicId, ...open.lesson }}
            existing={open}
            onSaved={() => setEditing(false)}
          />
        )}
      </div>
    </div>
  )
}
