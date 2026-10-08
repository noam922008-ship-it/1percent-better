import { createContext, useContext, useState, useEffect } from 'react'
import t from '../i18n/translations'

const LangCtx = createContext()

export function LangProvider({ children }) {
  // Saved choice wins; otherwise Hebrew for Hebrew devices, English for everyone else
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('ft_lang')
      if (saved === 'he' || saved === 'en') return saved
    } catch { /* storage unavailable: fall back to device language */ }
    return (navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en'
  })

  function setLang(l) {
    try { localStorage.setItem('ft_lang', l) } catch { /* ignore */ }
    setLangState(l)
    document.documentElement.dir  = l === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  useEffect(() => {
    document.documentElement.dir  = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangCtx.Provider value={{ lang, setLang, t: t[lang] }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)
