// PathBuilder (FEATURES.pathBuilder) → recommended tracks, from keywords in the AI vision profile.
// Moved from Dashboard.jsx; lists unchanged except the English words added for English users.
// Hebrew keywords match anywhere in the text (prefixes like ב/ה/ו stick to the word).
// English keywords match whole words only, with an optional plural "s" ('ai' must not match "daily").
export const NICHE_KEYWORDS = {
  physical: ['gym','sport','fitness','strength','health','body','muscle','workout','train','training','nutrition','diet','running','exercise','כושר','בריאות','כוח','ספורט','גוף','שרירים','אימון','תזונה','ריצה','משמעת','discipline','weight','lifting'],
  tech:     ['code','coding', 'ai','software','tech','technology','developer','develop','development','program','programming','app','automation','קוד','בינה','פיתוח','טכנולוגיה','אפליקציה','מפתח','אוטומציה','claude','gpt','chatgpt','machine learning'],
  finance:  ['trading','invest','investing','investment','money','capital','market','stock','crypto','wealth','finance','financial','מסחר','השקעות','הון','כסף','מניות','בורסה','פיננסי','נדלן','real estate','portfolio'],
  business: ['business','startup','company','brand','client','sale','sales','marketing','product','entrepreneur','freelance','עסק','יזמות','מותג','לקוח','מכירות','מוצר','פרילנס','agency','revenue'],
}
const HEBREW_KW = /[\u0590-\u05FF]/
const escapeRe = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export function keywordMatches(text, kw) {
  if (HEBREW_KW.test(kw)) return text.includes(kw)
  return new RegExp(`(^|[^a-z0-9])${escapeRe(kw)}s?($|[^a-z0-9])`).test(text)
}
const NICHE_TRACKS = {
  physical: ['self-discipline', 'business-soul'],
  tech:     ['ai-beginners', 'ai-pioneer', 'claude-code-mastery', 'product-builder'],
  finance:  ['capital-markets', 'business-mind', 'deal-closer'],
  business: ['business-mind', 'deal-closer', 'product-builder', 'business-soul'],
}
export function detectNicheRecs(visionProfile) {
  const text = [
    visionProfile?.three_year_vision || '',
    visionProfile?.the_gap || '',
    ...(visionProfile?.core_values || []),
    ...(visionProfile?.non_negotiables || []),
  ].join(' ').toLowerCase()
  const scores = Object.fromEntries(Object.keys(NICHE_KEYWORDS).map(k => [k, 0]))
  for (const [niche, kws] of Object.entries(NICHE_KEYWORDS)) {
    for (const kw of kws) { if (keywordMatches(text, kw)) scores[niche]++ }
  }
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  return NICHE_TRACKS[top] || NICHE_TRACKS.business
}
