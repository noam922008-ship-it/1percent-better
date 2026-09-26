import { describe, it, expect, vi, beforeEach } from 'vitest'

// Plain stub (not vi.fn): vitest reports errors thrown inside vi.fn implementations as failures.
let geminiImpl = async () => ''
const geminiCalls = []
vi.mock('../services/geminiClient', () => ({
  callGemini:      (...args) => { geminiCalls.push(args); return geminiImpl(...args) },
  geminiAvailable: () => true,
}))

import {
  buildReflectionPrompt, parseReflectionReply, getNextQuestion, aiQuestionsAvailable,
} from '../services/journalReflectionService'

const entry = { text: 'היה יום עמוס\nהרבה מחשבות', important: 'המשפחה', step: '' }

describe('parseReflectionReply', () => {
  it('reads a clean JSON reply', () => {
    expect(parseReflectionReply('{"question":"למה דווקא המשפחה עולה עכשיו?","distress":false}'))
      .toEqual({ question: 'למה דווקא המשפחה עולה עכשיו?', distress: false })
  })

  it('strips markdown fences and surrounding text', () => {
    expect(parseReflectionReply('```json\n{"question":"איך זה מרגיש בגוף?","distress":false}\n```'))
      .toEqual({ question: 'איך זה מרגיש בגוף?', distress: false })
  })

  it('adds a question mark when missing', () => {
    expect(parseReflectionReply('{"question":"מה גורם לזה","distress":false}').question).toBe('מה גורם לזה?')
  })

  it('returns distress without a question', () => {
    expect(parseReflectionReply('{"question":"משהו","distress":true}')).toEqual({ question: '', distress: true })
  })

  it('rejects unusable replies', () => {
    for (const bad of [null, '', 'not json', '{"question":"","distress":false}',
      '{"question":"Why is that?","distress":false}', `{"question":"${'א'.repeat(301)}","distress":false}`]) {
      expect(parseReflectionReply(bad), String(bad)).toBeNull()
    }
  })
})

describe('buildReflectionPrompt', () => {
  it('wraps the entry and previous answers as data', () => {
    const p = buildReflectionPrompt(entry, [{ q: 'למה?', a: 'כי כך' }])
    expect(p).toContain('<entry>')
    expect(p).toContain('היה יום עמוס')
    expect(p).toContain('המשפחה')
    expect(p).toContain('1. שאלה: למה?\nתשובה: כי כך')
    expect(p).not.toContain('הצעד הקטן להיום')   // empty step is left out
  })
})

describe('getNextQuestion', () => {
  beforeEach(() => { geminiCalls.length = 0 })

  it('sends the prompt with the system instruction and parses the reply', async () => {
    geminiImpl = async () => '{"question":"מה הכי מעסיק אותך בזה?","distress":false}'
    const r = await getNextQuestion(entry, [])
    expect(r).toEqual({ question: 'מה הכי מעסיק אותך בזה?', distress: false })
    const arg = geminiCalls[0][0]
    expect(arg.systemInstruction).toMatch(/Never give advice/)
    expect(arg.systemInstruction.length).toBeLessThanOrEqual(2000)
    expect(arg.model).toBeUndefined()
  })

  it('propagates function errors so the UI can fall back', async () => {
    geminiImpl = async () => { throw new Error('unavailable') }
    let caught = null
    try { await getNextQuestion(entry, []) } catch (e) { caught = e }
    expect(caught?.message).toBe('unavailable')
  })
})

describe('aiQuestionsAvailable', () => {
  it('is off for guests', () => {
    expect(aiQuestionsAvailable(null)).toBe(false)
    expect(aiQuestionsAvailable('uid1')).toBe(true)
  })
})
