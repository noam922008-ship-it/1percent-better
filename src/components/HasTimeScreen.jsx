import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'
import { addEntry } from '../services/journalService'
import { DAILY_CAP, MINUTE_CHOICES, OPTIONS, optionsFor, loadState, remainingCap, payoutFor } from '../utils/hasTime'
import { loadTimer, saveTimer, removeTimer, startMedia, stopMedia } from '../utils/timerSession'

// "יש לי זמן" — pick how much time you have, get a short list of things to do.
// Full-screen, rendered inside Dashboard's FullScreen. onClaim(option) → XP paid (0 when capped).
// onAction('journal' | 'lesson' | 'workout') opens the matching screen.

const C = {
  bg: '#09090b', surface: '#111317', field: '#17191E',
  border: 'rgba(255,255,255,0.08)', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A',
  accent: '#D9B34C', accentSoft: 'rgba(217,179,76,0.1)', accentBorder: 'rgba(217,179,76,0.45)',
  ok: '#3FAF7A',
}

const pad = n => String(n).padStart(2, '0')

export default function HasTimeScreen({ uid, dayKey, onClose, onClaim, onAction }) {
  const { t } = useLang()
  const th = t.hasTime
  // A saved timer's option must be visible, so open on a time choice that includes it
  const [minutes, setMinutes] = useState(() => {
    const saved = loadTimer()
    const opt = saved && OPTIONS.find(o => o.id === saved.id && o.timer)
    return opt ? Math.max(15, opt.minutes) : 15
  })
  const [state,   setState]   = useState(() => loadState(dayKey))
  // { id, endsAt, startedAt } — kept in localStorage so it survives closing this screen or the app
  const [timer,   setTimer]   = useState(() => {
    const saved = loadTimer()
    return saved && OPTIONS.some(o => o.id === saved.id && o.timer) ? saved : null
  })
  const [now,     setNow]     = useState(Date.now())
  const [notes,   setNotes]   = useState({})
  const [saved,   setSaved]   = useState({})

  useEffect(() => {
    if (!timer) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])

  const options = optionsFor(minutes)
  const left    = remainingCap(state)

  function finish(option) {
    const note = (notes[option.id] || '').trim()
    if (option.note && note) {
      addEntry(uid || null, { text: `${option.icon} ${note}` }).catch(() => {})
    }
    onClaim(option)
    setState(loadState(dayKey))
    if (timer?.id === option.id) cancelTimer()
  }

  function cancelTimer() {
    stopMedia()
    removeTimer()
    setTimer(null)
  }

  function startTimer(option) {
    const startedAt = Date.now()
    const next = { id: option.id, startedAt, endsAt: startedAt + option.timer * 60000 }
    const name = th.options[option.id].name
    saveTimer(next)
    setNow(startedAt)
    setTimer(next)
    startMedia({
      title: name,
      artist: 'PRIME',
      startedAt: next.startedAt,
      endsAt: next.endsAt,
      onStop: () => { removeTimer(); setTimer(null) },
      end: { title: th.timerDoneTitle, body: fmt(th.timerDoneBody, { name }) },
    })
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem 1.25rem 3rem', color: C.text }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{th.title}</h2>
        <button
          onClick={onClose}
          aria-label={t.common.back}
          style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><X size={22} /></button>
      </div>
      <p style={{ color: C.muted, fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>{th.sub}</p>

      <div role="radiogroup" aria-label={th.pick} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.9rem' }}>
        {MINUTE_CHOICES.map(m => {
          const on = m === minutes
          return (
            <button
              key={m}
              role="radio"
              aria-checked={on}
              onClick={() => setMinutes(m)}
              style={{
                flex: 1, minHeight: 48, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.95rem', fontWeight: 800,
                background: on ? C.accentSoft : C.surface,
                border: `1px solid ${on ? C.accentBorder : C.border}`,
                color: on ? C.accent : C.text,
              }}
            >{fmt(th.minutes, { n: m })}</button>
          )
        })}
      </div>

      <div style={{ color: left > 0 ? C.faint : C.ok, fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.9rem' }}>
        {left > 0 ? fmt(th.bonusLine, { n: state.xp, cap: DAILY_CAP }) : th.capFull}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map(o => {
          const copy    = th.options[o.id]
          const isDone  = state.done.includes(o.id)
          const pay     = payoutFor(state, o)
          const running = timer?.id === o.id
          const remain  = running ? Math.max(0, timer.endsAt - now) : 0
          const timerOver = running && remain === 0
          return (
            <div
              key={o.id}
              style={{
                background: C.surface, borderRadius: 14, padding: '0.9rem 1rem',
                border: `1px solid ${isDone ? 'rgba(63,175,122,0.3)' : C.border}`,
                borderInlineStart: `3px solid ${isDone ? C.ok : 'rgba(217,179,76,0.55)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }} aria-hidden="true">{o.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{copy.name}</div>
                  <div style={{ color: C.muted, fontSize: '0.76rem', marginTop: 2 }}>{copy.desc}</div>
                </div>
                <div style={{ textAlign: 'end', flexShrink: 0 }}>
                  <div style={{ color: C.faint, fontSize: '0.68rem', fontWeight: 700 }}>{fmt(th.minutes, { n: o.minutes })}</div>
                  <div style={{ color: o.xp > 0 ? C.accent : C.faint, fontSize: '0.72rem', fontWeight: 800 }}>
                    {o.xp > 0 ? fmt(th.xp, { n: o.xp }) : th.normalXp}
                  </div>
                </div>
              </div>

              {o.note && !isDone && (
                <input
                  value={notes[o.id] || ''}
                  onChange={e => setNotes(n => ({ ...n, [o.id]: e.target.value }))}
                  placeholder={th.notePlaceholder}
                  aria-label={th.notePlaceholder}
                  maxLength={200}
                  autoComplete="off"
                  style={{
                    width: '100%', boxSizing: 'border-box', marginTop: '0.7rem',
                    background: C.field, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '0.65rem 0.8rem', color: C.text, fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem' }}>
                {isDone ? (
                  <div style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ok, fontSize: '0.85rem', fontWeight: 800 }}>
                    {saved[o.id] === 0 ? th.doneCapped : th.doneTag}
                  </div>
                ) : (
                  <>
                    {o.action && (
                      <button
                        onClick={() => onAction(o.action)}
                        style={{ flex: 1, minHeight: 44, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: `1px solid ${C.accentBorder}`, color: C.accent, fontSize: '0.85rem', fontWeight: 800 }}
                      >{th.open}</button>
                    )}
                    {o.timer && !running && (
                      <button
                        onClick={() => startTimer(o)}
                        style={{ flex: 1, minHeight: 44, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: `1px solid ${C.accentBorder}`, color: C.accent, fontSize: '0.85rem', fontWeight: 800 }}
                      >{th.start}</button>
                    )}
                    {o.timer && running && !timerOver && (
                      <>
                        <div style={{ flex: 1, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: '0.9rem', fontWeight: 800 }}>
                          {fmt(th.timerLeft, { m: pad(Math.floor(remain / 60000)), s: pad(Math.floor((remain % 60000) / 1000)) })}
                        </div>
                        <button
                          onClick={cancelTimer}
                          style={{ minHeight: 44, padding: '0 0.9rem', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: '0.8rem', fontWeight: 700 }}
                        >{th.cancel}</button>
                      </>
                    )}
                    {o.action !== 'workout' && (!o.timer || timerOver) && (
                      <button
                        onClick={() => { setSaved(s => ({ ...s, [o.id]: pay })); finish(o) }}
                        style={{ flex: 1, minHeight: 44, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: C.accent, color: '#09090b', fontSize: '0.85rem', fontWeight: 800 }}
                      >{th.done}</button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
