import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import { fmt, byLang } from '../../i18n/fmt'
import { BOXING_LEVELS } from '../../data/boxingPath'

// ─── palette ────────────────────────────────────────────────────────────────
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

// ─── reflection options (labels: t.workouts.combat.boxing.reflect) ─────────────
const REFLECTIONS = ['technique', 'pace', 'endurance', 'movement', 'felt-good']

// ─── helper: format duration ─────────────────────────────────────────────────
function formatDuration(seconds, tc) {
  if (!seconds || seconds < 60) return fmt(tc.secShort, { n: seconds ?? 0 })
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0) return fmt(tc.minShort, { n: m })
  return fmt(tc.minShort, { n: `${m}:${String(s).padStart(2, '0')}` })
}

// ─── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div
      style={{
        flex: 1,
        background: C.surface,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        padding: '14px 10px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function BoxingCompletion({
  workout,
  stats,
  xpAwarded,
  nextWorkout,
  onDone,
  levelJustCompleted,
}) {
  const { lang, t: tr } = useLang()
  const tc = tr.workouts.combat
  const tk = tc.completion
  const [selectedReflection, setSelectedReflection] = useState(null)

  // Determine next level info for level-completion banner
  const completedLevelNum = workout?.level ?? 1
  const nextLevelObj = BOXING_LEVELS.find((lv) => lv.level === completedLevelNum + 1)

  // Technique count
  const techniqueCount = (stats?.techniques ?? []).length

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        fontFamily: 'system-ui, sans-serif',
        padding: '32px 16px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Success header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🥊</div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 900,
            margin: '0 0 8px',
            color: C.text,
          }}
        >
          {tk.title}
        </h1>
        <p style={{ fontSize: 15, color: C.muted, margin: 0 }}>
          {byLang(workout, 'title', lang)}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard value={formatDuration(stats?.durationSeconds, tc)} label={tk.time} />
        <StatCard value={stats?.roundsCompleted ?? 0} label={tk.rounds} />
        {techniqueCount > 0 && (
          <StatCard value={techniqueCount} label={tk.techniques} />
        )}
      </div>

      {/* ── XP card ── */}
      <div
        style={{
          background: C.surface,
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          padding: '16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {xpAwarded > 0 ? tk.xpEarned : 'XP'}
          </div>
        </div>
        {xpAwarded > 0 ? (
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: C.accent,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>+{xpAwarded}</span>
            <span style={{ fontSize: 16 }}>XP</span>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: C.muted, fontStyle: 'italic' }}>
            {tk.xpDoneBoxing}
          </div>
        )}
      </div>

      {/* ── Level completion banner ── */}
      {levelJustCompleted && (
        <div
          style={{
            background: `linear-gradient(135deg, ${C.accent}22, ${C.green}18)`,
            border: `1px solid ${C.accent}44`,
            borderRadius: 14,
            padding: '18px 16px',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.accent, marginBottom: 6 }}>
            {fmt(tk.levelDone, { n: completedLevelNum })}
          </div>
          {nextLevelObj && (
            <div style={{ fontSize: 13, color: C.muted }}>
              {fmt(tk.levelOpen, { n: nextLevelObj.level, title: byLang(nextLevelObj, 'title', lang) })}
            </div>
          )}
        </div>
      )}

      {/* ── Next workout teaser (only when no level completion) ── */}
      {!levelJustCompleted && nextWorkout && (
        <div
          style={{
            background: C.surface,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{tk.next}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            {byLang(nextWorkout, 'title', lang)}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {fmt(tk.nextMeta, {
              n: nextWorkout.order,
              total: BOXING_LEVELS.find((lv) => lv.workouts.some((w) => w.id === nextWorkout.id))?.workouts.length ?? 6,
              min: nextWorkout.estimatedMinutes,
            })}
          </div>
        </div>
      )}

      {/* ── Reflection section ── */}
      <div
        style={{
          background: C.surface,
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          padding: '16px',
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {tk.hardestQ}
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
          {tk.optional}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {REFLECTIONS.map((id) => {
            const selected = selectedReflection === id
            return (
              <button
                key={id}
                className="btn-tactile"
                onClick={() =>
                  setSelectedReflection(selected ? null : id)
                }
                style={{
                  background: selected ? C.blue + '22' : C.bg,
                  color: selected ? C.blue : C.muted,
                  border: `1px solid ${selected ? C.blue : C.border}`,
                  borderRadius: 20,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tc.boxing.reflect[id]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Spacer pushes button to bottom ── */}
      <div style={{ flex: 1 }} />

      {/* ── Done button ── */}
      <button
        className="btn-tactile"
        onClick={() => onDone(selectedReflection)}
        style={{
          width: '100%',
          background: C.accent,
          color: '#111317',
          border: 'none',
          borderRadius: 14,
          padding: '16px 0',
          fontSize: 17,
          fontWeight: 800,
          cursor: 'pointer',
          letterSpacing: 0.3,
        }}
      >
        {tk.continue}
      </button>
    </div>
  )
}
