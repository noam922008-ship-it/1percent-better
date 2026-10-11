import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import { fmt, byLang } from '../../i18n/fmt'

const C = {
  bg:      '#111317',
  surface: '#1C1F26',
  border:  '#2A2D35',
  text:    '#F4F1E8',
  muted:   '#71717A',
  accent:  '#D9B34C',
  blue:    '#60a5fa',
  green:   '#10b981',
  orange:  '#f97316',
  purple:  '#a78bfa',
}

const ROUND_TYPE_COLOR = {
  warmup:    C.green,
  technique: C.blue,
  work:      C.accent,
  rest:      C.muted,
  cooldown:  C.green,
}

function MetaChip({ label }) {
  return (
    <span style={{ background: '#2A2D35', color: C.muted, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
      {label}
    </span>
  )
}

function TrainingToggle({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const selected = value === opt.id
        return (
          <button key={opt.id} className="btn-tactile" onClick={() => onChange(opt.id)} style={{ flex: 1, minWidth: 80, background: selected ? C.blue + '22' : C.surface, border: `2px solid ${selected ? C.blue : C.border}`, borderRadius: 14, padding: '14px 10px', cursor: 'pointer', color: selected ? C.blue : C.muted, textAlign: 'center', transition: 'all 0.18s ease' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
            <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{opt.desc}</div>
          </button>
        )
      })}
    </div>
  )
}

function RoundStructureRow({ round }) {
  const { lang, t: tr } = useLang()
  const color  = ROUND_TYPE_COLOR[round.type] ?? C.muted
  const label  = tr.workouts.combat.roundType[round.type] ?? round.type
  const mins   = Math.floor(round.durationSeconds / 60)
  const secs   = round.durationSeconds % 60
  const timeStr = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}″`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 4, height: 28, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{byLang(round, 'title', lang)}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{label}</div>
      </div>
      <div style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{timeStr}</div>
    </div>
  )
}

/**
 * Generic combat workout preview.
 *
 * @param {object}   workout          - WorkoutRound object
 * @param {number}   levelNum         - Level number for display
 * @param {Array}    trainingOptions  - [{ id, label, emoji, desc }]
 * @param {string}   bagWarningLabel  - Warning shown when bag is selected
 * @param {Function} onStart(type)    - Called with selected training type
 * @param {Function} onBack           - Back navigation
 */
export default function CombatWorkoutPreview({ workout, levelNum, trainingOptions, bagWarningLabel, onStart, onInstant, onBack }) {
  const { lang, t: tr } = useLang()
  const tc = tr.workouts.combat
  const tp = tc.preview
  const [trainingType, setTrainingType] = useState(null)
  const [bagAck, setBagAck] = useState(false)

  function handleTypeChange(type) {
    setTrainingType(type)
    setBagAck(false)
  }

  if (!workout) return null

  const workRounds = (workout.rounds ?? []).filter((r) => r.type === 'work')
  const equipment  = (workout.equipment ?? []).map((id) => tc.equipment[id] ?? id).join(' · ')
  const diffLabel  = tc.difficulty[workout.difficulty] ?? workout.difficulty

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', paddingBottom: 32 }}>
      {/* Back */}
      <div style={{ padding: '12px 16px 0' }}>
        <button className="btn-tactile" onClick={onBack} style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 15, cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          {tc.backLabel}
        </button>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        {/* Title block */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: C.accent + '22', color: C.accent, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
              {fmt(tp.levelWorkout, { level: levelNum, n: workout.order })}
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2, color: C.text }}>{byLang(workout, 'title', lang)}</h1>
          <p dir="auto" style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>{workout.goalHe}</p>
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <MetaChip label={fmt(tc.minutes, { n: workout.estimatedMinutes })} />
          <MetaChip label={diffLabel} />
          {equipment && <MetaChip label={equipment} />}
          <MetaChip label={tp.xpChip} />
        </div>

        {/* Training type */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{tp.withWhat}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 0 }}>{tp.chooseFirst}</div>
          <TrainingToggle value={trainingType} onChange={handleTypeChange} options={trainingOptions} />

          {trainingType === 'bag' && bagWarningLabel && (
            <div style={{ marginTop: 12, background: C.orange + '1A', border: `1px solid ${C.orange}55`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.orange }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>{bagWarningLabel}</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={bagAck}
                  onChange={e => setBagAck(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: C.orange, cursor: 'pointer', flexShrink: 0 }}
                />
                <span>{tp.gearReady}</span>
              </label>
            </div>
          )}
        </div>

        {/* Round structure */}
        {workout.rounds && workout.rounds.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{fmt(tp.workRounds, { n: workRounds.length })}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{tp.structure}</span>
            </div>
            {workout.rounds.map((round, idx) => (
              <RoundStructureRow key={round.id ?? idx} round={round} />
            ))}
          </div>
        )}

        {/* Safety notes */}
        {workout.safetyNotesHe && workout.safetyNotesHe.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{tp.safety}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {workout.safetyNotesHe.map((note, i) => (
                <li key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, padding: '4px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}>•</span>
                  <span dir="auto">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Start button */}
        {(() => {
          const canStart = trainingType && (trainingType !== 'bag' || bagAck)
          return (
            <button className="btn-tactile" onClick={() => canStart && onStart(trainingType)} disabled={!canStart} style={{ width: '100%', background: canStart ? C.accent : C.border, color: canStart ? '#111317' : C.muted, border: 'none', borderRadius: 14, padding: '16px 0', fontSize: 17, fontWeight: 800, cursor: canStart ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', letterSpacing: 0.3, marginBottom: onInstant ? 10 : 0 }}>
              {!trainingType ? tp.pickType : trainingType === 'bag' && !bagAck ? tp.confirmGear : tc.startWorkout}
            </button>
          )
        })()}

        {/* Instant workout — 5 min, no warmup, no progression, no equipment */}
        {onInstant && (
          <button
            className="btn-tactile"
            onClick={onInstant}
            style={{
              width: '100%',
              background: 'transparent',
              color: C.purple,
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 14,
              padding: '13px 0',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.2,
            }}
          >
            {tp.instant}
          </button>
        )}
      </div>
    </div>
  )
}
