import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { cardTexts, makeCardBlob, shareBlob } from '../utils/shareCard'

// "Share" button for the story card (utils/shareCard.js). The image is drawn ahead of the tap,
// because iOS only lets navigator.share() run right after a tap.
// days: 7 booleans, Sunday first. variant 'solid' (weekly card) | 'chip' (after the day is done).

export default function ShareStreakButton({ streak, days, activeDays, variant = 'chip' }) {
  const { lang, t } = useLang()
  const ts = t.share
  const [blob,   setBlob]   = useState(null)
  const [status, setStatus] = useState(null)   // null | 'downloaded' | 'failed'
  const daysKey = (days || []).map(Boolean).join(',')

  useEffect(() => {
    let alive = true
    setBlob(null)
    makeCardBlob({
      texts:     cardTexts({ streak, activeDays, copy: ts.card }),
      days:      days || [],
      dayLabels: t.weekly.days,
      rtl:       lang === 'he',
    }).then(b => { if (alive) setBlob(b) })
    return () => { alive = false }
  }, [streak, activeDays, daysKey, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onShare() {
    const result = await shareBlob(blob, { text: `${ts.text} https://prime-daily.app/` })
    setStatus(result === 'downloaded' || result === 'failed' ? result : null)
  }

  const solid = variant === 'solid'
  return (
    <div>
      <button
        onClick={onShare}
        disabled={!blob}
        className="btn-tactile"
        style={{
          width: '100%', minHeight: 44, borderRadius: solid ? 10 : 14, cursor: blob ? 'pointer' : 'default', fontFamily: 'inherit',
          background: solid ? 'transparent' : 'rgba(63,175,122,0.08)',
          border: `1px solid ${solid ? 'rgba(255,255,255,0.18)' : 'rgba(63,175,122,0.4)'}`,
          color: solid ? '#F4F1E8' : '#3FAF7A', fontSize: '0.85rem', fontWeight: 800, opacity: blob ? 1 : 0.6,
        }}
      >📤 {solid ? ts.weekButton : ts.streakButton}</button>
      {status && (
        <div role="status" style={{ color: status === 'failed' ? '#D85C5C' : '#A4A6AD', fontSize: '0.72rem', marginTop: '0.35rem', textAlign: 'center' }}>
          {status === 'failed' ? ts.failed : ts.downloaded}
        </div>
      )}
    </div>
  )
}
