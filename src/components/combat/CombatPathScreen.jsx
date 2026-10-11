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
}

function ProgressBar({ value, total, color = C.accent }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ background: C.border, borderRadius: 8, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.4s ease' }} />
    </div>
  )
}

function TechniqueRow({ name, status }) {
  const iconMap = { done: { symbol: '✓', color: C.green }, current: { symbol: '●', color: C.accent }, locked: { symbol: '🔒', color: '#3A3A40' } }
  const { symbol, color } = iconMap[status] ?? iconMap.locked
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color, fontSize: 16, minWidth: 20, textAlign: 'center' }}>{symbol}</span>
      <span style={{ fontSize: 14, color: status === 'locked' ? '#3A3A40' : C.text, flex: 1 }}>{name}</span>
    </div>
  )
}

function WorkoutRow({ workout, completedIds }) {
  const { lang, t: tr } = useLang()
  const done = completedIds.includes(workout.id)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: done ? 'rgba(16,185,129,0.08)' : 'transparent' }}>
      <span style={{ fontSize: 15, color: done ? C.green : C.muted, minWidth: 20, textAlign: 'center' }}>{done ? '✓' : '○'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: done ? C.muted : C.text }}>{byLang(workout, 'title', lang)}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmt(tr.workouts.combat.minutes, { n: workout.estimatedMinutes })}</div>
      </div>
    </div>
  )
}

const TECHNIQUES_DEFAULT_VISIBLE = 3

function CollapsibleTechniqueList({ techniques, techStatus }) {
  const { t: tr } = useLang()
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? techniques : techniques.slice(0, TECHNIQUES_DEFAULT_VISIBLE)
  const hidden  = techniques.length - TECHNIQUES_DEFAULT_VISIBLE

  return (
    <>
      {visible.map((tech) => <TechniqueRow key={tech} name={tech} status={techStatus(tech)} />)}
      {!expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '10px 0 2px', width: '100%', textAlign: 'start' }}
        >
          {fmt(tr.workouts.combat.showAllTech, { n: hidden })}
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          aria-expanded={true}
          style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '10px 0 2px', width: '100%', textAlign: 'start' }}
        >
          {tr.workouts.combat.hide}
        </button>
      )}
    </>
  )
}

function LevelAccordion({ level, completedIds, engine, defaultOpen }) {
  const { lang, t: tr } = useLang()
  const tc = tr.workouts.combat
  const [open, setOpen] = useState(defaultOpen)
  const unlocked = engine.isLevelUnlocked(level.level, completedIds)
  const done     = engine.isLevelComplete(level.level, completedIds)
  const progress = engine.getLevelProgress(level.level, completedIds)
  const icon     = done ? '✓' : unlocked ? '◉' : '🔒'
  const color    = done ? C.green : unlocked ? C.accent : C.muted

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 8 }}>
      <button onClick={() => unlocked && setOpen((o) => !o)} style={{ width: '100%', background: open ? C.surface : 'transparent', border: 'none', padding: '14px 16px', cursor: unlocked ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18, color, minWidth: 24, textAlign: 'center' }}>{icon}</span>
        <div style={{ flex: 1, textAlign: 'start' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: unlocked ? C.text : C.muted }}>{fmt(tc.levelTitle, { n: level.level, title: byLang(level, 'title', lang) })}</div>
          {unlocked && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{fmt(tc.levelCount, { done: progress.completed, total: progress.total })}</div>}
          {!unlocked && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{tc.locked}</div>}
        </div>
        {unlocked && <span style={{ color: C.muted, fontSize: 14 }}>{open ? '▲' : '▼'}</span>}
      </button>
      {open && unlocked && (
        <div style={{ background: C.surface, padding: '4px 8px 8px' }}>
          {level.workouts.map((w) => <WorkoutRow key={w.id} workout={w} completedIds={completedIds} />)}
        </div>
      )}
    </div>
  )
}

/**
 * Generic combat path overview screen.
 *
 * Props:
 *   title              — header title string
 *   levels             — LEVELS array
 *   levelOneTechniques — string[] shown in techniques section
 *   state              — { currentLevel, completedWorkoutIds, ... }
 *   engine             — progression engine from createCombatProgressionEngine
 *   freePracticeLabel  — string
 *   allCompletedLabel  — string shown when entire curriculum is done
 *   onStartWorkout     — fn(workout)
 *   onFreeTraining     — fn()
 *   onClose            — fn()
 *   onQuickLegWork     — optional fn() — quick-start leg/footwork drill
 *   onQuickHandsElbows — optional fn() — quick-start hands+elbows drill
 *   quickDuration      — number (minutes) shown on quick-start buttons
 */
export default function CombatPathScreen({
  title,
  levels,
  levelOneTechniques,
  state,
  engine,
  freePracticeLabel,
  allCompletedLabel,
  onStartWorkout,
  onFreeTraining,
  onClose,
  onQuickLegWork,
  onQuickHandsElbows,
  quickDuration = 5,
}) {
  const { lang, t: tr } = useLang()
  const tc = tr.workouts.combat
  const completedIds  = state?.completedWorkoutIds ?? []
  const nextWorkout   = engine.getNextWorkout(state ?? { completedWorkoutIds: [], currentLevel: 1 })
  const learnedTechs  = engine.getLearnedTechniques(completedIds)
  const allDone       = !nextWorkout && levels?.every((lv) => engine.isLevelComplete(lv.level, completedIds))

  const nextLevel = nextWorkout
    ? levels?.find((lv) => lv.workouts.some((w) => w.id === nextWorkout.id))
    : null

  function techStatus(tech) {
    if (learnedTechs.includes(tech)) return 'done'
    const firstUnlearned = (levelOneTechniques ?? []).find((t) => !learnedTechs.includes(t))
    if (tech === firstUnlearned) return 'current'
    return 'locked'
  }

  const levelProgress = nextLevel ? engine.getLevelProgress(nextLevel.level, completedIds) : null

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', paddingBottom: 32, overflowX: 'hidden' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', minHeight: 56, padding: '0 16px', gap: 12 }}>
        <button onClick={onClose} className="btn-tactile" style={{ background: 'transparent', border: 'none', color: C.text, fontSize: 22, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, lineHeight: 1, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tc.back}</button>
        <h1 style={{ flex: 1, fontSize: 17, fontWeight: 700, margin: 0, textAlign: 'start' }}>{title}</h1>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Quick Start ──────────────────────────────────────────────── */}
        {(onQuickLegWork || onQuickHandsElbows) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 8, textAlign: 'start', letterSpacing: 0.3 }}>
              {tc.quickStart}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {onQuickLegWork && (
                <button
                  className="btn-tactile"
                  onClick={onQuickLegWork}
                  style={{ flex: 1, minWidth: 0, minHeight: 72, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '12px 8px' }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>👟</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tc.quickLegs}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{fmt(tc.minShort, { n: quickDuration })}</span>
                </button>
              )}
              {onQuickHandsElbows && (
                <button
                  className="btn-tactile"
                  onClick={onQuickHandsElbows}
                  style={{ flex: 1, minWidth: 0, minHeight: 72, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '12px 8px' }}
                >
                  <span style={{ fontSize: 24, lineHeight: 1 }}>🥊</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tc.handsElbows}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{fmt(tc.minShort, { n: quickDuration })}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Current workout card */}
        <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16 }}>
          {allDone ? (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 15 }}>🏆 {allCompletedLabel}</div>
          ) : nextWorkout ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: C.accent + '22', color: C.accent, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  {fmt(tc.levelChip, { n: nextLevel?.level ?? 1, title: byLang(nextLevel, 'title', lang) })}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>
                  {fmt(tc.workoutOf, { n: nextWorkout.order, total: nextLevel?.workouts.length ?? 6 })}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{byLang(nextWorkout, 'title', lang)}</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>
                {fmt(tc.minutes, { n: nextWorkout.estimatedMinutes })} ·{' '}
                {tc.difficulty[nextWorkout.difficulty] ?? nextWorkout.difficulty} ·{' '}
                {(nextWorkout.equipment ?? []).length === 0 ? tc.equipment.none : (nextWorkout.equipment ?? []).map((id) => tc.equipment[id] ?? id).join(', ')}
              </div>
              <button className="btn-tactile" onClick={() => onStartWorkout(nextWorkout)} style={{ width: '100%', background: C.accent, color: '#111317', border: 'none', borderRadius: 14, padding: '15px 0', fontSize: 17, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 }}>
                {tc.startWorkout}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: 15 }}>🎉 {allCompletedLabel}</div>
          )}
        </div>

        {/* Level progress bar */}
        {nextLevel && levelProgress && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: C.muted }}>{levelProgress.completed}/{levelProgress.total}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tc.levelProgress}</span>
            </div>
            <ProgressBar value={levelProgress.completed} total={levelProgress.total} />
          </div>
        )}

        {/* Techniques */}
        {levelOneTechniques && levelOneTechniques.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, textAlign: 'start' }}>{tc.techniques}</div>
            <CollapsibleTechniqueList techniques={levelOneTechniques} techStatus={techStatus} />
          </div>
        )}

        {/* Level roadmap */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, textAlign: 'start' }}>{tc.roadmap}</div>
          {(levels ?? []).map((level) => (
            <LevelAccordion
              key={level.level}
              level={level}
              completedIds={completedIds}
              engine={engine}
              defaultOpen={nextLevel?.level === level.level}
            />
          ))}
        </div>

        {/* Free training */}
        <button className="btn-tactile" onClick={onFreeTraining} style={{ width: '100%', background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 0', fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>
          {freePracticeLabel}
        </button>
      </div>
    </div>
  )
}
