// Lesson notes — the user's own notes on a daily lesson, saved with a copy of the lesson.
// Signed-in: Firestore users/{uid}/lessons/{lessonId}. Guest: localStorage.
// Note: { lessonId, topicId, lesson, learned, apply, date, createdAt, updatedAt? }
// date is a local key (getLocalDateKey). One note per lesson; if the lesson comes back, its note is edited.
// No AI and no XP — lesson picking and completion stay in dailyLessonService.

import { collection, doc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { getLocalDateKey } from '../utils/localDate'

export const MAX_LEARNED_LEN = 2000
export const MAX_APPLY_LEN   = 1000
const GUEST_KEY = 'prime_lesson_notes_guest'

const notesCol = uid       => collection(db, 'users', uid, 'lessons')
const noteDoc  = (uid, id) => doc(db, 'users', uid, 'lessons', id)

// Keeps line breaks, drops other control chars.
function clean(s, max) {
  // eslint-disable-next-line no-control-regex
  return String(s || '').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' ').trim().slice(0, max)
}

// Copy of the lesson content as it was shown, so the note keeps its context.
function lessonSnapshot(l) {
  const pick = k => (typeof l[k] === 'string' ? l[k] : '')
  return {
    titleHe: pick('titleHe'), summaryHe: pick('summaryHe'), ideaHe: pick('ideaHe'),
    explanationHe: pick('explanationHe'), exampleHe: pick('exampleHe'),
    questionHe: pick('questionHe'), answerHe: pick('answerHe'), actionHe: pick('actionHe'),
  }
}

export function firstLine(s) {
  return String(s || '').split('\n').map(l => l.trim()).find(Boolean) || ''
}

// ── Guest (localStorage) ─────────────────────────────────────────

function loadGuest() {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || [] } catch { return [] }
}
const guestListeners = new Set()
function saveGuest(list) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(list)) } catch {}
  guestListeners.forEach(fn => fn())
}

const byNewest = (a, b) => b.createdMs - a.createdMs

// ── Public API ───────────────────────────────────────────────────

// Calls onChange(list) with all notes, newest first; returns an unsubscribe fn.
export function subscribeNotes(uid, onChange, onError) {
  if (!uid) {
    const fn = () => onChange(loadGuest().map(n => ({ ...n, id: n.lessonId, createdMs: n.createdAt || 0 })).sort(byNewest))
    guestListeners.add(fn)
    fn()
    return () => guestListeners.delete(fn)
  }
  return onSnapshot(notesCol(uid), snap => {
    const list = snap.docs.map(d => {
      const data = d.data({ serverTimestamps: 'estimate' })
      return { id: d.id, ...data, createdMs: data.createdAt?.toMillis?.() ?? Date.now() }
    })
    onChange(list.sort(byNewest))
  }, err => onError?.(err))
}

// Creates the note for this lesson, or edits it if one already exists.
// Only learned/apply change on edit; the lesson copy, date and createdAt stay.
export async function saveNote(uid, lesson, { learned, apply }, exists) {
  const text = { learned: clean(learned, MAX_LEARNED_LEN), apply: clean(apply, MAX_APPLY_LEN) }
  if (!text.learned) return
  if (!uid) {
    const list = loadGuest()
    if (list.some(n => n.lessonId === lesson.id)) {
      saveGuest(list.map(n => n.lessonId === lesson.id ? { ...n, ...text, updatedAt: Date.now() } : n))
    } else {
      saveGuest([...list, { lessonId: lesson.id, topicId: lesson.topicId || '', lesson: lessonSnapshot(lesson), ...text, date: getLocalDateKey(), createdAt: Date.now() }])
    }
    return
  }
  if (exists) {
    await updateDoc(noteDoc(uid, lesson.id), { ...text, updatedAt: serverTimestamp() })
  } else {
    await setDoc(noteDoc(uid, lesson.id), {
      lessonId: lesson.id, topicId: lesson.topicId || '', lesson: lessonSnapshot(lesson),
      ...text, date: getLocalDateKey(), createdAt: serverTimestamp(),
    })
  }
}
