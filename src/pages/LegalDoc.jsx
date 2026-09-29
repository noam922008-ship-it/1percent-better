import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import LegalContent from '../components/LegalContent'

// /privacy and /terms — full pages. Linked from the signup screen, Settings and /legal.
export default function LegalDoc({ type }) {
  const navigate = useNavigate()
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/welcome'))

  return (
    <div dir="rtl" style={{ minHeight: '100svh', background: '#09090b', direction: 'rtl' }}>
      <div style={{ position: 'sticky', top: 0, background: '#09090b', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 'calc(env(safe-area-inset-top, 0px) + 0.5rem) 0.5rem 0.5rem' }}>
        <button onClick={back} aria-label="חזור" style={{ background: 'none', border: 'none', color: '#A4A6AD', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <ChevronRight size={22} />
        </button>
        <img src="/prime-logo.svg" alt="PRIME" style={{ height: 20 }} />
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.25rem 1rem calc(env(safe-area-inset-bottom, 0px) + 2.5rem)' }}>
        <LegalContent type={type} />
      </div>
    </div>
  )
}
