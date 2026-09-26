import { useEffect, useRef, useState } from 'react'
import { detectDistress } from '../utils/distress'
import { aiQuestionsAvailable, getNextQuestion, MAX_AI_QUESTIONS, STEP_QUESTION, MAX_REFLECTION_ANSWER } from '../services/journalReflectionService'
import { saveReflections } from '../services/journalService'
import { addTask } from '../services/myTasksService'
import JournalSupport from './JournalSupport'

// Calm follow-up conversation after a journal entry is saved.
// Order: local distress check → (signed in + AI available) consent invite or remembered consent →
// up to 2 AI questions → the fixed step question (skipped if the entry already has a step).
// "מספיק" skips straight to the step question. Distress (local or AI) → support message, no questions.
// Nothing leaves the device without consent. No XP.

const C = {
  bubble: '#15181D', bubbleBorder: 'rgba(255,255,255,0.06)',
  mine: 'rgba(217,179,76,0.08)', mineBorder: 'rgba(217,179,76,0.18)',
  field: '#17191E', border: 'rgba(255,255,255,0.08)', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A',
  accent: '#D9B34C', accentBorder: 'rgba(217,179,76,0.4)', ok: '#3FAF7A',
}

const fade = { animation: 'fadeIn 0.6s ease both' }

function QuestionBubble({ children }) {
  return (
    <div style={{ ...fade, alignSelf: 'flex-start', maxWidth: '88%', background: C.bubble, border: `1px solid ${C.bubbleBorder}`,
      borderRadius: '16px 16px 16px 4px', padding: '0.75rem 0.95rem', color: C.text, fontSize: '0.95rem', lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

function AnswerBubble({ children }) {
  return (
    <div style={{ ...fade, alignSelf: 'flex-end', maxWidth: '88%', background: C.mine, border: `1px solid ${C.mineBorder}`,
      borderRadius: '16px 16px 4px 16px', padding: '0.7rem 0.9rem', color: C.text, fontSize: '0.92rem', lineHeight: 1.6,
      whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
      {children}
    </div>
  )
}

const softButton = (on = true) => ({
  minHeight: 44, borderRadius: 12, cursor: on ? 'pointer' : 'default', fontFamily: 'inherit',
  background: 'transparent', border: `1px solid ${on ? C.accentBorder : C.border}`,
  color: on ? C.accent : C.faint, fontSize: '0.9rem', fontWeight: 700, padding: '0 1rem',
})

export default function JournalReflection({ uid, entry, aiConsent, onAiConsentChange, onDone }) {
  const [phase,       setPhase]       = useState('init')  // init | invite | loading | question | stepDone | done | support
  const [reflections, setReflections] = useState([])
  const [current,     setCurrent]     = useState(null)    // { q, source: 'ai' | 'fixed' }
  const [answer,      setAnswer]      = useState('')
  const [remember,    setRemember]    = useState(true)
  const [saveError,   setSaveError]   = useState(false)
  const [taskAdded,   setTaskAdded]   = useState(false)
  const [taskError,   setTaskError]   = useState(false)
  const token = useRef(0)   // ignores AI replies that arrive after "מספיק"

  const hasStep = !!entry.step?.trim()

  function toStep(answered = reflections.length) {
    token.current++
    if (hasStep) {
      if (answered === 0) onDone()   // nothing was asked — just close
      else setPhase('done')
      return
    }
    setCurrent({ q: STEP_QUESTION, source: 'fixed' })
    setAnswer('')
    setPhase('question')
  }

  async function ask(refl) {
    const my = ++token.current
    setPhase('loading')
    try {
      const r = await getNextQuestion(entry, refl)
      if (my !== token.current) return
      if (r?.distress) { setPhase('support'); return }
      if (!r) { toStep(refl.length); return }
      setCurrent({ q: r.question, source: 'ai' })
      setAnswer('')
      setPhase('question')
    } catch {
      if (my === token.current) toStep(refl.length)   // AI unavailable → go on without it
    }
  }

  // Decide how to start, once per saved entry
  useEffect(() => {
    if (detectDistress(entry.text, entry.important, entry.step)) { setPhase('support'); return }
    if (!aiQuestionsAvailable(uid)) { toStep(); return }
    if (aiConsent) ask([])
    else setPhase('invite')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  function acceptInvite() {
    if (remember) onAiConsentChange?.(true)
    ask([])
  }

  async function submitAnswer() {
    const a = answer.trim().slice(0, MAX_REFLECTION_ANSWER)
    if (!a || !current) return
    const next = [...reflections, { q: current.q, a, source: current.source }]
    setReflections(next)
    setAnswer('')
    saveReflections(uid, entry.id, next).then(() => setSaveError(false)).catch(() => setSaveError(true))

    if (detectDistress(a))           { token.current++; setPhase('support'); return }
    if (current.source === 'fixed')  { setPhase('stepDone'); return }
    const aiCount = next.filter(r => r.source === 'ai').length
    if (aiCount < MAX_AI_QUESTIONS) ask(next)
    else toStep(next.length)
  }

  async function handleAddTask() {
    const step = reflections.find(r => r.source === 'fixed')?.a
    if (!step || taskAdded) return
    try { await addTask(uid, step); setTaskAdded(true); setTaskError(false) }
    catch { setTaskError(true) }
  }

  if (phase === 'support') return <JournalSupport onDone={onDone} />
  if (phase === 'init') return null

  const inConversation = phase === 'loading' || (phase === 'question' && current?.source === 'ai')

  return (
    <div dir="rtl" style={{ direction: 'rtl', display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '1.25rem' }}>

      {/* Consent — nothing is sent before this */}
      {phase === 'invite' && (
        <div style={{ ...fade, background: C.bubble, border: `1px solid ${C.bubbleBorder}`, borderRadius: 16, padding: '1rem' }}>
          <div style={{ color: C.text, fontSize: '0.95rem', lineHeight: 1.6 }}>
            רוצה שה-AI ישאל אותך כמה שאלות על מה שכתבת?
          </div>
          <div style={{ color: C.muted, fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.35rem' }}>
            הטקסט יישלח ל-Gemini (Google) כדי לנסח שאלות.
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.muted, fontSize: '0.84rem', marginTop: '0.75rem', cursor: 'pointer', minHeight: 32 }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.accent }} />
            תמיד אפשר (אפשר לכבות בכל רגע)
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={acceptInvite} style={{ ...softButton(), flex: '1 1 150px' }}>כן, בוא נחשוב יחד</button>
            <button onClick={() => toStep()} style={{ ...softButton(false), flex: '1 1 110px', color: C.muted }}>לא עכשיו</button>
          </div>
        </div>
      )}

      {/* The conversation so far */}
      {reflections.map((r, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <QuestionBubble>{r.q}</QuestionBubble>
          <AnswerBubble>{r.a}</AnswerBubble>
        </div>
      ))}

      {phase === 'loading' && (
        <QuestionBubble><span style={{ color: C.faint, animation: 'pulse 1.6s ease-in-out infinite' }}>חושב על שאלה…</span></QuestionBubble>
      )}

      {phase === 'question' && current && (
        <>
          <QuestionBubble>{current.q}</QuestionBubble>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            aria-label={current.q}
            placeholder="במילים שלך…"
            maxLength={MAX_REFLECTION_ANSWER}
            rows={3}
            dir="rtl"
            style={{ ...fade, width: '100%', boxSizing: 'border-box', background: C.field, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '0.75rem 0.9rem', color: C.text, fontSize: '1rem', lineHeight: 1.6, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={submitAnswer} disabled={!answer.trim()} style={{ ...softButton(!!answer.trim()), flex: 1 }}>המשך</button>
            {current.source === 'fixed' && (
              <button onClick={onDone} style={{ ...softButton(false), flex: '0 0 auto', color: C.muted }}>סיום</button>
            )}
          </div>
        </>
      )}

      {/* "מספיק" — always visible while the AI is asking */}
      {inConversation && (
        <button onClick={() => toStep()} style={{ alignSelf: 'center', background: 'none', border: 'none', color: C.muted, fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', minHeight: 44, padding: '0 1rem' }}>
          מספיק
        </button>
      )}

      {phase === 'stepDone' && (
        <>
          <button onClick={handleAddTask} disabled={taskAdded} style={{ ...fade, ...softButton(!taskAdded), width: '100%', minHeight: 48,
            ...(taskAdded ? { color: C.ok, borderColor: 'rgba(63,175,122,0.35)' } : {}) }}>
            {taskAdded ? 'נוסף ✓' : 'הוסף למשימות שלי'}
          </button>
          {taskError && <div role="alert" style={{ color: C.muted, fontSize: '0.8rem', textAlign: 'center' }}>לא הצלחנו להוסיף למשימות — נסה שוב</div>}
        </>
      )}

      {(phase === 'stepDone' || phase === 'done') && (
        <>
          <div style={{ ...fade, color: C.muted, fontSize: '0.88rem', textAlign: 'center', marginTop: '0.25rem' }}>תודה ששיתפת.</div>
          <button onClick={onDone} style={{ ...softButton(), width: '100%', minHeight: 48 }}>סיום</button>
        </>
      )}

      {saveError && (
        <div role="alert" style={{ color: C.muted, fontSize: '0.8rem', textAlign: 'center' }}>לא הצלחנו לשמור את התשובות — נסה שוב</div>
      )}
    </div>
  )
}
