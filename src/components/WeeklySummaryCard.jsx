import { X } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { fmt, localeFor } from '../i18n/fmt'

// "השבוע שלך" — last week at a glance (Sunday → Saturday), on Home on Sunday and Monday.
// summary comes from utils/weeklySummary.js. onGoals opens the journal to write the week's goals
// (the Sunday 10:00 push asks for exactly that).

const C = { surface: '#111317', text: '#F4F1E8', muted: '#A4A6AD', faint: '#71717A', accent: '#D9B34C', ok: '#3FAF7A' }

function shortDate(key, lang) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString(localeFor(lang), { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

const plural = (forms, n) => fmt(n === 0 ? forms.zero : n === 1 ? forms.one : forms.many, { n })

export default function WeeklySummaryCard({ summary, onGoals, onClose }) {
  const { lang, t } = useLang()
  const tw = t.weekly
  const s = summary

  return (
    <section
      aria-label={tw.title}
      style={{ background: C.surface, border: '1px solid rgba(255,255,255,0.06)', borderInlineStart: '3px solid rgba(217,179,76,0.55)', borderRadius: 14, padding: '0.9rem 1rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: '0.92rem', fontWeight: 800 }}>{tw.title}</div>
          <div style={{ color: C.faint, fontSize: '0.7rem', marginTop: 2 }}>
            {fmt(tw.range, { from: shortDate(s.weekStart, lang), to: shortDate(s.weekEnd, lang) })}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={tw.closeAria}
          style={{ background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><X size={18} /></button>
      </div>

      {/* Seven days, Sunday first */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, margin: '0.6rem 0 0.75rem' }} aria-label={fmt(tw.activeDays, { n: s.activeDays })}>
        {s.days.map((d, i) => (
          <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 30, borderRadius: 8,
              background: d.active ? 'rgba(63,175,122,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${d.active ? 'rgba(63,175,122,0.45)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: d.active ? C.ok : C.faint, fontSize: '0.8rem', fontWeight: 800,
            }} aria-hidden="true">{d.active ? '✓' : ''}</div>
            <div style={{ color: C.faint, fontSize: '0.65rem', marginTop: 4 }} aria-hidden="true">{tw.days[i]}</div>
          </div>
        ))}
      </div>

      <div style={{ color: C.text, fontSize: '1rem', fontWeight: 800 }}>{fmt(tw.activeDays, { n: s.activeDays })}</div>
      <div style={{ color: s.trend === 'down' ? C.muted : C.accent, fontSize: '0.78rem', fontWeight: 700, marginTop: 2 }}>
        {fmt(tw.trend[s.trend], { n: s.prevActiveDays })}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem', flexWrap: 'wrap' }}>
        <span style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.25rem 0.55rem' }}>
          💪 {plural(tw.workouts, s.workouts)}
        </span>
        <span style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.25rem 0.55rem' }}>
          🔥 {plural(tw.streak, s.streak)}
        </span>
      </div>

      <button
        onClick={onGoals}
        className="btn-tactile"
        style={{ width: '100%', minHeight: 44, marginTop: '0.8rem', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(217,179,76,0.1)', border: '1px solid rgba(217,179,76,0.45)', color: C.accent, fontSize: '0.85rem', fontWeight: 800 }}
      >{tw.goals}</button>
    </section>
  )
}
