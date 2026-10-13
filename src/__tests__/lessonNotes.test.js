import { describe, it, expect, vi, beforeEach } from 'vitest'

// Guest path only (localStorage) — Firestore is never reached.
vi.mock('../services/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: () => ({}), doc: () => ({}), setDoc: async () => {}, updateDoc: async () => {},
  onSnapshot: () => () => {}, serverTimestamp: () => null,
}))

import { lessonSnapshot, saveNote } from '../services/lessonNotesService'
import { LESSON_BY_ID } from '../data/dailyLessons'

const FIELDS = ['title', 'summary', 'idea', 'explanation', 'example', 'question', 'answer', 'action']
const HE_KEYS = FIELDS.map(f => `${f}He`)
const EN_KEYS = FIELDS.map(f => `${f}En`)
const guestNotes = () => JSON.parse(localStorage.getItem('prime_lesson_notes_guest') || '[]')

beforeEach(() => localStorage.clear())

describe('lesson copy saved with a note', () => {
  it('shown in Hebrew: the 8 Hebrew fields only, as before — even for a translated lesson', () => {
    const l = LESSON_BY_ID.brain_1
    const snap = lessonSnapshot(l, 'he')
    expect(Object.keys(snap).sort()).toEqual([...HE_KEYS].sort())
    for (const k of HE_KEYS) expect(snap[k]).toBe(l[k])
    expect(lessonSnapshot(l)).toEqual(snap)   // default is Hebrew
  })

  it('shown in English: Hebrew (the fallback) plus the lesson’s English fields', () => {
    const l = LESSON_BY_ID.brain_1
    const snap = lessonSnapshot(l, 'en')
    expect(Object.keys(snap).sort()).toEqual([...HE_KEYS, ...EN_KEYS].sort())
    for (const k of [...HE_KEYS, ...EN_KEYS]) expect(snap[k]).toBe(l[k])
  })

  it('shown in English, lesson not translated yet: Hebrew only (the page falls back to it)', () => {
    expect(Object.keys(lessonSnapshot(LESSON_BY_ID.tech_1, 'en')).sort()).toEqual([...HE_KEYS].sort())
  })

  it('an empty English example is kept empty, not filled from Hebrew', () => {
    expect(lessonSnapshot(LESSON_BY_ID.brain_4, 'en').exampleEn).toBe('')
  })

  it('saveNote (guest) stores the copy in the language shown; editing keeps the copy', async () => {
    const l = LESSON_BY_ID.comm_1
    await saveNote(null, l, { learned: 'Reflect back', apply: '' }, false, 'en')
    expect(guestNotes()[0].lesson.titleEn).toBe(l.titleEn)
    expect(guestNotes()[0].lesson.titleHe).toBe(l.titleHe)

    await saveNote(null, l, { learned: 'Edited', apply: '' }, true, 'he')
    expect(guestNotes()[0].learned).toBe('Edited')
    expect(guestNotes()[0].lesson.titleEn).toBe(l.titleEn)

    localStorage.clear()
    await saveNote(null, l, { learned: 'שיקוף', apply: '' }, false)
    expect(guestNotes()[0].lesson.titleEn).toBeUndefined()
  })
})
