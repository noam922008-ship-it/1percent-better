import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { publicName, cleanNickname } from '../utils/publicName'

// Plain stubs (not vi.fn) — see journalReflection.test.js
let method = 'password'
let deleteResult = 'deleted'     // 'deleted' | 'needs-reauth' | 'partial'
let finishOk = true
const calls = []
vi.mock('../services/accountDeletionService', () => ({
  signInMethod: () => method,
  deleteAccount: async () => {
    calls.push(['delete'])
    if (deleteResult === 'partial') throw new Error('data-not-deleted')
    return deleteResult
  },
  finishDeleteAfterReauth: async ({ password }) => { calls.push(['reauth+finish', password]); if (!finishOk) throw new Error('bad') },
  cancelDeletion: () => calls.push(['cancel']),
}))

import DeleteAccountSheet from '../components/DeleteAccountSheet'

beforeEach(() => { method = 'password'; deleteResult = 'deleted'; finishOk = true; calls.length = 0 })

function open() {
  const done = [], closed = []
  render(<DeleteAccountSheet onClose={() => closed.push(1)} onDeleted={() => done.push(1)} />)
  return { done, closed }
}
const del = () => screen.getByText('מחק את החשבון לצמיתות')
const type = (label, v) => fireEvent.change(screen.getByLabelText(label), { target: { value: v } })

describe('DeleteAccountSheet', () => {
  it('only "מחק" is needed — no password up front', () => {
    open()
    expect(screen.queryByLabelText('סיסמה')).toBeNull()
    expect(del()).toBeDisabled()
    type('אישור מחיקה', 'מחקק')
    expect(del()).toBeDisabled()
    type('אישור מחיקה', 'מחק')
    expect(del()).not.toBeDisabled()
  })

  it('deletes directly when Firebase does not ask for a recent sign-in', async () => {
    const { done } = open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    await waitFor(() => expect(done).toEqual([1]))
    expect(calls).toEqual([['delete']])
  })

  it('asks for the password only after auth/requires-recent-login, then finishes', async () => {
    deleteResult = 'needs-reauth'
    const { done } = open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    expect(await screen.findByText('כל המידע נמחק. כדי לסיים ולמחוק גם את החשבון, צריך להתחבר שוב.')).toBeInTheDocument()
    type('סיסמה', 'secret')
    fireEvent.click(screen.getByText('התחבר ומחק את החשבון'))
    await waitFor(() => expect(done).toEqual([1]))
    expect(calls).toEqual([['delete'], ['reauth+finish', 'secret']])
  })

  it('wrong password at that step: told, account not finished', async () => {
    deleteResult = 'needs-reauth'; finishOk = false
    const { done } = open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    await screen.findByLabelText('סיסמה')
    type('סיסמה', 'wrong')
    fireEvent.click(screen.getByText('התחבר ומחק את החשבון'))
    expect(await screen.findByText('הסיסמה לא נכונה — נסה שוב')).toBeInTheDocument()
    expect(done).toEqual([])
  })

  it('Google accounts: re-sign-in with Google at that step', async () => {
    method = 'google'; deleteResult = 'needs-reauth'
    open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    expect(await screen.findByText('התחבר עם Google ומחק')).not.toBeDisabled()
    expect(screen.queryByLabelText('סיסמה')).toBeNull()
  })

  it('closing at the sign-in-again step cancels cleanly', async () => {
    deleteResult = 'needs-reauth'
    const { closed } = open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    await screen.findByText('התחבר ומחק את החשבון')
    fireEvent.click(screen.getByText('ביטול'))
    expect(calls).toContainEqual(['cancel'])
    expect(closed).toEqual([1])
  })

  it('if some data was not deleted, the account is kept and the user is told', async () => {
    deleteResult = 'partial'
    const { done } = open()
    type('אישור מחיקה', 'מחק')
    fireEvent.click(del())
    expect(await screen.findByText(/חלק מהנתונים לא נמחקו, והחשבון נשאר/)).toBeInTheDocument()
    expect(done).toEqual([])
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
