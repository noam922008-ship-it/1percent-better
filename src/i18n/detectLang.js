import { FEATURES } from '../config/features'

export const LANG_KEY = 'ft_lang'
export const LANGS = ['he', 'en']

// English is behind FEATURES.english; dev builds (npm run dev) always get it so it can be tested.
export function isEnglishEnabled() {
  return FEATURES.english || import.meta.env.DEV
}

// Saved choice first, then the browser's preferred language: Hebrew device → he, anything else → en.
// With English off, always Hebrew.
export function detectLang({ enabled = isEnglishEnabled(), storage, nav } = {}) {
  if (!enabled) return 'he'
  try {
    const saved = (storage ?? globalThis.localStorage)?.getItem(LANG_KEY)
    if (LANGS.includes(saved)) return saved
  } catch { /* storage unavailable: fall back to device language */ }
  const n = nav ?? globalThis.navigator
  const pref = (n?.languages?.[0] || n?.language || '').toLowerCase()
  return pref.startsWith('he') || pref.startsWith('iw') ? 'he' : 'en'
}

export function dirFor(lang) {
  return lang === 'he' ? 'rtl' : 'ltr'
}
