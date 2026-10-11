import { legalConfig, legalDoc, PLACEHOLDER_LABELS, PLACEHOLDER_LABELS_EN } from '../data/legal'
import { useLang } from '../context/LangContext'
import { dirFor } from '../i18n/detectLang'
import SocialLinks from './SocialLinks'

// Renders the privacy policy or terms from src/data/legal.js, in the UI language.
// Unfilled {placeholders} and { decide } blocks show as highlighted markers for the owner.

const C = { text: '#F4F1E8', body: 'rgba(244,241,232,0.78)', muted: '#A4A6AD', gold: '#D9B34C' }

const markStyle = {
  background: 'rgba(217,179,76,0.12)', border: '1px dashed rgba(217,179,76,0.6)', color: C.gold,
  borderRadius: 6, padding: '0 0.3rem', fontWeight: 700, whiteSpace: 'nowrap',
}

function fill(text, cfg, labels, toFill) {
  const parts = String(text).split(/(\{[a-zA-Z]+\})/g)
  return parts.map((part, i) => {
    const m = /^\{([a-zA-Z]+)\}$/.exec(part)
    if (!m) return part
    const value = cfg[m[1]]
    if (value !== null && value !== undefined) return <span key={i}>{value}</span>
    return <span key={i} style={markStyle}>📝 {toFill} {labels[m[1]] || m[1]}</span>
  })
}

function Para({ p, fillText, toDecide }) {
  if (p?.decide) {
    return (
      <div role="note" style={{ ...markStyle, whiteSpace: 'normal', display: 'block', padding: '0.55rem 0.7rem', fontWeight: 600, lineHeight: 1.6, margin: '0.5rem 0' }}>
        📝 {toDecide} {p.decide}
      </div>
    )
  }
  if (p?.list) {
    return (
      <ul style={{ margin: '0.4rem 0', paddingInlineStart: '1.1rem' }}>
        {p.list.map((item, i) => <li key={i} style={{ marginBottom: '0.35rem' }}>{fillText(item)}</li>)}
      </ul>
    )
  }
  return <p style={{ margin: '0 0 0.6rem' }}>{fillText(p)}</p>
}

export default function LegalContent({ type, showTitle = true }) {
  const { lang, t } = useLang()
  const doc = legalDoc(type, lang)
  if (!doc) return null
  const cfg = legalConfig(lang)
  const labels = lang === 'en' ? PLACEHOLDER_LABELS_EN : PLACEHOLDER_LABELS
  const fillText = text => fill(text, cfg, labels, t.legal.toFill)
  const dir = dirFor(lang)
  return (
    <div dir={dir} style={{ direction: dir, color: C.body, fontSize: '0.9rem', lineHeight: 1.75 }}>
      {showTitle && <h1 style={{ color: C.text, fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.6rem' }}>{doc.title}</h1>}
      <p style={{ color: C.muted, margin: '0 0 1.4rem' }}>{doc.intro}</p>
      {doc.sections.map(s => (
        <section key={s.title} style={{ marginBottom: '1.3rem' }}>
          <h2 style={{ color: C.gold, fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.45rem' }}>{s.title}</h2>
          {s.paras.map((p, i) => <Para key={i} p={p} fillText={fillText} toDecide={t.legal.toDecide} />)}
        </section>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <span style={{ color: C.muted, fontSize: '0.8rem' }}>
          {cfg.contactEmail && <a href={`mailto:${cfg.contactEmail}`} style={{ color: C.gold, fontWeight: 700 }}>{cfg.contactEmail}</a>}
        </span>
        <SocialLinks />
      </div>
      <p style={{ color: C.muted, fontSize: '0.78rem', marginTop: '0.75rem' }}>{t.legal.updated} {cfg.updated}</p>
    </div>
  )
}
