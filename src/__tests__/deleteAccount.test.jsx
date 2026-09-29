import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { publicName, cleanNickname } from '../utils/publicName'

// Plain stubs (not vi.fn) — see journalReflection.test.js
let method = 'password'
let reauthOk = true
let deleteResult = 'ok'
const calls = []
vi.mock('../services/accountDeletionService', () => ({
  signInMethod: () => method,
  reauthenticate: async ({ password }) => { calls.push(['reauth', password]); if (!reauthOk) throw new Error('bad') },
  deleteAccount: async () => {
    calls.push(['delete'])
    if (deleteResult === 'partial') { const e = new Error('data-not-deleted'); throw e }
  },
}))

import DeleteAccountSheet from '../components/DeleteAccountSheet'

beforeEach(() => { method = 'password'; reauthOk = true; deleteResult = 'ok'; calls.length = 0 })

function open() {
  const done = []
  render(<DeleteAccountSheet onClose={() => {}} onDeleted={() => done.push(1)} />)
  return done
}
const del = () => screen.getByText('מחק את החשבון לצמיתות')
const type = (label, v) => fireEvent.change(screen.getByLabelText(label), { target: { value: v } })

describe('DeleteAccountSheet', () => {
  it('stays disabled until "מחק" is typed and the password entered', () => {
    open()
    expect(del()).toBeDisabled()
    type('אישור מחיקה', 'מחקק')
    type('סיסמה', 'pw')
    expect(del()).toBeDisabled()
    type('אישור מחיקה', 'מחק')
    expect(del()).not.toBeDisabled()
  })

  it('re-authenticates first, then deletes, then reports done', async () => {
    const done = open()
    type('אישור מחיקה', 'מחק'); type('סיסמה', 'secret')
    fireEvent.click(del())
    await waitFor(() => expect(done).toEqual([1]))
    expect(calls).toEqual([['reauth', 'secret'], ['delete']])
  })

  it('wrong password: nothing is deleted', async () => {
    reauthOk = false
    const done = open()
    type('אישור מחיקה', 'מחק'); type('סיסמה', 'wrong')
    fireEvent.click(del())
    expect(await screen.findByText('הסיסמה לא נכונה — נסה שוב')).toBeInTheDocument()
    expect(calls).toEqual([['reauth', 'wrong']])
    expect(done).toEqual([])
  })

  it('if some data was not deleted, the account is kept and the user is told', async () => {
    deleteResult = 'partial'
    const done = open()
    type('אישור מחיקה', 'מחק'); type('סיסמה', 'secret')
    fireEvent.click(del())
    expect(await screen.findByText(/חלק מהנתונים לא נמחקו, והחשבון נשאר/)).toBeInTheDocument()
    expect(done).toEqual([])
  })

  it('Google accounts: no password field, re-sign-in with Google', () => {
    method = 'google'
    open()
    expect(screen.queryByLabelText('סיסמה')).toBeNull()
    expect(screen.getByText('נבקש ממך להתחבר שוב עם Google לפני המחיקה.')).toBeInTheDocument()
    type('אישור מחיקה', 'מחק')
    expect(del()).not.toBeDisabled()
  })
})

describe('public name on the leaderboard', () => {
  it('is empty by default — never the real name', () => {
    expect(publicName({ name: 'נועם', xp: 10 })).toBe('')
    expect(publicName({ name: 'נועם', leaderboardNickname: 'הרץ' })).toBe('')
  })
  it('is the nickname only after opting in', () => {
    expect(publicName({ name: 'נועם', leaderboardOptIn: true, leaderboardNickname: '  הרץ  ' })).toBe('הרץ')
  })
  it('cleans nicknames', () => {
    expect(cleanNickname('<b>x</b>')).toBe('bx/b')
    expect(cleanNickname('a'.repeat(40))).toHaveLength(30)
  })
})
