// Delete account + all its data, from the client (no Cloud Functions).
// Order: re-authenticate (Firebase requires a recent sign-in) → delete Firestore data →
// delete Storage files → delete the Auth user. If any data step fails we stop BEFORE deleting
// the Auth user, so nothing is left behind without an account to reach it.
// Server-only data (geminiUsage, pushLog) isn't reachable from the client — see the privacy policy.

import {
  collection, doc, getDocs, query, where, writeBatch,
} from 'firebase/firestore'
import { ref, listAll, deleteObject } from 'firebase/storage'
import {
  deleteUser, reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider,
} from 'firebase/auth'
import { db, storage, auth, googleProvider } from './firebase'
import { setProfileAutoCreate } from './focusTriggerService'

// Every per-user subcollection under users/{uid}
const USER_SUBCOLLECTIONS = ['tasks', 'journal', 'lessons', 'habitLog', 'activity']

// Which sign-in method the account uses — decides how to re-authenticate.
export function signInMethod(user = auth?.currentUser) {
  const ids = (user?.providerData || []).map(p => p.providerId)
  if (ids.includes('password')) return 'password'
  if (ids.includes('google.com')) return 'google'
  return 'other'
}

export async function reauthenticate({ password } = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('not-signed-in')
  if (signInMethod(user) === 'password') {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password || ''))
  } else {
    await reauthenticateWithPopup(user, googleProvider)
  }
}

async function deleteDocs(docs) {
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    docs.slice(i, i + 400).forEach(d => batch.delete(d.ref ?? d))
    await batch.commit()
  }
}

async function deleteStorageFolder(path) {
  const { items } = await listAll(ref(storage, path))
  await Promise.all(items.map(item => deleteObject(item)))
}

// Deletes all Firestore + Storage data of uid. Returns { failed: [step names] }.
export async function deleteAccountData(uid) {
  const failed = []
  const step = async (name, fn) => { try { await fn() } catch (e) { failed.push(`${name}: ${e?.code || e?.message || e}`) } }

  for (const sub of USER_SUBCOLLECTIONS) {
    await step(`users/${sub}`, async () => deleteDocs((await getDocs(collection(db, 'users', uid, sub))).docs))
  }
  await step('userPaths/history', async () => deleteDocs((await getDocs(collection(db, 'userPaths', uid, 'history'))).docs))
  await step('proofs/entries',    async () => deleteDocs((await getDocs(collection(db, 'proofs', uid, 'entries'))).docs))
  await step('posts',             async () => deleteDocs((await getDocs(query(collection(db, 'posts'), where('uid', '==', uid)))).docs))
  await step('nudgeResponses',    async () => deleteDocs((await getDocs(query(collection(db, 'nudgeResponses'), where('uid', '==', uid)))).docs))
  await step('challenges',        async () => {
    const mine = await Promise.all([
      getDocs(query(collection(db, 'challenges'), where('challenger', '==', uid))),
      getDocs(query(collection(db, 'challenges'), where('challenged', '==', uid))),
    ])
    await deleteDocs(mine.flatMap(s => s.docs))
  })
  await step('top-level docs', async () => deleteDocs([
    doc(db, 'focusTriggers', uid), doc(db, 'leaderboard', uid), doc(db, 'weeklyReps', uid),
    doc(db, 'waitlist', uid), doc(db, 'userPaths', uid), doc(db, 'users', uid),
  ]))
  for (const folder of ['proofs', 'avatars', 'workout-analysis']) {
    await step(`storage/${folder}`, () => deleteStorageFolder(`${folder}/${uid}`))
  }
  return { failed }
}

// Full flow after the user confirmed and re-authenticated. Throws 'data-not-deleted' if any
// data step failed (the account is kept so the user can retry).
export async function deleteAccount() {
  const user = auth.currentUser
  if (!user) throw new Error('not-signed-in')
  setProfileAutoCreate(false)   // don't let the profile listener re-create what we delete
  const { failed } = await deleteAccountData(user.uid)
  if (failed.length) {
    setProfileAutoCreate(true)
    const err = new Error('data-not-deleted')
    err.failed = failed
    throw err
  }
  try { await deleteUser(user) } finally { setProfileAutoCreate(true) }   // signed out now: a late re-create is denied
  try { localStorage.clear() } catch {}
}

// Guests: everything lives in this browser.
export function deleteGuestData() {
  try { localStorage.clear() } catch {}
}
