// First-run welcome (FirstWelcome) — seen flag. Signed-in users also get profile.welcomeSeen,
// so it isn't shown again on another device.

const WELCOME_KEY = 'prime_welcome_v2'

export function hasSeenWelcome(profile) {
  if (profile?.welcomeSeen) return true
  try { return localStorage.getItem(WELCOME_KEY) === 'true' } catch { return false }
}

export function markWelcomeSeen() {
  try { localStorage.setItem(WELCOME_KEY, 'true') } catch {}
}
