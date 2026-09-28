// Setup (/setup) is only for accounts that haven't finished it. Its finish() writes name and
// triggers with merge, so running it again would overwrite an existing user's name and habits.
// Same rule WelcomeScreen uses to route signed-in users: onboardingDone or any real progress.

export function hasCompletedSetup(profile) {
  if (!profile) return false
  return profile.onboardingDone === true
    || (profile.xp || 0) > 0
    || (profile.triggers || []).length > 0
    || Object.values(profile.challenges || {}).some(c => (c?.daysCompleted || 0) > 0)
}
