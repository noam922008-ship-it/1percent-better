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
