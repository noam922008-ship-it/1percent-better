import { LEGAL_CONFIG, LEGAL_DOCS, PLACEHOLDER_LABELS } from '../data/legal'

// Renders the privacy policy or terms from src/data/legal.js.
// Unfilled {placeholders} and { decide } blocks show as highlighted markers for the owner.

const C = { text: '#F4F1E8', body: 'rgba(244,241,232,0.78)', muted: '#A4A6AD', gold: '#D9B34C' }

const markStyle = {
  background: 'rgba(217,179,76,0.12)', border: '1px dashed rgba(217,179,76,0.6)', color: C.gold,
  borderRadius: 6, padding: '0 0.3rem', fontWeight: 700, whiteSpace: 'nowrap',
}

function fill(text) {
  const parts = String(text).split(/(\{[a-zA-Z]+\})/g)
  return parts.map((part, i) => {
    const m = /^\{([a-zA-Z]+)\}$/.exec(part)
    if (!m) return part
    const value = LEGAL_CONFIG[m[1]]
    if (value !== null && value !== undefined) return <span key={i}>{value}</span>
    return <span key={i} style={markStyle}>📝 להשלים: {PLACEHOLDER_LABELS[m[1]] || m[1]}</span>
  })
}

function Para({ p }) {
  if (p?.decide) {
    return (
      <div role="note" style={{ ...markStyle, whiteSpace: 'normal', display: 'block', padding: '0.55rem 0.7rem', fontWeight: 600, lineHeight: 1.6, margin: '0.5rem 0' }}>
        📝 להחלטה שלך: {p.decide}
      </div>
    )
  }
  if (p?.list) {
    return (
      <ul style={{ margin: '0.4rem 0', paddingInlineStart: '1.1rem' }}>
        {p.list.map((item, i) => <li key={i} style={{ marginBottom: '0.35rem' }}>{fill(item)}</li>)}
      </ul>
    )
  }
  return <p style={{ margin: '0 0 0.6rem' }}>{fill(p)}</p>
}

export default function LegalContent({ type, showTitle = true }) {
  const doc = LEGAL_DOCS[type]
  if (!doc) return null
  return (
    <div dir="rtl" style={{ direction: 'rtl', color: C.body, fontSize: '0.9rem', lineHeight: 1.75 }}>
      {showTitle && <h1 style={{ color: C.text, fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.6rem' }}>{doc.title}</h1>}
      <p style={{ color: C.muted, margin: '0 0 1.4rem' }}>{doc.intro}</p>
      {doc.sections.map(s => (
        <section key={s.title} style={{ marginBottom: '1.3rem' }}>
          <h2 style={{ color: C.gold, fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.45rem' }}>{s.title}</h2>
          {s.paras.map((p, i) => <Para key={i} p={p} />)}
        </section>
      ))}
      <p style={{ color: C.muted, fontSize: '0.78rem', marginTop: '1.5rem' }}>עודכן לאחרונה: {LEGAL_CONFIG.updated}</p>
    </div>
  )
}
