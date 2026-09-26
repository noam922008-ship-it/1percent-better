import { useState } from 'react'
import { saveNote, MAX_LEARNED_LEN, MAX_APPLY_LEN } from '../services/lessonNotesService'
import { addTask } from '../services/myTasksService'

// "מה למדתי?" / "איך אני משתמש בזה?" — the user's own notes on a lesson.
// Used at the end of the daily lesson and when editing from the notes page.
// No AI, no XP. uid null → guest (localStorage).

const C = {
  field: '#17191E', border: 'rgba(255,255,255,0.08)', text: '#F4F1E8', faint: '#71717A',
  accent: '#D9B34C', accentBorder: 'rgba(217,179,76,0.45)', ok: '#3FAF7A', danger: '#D85C5C',
}

const fieldStyle = {
  width: '100%', boxSizing: 'border-box', display: 'block',
  background: C.field, border: `1px solid ${C.border}`, borderRadius: 12,
  padding: '0.8rem 0.9rem', color: C.text,
  fontSize: '1rem',   // ≥16px so iOS doesn't zoom on focus
  lineHeight: 1.6, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
}
const focusOn  = e => { e.target.style.borderColor = C.accentBorder }
const focusOff = e => { e.target.style.borderColor = C.border }
const labelStyle = { display: 'block', color: C.text, fontSize: '0.9rem', fontWeight: 700, margin: '1rem 0 0.5rem' }

export default function LessonNotesForm({ uid, lesson, existing, onSaved }) {
  const [learned,   setLearned]   = useState(existing?.learned || '')
  const [apply,     setApply]     = useState(existing?.apply || '')
  const [addedTask, setAddedTask] = useState(null)   // apply text already sent to My Tasks
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)   // null | 'save' | 'task'

  const applyText = apply.trim()
  const taskDone  = !!applyText && addedTask === applyText
  const canSave   = !!learned.trim() && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true); setError(null)
    try {
      await saveNote(uid, lesson, { learned, apply }, !!existing)
      setSaved(true)
      onSaved?.()
    } catch { setError('save') }
    setSaving(false)
  }

  async function handleAddTask() {
    if (!applyText || taskDone) return
    setError(null)
    try {
      await addTask(uid, applyText)
      setAddedTask(applyText)
    } catch { setError('task') }
  }

  return (
    <div dir="rtl" style={{ direction: 'rtl' }}>
      <label htmlFor={`learned-${lesson.id}`} style={{ ...labelStyle, marginTop: 0 }}>מה למדתי?</label>
      <textarea
        id={`learned-${lesson.id}`}
        value={learned}
        onChange={e => { setLearned(e.target.value); setSaved(false) }}
        placeholder="במילים שלי…"
        maxLength={MAX_LEARNED_LEN}
        rows={4}
        dir="rtl"
        style={fieldStyle}
        onFocus={focusOn} onBlur={focusOff}
      />

      <label htmlFor={`apply-${lesson.id}`} style={labelStyle}>
        איך אני משתמש בזה? <span style={{ color: C.faint, fontWeight: 500, fontSize: '0.78rem' }}>(רשות)</span>
      </label>
      <textarea
        id={`apply-${lesson.id}`}
        value={apply}
        onChange={e => { setApply(e.target.value); setSaved(false) }}
        maxLength={MAX_APPLY_LEN}
        rows={2}
        dir="rtl"
        style={fieldStyle}
        onFocus={focusOn} onBlur={focusOff}
      />

      {error && (
        <div role="alert" style={{ color: C.danger, fontSize: '0.78rem', fontWeight: 600, marginTop: '0.6rem' }}>
          {error === 'task' ? 'לא הצלחנו להוסיף למשימות — נסה שוב' : 'לא הצלחנו לשמור — נסה שוב'}
        </div>
      )}

      <button
        onClick={handleAddTask}
        disabled={!applyText || taskDone}
        style={{
          width: '100%', minHeight: 48, marginTop: '0.75rem', borderRadius: 12, fontFamily: 'inherit',
          cursor: !applyText || taskDone ? 'default' : 'pointer', background: 'transparent',
          border: `1px solid ${taskDone ? 'rgba(63,175,122,0.35)' : applyText ? 'rgba(217,179,76,0.35)' : C.border}`,
          color: taskDone ? C.ok : applyText ? C.accent : C.faint, fontSize: '0.9rem', fontWeight: 700,
        }}
      >{taskDone ? 'נוסף ✓' : 'הוסף למשימות שלי'}</button>

      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{
          width: '100%', minHeight: 48, marginTop: '0.75rem', borderRadius: 12, border: 'none', fontFamily: 'inherit',
          cursor: canSave ? 'pointer' : 'default',
          background: canSave ? C.accent : 'rgba(217,179,76,0.25)', color: '#09090b',
          fontSize: '0.95rem', fontWeight: 800,
        }}
      >{existing ? 'שמור שינויים' : 'שמור'}</button>
      {saved && (
        <div role="status" style={{ color: C.ok, fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', marginTop: '0.6rem' }}>נשמר ✓</div>
      )}
    </div>
  )
}
