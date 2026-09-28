// Seeds the local Firebase emulators with test users — never touches production.
// Usage: start the emulators (auth 9099, firestore 8085), then `node scripts/emulator-seed.mjs`.
// Refuses to run unless both emulator hosts answer on 127.0.0.1.

const PROJECT = 'better-de9aa'
const AUTH = 'http://127.0.0.1:9099'
const FS   = `http://127.0.0.1:8085/v1/projects/${PROJECT}/databases/(default)/documents`

// Test-only accounts, valid only inside the Auth emulator.
export const TEST_USERS = {
  existing: { email: 'existing@prime.test', password: 'emulator-only-1' },
  fresh:    { email: 'new@prime.test',      password: 'emulator-only-2' },
}

// JS value → Firestore REST value
function fsValue(v) {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (typeof v === 'string') return { stringValue: v }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(fsValue) } }
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fsValue(x)])) } }
}

async function ensureEmulators() {
  for (const url of [AUTH, 'http://127.0.0.1:8085']) {
    try { await fetch(url) } catch { throw new Error(`Emulator not running at ${url} — refusing to seed`) }
  }
}

async function signUp({ email, password }) {
  const res = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  })
  const data = await res.json()
  if (data.localId) return data.localId
  if (data.error?.message === 'EMAIL_EXISTS') {
    const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=emulator`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    })
    return (await r.json()).localId
  }
  throw new Error(JSON.stringify(data))
}

async function putDoc(path, data) {
  const res = await fetch(`${FS}/${path}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, fsValue(v)])) }),
  })
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
}

export async function seed() {
  await ensureEmulators()
  const existingUid = await signUp(TEST_USERS.existing)
  const freshUid    = await signUp(TEST_USERS.fresh)
  await putDoc(`focusTriggers/${existingUid}`, {
    name: 'משתמש קיים', onboardingDone: true, xp: 500, tier: 'free', welcomeSeen: true,
    triggers: [
      { id: 't1', cue: 'כשאני מתעורר', habit: 'מודה אני', time: null, note: '' },
      { id: 't2', cue: 'אחרי העבודה', habit: 'ריצה', frequency: { type: 'weekly', timesPerWeek: 3 }, days: [0, 2, 4], time: '18:00' },
    ],
  })
  return { existingUid, freshUid }
}

if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  seed().then(r => console.log('seeded', r)).catch(e => { console.error(e.message); process.exit(1) })
}
