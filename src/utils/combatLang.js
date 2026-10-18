// Boxing / Muay Thai in English: the content (titles, round instructions, coaching cues, safety notes,
// goals, technique names, the spoken coach lines) has English in the data files and the screens pick it
// with byLang(). Turned on for English on 2026-10-18. To hide combat from English users again
// (for example if a translation problem shows up), return lang !== 'en' here.
export const combatAvailable = () => true

// Combat ids used in the Home / library lists
export const COMBAT_IDS = ['boxing', 'muaythai']
