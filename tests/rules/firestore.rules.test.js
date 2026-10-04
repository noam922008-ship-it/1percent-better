import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
