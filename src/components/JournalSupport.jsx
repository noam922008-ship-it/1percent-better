// Shown instead of AI questions when a journal entry shows signs of distress.
// Wording approved by the product owner — change it only with their approval.
// Calm colors on purpose: no red, no alarm icons.

const C = {
  surface: '#12161A', border: 'rgba(125,170,190,0.22)', text: '#F4F1E8', muted: '#A4A6AD', soft: '#9CC3D5',
}

const linkStyle = { color: C.soft, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }
const rowStyle  = { display: 'flex', gap: '0.55rem', alignItems: 'flex-start', lineHeight: 1.6, fontSize: '0.92rem', marginTop: '0.7rem' }

export default function JournalSupport({ onDone }) {
  return (
    <div role="region" aria-label="תמיכה" dir="rtl" style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: '1.1rem 1.1rem 1rem', color: C.text, animation: 'fadeIn 0.6s ease both',
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>נשמע שעובר עליך משהו כבד.</div>
      <div style={{ color: C.muted, fontSize: '0.92rem', lineHeight: 1.6 }}>
        לא צריך להתמודד עם זה לבד. אפשר לדבר עכשיו עם מישהו שמקשיב.
      </div>

      <div style={rowStyle}>
        <span aria-hidden="true">📞</span>
        <span>ער״ן — עזרה ראשונה נפשית, 24/7: <a href="tel:1201" style={linkStyle}>1201</a></span>
      </div>
      <div style={rowStyle}>
        <span aria-hidden="true">💬</span>
        <span>שיחה בצ׳אט: <a href="https://www.eran.org.il" target="_blank" rel="noopener noreferrer" style={linkStyle}>eran.org.il</a></span>
      </div>
      <div style={rowStyle}>
        <span aria-hidden="true">💬</span>
        <span>צ׳אט אנונימי — סה״ר: <a href="https://sahar.org.il" target="_blank" rel="noopener noreferrer" style={linkStyle}>sahar.org.il</a></span>
      </div>
      <div style={rowStyle}>
        <span aria-hidden="true">🚑</span>
        <span>במצב חירום: <a href="tel:101" style={linkStyle}>101</a> (מד״א) · <a href="tel:100" style={linkStyle}>100</a> (משטרה)</span>
      </div>

      <div style={{ color: C.muted, fontSize: '0.85rem', marginTop: '0.9rem' }}>מה שכתבת נשמר ביומן שלך.</div>

      <button
        onClick={onDone}
        style={{
          width: '100%', minHeight: 46, marginTop: '1rem', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
          background: 'transparent', border: `1px solid ${C.border}`, color: C.text, fontSize: '0.92rem', fontWeight: 700,
        }}
      >חזרה ליומן</button>
    </div>
  )
}
