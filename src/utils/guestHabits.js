// Guest habits live only in this browser (like guest tasks and journal).
// Signed-in habits stay on the profile (focusTriggers/{uid}.triggers).

const KEY = 'prime_guest_triggers'

export function loadGuestTriggers() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(list) ? list : []
  } catch { return [] }
}

export function saveGuestTriggers(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list || [])) } catch {}
}

// Guest → account. On iPhone, an app added to the Home Screen starts with empty storage, so guest
// habits made in Safari would be gone there. When a guest signs in to an account that has no habits
// yet, their guest habits move to the account (Firestore) and show up on every device.
const ADOPTED_KEY = 'prime_guest_triggers_adopted'   // kept as a backup, never read back as guest data

export function guestTriggersToAdopt(profile, guest = loadGuestTriggers()) {
  if (!Array.isArray(guest) || !guest.length) return null
  if (Array.isArray(profile?.triggers) && profile.triggers.length) return null
  return guest
}

export function markGuestTriggersAdopted() {
  try {
    const v = localStorage.getItem(KEY)
    if (v != null) localStorage.setItem(ADOPTED_KEY, v)
    localStorage.removeItem(KEY)
  } catch {}
}
