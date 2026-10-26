import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { ref, uploadBytes, getBytes, deleteObject, listAll } from 'firebase/storage'

// Storage rules (security review 2026-10): no client uploads anywhere today; read/delete only
// for the owner (account deletion lists and deletes the owner's folders).
let env

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-prime-rules',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearStorage())

const st = uid => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).storage()
const bytes = (n = 10) => new Uint8Array(n)
const seed = (path, contentType) =>
  env.withSecurityRulesDisabled(c => uploadBytes(ref(c.storage(), path), bytes(), { contentType }))

const FOLDERS = [['proofs', 'image/jpeg'], ['avatars', 'image/png'], ['workout-analysis', 'video/mp4']]

describe('uploads are closed everywhere', () => {
  for (const [folder, type] of FOLDERS) {
    it(`${folder}: not even the owner can upload (small, right type)`, async () => {
      await assertFails(uploadBytes(ref(st('alice'), `${folder}/alice/f1`), bytes(), { contentType: type }))
      await assertFails(uploadBytes(ref(st('bob'), `${folder}/alice/f1`), bytes(), { contentType: type }))
      await assertFails(uploadBytes(ref(st(null), `${folder}/alice/f1`), bytes(), { contentType: type }))
    })
  }
  it('nothing outside the known folders', async () => {
    await assertFails(uploadBytes(ref(st('alice'), 'public/x.png'), bytes(), { contentType: 'image/png' }))
    await assertFails(uploadBytes(ref(st('alice'), 'alice/x.png'), bytes(), { contentType: 'image/png' }))
  })
})

describe('existing files: owner reads, lists and deletes; nobody else', () => {
  for (const [folder, type] of FOLDERS) {
    it(`${folder}`, async () => {
      await seed(`${folder}/alice/f1`, type)
      if (folder === 'avatars') await assertSucceeds(getBytes(ref(st('bob'), `${folder}/alice/f1`)))   // avatars: any signed-in user may read
      else await assertFails(getBytes(ref(st('bob'), `${folder}/alice/f1`)))
      await assertFails(getBytes(ref(st(null), `${folder}/alice/f1`)))
      await assertFails(deleteObject(ref(st('bob'), `${folder}/alice/f1`)))
      await assertSucceeds(getBytes(ref(st('alice'), `${folder}/alice/f1`)))
      await assertSucceeds(listAll(ref(st('alice'), `${folder}/alice`)))
      await assertSucceeds(deleteObject(ref(st('alice'), `${folder}/alice/f1`)))
    })
  }
})
