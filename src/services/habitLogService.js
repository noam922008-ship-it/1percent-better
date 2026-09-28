// Weekly-habit check-ins. Signed-in: Firestore users/{uid}/habitLog/{localDateKey} = { [triggerId]: true }.
// Guest: localStorage. One check-in per habit per day. Daily habits keep their existing
// localStorage check-ins (ft_checkins_*) — this log is only for weekly habits.

import { collection, doc, setDoc, onSnapshot, query, where, documentId } from 'firebase/firestore'
import { db } from './firebase'

const GUEST_KEY = 'prime_habit_log_guest'

const logCol = uid       => collection(db, 'users', uid, 'habitLog')
const logDoc = (uid, key) => doc(db, 'users', uid, 'habitLog', key)

function loadGuest() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || {} } catch { return {} }
}
const guestListeners = new Set()
function saveGuest(log) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(log)) } catch {}
  guestListeners.forEach(fn => fn())
}

// Calls onChange({ [dateKey]: { [id]: true } }) for the given week keys; returns unsubscribe.
export function subscribeWeekLog(uid, keys, onChange, onError) {
  if (!uid) {
    const fn = () => {
      const all = loadGuest()
      onChange(Object.fromEntries(keys.filter(k => all[k]).map(k => [k, all[k]])))
    }
    guestListeners.add(fn)
    fn()
    return () => guestListeners.delete(fn)
  }
  return onSnapshot(
    query(logCol(uid), where(documentId(), 'in', keys)),
    snap => onChange(Object.fromEntries(snap.docs.map(d => [d.id, d.data()]))),
    err => onError?.(err),
  )
}

// Marks a weekly habit done on dateKey (idempotent — at most once per day).
export async function markHabitDone(uid, triggerId, dateKey) {
  if (!uid) {
    const all = loadGuest()
    saveGuest({ ...all, [dateKey]: { ...(all[dateKey] || {}), [triggerId]: true } })
    return
  }
  await setDoc(logDoc(uid, dateKey), { [triggerId]: true }, { merge: true })
}
