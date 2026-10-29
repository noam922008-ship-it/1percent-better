// Check actual guest records, not language/consent/cache preferences.
export function hasGuestData(storage) {
  try {
    return Object.keys(storage).some(key => (
      /^prime_.*guest/.test(key) || key === 'prime_welcome_v2' ||
      key === 'prime_handoff_arrived' || /^ft_checkins_/.test(key)
    ) && storage.getItem(key) !== null)
  } catch { return false }
}

export function shouldOpenApp({ user, isGuest, standalone, guestData, search = '' }) {
  return Boolean(user || isGuest || standalone || guestData ||
    new URLSearchParams(search).getAll('utm_medium').includes('dm'))
}

// Snapshot before main.jsx runs its existing legacy storage migrations.
export const guestDataAtStartup = typeof window !== 'undefined' && hasGuestData(window.localStorage)
