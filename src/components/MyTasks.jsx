import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { subscribeTasks, addTask, setTaskDone, deleteTask, MAX_TASK_LEN } from '../services/myTasksService'
import { getLocalDateKey } from '../utils/localDate'
import { track } from '../services/analytics'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'

// My Tasks — the user's own one-off tasks for today. Not connected to XP.
// uid null → guest (localStorage).
export default function MyTasks({ uid }) {
  const { t: tr } = useLang()
  const tm = tr.myTasks
  const [tasks,  setTasks]  = useState([])
  const [text,   setText]   = useState('')
  const [error,  setError]  = useState(null)   // null | 'load' | 'save'
  const [dayKey, setDayKey] = useState(getLocalDateKey)

  // Re-subscribe when the local day changes (app left open past midnight)
  useEffect(() => {
    const tick = () => setDayKey(getLocalDateKey())
    const id = setInterval(tick, 60000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [])

  useEffect(() => {
    return subscribeTasks(uid, list => { setTasks(list); setError(null) }, () => setError('load'))
  }, [uid, dayKey])

  function handleSubmit(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setText('')
    addTask(uid, value).then(id => { if (id) track('task_added') }).catch(() => { setText(value); setError('save') })
  }

  function toggle(t) {
    setTaskDone(uid, t.id, !t.done).catch(() => setError('save'))
  }

  function remove(t) {
    deleteTask(uid, t.id).catch(() => setError('save'))
  }

  const doneCount = tasks.filter(t => t.done).length

  return (
    <div style={{ background: '#111317', border: '1px solid rgba(255,255,255,0.06)', borderInlineStart: '3px solid rgba(217,179,76,0.55)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem 0' }}>
        <span style={{ color: '#F4F1E8', fontSize: '0.88rem', fontWeight: 800 }}>{tm.title}</span>
        {tasks.length > 0 && (
          <span style={{ color: doneCount === tasks.length ? '#3FAF7A' : '#A4A6AD', fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${doneCount === tasks.length ? 'rgba(63,175,122,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 6, padding: '0.1rem 0.4rem' }}>
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0.65rem 1rem 0' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={tm.placeholder}
          aria-label={tm.addAria}
          maxLength={MAX_TASK_LEN}
          enterKeyHint="enter"
          autoComplete="off"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#17191E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
            padding: '0.75rem 0.9rem', color: '#F4F1E8',
            fontSize: '1rem',   // ≥16px so iOS doesn't zoom on focus
            fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(217,179,76,0.45)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
        />
      </form>

      {error && (
        <div role="alert" style={{ color: '#D85C5C', fontSize: '0.7rem', fontWeight: 600, padding: '0.45rem 1rem 0' }}>
          {error === 'load' ? tm.errorLoad : tr.common.errorSave}
        </div>
      )}

      <div style={{ padding: '0.4rem 0 0.35rem' }}>
        {tasks.map((t, i) => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              paddingBlock: '0.2rem', paddingInlineStart: '1rem', paddingInlineEnd: '0.35rem',   // checkbox side 1rem, delete side tight
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              minHeight: 52,
            }}
          >
            <button
              role="checkbox"
              aria-checked={t.done}
              aria-label={fmt(t.done ? tm.unmark : tm.markDone, { text: t.text })}
              onClick={() => toggle(t)}
              style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0, padding: 0,
                border: `1.5px solid ${t.done ? 'rgba(63,175,122,0.5)' : 'rgba(255,255,255,0.14)'}`,
                background: t.done ? 'rgba(63,175,122,0.1)' : 'transparent',
                color: '#3FAF7A', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{t.done && '✓'}</button>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', padding: '0.55rem 0' }}>
              <span
                onClick={() => toggle(t)}
                style={{
                  color: t.done ? '#71717A' : '#F4F1E8', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4,
                  textDecoration: t.done ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.18)',
                  overflowWrap: 'anywhere', cursor: 'pointer',
                }}
              >{t.text}</span>
              {t.carriedOver && (
                <span style={{ color: '#D9B34C', background: 'rgba(217,179,76,0.1)', border: '1px solid rgba(217,179,76,0.2)', fontSize: '0.58rem', fontWeight: 700, padding: '0.05rem 0.4rem', borderRadius: 5, whiteSpace: 'nowrap' }}>
                  {tm.carriedOver}
                </span>
              )}
            </div>

            <button
              onClick={() => remove(t)}
              aria-label={fmt(tm.deleteAria, { text: t.text })}
              style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
