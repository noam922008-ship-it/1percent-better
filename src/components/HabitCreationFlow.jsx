import { useState } from 'react'
import { getTopSuggestionsForPillars } from '../data/habitSuggestions'
import { getPillar } from '../data/pillars'
import { MAX_ACTIVE_HABITS, normalizeSchedule } from '../utils/habitSchedule'
import HabitScheduleFields from './HabitScheduleFields'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'
import he from '../i18n/he'

// Cue presets, by id. Labels in t.habitFlow.cues; 'custom' opens a free-text field.
const CUE_IDS = ['wake', 'bfast', 'phone', 'work', 'sleep', 'custom']

// Suggestions carry a Hebrew cue (data/). Match it to a preset id so the preset is highlighted and the
// cue is saved in the UI language. No match → keep the text as is (still Hebrew until suggestions are translated).
function cueFromSuggestion(text) {
  const id = CUE_IDS.find(c => c !== 'custom' && he.habitFlow.cues[c] === text)
  return id ? { id, text: '' } : { id: '', text: text || '' }
}

export default function HabitCreationFlow({ growthPillars, existingCount, onSave, onClose, prefill }) {
  const { t } = useLang()
  const tf = t.habitFlow
  // If prefill (from surprise mission), skip to step 2
  const hasPreFill = !!(prefill?.titleHe)
  const [step, setStep]       = useState(hasPreFill ? 2 : 0)
  const [selected, setSelected] = useState(hasPreFill ? prefill : null) // chosen suggestion or { titleHe, pillar }
  const [customTitle, setCustomTitle] = useState(prefill?.titleHe || '')
  // cue.id: a preset id, 'custom' or '' · cue.text: a suggestion's cue that matches no preset
  const [cue, setCue] = useState(() => cueFromSuggestion(prefill?.triggerSuggestionHe))
  const [customTrigger, setCustomTrigger] = useState('')
  const [schedule, setSchedule] = useState({ weekly: false, times: 3, days: [], time: '' })

  const activePillars = growthPillars?.length ? growthPillars : ['discipline', 'body']
  const suggestions = getTopSuggestionsForPillars(activePillars, 6)
  const atMax = existingCount >= MAX_ACTIVE_HABITS
  const hasCue = !!(cue.id || cue.text)

  function handleSuggestionPick(s) {
    setSelected(s)
    setCustomTitle(s.titleHe)
    setCue(cueFromSuggestion(s.triggerSuggestionHe))
    setStep(2)
  }

  function handleCustom() {
    setSelected(null)
    setCustomTitle('')
    setCue({ id: '', text: '' })
    setStep(1)
  }

  function handleTitleNext() {
    if (!customTitle.trim()) return
    setSelected({ titleHe: customTitle.trim(), pillar: null })
    setStep(2)
  }

  function handleSave() {
    const finalTitle   = selected?.titleHe || customTitle.trim()
    const finalTrigger = cue.id === 'custom' ? customTrigger.trim() : cue.id ? tf.cues[cue.id] : cue.text
    if (!finalTitle) return
    onSave({
      cue:       finalTrigger || finalTitle,
      habit:     finalTitle,
      pillar:    selected?.pillar || prefill?.pillar || null,
      source:    prefill ? 'surprise-mission' : (selected?.id ? 'suggested' : 'manual'),
      createdAt: new Date().toISOString().slice(0, 10),
      ...normalizeSchedule(schedule),
    })
  }

  const overlay = (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', background: '#161622', borderRadius: '20px 20px 0 0', padding: '1.5rem 1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'slide-up 0.22s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ color: '#F4F1E8', fontWeight: 800, fontSize: '1rem' }}>
              {tf.titles[step]}
            </div>
            <div style={{ color: '#71717A', fontSize: '0.68rem', marginTop: '0.1rem' }}>
              {tf.steps[step]}
            </div>
          </div>
          <button onClick={onClose} className="btn-tactile" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(241,245,249,0.6)', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, minHeight: 44, minWidth: 44 }}>✕</button>
        </div>

        {/* STEP 0 — Suggestions or custom */}
        {step === 0 && (
          <div>
            {atMax ? (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1rem', textAlign: 'center', color: '#A4A6AD', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {tf.maxTitle}<br />
                <span style={{ color: '#71717A', fontSize: '0.75rem' }}>{tf.maxSub}</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCustom}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#A4A6AD', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}
                >
                  {tf.custom}
                </button>
                <div style={{ color: '#71717A', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
                  {tf.recommended}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {suggestions.map(s => {
                    const pillar = getPillar(s.pillar)
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSuggestionPick(s)}
                        className="btn-tactile"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 0.9rem',
                          background: '#111317',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 12,
                          cursor: 'pointer', textAlign: 'start',
                          width: '100%',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{pillar?.emoji || '⚡'}</span>
                        <div style={{ flex: 1, textAlign: 'start' }}>
                          <div style={{ color: '#F4F1E8', fontSize: '0.88rem', fontWeight: 700 }}>{s.titleHe}</div>
                          <div style={{ color: '#71717A', fontSize: '0.67rem', marginTop: '0.1rem' }}>
                            {s.triggerSuggestionHe} · {fmt(tf.minutes, { n: s.estimatedMinutes })}
                          </div>
                        </div>
                        <span style={{ color: '#71717A', fontSize: '0.8rem' }}>{tf.arrow}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 1 — Custom title */}
        {step === 1 && (
          <div>
            <input
              autoFocus
              className="glow-input"
              placeholder={tf.titlePh}
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTitleNext()}
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'inherit' }}
            />
            <button
              onClick={handleTitleNext}
              disabled={!customTitle.trim()}
              className={customTitle.trim() ? 'btn-tactile' : ''}
              style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none', background: customTitle.trim() ? 'linear-gradient(135deg,#c49020,#d4a843)' : 'rgba(255,255,255,0.06)', color: customTitle.trim() ? '#111' : 'rgba(255,255,255,0.25)', fontSize: '0.9rem', fontWeight: 900, cursor: customTitle.trim() ? 'pointer' : 'not-allowed' }}
            >
              {tf.next}
            </button>
          </div>
        )}

        {/* STEP 2 — Trigger */}
        {step === 2 && (
          <div>
            <div style={{ color: '#A4A6AD', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.1rem' }}>{selected?.titleHe || customTitle}</div>
            <div style={{ color: '#71717A', fontSize: '0.7rem', marginBottom: '1rem' }}>{tf.cueQ}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {CUE_IDS.map(id => (
                <button
                  key={id}
                  onClick={() => setCue({ id, text: '' })}
                  aria-pressed={cue.id === id}
                  className="btn-tactile"
                  style={{
                    padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${cue.id === id ? 'rgba(217,179,76,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    background: cue.id === id ? 'rgba(217,179,76,0.08)' : 'transparent',
                    color: cue.id === id ? '#D9B34C' : '#A4A6AD',
                    fontSize: '0.85rem', fontWeight: 600, textAlign: 'start',
                  }}
                >
                  {tf.cues[id]}
                </button>
              ))}
            </div>
            {cue.id === 'custom' && (
              <input
                autoFocus
                className="glow-input"
                placeholder={tf.cuePh}
                value={customTrigger}
                onChange={e => setCustomTrigger(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.88rem', boxSizing: 'border-box', marginBottom: '0.75rem', fontFamily: 'inherit' }}
              />
            )}
            <button
              onClick={() => hasCue && setStep(3)}
              disabled={!hasCue}
              className={hasCue ? 'btn-tactile' : ''}
              style={{ width: '100%', padding: '0.95rem', borderRadius: 12, border: 'none', background: hasCue ? 'linear-gradient(135deg,#c49020,#d4a843)' : 'rgba(255,255,255,0.06)', color: hasCue ? '#111' : 'rgba(255,255,255,0.25)', fontSize: '0.9rem', fontWeight: 900, cursor: hasCue ? 'pointer' : 'not-allowed' }}
            >
              {tf.next}
            </button>
          </div>
        )}

        {/* STEP 3 — How often + optional days/time */}
        {step === 3 && (
          <div>
            <div style={{ color: '#A4A6AD', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>{selected?.titleHe || customTitle}</div>
            <HabitScheduleFields value={schedule} onChange={setSchedule} />
            <button
              onClick={handleSave}
              className="btn-tactile"
              style={{ width: '100%', padding: '0.95rem', marginTop: '1.25rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c49020,#d4a843)', color: '#0a0a0a', fontSize: '0.95rem', fontWeight: 900, cursor: 'pointer' }}
            >
              {tf.save}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return overlay
}
