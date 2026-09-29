// What other signed-in users may see next to XP / weekly reps (leaderboard, weeklyReps).
// Default: no name at all. Only an opted-in nickname is ever written — never profile.name.

export const MAX_NICKNAME_LEN = 30

export function cleanNickname(s) {
  // eslint-disable-next-line no-control-regex
  return String(s || '').replace(/[\x00-\x1F\x7F<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NICKNAME_LEN)
}

export function publicName(profile) {
  return profile?.leaderboardOptIn ? cleanNickname(profile.leaderboardNickname) : ''
}
