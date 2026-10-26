// A "quit a bad habit" row on Home (utils/quitHabit): clean days counted on their own,
// best run, and "I slipped" with a second tap to confirm (no browser dialogs).
import { useState } from 'react'
import { PencilLine } from 'lucide-react'
import { plural, fmt } from '../i18n/fmt'
import { quitDays, quitBest } from '../utils/quitHabit'

export default function QuitHabitRow({ tr, first, today, s, onSlip, onEdit }) {
  const [confirm, setConfirm] = useState(false)
  const [justSlipped, setJustSlipped] = useState(false)
  const days = quitDays(tr, today)
  const best = quitBest(tr, today)

  function slip() {
    setConfirm(false)
    setJustSlipped(true)
    onSlip()
    setTimeout(() => setJustSlipped(false), 6000)
  }

  return (
    <div style={{ padding: '0.85rem 1rem', borderTop: first ? 'none' : '1px solid rgba(255,255,255,0.04)', minHeight: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ minWidth: 30, height: 30, borderRadius: 8, flexShrink: 0, padding: '0 0.3rem', border: '1.5px solid rgba(217,179,76,0.45)', background: 'rgba(217,179,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D9B34C', fontSize: '0.8rem', fontWeight: 900 }}>
          {days}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#F4F1E8', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.35 }}>🛡️ {tr.habit}</div>
          <div style={{ color: days > 0 ? '#D9B34C' : '#71717A', fontSize: '0.68rem', marginTop: '0.15rem' }}>
            {days > 0 ? `🔥 ${plural(s.days, days)}` : s.dayZero}
            {best > days && ` · ${fmt(s.best, { n: best })}`}
          </div>
        </div>
        {!confirm && (
          <button onClick={() => setConfirm(true)} className="btn-tactile" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#A4A6AD', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', cursor: 'pointer', minHeight: 36, flexShrink: 0 }}>
            {s.slip}
          </button>
        )}
        <button onClick={onEdit} aria-label={s.editAria} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '0.3rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PencilLine size={15} />
        </button>
      </div>
      {confirm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', animation: 'fadeIn 0.18s ease' }}>
          <span style={{ color: '#A4A6AD', fontSize: '0.75rem', flex: 1 }}>{s.slipConfirm}</span>
          <button onClick={() => setConfirm(false)} className="btn-tactile" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#A4A6AD', fontSize: '0.72rem', fontWeight: 700, padding: '0.35rem 0.7rem', cursor: 'pointer', minHeight: 36 }}>{s.slipNo}</button>
          <button onClick={slip} className="btn-tactile" style={{ background: 'rgba(217,179,76,0.12)', border: '1px solid rgba(217,179,76,0.4)', borderRadius: 8, color: '#D9B34C', fontSize: '0.72rem', fontWeight: 800, padding: '0.35rem 0.7rem', cursor: 'pointer', minHeight: 36 }}>{s.slipYes}</button>
        </div>
      )}
      {justSlipped && (
        <div role="status" style={{ marginTop: '0.55rem', color: '#F4F1E8', fontSize: '0.75rem', lineHeight: 1.5, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.65rem' }}>
          {s.slipMsg}
        </div>
      )}
    </div>
  )
}
