import { createContext, useContext, useState, useEffect } from 'react'
import t from '../i18n/translations'
import { LANG_KEY, LANGS, detectLang, dirFor, isEnglishEnabled } from '../i18n/detectLang'

const LangCtx = createContext()

export function LangProvider({ children }) {
  const englishEnabled = isEnglishEnabled()
  const [lang, setLangState] = useState(() => detectLang({ enabled: englishEnabled }))

  function setLang(l) {
    // English off: stay Hebrew, don't store a choice that would apply once it's turned on
    if (!englishEnabled || !LANGS.includes(l)) return
    try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ }
    setLangState(l)
  }

  useEffect(() => {
    document.documentElement.dir  = dirFor(lang)
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangCtx.Provider value={{ lang, setLang, t: t[lang], englishEnabled }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)
