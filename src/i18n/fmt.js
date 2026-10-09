// fmt('{n} of {total}', { n: 2, total: 5 }) → '2 of 5'. Unknown placeholders stay as they are.
export function fmt(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

// Counted strings: { one, two?, many } — Hebrew has a dual ("יומיים"), English falls back to many.
export function plural(forms, n, vars = {}) {
  const str = n === 1 ? forms.one : n === 2 && forms.two ? forms.two : forms.many
  return fmt(str, { n, ...vars })
}

// Locale for dates: toLocaleDateString(localeFor(lang), …)
export const localeFor = lang => (lang === 'he' ? 'he-IL' : 'en-US')

// Data fields with a language suffix: byLang(round, 'title', lang) → titleEn in English when present, else titleHe.
export const byLang = (obj, field, lang) => (lang === 'en' && obj?.[`${field}En`]) || obj?.[`${field}He`] || ''
