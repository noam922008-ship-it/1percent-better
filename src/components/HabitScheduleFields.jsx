import { DAY_LABELS, MAX_TIMES_PER_WEEK } from '../utils/habitSchedule'

// "כל יום" / "X פעמים בשבוע", optional days and time. Used when creating and editing a habit.
// value: { weekly: bool, times: 1..6, days: [0..6], time: 'HH:MM' | '' }

const C = {
  text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A',
  gold: '#D9B34C', goldSoft: 'rgba(217,179,76,0.08)', goldBorder: 'rgba(217,179,76,0.4)',
  border: 'rgba(255,255,255,0.08)', field: 'rgba(255,255,255,0.05)',
}

const label = { color: C.muted, fontSize: '0.72rem', fontWeight: 700, margin: '1rem 0 0.45rem' }

const chip = on => ({
  minHeight: 44, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
  border: `1px solid ${on ? C.goldBorder : C.border}`, background: on ? C.goldSoft : 'transparent',
  color: on ? C.gold : C.muted, fontSize: '0.85rem', fontWeight: 700,
})

export default function HabitScheduleFields({ value, onChange }) {
  const set = patch => onChange({ ...value, ...patch })
  const toggleDay = i => set({ days: value.days.includes(i) ? value.days.filter(d => d !== i) : [...value.days, i] })

  return (
    <div dir="rtl" style={{ direction: 'rtl' }}>
      <div style={{ ...label, marginTop: 0 }}>כמה פעמים?</div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={() => set({ weekly: false })} style={{ ...chip(!value.weekly), flex: 1 }}>כל יום</button>
        <button type="button" onClick={() => set({ weekly: true })} style={{ ...chip(value.weekly), flex: 1 }}>כמה פעמים בשבוע</button>
      </div>

      {value.weekly && (
        <>
          <div style={label}>פעמים בשבוע</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" aria-label="פחות" onClick={() => set({ times: Math.max(1, value.times - 1) })}
              disabled={value.times <= 1} style={{ ...chip(false), width: 44, opacity: value.times <= 1 ? 0.4 : 1 }}>−</button>
            <span aria-live="polite" style={{ color: C.text, fontSize: '1.4rem', fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{value.times}</span>
            <button type="button" aria-label="יותר" onClick={() => set({ times: Math.min(MAX_TIMES_PER_WEEK, value.times + 1) })}
              disabled={value.times >= MAX_TIMES_PER_WEEK} style={{ ...chip(false), width: 44, opacity: value.times >= MAX_TIMES_PER_WEEK ? 0.4 : 1 }}>+</button>
          </div>

          <div style={label}>באילו ימים? <span style={{ color: C.faint, fontWeight: 500 }}>(רשות — לתזכורת)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.3rem' }}>
            {DAY_LABELS.map((d, i) => (
              <button key={i} type="button" aria-pressed={value.days.includes(i)} onClick={() => toggleDay(i)}
                style={{ ...chip(value.days.includes(i)), padding: 0, fontSize: '0.8rem' }}>{d}</button>
            ))}
          </div>
        </>
      )}

      <div style={label}>באיזו שעה? <span style={{ color: C.faint, fontWeight: 500 }}>(רשות — לתזכורת)</span></div>
      <input
        type="time"
        value={value.time || ''}
        onChange={e => set({ time: e.target.value })}
        aria-label="שעת תזכורת"
        style={{ width: '100%', boxSizing: 'border-box', minHeight: 44, padding: '0.6rem 0.9rem', borderRadius: 10,
          border: `1px solid ${C.border}`, background: C.field, color: C.text, fontSize: '1rem', fontFamily: 'inherit', colorScheme: 'dark' }}
      />
    </div>
  )
}
