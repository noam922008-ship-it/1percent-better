// Emulator-only: fills every place an account can have data, for testing "מחק חשבון".
// Also creates a second user whose data must survive. Refuses to run without the emulators.
// Usage: node scripts/emulator-seed-deletion.mjs [check]
//   (no arg) seed · check → print what's left for both users

import { seed, TEST_USERS } from './emulator-seed.mjs'

const P = 'better-de9aa'
const FS = `http://127.0.0.1:8085/v1/projects/${P}/databases/(default)/documents`
const ST = `http://127.0.0.1:9199/v0/b/${P}.firebasestorage.app/o`
const H = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' }

const v = x => x === null ? { nullValue: null } : typeof x === 'boolean' ? { booleanValue: x } : typeof x === 'number' ? { integerValue: String(x) } : typeof x === 'string' ? { stringValue: x } : Array.isArray(x) ? { arrayValue: { values: x.map(v) } } : { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, y]) => [k, v(y)])) } }
const put = async (path, data) => {
  const r = await fetch(`${FS}/${path}`, { method: 'PATCH', headers: H, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, x]) => [k, v(x)])) }) })
  if (!r.ok) throw new Error(`${path}: ${r.status}`)
}
const exists = async path => (await fetch(`${FS}/${path}`, { headers: H })).ok
const listCount = async path => ((await (await fetch(`${FS}/${path}`, { headers: H })).json()).documents || []).length
const upload = async (name, body) => {
  const r = await fetch(`${ST}?name=${encodeURIComponent(name)}`, { method: 'POST', headers: { 'Content-Type': 'image/png', Authorization: 'Bearer owner' }, body })
  if (!r.ok) throw new Error(`storage ${name}: ${r.status} ${await r.text()}`)
}
const fileExists = async name => (await fetch(`${ST}/${encodeURIComponent(name)}`, { headers: { Authorization: 'Bearer owner' } })).ok

async function fill(uid, other) {
  const d = '2026-09-29'
  await put(`users/${uid}`, { fcmTokens: ['t'] })
  await put(`users/${uid}/tasks/t1`, { text: 'משימה', done: false, createdDate: d, doneDate: null })
  await put(`users/${uid}/journal/j1`, { text: 'יומן פרטי', important: '', step: '', date: d })
  await put(`users/${uid}/lessons/money_1`, { lessonId: 'money_1', topicId: 'money', lesson: {}, learned: 'למדתי', apply: '', date: d })
  await put(`users/${uid}/habitLog/${d}`, { t1: true })
  await put(`users/${uid}/activity/${d}`, { t1: { reflection: 'x' } })
  await put(`leaderboard/${uid}`, { name: 'שם אמיתי', xp: 500, updatedAt: d })
  await put(`weeklyReps/${uid}`, { uid, name: 'שם אמיתי', weekKey: '2026-W40', totalReps: 10, byExercise: {}, updatedAt: d })
  await put(`waitlist/${uid}`, { email: 'x@prime.test' })
  await put(`userPaths/${uid}`, { status: 'active' })
  await put(`userPaths/${uid}/history/h1`, { a: 1 })
  await put(`proofs/${uid}/entries/p1`, { text: 'הוכחה' })
  await put(`nudgeResponses/${uid}_${d}`, { uid })
  await put(`posts/post-${uid}`, { uid, caption: 'פוסט' })
  await put(`challenges/ch-${uid}`, { challenger: uid, challenged: other })
  await upload(`proofs/${uid}/p1.png`, new Uint8Array([137, 80, 78, 71]))
  await upload(`avatars/${uid}/a.png`, new Uint8Array([137, 80, 78, 71]))
}

const PATHS = uid => [
  `focusTriggers/${uid}`, `users/${uid}`, `users/${uid}/tasks/t1`, `users/${uid}/journal/j1`, `users/${uid}/lessons/money_1`,
  `users/${uid}/habitLog/2026-09-29`, `users/${uid}/activity/2026-09-29`, `leaderboard/${uid}`, `weeklyReps/${uid}`,
  `waitlist/${uid}`, `userPaths/${uid}`, `userPaths/${uid}/history/h1`, `proofs/${uid}/entries/p1`,
  `nudgeResponses/${uid}_2026-09-29`, `posts/post-${uid}`, `challenges/ch-${uid}`,
]

export async function report(uid) {
  const left = []
  for (const p of PATHS(uid)) if (await exists(p)) left.push(p)
  for (const f of [`proofs/${uid}/p1.png`, `avatars/${uid}/a.png`]) if (await fileExists(f)) left.push(`storage:${f}`)
  return left
}

const { existingUid, freshUid } = await seed()
if (process.argv[2] === 'check') {
  console.log(JSON.stringify({ deletedUser: await report(existingUid), otherUser: (await report(freshUid)).length }, null, 1))
} else {
  await fill(existingUid, freshUid)
  await fill(freshUid, existingUid)
  console.log('filled', { existing: (await report(existingUid)).length, other: (await report(freshUid)).length, login: TEST_USERS.existing.email })
}
void listCount
