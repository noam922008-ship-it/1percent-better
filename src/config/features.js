// Feature flags — features hidden because they don't fit VISION.md.
// Flip one to true to bring it back. Hiding only skips rendering:
// components, services, data and stored user progress are all kept.

export const FEATURES = {
  deepTracks:      false, // 30-day tracks: Home daily mission ("לוח שנה אנרגטי") + track bar/day, מסלולים עמוקים, Hobby Discovery, "מסלול פעיל", growth-pillar prefs
  surpriseMission: false, // משימת הפתעה card (Progress) + its category prefs (Profile)
  dailyLesson:     false, // שיעור יומי card (Home) + lesson-topic prefs (Settings)
  xpForecast:      false, // "מסלול הצמיחה שלך" XP projection (Progress)
  routineCards:    false, // פרוטוקול בוקר/צהריים/ערב cards (Progress)
  fightClub:       false, // "מועדון הקרב" XP-level card (Progress)
  homeXpExtras:    false, // Home "XP היום" card + XP level bar (XP stays in header + ring)
}
