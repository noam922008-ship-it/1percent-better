import { useNavigate } from 'react-router-dom'
import { BackChevron, ForwardChevron } from '../components/DirChevron'
import { useLang } from '../context/LangContext'
import { dirFor } from '../i18n/detectLang'
import { allGuides } from '../utils/fromZero'

// /guides — every short guide in the UI language. The guides themselves are static pages
// under /guides/<slug> and /en/guides/<slug> (public/), so they open as plain links.

const linkRow = {
  display: 'flex', alignItems: 'center', gap: '0.7rem', minHeight: 56,
  padding: '0 1rem', color: '#F4F1E8', fontSize: '0.92rem', fontWeight: 700, textDecoration: 'none',
}

export default function Guides() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const dir = dirFor(lang)
  const list = allGuides(lang)

  return (
    <div dir={dir} style={{ minHeight: '100svh', background: '#09090b', direction: dir }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 'calc(env(safe-area-inset-top, 0px) + 0.5rem) 0.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))} aria-label={t.guidesPage.back} style={{ background: 'none', border: 'none', color: '#A4A6AD', cursor: 'pointer', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <BackChevron size={22} />
        </button>
        <h1 style={{ color: '#F4F1E8', fontSize: '1rem', fontWeight: 800, margin: 0 }}>{t.guidesPage.title}</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem 1rem 2.5rem' }}>
        <p style={{ color: 'rgba(244,241,232,0.78)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{t.guidesPage.sub}</p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, background: '#111317', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          {list.map((g, i) => (
            <li key={g.slug} style={i ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : undefined}>
              <a href={g.href} style={linkRow}>
                <span aria-hidden="true" style={{ fontSize: '1.15rem' }}>{t.fromZero.bad[g.id].icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{t.home.guide.titles[g.id]}</span>
                <ForwardChevron size={18} color="#8A8A93" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
