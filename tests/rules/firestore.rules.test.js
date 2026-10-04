import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'

let env

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-prime-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

const as = uid => env.authenticatedContext(uid).firestore()

describe('users/{uid}/habitLog — weekly check-ins', () => {
  it('owner can write and read a check-in', async () => {
    const ref = doc(as('alice'), 'users/alice/habitLog/2026-10-04')
    await assertSucceeds(setDoc(ref, { t1: true }))
    await assertSucceeds(getDoc(ref))
  })

  it('another user can neither read nor write it', async () => {
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'users/alice/habitLog/2026-10-04'), { t1: true }))
    await assertFails(getDoc(doc(as('bob'), 'users/alice/habitLog/2026-10-04')))
    await assertFails(setDoc(doc(as('bob'), 'users/alice/habitLog/2026-10-04'), { t1: true }))
  })

  it('rejects a bad date key or non-true values', async () => {
    await assertFails(setDoc(doc(as('alice'), 'users/alice/habitLog/today'), { t1: true }))
    await assertFails(setDoc(doc(as('alice'), 'users/alice/habitLog/2026-10-04'), { t1: 'x' }))
  })
})

describe('nudgeResponses/{uid}_{date}', () => {
  const mine = { uid: 'alice', date: '2026-10-04', responses: [{ habitLabel: 'run', response: 'done', ts: 1 }] }
  const seed = data => env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'nudgeResponses/alice_2026-10-04'), data))

  it('owner can create, merge, read, query and delete their own doc', async () => {
    const ref = doc(as('alice'), 'nudgeResponses/alice_2026-10-04')
    await assertSucceeds(setDoc(ref, mine, { merge: true }))
    await assertSucceeds(setDoc(ref, mine, { merge: true }))
    await assertSucceeds(getDoc(ref))
    await assertSucceeds(getDocs(query(collection(as('alice'), 'nudgeResponses'), where('uid', '==', 'alice'))))
    await assertSucceeds(deleteDoc(ref))
  })

  it("another user can't overwrite it, even by claiming their own uid", async () => {
    await seed(mine)
    const ref = doc(as('bob'), 'nudgeResponses/alice_2026-10-04')
    await assertFails(setDoc(ref, { uid: 'bob', date: '2026-10-04', responses: [] }))
    await assertFails(setDoc(ref, { uid: 'bob', responses: [] }, { merge: true }))
    await assertFails(getDoc(ref))
    await assertFails(deleteDoc(ref))
  })

  it("can't create a doc under someone else's id", async () => {
    await assertFails(setDoc(doc(as('bob'), 'nudgeResponses/alice_2026-10-05'), { ...mine, uid: 'bob' }))
    await assertFails(setDoc(doc(as('bob'), 'nudgeResponses/whatever'), { ...mine, uid: 'bob' }))
  })

  it("owner can't hand the doc to someone else", async () => {
    await seed(mine)
    await assertFails(setDoc(doc(as('alice'), 'nudgeResponses/alice_2026-10-04'), { uid: 'bob' }, { merge: true }))
  })
})

describe('challenges/{id}', () => {
  const ch = {
    challenger: 'alice', challengerName: 'A', challenged: 'bob', challengedName: 'B',
    exercise: 'pushups', createdAt: '2026-10-04T10:00:00.000Z', expiresAt: '2026-10-05T10:00:00.000Z',
    status: 'active', reps: { alice: 0, bob: 0 },
  }
  const seed = () => env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'challenges/c1'), ch))

  it('challenger can create; both sides read; outsiders cannot', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'challenges/c1'), ch))
    await assertSucceeds(getDoc(doc(as('bob'), 'challenges/c1')))
    await assertFails(getDoc(doc(as('eve'), 'challenges/c1')))
    await assertFails(setDoc(doc(as('eve'), 'challenges/c2'), ch))
  })

  it('a participant can update status and their own reps', async () => {
    await seed()
    await assertSucceeds(updateDoc(doc(as('bob'), 'challenges/c1'), { 'reps.bob': 20 }))
    await assertSucceeds(updateDoc(doc(as('alice'), 'challenges/c1'), { status: 'done' }))
  })

  it("a participant can't rewrite who is in it, the other side's reps or other fields", async () => {
    await seed()
    const ref = doc(as('bob'), 'challenges/c1')
    await assertFails(updateDoc(ref, { challenger: 'bob' }))
    await assertFails(updateDoc(ref, { challenged: 'eve' }))
    await assertFails(updateDoc(ref, { challengerName: 'loser' }))
    await assertFails(updateDoc(ref, { 'reps.alice': -5, 'reps.bob': 999 }))
    await assertFails(updateDoc(ref, { expiresAt: '2030-01-01T00:00:00.000Z' }))
    await assertFails(updateDoc(doc(as('eve'), 'challenges/c1'), { status: 'done' }))
  })

  it('either participant can delete (account deletion)', async () => {
    await seed()
    await assertFails(deleteDoc(doc(as('eve'), 'challenges/c1')))
    await assertSucceeds(deleteDoc(doc(as('bob'), 'challenges/c1')))
  })
})
