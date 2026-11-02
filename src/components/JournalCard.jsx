import { ForwardChevron } from './DirChevron'
import { useLang } from '../context/LangContext'

// One-line Home row that opens the Journal. Sits right below the habits.
export default function JournalCard({ onOpen }) {
  const { t } = useLang()
  return (
    <button
      onClick={onOpen}
      className="btn-tactile"
      style={{
        width: '100%', boxSizing: 'border-box', minHeight: 52,
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        background: '#111317', border: '1px solid rgba(255,255,255,0.06)', borderInlineStart: '3px solid rgba(217,179,76,0.55)', borderRadius: 14,
        padding: '0.8rem 1rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'start',
      }}
    >
      <span style={{ fontSize: '1.1rem' }} aria-hidden="true">📓</span>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <span style={{ color: '#F4F1E8', fontSize: '0.88rem', fontWeight: 800 }}>{t.journal.title}</span>
        <span style={{ color: '#71717A', fontSize: '0.72rem', fontWeight: 600 }}>{t.journal.homeHint}</span>
      </span>
      <ForwardChevron size={18} color="#71717A" />
    </button>
  )
}
