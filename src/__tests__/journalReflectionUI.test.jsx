import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// Plain stubs (not vi.fn) — see journalReflection.test.js
let nextQuestion = async () => null
let available    = true
const saved = []
const tasks = []
vi.mock('../services/journalReflectionService', () => ({
  aiQuestionsAvailable: uid => !!uid && available,
  getNextQuestion:      (...a) => nextQuestion(...a),
  MAX_AI_QUESTIONS:     2,
  STEP_QUESTION:        'מה הצעד הכי קטן שאתה יכול לעשות היום?',
  MAX_REFLECTION_ANSWER: 1000,
}))
vi.mock('../services/journalService', () => ({
  saveReflections: async (uid, id, list) => { saved.push(list) },
}))
vi.mock('../services/myTasksService', () => ({
  addTask: async (uid, text) => { tasks.push(text) },
}))

import JournalReflection from '../components/JournalReflection'

const STEP_Q = 'מה הצעד הכי קטן שאתה יכול לעשות היום?'
const baseEntry = { id: 'e1', text: 'יום עמוס בעבודה', important: 'המשפחה', step: '' }

function setup(props = {}) {
  const onDone = props.onDone || (() => {})
  const consent = []
  const utils = render(
    <JournalReflection uid="u1" entry={baseEntry} aiConsent={false}
      onAiConsentChange={v => consent.push(v)} onDone={onDone} {...props} />
  )
  return { ...utils, consent }
}

function answer(text) {
  fireEvent.change(screen.getByPlaceholderText('במילים שלך…'), { target: { value: text } })
  fireEvent.click(screen.getByText('המשך'))
}

beforeEach(() => {
  saved.length = 0; tasks.length = 0; available = true
  nextQuestion = async () => null
})

describe('JournalReflection', () => {
  it('shows the support message for a distressed entry and never calls the AI', async () => {
    let called = false
    nextQuestion = async () => { called = true; return null }
    setup({ entry: { ...baseEntry, text: 'אני כבר לא רוצה לחיות' }, aiConsent: true })
    expect(await screen.findByText('נשמע שעובר עליך משהו כבד.')).toBeInTheDocument()
    expect(screen.getByText('1201').closest('a')).toHaveAttribute('href', 'tel:1201')
    expect(screen.getByText('sahar.org.il').closest('a')).toHaveAttribute('href', 'https://sahar.org.il')
    expect(screen.getByText('eran.org.il').closest('a')).toHaveAttribute('href', 'https://www.eran.org.il')
    expect(screen.queryByText('מספיק')).toBeNull()
    expect(called).toBe(false)
  })

  it('asks for consent first and sends nothing before "כן"', async () => {
    let called = false
    nextQuestion = async () => { called = true; return { question: 'למה דווקא עכשיו?', distress: false } }
    const { consent } = setup()
    expect(screen.getByText('רוצה שה-AI ישאל אותך כמה שאלות על מה שכתבת?')).toBeInTheDocument()
    expect(screen.getByText('הטקסט יישלח ל-Gemini (Google) כדי לנסח שאלות.')).toBeInTheDocument()
    expect(called).toBe(false)
    fireEvent.click(screen.getByText('כן, בוא נחשוב יחד'))
    expect(await screen.findByText('למה דווקא עכשיו?')).toBeInTheDocument()
    expect(called).toBe(true)
    expect(consent).toEqual([true])          // "תמיד אפשר" is checked by default
  })

  it('"לא עכשיו" skips the AI and goes to the step question', async () => {
    let called = false
    nextQuestion = async () => { called = true; return null }
    setup()
    fireEvent.click(screen.getByText('לא עכשיו'))
    expect(await screen.findByText(STEP_Q)).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('runs 2 AI questions with full context, then the step question, saves all, adds the task', async () => {
    const seen = []
    nextQuestion = async (entry, refl) => {
      seen.push(refl.length)
      return { question: refl.length === 0 ? 'מה גורם לעומס?' : 'איך זה משפיע עליך?', distress: false }
    }
    setup({ aiConsent: true })
    expect(await screen.findByText('מה גורם לעומס?')).toBeInTheDocument()
    expect(screen.getByText('מספיק')).toBeInTheDocument()
    answer('הרבה פגישות')
    expect(await screen.findByText('איך זה משפיע עליך?')).toBeInTheDocument()
    answer('אני עייף')
    expect(await screen.findByText(STEP_Q)).toBeInTheDocument()
    expect(screen.queryByText('מספיק')).toBeNull()
    answer('לסגור את המחשב ב-19:00')
    expect(await screen.findByText('הוסף למשימות שלי')).toBeInTheDocument()
    expect(seen).toEqual([0, 1])              // second question saw the first answer
    expect(saved.at(-1)).toEqual([
      { q: 'מה גורם לעומס?', a: 'הרבה פגישות', source: 'ai' },
      { q: 'איך זה משפיע עליך?', a: 'אני עייף', source: 'ai' },
      { q: STEP_Q, a: 'לסגור את המחשב ב-19:00', source: 'fixed' },
    ])
    fireEvent.click(screen.getByText('הוסף למשימות שלי'))
    expect(await screen.findByText('נוסף ✓')).toBeInTheDocument()
    expect(tasks).toEqual(['לסגור את המחשב ב-19:00'])
  })

  it('"מספיק" skips straight to the step question and ignores a late AI reply', async () => {
    let resolve
    nextQuestion = () => new Promise(r => { resolve = r })
    setup({ aiConsent: true })
    fireEvent.click(await screen.findByText('מספיק'))
    expect(await screen.findByText(STEP_Q)).toBeInTheDocument()
    await act(async () => resolve({ question: 'שאלה מאוחרת?', distress: false }))
    expect(screen.queryByText('שאלה מאוחרת?')).toBeNull()
  })

  it('skips the step question when the entry already has a step', async () => {
    nextQuestion = async () => ({ question: 'למה זה חשוב לך?', distress: false })
    setup({ aiConsent: true, entry: { ...baseEntry, step: 'ללכת לישון מוקדם' } })
    await screen.findByText('למה זה חשוב לך?')
    answer('כי אני עייף')
    fireEvent.click(await screen.findByText('מספיק'))
    expect(await screen.findByText('תודה ששיתפת.')).toBeInTheDocument()
    expect(screen.queryByText(STEP_Q)).toBeNull()
  })

  it('closes quietly on "מספיק" when nothing was answered and the step is filled', async () => {
    nextQuestion = async () => ({ question: 'למה זה חשוב לך?', distress: false })
    const done = []
    setup({ aiConsent: true, entry: { ...baseEntry, step: 'ללכת לישון מוקדם' }, onDone: () => done.push(1) })
    fireEvent.click(await screen.findByText('מספיק'))
    await waitFor(() => expect(done).toEqual([1]))
  })

  it('shows the support message when the AI flags distress', async () => {
    nextQuestion = async () => ({ question: '', distress: true })
    setup({ aiConsent: true })
    expect(await screen.findByText('נשמע שעובר עליך משהו כבד.')).toBeInTheDocument()
  })

  it('shows the support message when an answer shows distress', async () => {
    nextQuestion = async () => ({ question: 'מה מרגיש הכי כבד?', distress: false })
    setup({ aiConsent: true })
    await screen.findByText('מה מרגיש הכי כבד?')
    answer('אני לא יכול יותר')
    expect(await screen.findByText('נשמע שעובר עליך משהו כבד.')).toBeInTheDocument()
  })

  it('falls back to the step question when the AI fails', async () => {
    nextQuestion = async () => { throw new Error('function not deployed') }
    setup({ aiConsent: true })
    expect(await screen.findByText(STEP_Q)).toBeInTheDocument()
  })

  it('guests get no AI: only the step question, or nothing if the step is filled', async () => {
    const done = []
    setup({ uid: null, aiConsent: true })
    expect(await screen.findByText(STEP_Q)).toBeInTheDocument()
    expect(screen.queryByText(/Gemini/)).toBeNull()
    setup({ uid: null, entry: { ...baseEntry, id: 'e2', step: 'משהו' }, onDone: () => done.push(1) })
    await waitFor(() => expect(done).toEqual([1]))
  })
})
