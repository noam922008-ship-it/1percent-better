import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'
import { BAD_IDS, GOOD, HELP_FOR, REMIND_EARLY, buildFromZero, defaultTimeFor, replacementsFor, shiftTime } from '../utils/fromZero'

// First-run path (docs/FROM_ZERO_PLAN.md), two steps so people actually finish it:
// 1 the bad habit (one tap) → 2 the tiny good habit that replaces it, with the deal and "start" on the same screen.
// No "when" question: the reminder gets the usual time for that habit (defaultTimeFor), editable later.
// "I already have habits" (first run only) goes to the regular HabitCreationFlow (onRegular).
// later: opened from "add habit" → no focus week.

const GOLD = '#D9B34C'
const chip = on => ({
  padding: '0.75rem 0.95rem', borderRadius: 14, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, minHeight: 48,
  textAlign: 'start', fontFamily: 'inherit', width: '100%',
  border: `1px solid ${on ? 'rgba(217,179,76,0.6)' : 'rgba(255,255,255,0.08)'}`,
  background: on ? 'rgba(217,179,76,0.15)' : '#111317', color: on ? GOLD : '#F4F1E8',
})
const primary = disabled => ({
  width: '100%', padding: '0.95rem', marginTop: '1rem', borderRadius: 14, border: 'none',
  background: disabled ? 'rgba(217,179,76,0.25)' : GOLD, color: '#111', fontSize: '0.95rem', fontWeight: 900,
  cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
})
const input = { width: '100%', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.9rem', boxSizing: 'border-box', marginTop: '0.6rem', fontFamily: 'inherit' }

export default function FromZeroFlow({ onSave, onRegular, onClose, later = false }) {
  const { t } = useLang()
  const s = t.fromZero
  const [step, setStep]   = useState(1)
  const [badId, setBadId] = useState('')
  const [own, setOwn]     = useState('')
  const [goodId, setGoodId] = useState('')
  const [amount, setAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  const ownText = own.trim()
  const bad = badId === 'other'
    ? (ownText ? { label: ownText, quit: fmt(s.ownQuit, { x: ownText }), cue: fmt(s.ownCue, { x: ownText }) } : null)
    : badId ? s.bad[badId] : null
  const options = replacementsFor(badId)
  const hasAmount = goodId && GOOD[goodId].n != null
  const good = goodId ? { title: fmt(s.good[goodId].title, { n: amount }), phrase: fmt(s.good[goodId].phrase || s.good[goodId].title, { n: amount }) } : null
  // Late nights: the reminder comes an hour before the usual bedtime
  const remindAt = shiftTime(defaultTimeFor(badId), REMIND_EARLY[badId] || 0)
  const help = HELP_FOR[badId] ? s.help[HELP_FOR[badId]] : null

  function pickGood(opt) { setGoodId(opt.id); setAmount(opt.n ?? GOOD[opt.id].n ?? 0) }
  // One tap: a listed habit goes straight to step 2; "something else" waits for the text
  function pickBad(id) { setBadId(id); setGoodId(''); if (id !== 'other') setStep(2) }
  function step1Next() { if (bad) setStep(2) }
  async function save() {
    if (!bad || !good || saving) return
    setSaving(true)
    try { await onSave(buildFromZero({ bad, good, time: remindAt, badId, later })) } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box', background: '#161622', borderRadius: '20px 20px 0 0', padding: '1.5rem 1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'slide-up 0.22s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.1rem' }}>
          <div>
            <div style={{ color: '#8A8A93', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>{fmt(s.stepOf, { n: step, total: 2 })}</div>
            <div style={{ color: '#F4F1E8', fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.35 }}>{s.titles[step]}</div>
            {s.subs[step] && <div style={{ color: '#A4A6AD', fontSize: '0.8rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{s.subs[step]}</div>}
          </div>
          <button onClick={onClose} aria-label={s.close} className="btn-tactile" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(241,245,249,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, minHeight: 44, minWidth: 44 }}>✕</button>
        </div>


        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {BAD_IDS.map(id => (
                <button key={id} className="btn-tactile" aria-pressed={badId === id} style={chip(badId === id)} onClick={() => pickBad(id)}>{s.bad[id].icon} {s.bad[id].label}</button>
              ))}
              <button className="btn-tactile" aria-pressed={badId === 'other'} style={chip(badId === 'other')} onClick={() => pickBad('other')}>{s.other}</button>
            </div>
            {badId === 'other' && (
              <input autoFocus className="glow-input" style={input} placeholder={s.ownPh} value={own}
                onChange={e => setOwn(e.target.value)} onKeyDown={e => e.key === 'Enter' && step1Next()} maxLength={60} />
            )}
            {badId === 'other' && <button className="btn-tactile" style={primary(!bad)} disabled={!bad} onClick={step1Next}>{s.next}</button>}
            {!later && (
              <button onClick={onRegular} style={{ display: 'block', margin: '0.6rem auto 0', minHeight: 44, padding: '0 1rem', background: 'none', border: 'none', color: '#8A8A93', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{s.start.some}</button>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            {help && (
              <div role="note" style={{ marginBottom: '0.9rem', padding: '0.8rem 0.9rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#A4A6AD', fontSize: '0.78rem', lineHeight: 1.6 }}>
                {help.text}{' '}
                {help.href
                  ? <a href={help.href} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: GOLD, fontWeight: 700, unicodeBidi: 'isolate' }}>{help.link}</a>
                  : <span style={{ color: GOLD, fontWeight: 700 }}>{help.link}</span>}
              </div>
            )}
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {options.map(opt => (
                <button key={opt.id} className="btn-tactile" aria-pressed={goodId === opt.id} style={chip(goodId === opt.id)} onClick={() => pickGood(opt)}>
                  {s.good[opt.id].icon} {fmt(s.good[opt.id].title, { n: goodId === opt.id ? amount : (opt.n ?? GOOD[opt.id].n) })}
                </button>
              ))}
            </div>
            {hasAmount && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '0.9rem' }}>
                <button className="btn-tactile" aria-label={s.less} onClick={() => setAmount(a => Math.max(GOOD[goodId].min, a - 1))} style={{ ...chip(false), width: 48, textAlign: 'center' }}>−</button>
                <span style={{ color: '#F4F1E8', fontWeight: 900, fontSize: '1.3rem', minWidth: 36, textAlign: 'center' }} aria-live="polite">{amount}</span>
                <button className="btn-tactile" aria-label={s.more} onClick={() => setAmount(a => Math.min(GOOD[goodId].max, a + 1))} style={{ ...chip(false), width: 48, textAlign: 'center' }}>+</button>
              </div>
            )}
            {hasAmount && <div style={{ color: '#8A8A93', fontSize: '0.74rem', textAlign: 'center', marginTop: '0.5rem' }}>{s.smallHint}</div>}
            {good && bad && (
              <div style={{ marginTop: '1rem', background: 'rgba(217,179,76,0.06)', border: '1px solid rgba(217,179,76,0.3)', borderRadius: 14, padding: '0.8rem 0.95rem' }}>
                <div style={{ color: '#F4F1E8', fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.6 }}>{fmt(s.pact, { cue: bad.cue, good: good.phrase })}</div>
                <div style={{ color: '#A4A6AD', fontSize: '0.76rem', marginTop: '0.35rem' }}>{fmt(s.reminderAt, { time: '\u2066' + remindAt + '\u2069' })}</div>
              </div>
            )}
            <button className="btn-tactile" style={primary(!good || saving)} disabled={!good || saving} onClick={save}>{saving ? '…' : s.save}</button>
          </div>
        )}



        {step === 2 && (
          <button onClick={() => setStep(1)} style={{ display: 'block', margin: '0.6rem auto 0', minHeight: 44, padding: '0 1rem', background: 'none', border: 'none', color: '#8A8A93', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{s.back}</button>
        )}
      </div>
    </div>
  )
}
