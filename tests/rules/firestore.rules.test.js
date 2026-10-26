import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, increment, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'

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

describe('users/{uid} — lang and tz', () => {
  it('owner can save lang he/en and an IANA time zone', async () => {
    const ref = doc(as('alice'), 'users/alice')
    await assertSucceeds(setDoc(ref, { lang: 'he', tz: 'Asia/Jerusalem' }, { merge: true }))
    await assertSucceeds(setDoc(ref, { lang: 'en', tz: 'America/Argentina/Buenos_Aires' }, { merge: true }))
    await assertSucceeds(updateDoc(ref, { tz: 'Etc/GMT+3' }))
  })

  it('rejects any other lang', async () => {
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(setDoc(ref, { lang: 'ar' }, { merge: true }))
    await assertFails(setDoc(ref, { lang: 1 }, { merge: true }))
  })

  it('rejects a tz that is not a short zone name', async () => {
    const ref = doc(as('alice'), 'users/alice')
    await assertFails(setDoc(ref, { tz: 'x'.repeat(65) }, { merge: true }))
    await assertFails(setDoc(ref, { tz: '<script>' }, { merge: true }))
    await assertFails(setDoc(ref, { tz: 5 }, { merge: true }))
  })

  it("other fields still save, and another user can't set alice's lang", async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'users/alice'), { streak: { lastDate: '2026-10-11' } }, { merge: true }))
    await assertFails(setDoc(doc(as('bob'), 'users/alice'), { lang: 'en' }, { merge: true }))
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

  it('nobody can create one (hidden feature, closed 2026-10); both sides read an existing one, outsiders cannot', async () => {
    await assertFails(setDoc(doc(as('alice'), 'challenges/c1'), ch))
    await assertFails(setDoc(doc(as('eve'), 'challenges/c2'), ch))
    await seed()
    await assertSucceeds(getDoc(doc(as('bob'), 'challenges/c1')))
    await assertFails(getDoc(doc(as('eve'), 'challenges/c1')))
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


// ── Security review 2026-10 ──────────────────────────────────────────────────
const anon = () => env.unauthenticatedContext().firestore()
const seedDoc = (path, data) => env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), path), data))

describe('anonymous (signed-out) caller', () => {
  it('can read or write nothing private', async () => {
    await seedDoc('users/alice', { lang: 'he' })
    await seedDoc('focusTriggers/alice', { xp: 10 })
    await seedDoc('leaderboard/alice', { name: '', xp: 10 })
    for (const p of ['users/alice', 'focusTriggers/alice', 'leaderboard/alice', 'igAutoDmSent/prime_1', 'stats/2026-10-25', 'config/app', 'funnel/2026-10-26']) {
      await assertFails(getDoc(doc(anon(), p)))
    }
    await assertFails(setDoc(doc(anon(), 'users/alice'), { lang: 'en' }))
    await assertFails(setDoc(doc(anon(), 'focusTriggers/alice'), { xp: 1 }))
    await assertFails(setDoc(doc(anon(), 'igAutoDmSent/prime_1'), { at: 1 }))
    await assertFails(setDoc(doc(anon(), 'config/app'), { pendingBroadcast: true }))
  })
})

describe('server-only collections', () => {
  it('no signed-in client can read or write igAutoDmSent, stats, config, geminiUsage', async () => {
    await seedDoc('config/app', { version: '1' })
    for (const p of ['igAutoDmSent/prime_1', 'stats/2026-10-25', 'config/app', 'geminiUsage/alice']) {
      await assertFails(getDoc(doc(as('alice'), p)))
      await assertFails(setDoc(doc(as('alice'), p), { x: 1 }))
    }
    await assertFails(updateDoc(doc(as('alice'), 'config/app'), { pendingBroadcast: true }))   // broadcast trigger
  })
})

describe('users/{uid} — isPro is server-only', () => {
  it('cannot be set on create, by setDoc merge, update, batch or a nested path', async () => {
    const db = as('alice')
    const ref = doc(db, 'users/alice')
    await assertFails(setDoc(ref, { lang: 'he', isPro: true }))
    await assertFails(setDoc(ref, { isPro: true }, { merge: true }))
    await assertSucceeds(setDoc(ref, { lang: 'he' }))
    await assertFails(updateDoc(ref, { isPro: true }))
    await assertFails(updateDoc(ref, { isPro: 'yes' }))
    const b = writeBatch(db); b.set(ref, { isPro: true }, { merge: true })
    await assertFails(b.commit())
    await assertSucceeds(updateDoc(ref, { 'streak.lastDate': '2026-10-26' }))   // ordinary nested update still fine
  })

  it('re-creating the doc after deleting it cannot set it either', async () => {
    const ref = doc(as('alice'), 'users/alice')
    await assertSucceeds(setDoc(ref, { lang: 'he' }))
    await assertSucceeds(deleteDoc(ref))
    await assertFails(setDoc(ref, { lang: 'he', isPro: true }))
  })

  it('a server-set isPro survives the client\'s own writes and can\'t be changed or removed', async () => {
    await seedDoc('users/alice', { lang: 'he', isPro: true })
    const ref = doc(as('alice'), 'users/alice')
    await assertSucceeds(updateDoc(ref, { lang: 'en' }))
    await assertSucceeds(setDoc(ref, { tz: 'Asia/Jerusalem' }, { merge: true }))
    await assertFails(updateDoc(ref, { isPro: false }))
    await assertFails(updateDoc(ref, { isPro: deleteField() }))
    await assertFails(setDoc(ref, { lang: 'he' }))   // full overwrite would drop it
  })

  it('another user cannot touch alice\'s doc at all', async () => {
    await seedDoc('users/alice', { lang: 'he' })
    await assertFails(getDoc(doc(as('bob'), 'users/alice')))
    await assertFails(updateDoc(doc(as('bob'), 'users/alice'), { lang: 'en' }))
    await assertFails(deleteDoc(doc(as('bob'), 'users/alice')))
  })
})

describe('posts — closed for writes', () => {
  it('nobody can create or edit a post, with any shape', async () => {
    await assertFails(setDoc(doc(as('alice'), 'posts/p1'), { uid: 'alice', caption: 'hi' }))
    await assertFails(setDoc(doc(as('alice'), 'posts/p1'), { uid: 'alice', caption: 'hi', imageUrl: 'https://evil' }))
    await seedDoc('posts/p2', { uid: 'alice', caption: 'old' })
    await assertFails(updateDoc(doc(as('alice'), 'posts/p2'), { caption: 'new' }))
  })

  it('only the author can delete an old post; anonymous cannot read', async () => {
    await seedDoc('posts/p2', { uid: 'alice', caption: 'old' })
    await assertFails(deleteDoc(doc(as('bob'), 'posts/p2')))
    await assertFails(getDoc(doc(anon(), 'posts/p2')))
    await assertSucceeds(deleteDoc(doc(as('alice'), 'posts/p2')))
  })
})

describe('squads — create and join closed; members edit only their own entry', () => {
  const squad = (members, extra = {}) => ({
    name: 'Team', createdBy: 'alice', inviteCode: 'ABC123', createdAt: '2026-10-26', telegramChatId: null,
    memberUids: members, members: Object.fromEntries(members.map(u => [u, { name: u }])), ...extra,
  })

  it('nobody can create a squad, alone or with others', async () => {
    await assertFails(setDoc(doc(as('alice'), 'squads/s1'), squad(['alice'])))
    await assertFails(setDoc(doc(as('alice'), 'squads/s2'), squad(['alice', 'bob'])))
  })

  it('knowing a squad id is not enough to join or read it', async () => {
    await seedDoc('squads/s1', squad(['alice']))
    const ref = doc(as('eve'), 'squads/s1')
    await assertFails(getDoc(ref))
    await assertFails(updateDoc(ref, { memberUids: ['alice', 'eve'], 'members.eve': { name: 'eve' } }))
    await assertFails(getDocs(query(collection(as('eve'), 'squads'), where('inviteCode', '==', 'ABC123'))))
  })

  it('a member can edit squad fields and their own entry, not other members\', membership or core fields', async () => {
    await seedDoc('squads/s1', squad(['alice', 'bob']))
    const ref = doc(as('bob'), 'squads/s1')
    await assertSucceeds(getDoc(ref))
    await assertSucceeds(updateDoc(ref, { telegramChatId: '123' }))
    await assertSucceeds(updateDoc(ref, { 'members.bob': { name: 'Bobby' } }))
    await assertFails(updateDoc(ref, { 'members.alice': { name: 'x' } }))
    await assertFails(updateDoc(ref, { 'members.alice': deleteField() }))
    await assertFails(updateDoc(ref, { memberUids: ['bob'] }))                 // kick alice
    await assertFails(updateDoc(ref, { memberUids: ['alice', 'bob', 'eve'] })) // add someone
    await assertFails(updateDoc(ref, { inviteCode: 'NEW' }))
    await assertFails(updateDoc(ref, { createdBy: 'bob' }))
    await assertFails(updateDoc(ref, { role: 'admin' }))                        // unexpected field
  })
})

describe('focusTriggers/{uid} — profile', () => {
  it('owner only; xp rises by at most 1000 per write; tier stays free; at most 10 habits', async () => {
    const ref = doc(as('alice'), 'focusTriggers/alice')
    await assertSucceeds(setDoc(ref, { xp: 900, triggers: [] }))
    await assertSucceeds(updateDoc(ref, { xp: 1900 }))
    await assertFails(updateDoc(ref, { xp: 3000 }))
    await assertSucceeds(updateDoc(ref, { xp: 0 }))
    await assertFails(updateDoc(ref, { tier: 'pro' }))
    await assertFails(updateDoc(ref, { triggers: Array.from({ length: 11 }, (_, i) => ({ id: `t${i}` })) }))
    await assertFails(getDoc(doc(as('bob'), 'focusTriggers/alice')))
    await assertFails(setDoc(doc(as('bob'), 'focusTriggers/alice'), { xp: 1 }))
  })
})

describe('leaderboard/{uid}', () => {
  it('xp can\'t exceed the owner\'s own profile xp; only name/xp/updatedAt', async () => {
    await seedDoc('focusTriggers/alice', { xp: 500 })
    const ref = doc(as('alice'), 'leaderboard/alice')
    await assertSucceeds(setDoc(ref, { name: '', xp: 500 }))
    await assertFails(setDoc(ref, { name: '', xp: 501 }))
    await assertFails(setDoc(ref, { name: '', xp: 100, isAdmin: true }))
    await assertFails(setDoc(doc(as('bob'), 'leaderboard/alice'), { name: '', xp: 0 }))
  })
})

describe('funnel/{date} — anonymous +1 counters', () => {
  it('anyone may add exactly 1 to one known counter, never read', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'funnel/2026-10-26'), { open: increment(1) }, { merge: true }))
    await assertSucceeds(setDoc(doc(anon(), 'funnel/2026-10-26'), { open: increment(1) }, { merge: true }))
    await assertSucceeds(setDoc(doc(as('alice'), 'funnel/2026-10-26'), { guest_start: increment(1) }, { merge: true }))
    await assertFails(getDoc(doc(anon(), 'funnel/2026-10-26')))
    await assertFails(getDoc(doc(as('alice'), 'funnel/2026-10-26')))
  })

  it('every known counter can be bumped many times on the same day (regression: toList)', async () => {
    const keys = ['open', 'open_inapp', 'open_dm', 'guest_start', 'habit_first_guest', 'habit_first_user', 'checkin_guest', 'checkin_user', 'signup', 'guest_to_account']
    const ref = doc(anon(), 'funnel/2026-10-26')
    for (const k of keys) for (let i = 0; i < 2; i++) await assertSucceeds(setDoc(ref, { [k]: increment(1) }, { merge: true }))
    await env.withSecurityRulesDisabled(async c => {
      const snap = await getDoc(doc(c.firestore(), 'funnel/2026-10-26'))
      for (const k of keys) if (snap.data()[k] !== 2) throw new Error(`${k} = ${snap.data()[k]}`)
    })
  })

  it('no jumps, no going down, no two counters at once, no unknown keys, no odd dates', async () => {
    await seedDoc('funnel/2026-10-26', { open: 5 })
    const ref = doc(anon(), 'funnel/2026-10-26')
    await assertFails(setDoc(ref, { open: increment(2) }, { merge: true }))
    await assertFails(setDoc(ref, { open: increment(-1) }, { merge: true }))
    await assertFails(updateDoc(ref, { open: 0 }))
    await assertFails(setDoc(ref, { open: increment(1), signup: increment(1) }, { merge: true }))
    await assertFails(setDoc(ref, { email: increment(1) }, { merge: true }))
    await assertFails(updateDoc(ref, { open: deleteField() }))
    await assertFails(deleteDoc(ref))
    await assertFails(setDoc(doc(anon(), 'funnel/today'), { open: 1 }))
    await assertFails(setDoc(doc(anon(), 'funnel/2026-10-27'), { open: 5 }))
  })
})

describe('account deletion — every doc the client deletes is deletable by its owner', () => {
  it('alice can delete all her own docs; bob can delete none of them', async () => {
    const paths = [
      'users/alice', 'users/alice/tasks/t1', 'users/alice/journal/j1', 'users/alice/lessons/l1',
      'users/alice/habitLog/2026-10-26', 'users/alice/activity/2026-10-26',
      'userPaths/alice', 'userPaths/alice/history/h1', 'proofs/alice/entries/e1',
      'focusTriggers/alice', 'leaderboard/alice', 'weeklyReps/alice', 'waitlist/alice',
      'nudgeResponses/alice_2026-10-26',
    ]
    for (const p of paths) await seedDoc(p, { uid: 'alice' })
    for (const p of paths) await assertFails(deleteDoc(doc(as('bob'), p)))
    const db = as('alice')
    const b = writeBatch(db)
    for (const p of paths) b.delete(doc(db, p))
    await assertSucceeds(b.commit())
  })

  it('the queries deleteAccountData runs are allowed for the owner', async () => {
    await seedDoc('nudgeResponses/alice_2026-10-26', { uid: 'alice' })
    await seedDoc('posts/p1', { uid: 'alice', caption: 'x' })
    await assertSucceeds(getDocs(collection(as('alice'), 'users', 'alice', 'tasks')))
    await assertSucceeds(getDocs(query(collection(as('alice'), 'posts'), where('uid', '==', 'alice'))))
    await assertSucceeds(getDocs(query(collection(as('alice'), 'nudgeResponses'), where('uid', '==', 'alice'))))
    await assertSucceeds(getDocs(query(collection(as('alice'), 'challenges'), where('challenger', '==', 'alice'))))
  })
})
