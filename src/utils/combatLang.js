// Boxing / Muay Thai content (round instructions, coaching cues, safety notes, the spoken coach lines)
// is still Hebrew only — docs/ENGLISH_PLAN.md, Content 3. Until it's translated, English users don't
// get the combat entry points (Workouts tab category, the daily workout on Home, the workout library).
// The screens themselves stay as they are; turn this back on once the content has English.
export const combatAvailable = lang => lang !== 'en'

// Combat ids used in the Home / library lists
export const COMBAT_IDS = ['boxing', 'muaythai']
