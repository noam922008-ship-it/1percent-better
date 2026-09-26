// Local distress check for journal text — runs on the device, before anything is sent to AI,
// and works without consent or network. A safety net, not a diagnosis: it will miss some cases
// and flag some innocent ones (a false positive only means no AI questions are shown).
// Everyday sadness/stress ("עצוב לי", "לחוץ", "אין לי כוח") is deliberately not listed.
// The phrase list was approved by the product owner — change it only with their approval.

export const DISTRESS_PHRASES = [
  // Hopelessness / thoughts of death
  'לא רוצה לחיות', 'אין טעם לחיות', 'אין לי סיבה לחיות', 'אין לי כוח לחיות',
  'רוצה למות', 'בא לי למות', 'מתחשק לי למות', 'הלוואי שהייתי מת', 'הלוואי שהייתי מתה',
  'להתאבד', 'התאבדות', 'מחשבות אובדניות',
  'לפגוע בעצמי', 'פוגע בעצמי', 'פוגעת בעצמי',
  'לשים סוף לחיים', 'רוצה להיעלם', 'עדיף שלא הייתי',
  'כולם יהיו טוב יותר בלעדיי', 'עדיף בלעדיי',
  'חסר תקווה', 'חסרת תקווה', 'אין שום תקווה', 'אין טעם לכלום',
  // Heavy distress / anxiety
  'התקף חרדה', 'התקפי חרדה', 'חרדה משתקת',
  'לא יכול יותר', 'לא יכולה יותר',
  'לא מפסיק לבכות', 'לא מפסיקה לבכות', 'בוכה כל הזמן',
  'מרגיש ריק מבפנים', 'מרגישה ריקה מבפנים',
  'אין לי אף אחד', 'לגמרי לבד בעולם',
]

// Strip niqqud/cantillation, turn punctuation into spaces, collapse whitespace.
export function normalizeHebrew(s) {
  return String(s || '')
    .replace(/[֑-ׇ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const NORMALIZED = DISTRESS_PHRASES.map(normalizeHebrew)

// True if any of the texts contains a listed phrase. Substring match, so Hebrew
// prefixes (ו, ש, ה…) are caught: "שאין טעם לחיות" matches "אין טעם לחיות".
export function detectDistress(...texts) {
  const hay = normalizeHebrew(texts.filter(Boolean).join(' \n '))
  if (!hay) return false
  return NORMALIZED.some(p => hay.includes(p))
}
