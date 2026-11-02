import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { fmt } from '../i18n/fmt'
import { BAD_IDS, GOOD, HELP_FOR, REMIND_EARLY, buildFromZero, replacementsFor, shiftTime } from '../utils/fromZero'

// First-run path for people who start from zero (docs/FROM_ZERO_PLAN.md):
// 0 where do you start → 1 the bad habit → 2 the tiny good habit that replaces it → 3 when → 4 summary + save.
// "I have some habits" / "I only want to quit" go to the regular HabitCreationFlow (onRegular).

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

export default function FromZeroFlow({ onSave, onRegular, onClose }) {
  const { t } = useLang()
  const s = t.fromZero
  const [step, setStep]   = useState(0)
  const [badId, setBadId] = useState('')
  const [own, setOwn]     = useState('')
  const [goodId, setGoodId] = useState('')
  const [amount, setAmount] = useState(0)
  const [timeId, setTimeId] = useState('')
  const [ownTime, setOwnTime] = useState('')
  const [saving, setSaving] = useState(false)

  const ownText = own.trim()
  const bad = badId === 'other'
    ? (ownText ? { label: ownText, quit: fmt(s.ownQuit, { x: ownText }), cue: fmt(s.ownCue, { x: ownText }) } : null)
    : badId ? s.bad[badId] : null
  const options = replacementsFor(badId)
  const hasAmount = goodId && GOOD[goodId].n != null
  const good = goodId ? { title: fmt(s.good[goodId].title, { n: amount }), phrase: fmt(s.good[goodId].phrase || s.good[goodId].title, { n: amount }) } : null
  const time = timeId === 'own' ? ownTime : timeId ? s.times.find(x => x.id === timeId)?.time || '' : ''
  // Late nights: the reminder comes an hour before the bedtime the person picked
  const remindAt = shiftTime(time, REMIND_EARLY[badId] || 0)
  const help = HELP_FOR[badId] ? s.help[HELP_FOR[badId]] : null

  function pickGood(opt) { setGoodId(opt.id); setAmount(opt.n ?? GOOD[opt.id].n ?? 0) }
  function pickBad(id) { setBadId(id); setGoodId('') }
  function step1Next() { if (bad) setStep(2) }
  async function save() {
    if (!bad || !good || saving) return
    setSaving(true)
    try { await onSave(buildFromZero({ bad, good, time: remindAt })) } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box', background: '#161622', borderRadius: '20px 20px 0 0', padding: '1.5rem 1.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'slide-up 0.22s ease' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.1rem' }}>
          <div>
            <div style={{ color: '#71717A', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>{step > 0 ? fmt(s.stepOf, { n: step, total: 4 }) : ''}</div>
            <div style={{ color: '#F4F1E8', fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.35 }}>{s.titles[step]}</div>
            {s.subs[step] && <div style={{ color: '#A4A6AD', fontSize: '0.8rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{s.subs[step]}</div>}
          </div>
          <button onClick={onClose} aria-label={s.close} className="btn-tactile" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'rgba(241,245,249,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, minHeight: 44, minWidth: 44 }}>✕</button>
        </div>

        {step === 0 && (
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            <button className="btn-tactile" style={chip(false)} onClick={() => setStep(1)}>{s.start.zero}</button>
            <button className="btn-tactile" style={chip(false)} onClick={onRegular}>{s.start.some}</button>
            <button className="btn-tactile" style={chip(false)} onClick={onRegular}>{s.start.quit}</button>
          </div>
        )}

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
            {help && (
              <div role="note" style={{ marginTop: '0.9rem', padding: '0.8rem 0.9rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#A4A6AD', fontSize: '0.78rem', lineHeight: 1.6 }}>
                {help.text}{' '}
                {help.href
                  ? <a href={help.href} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: GOLD, fontWeight: 700, unicodeBidi: 'isolate' }}>{help.link}</a>
                  : <span style={{ color: GOLD, fontWeight: 700 }}>{help.link}</span>}
              </div>
            )}
            <button className="btn-tactile" style={primary(!bad)} disabled={!bad} onClick={step1Next}>{s.next}</button>
          </div>
        )}

        {step === 2 && (
          <div>
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
            {hasAmount && <div style={{ color: '#71717A', fontSize: '0.74rem', textAlign: 'center', marginTop: '0.5rem' }}>{s.smallHint}</div>}
            <button className="btn-tactile" style={primary(!good)} disabled={!good} onClick={() => good && setStep(3)}>{s.next}</button>
          </div>
        )}

        {step === 3 && bad && (
          <div>
            <div style={{ color: '#A4A6AD', fontSize: '0.82rem', marginBottom: '0.7rem' }}>{fmt(s.whenQ, { bad: bad.label })}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {s.times.map(x => (
                <button key={x.id} className="btn-tactile" aria-pressed={timeId === x.id} style={chip(timeId === x.id)} onClick={() => setTimeId(x.id)}>{x.label}</button>
              ))}
              <button className="btn-tactile" aria-pressed={timeId === 'own'} style={chip(timeId === 'own')} onClick={() => setTimeId('own')}>{s.ownTime}</button>
            </div>
            {timeId === 'own' && <input type="time" className="glow-input" style={{ ...input, direction: 'ltr' }} value={ownTime} onChange={e => setOwnTime(e.target.value)} aria-label={s.ownTime} />}
            <button className="btn-tactile" style={primary(!time)} disabled={!time} onClick={() => time && setStep(4)}>{s.next}</button>
          </div>
        )}

        {step === 4 && bad && good && (
          <div>
            <div style={{ background: 'rgba(217,179,76,0.06)', border: '1px solid rgba(217,179,76,0.3)', borderRadius: 16, padding: '1rem 1.05rem' }}>
              <div style={{ color: '#F4F1E8', fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.6 }}>
                {fmt(s.pact, { cue: bad.cue, good: good.phrase })}
              </div>
              <div style={{ color: '#A4A6AD', fontSize: '0.8rem', marginTop: '0.5rem' }}>{fmt(s.reminderAt, { time: '\u2066' + remindAt + '\u2069' })}</div>
            </div>
            <ul style={{ color: '#A4A6AD', fontSize: '0.8rem', lineHeight: 1.7, margin: '0.9rem 0 0', paddingInlineStart: '1.1rem' }}>
              <li>{fmt(s.willCount, { quit: bad.quit })}</li>
              <li>{s.weekOne}</li>
            </ul>
            <button className="btn-tactile" style={primary(saving)} disabled={saving} onClick={save}>{saving ? '…' : s.save}</button>
          </div>
        )}

        {step > 0 && (
          <button onClick={() => setStep(n => n - 1)} style={{ display: 'block', margin: '0.6rem auto 0', minHeight: 44, padding: '0 1rem', background: 'none', border: 'none', color: '#71717A', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{s.back}</button>
        )}
      </div>
    </div>
  )
}
