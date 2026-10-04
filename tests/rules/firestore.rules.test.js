import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

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
