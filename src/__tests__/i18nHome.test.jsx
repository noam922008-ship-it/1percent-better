import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import he from '../i18n/he'
import en from '../i18n/en'
import { LESSON_TOPICS, DAILY_LESSONS } from '../data/dailyLessons'
import { getTopSuggestionsForPillars } from '../data/habitSuggestions'

// Phase 3: Home's remaining cards (My Tasks, "הראש שלי", daily lesson, week strip) and the add-habit flow
// have no Hebrew UI left when English is on. Lesson content and habit suggestions (data/) stay Hebrew for now.
const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))
vi.mock('../services/analytics', () => ({ track: () => {} }))

const TASKS = [
  { id: 'a', text: 'Call mom', done: false, carriedOver: true },
  { id: 'b', text: 'Pay rent', done: true,  carriedOver: false },
]
vi.mock('../services/myTasksService', () => ({
  MAX_TASK_LEN: 200,
  subscribeTasks: (uid, cb) => { cb(TASKS); return () => {} },
  addTask: async () => 'x', setTaskDone: async () => {}, deleteTask: async () => {},
}))

const ENTRIES = [{ id: 'e1', date: '2026-10-08', text: 'Busy day', important: 'Sleep', step: 'Bed by 11' }]
vi.mock('../services/journalService', () => ({
  MAX_TEXT_LEN: 5000, MAX_ANSWER_LEN: 1000,
  isEmptyEntry: e => !e.text && !e.important && !e.step,
  firstLine: e => e.text,
  subscribeEntries: (uid, cb) => { cb(ENTRIES); return () => {} },
  addEntry: async () => {}, updateEntry: async () => {}, deleteEntry: async () => {},
}))

const notes = { current: [] }
vi.mock('../services/lessonNotesService', () => ({
  MAX_LEARNED_LEN: 2000, MAX_APPLY_LEN: 1000,
  firstLine: s => s,
  subscribeNotes: (uid, cb) => { cb(notes.current); return () => {} },
  saveNote: async () => {},
}))

import MyTasks from '../components/MyTasks'
import JournalCard from '../components/JournalCard'
import Journal from '../components/Journal'
import DailyLessonCard from '../components/DailyLessonCard'
import LessonNotesPage from '../components/LessonNotesPage'
import WeekStrip from '../components/dashboard/WeekStrip'
import HabitCreationFlow from '../components/HabitCreationFlow'

const HEBREW = /[֐-׿]/

// Visible text plus the attributes a screen reader or the keyboard user meets.
// `allowed`: Hebrew content from data/ that stays Hebrew in this phase — elements whose own text is one of
// these are dropped before checking.
function hebrewIn(container, allowed = []) {
  const found = []
  const copy = container.cloneNode(true)
  const skip = new Set(allowed.filter(Boolean).map(s => s.trim()))
  copy.querySelectorAll('*').forEach(el => {
    if (el.children.length === 0 && skip.has(el.textContent.trim())) el.remove()
  })
  if (HEBREW.test(copy.textContent)) found.push(copy.textContent.match(/[֐-׿][^\n]{0,40}/)[0])
  copy.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el => {
    for (const a of ['placeholder', 'aria-label', 'title']) {
      const v = el.getAttribute(a)
      if (v && HEBREW.test(v)) found.push(`${a}="${v}"`)
    }
  })
  return found
}

const chevron = el => el.querySelector('svg').getAttribute('class')

beforeEach(() => {
  lang.current = 'en'
  notes.current = []
  localStorage.clear()
})

describe('English Home cards have no Hebrew', () => {
  it('My Tasks, with a carried-over task and a done task', () => {
    const { container } = render(<MyTasks uid={null} />)
    expect(screen.getByText(en.myTasks.title)).toBeInTheDocument()
    expect(screen.getByText(en.myTasks.carriedOver)).toBeInTheDocument()
    expect(screen.getByLabelText('Mark as done: Call mom')).toBeInTheDocument()
    expect(screen.getByLabelText('Unmark: Pay rent')).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
  })

  it('"On my mind" card and full screen: write, past entries, one entry', () => {
    const card = render(<JournalCard onOpen={() => {}} />)
    expect(screen.getByText('On my mind')).toBeInTheDocument()
    expect(hebrewIn(card.container)).toEqual([])
    card.unmount()

    const { container } = render(<Journal uid={null} onClose={() => {}} />)
    expect(screen.getByLabelText(en.journal.qImportant)).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText('Past entries (1)'))
    expect(screen.getByText(/October 8/)).toBeInTheDocument()   // date in en-US
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText('Busy day'))
    fireEvent.click(screen.getByText(en.journal.delete))
    expect(screen.getByText(en.journal.confirmDelete)).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
  })

  it('daily lesson card and the open lesson, through to the notes form (lesson content excluded)', () => {
    const { container } = render(<DailyLessonCard uid={null} onOpenNotes={() => {}} />)
    const content = DAILY_LESSONS.flatMap(l => [l.titleHe, l.summaryHe, l.ideaHe, l.explanationHe, l.exampleHe, l.questionHe, l.answerHe, l.actionHe])
    expect(screen.getByText(en.lesson.card.label)).toBeInTheDocument()
    expect(hebrewIn(container, content)).toEqual([])
    // the topic label is translated, not taken from data/
    expect(LESSON_TOPICS.some(t => container.textContent.includes(en.lesson.topics[t.id]))).toBe(true)

    fireEvent.click(screen.getByText(en.lesson.card.start))
    fireEvent.click(screen.getByText(en.lesson.view.readDone))
    // marking it read completes the lesson, so the answer shows right away
    expect(screen.getByText(en.lesson.view.answer)).toBeInTheDocument()
    expect(screen.getByText(en.lesson.notesForm.learned)).toBeInTheDocument()
    expect(hebrewIn(container, content)).toEqual([])
  })

  it('"What I learned" page: empty state and a saved lesson', () => {
    const empty = render(<LessonNotesPage uid={null} onClose={() => {}} />)
    expect(screen.getByText(en.lesson.notesPage.empty1, { exact: false })).toBeInTheDocument()
    expect(hebrewIn(empty.container)).toEqual([])
    empty.unmount()

    const lesson = { titleHe: 'כותרת', summaryHe: 'תקציר', ideaHe: 'רעיון', answerHe: 'תשובה' }
    notes.current = [{ id: 'l1', lessonId: 'l1', date: '2026-10-08', learned: 'Compounding', apply: 'Save weekly', lesson }]
    const { container } = render(<LessonNotesPage uid={null} onClose={() => {}} />)
    fireEvent.click(screen.getByText('Compounding'))
    expect(screen.getByText(en.lesson.notesPage.sections.ideaHe)).toBeInTheDocument()
    expect(hebrewIn(container, Object.values(lesson))).toEqual([])
  })

  it('week strip: English day letters', () => {
    const { container } = render(<WeekStrip activityLog={[]} />)
    expect(screen.getByText('0 of 7 days')).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
  })
})

describe('English add-habit flow', () => {
  const suggestions = getTopSuggestionsForPillars(['body'], 6)
  // Suggestions are data/ and stay Hebrew in this phase
  const suggestionText = suggestions.flatMap(s => [s.titleHe, `${s.triggerSuggestionHe} · ${s.estimatedMinutes} min`])

  function create() {
    const saved = []
    const r = render(<HabitCreationFlow growthPillars={['body']} existingCount={0} onSave={d => saved.push(d)} onClose={() => {}} />)
    return { saved, container: r.container }
  }

  it('custom habit, every step, saves the preset cue in English', () => {
    const { saved, container } = create()
    expect(hebrewIn(container, suggestionText)).toEqual([])
    fireEvent.click(screen.getByText(en.habitFlow.custom))
    fireEvent.change(screen.getByPlaceholderText(en.habitFlow.titlePh), { target: { value: 'Run' } })
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText(en.habitFlow.next))
    expect(screen.getByText('Add a cue')).toBeInTheDocument()
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText('After work / school'))
    fireEvent.click(screen.getByText(en.habitFlow.next))
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText(en.habitFlow.save))
    expect(saved[0]).toMatchObject({ cue: 'After work / school', habit: 'Run' })
  })

  it('a suggestion whose Hebrew cue matches a preset highlights it and saves it in English', () => {
    const s = suggestions.find(x => x.triggerSuggestionHe === he.habitFlow.cues.wake)
    const { saved } = create()
    fireEvent.click(screen.getByText(s.titleHe))
    expect(screen.getByText('When I wake up')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByText(en.habitFlow.next))
    fireEvent.click(screen.getByText(en.habitFlow.save))
    expect(saved[0].cue).toBe('When I wake up')
  })

  it("a suggestion whose cue matches no preset keeps its text (Hebrew until suggestions are translated)", () => {
    const all = getTopSuggestionsForPillars(['body', 'discipline', 'growth', 'people', 'life'], 100)
    const presets = Object.values(he.habitFlow.cues)
    const s = all.find(x => !presets.includes(x.triggerSuggestionHe))
    const saved = []
    render(<HabitCreationFlow growthPillars={[s.pillar]} existingCount={0} onSave={d => saved.push(d)} onClose={() => {}} prefill={s} />)
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
    fireEvent.click(screen.getByText(en.habitFlow.next))
    fireEvent.click(screen.getByText(en.habitFlow.save))
    expect(saved[0].cue).toBe(s.triggerSuggestionHe)
  })
})

describe('Hebrew is unchanged', () => {
  beforeEach(() => { lang.current = 'he' })

  it('cards keep their Hebrew copy', () => {
    render(<><MyTasks uid={null} /><JournalCard onOpen={() => {}} /><WeekStrip activityLog={[]} /></>)
    for (const s of ['המשימות שלי', 'מאתמול', 'הראש שלי', 'פעילות שבועית', '0 מתוך 7 ימים']) expect(screen.getByText(s)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('מה אתה חייב לעשות היום?')).toBeInTheDocument()
  })

  it('a matching suggestion still highlights and saves the Hebrew preset', () => {
    const s = getTopSuggestionsForPillars(['body'], 6).find(x => x.triggerSuggestionHe === 'כשאני מתעורר')
    const saved = []
    render(<HabitCreationFlow growthPillars={['body']} existingCount={0} onSave={d => saved.push(d)} onClose={() => {}} />)
    fireEvent.click(screen.getByText(s.titleHe))
    expect(screen.getByText('כשאני מתעורר')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByText('המשך ←'))
    fireEvent.click(screen.getByText('הוסף הרגל ✓'))
    expect(saved[0].cue).toBe('כשאני מתעורר')
  })

  it('lesson topic labels in he.js match data/dailyLessons.js', () => {
    expect(Object.fromEntries(LESSON_TOPICS.map(t => [t.id, t.label]))).toEqual(he.lesson.topics)
    expect(Object.keys(en.lesson.topics).sort()).toEqual(LESSON_TOPICS.map(t => t.id).sort())
  })
})

describe('chevrons follow the reading direction', () => {
  it('"On my mind" card arrow: left in Hebrew, right in English', () => {
    lang.current = 'he'
    const a = render(<JournalCard onOpen={() => {}} />)
    expect(chevron(a.container)).toMatch(/chevron-left/)
    a.unmount()
    lang.current = 'en'
    const b = render(<JournalCard onOpen={() => {}} />)
    expect(chevron(b.container)).toMatch(/chevron-right/)
  })

  it('back buttons: right in Hebrew, left in English', () => {
    for (const [l, dir] of [['he', /chevron-right/], ['en', /chevron-left/]]) {
      lang.current = l
      const j = render(<Journal uid={null} onClose={() => {}} />)
      expect(chevron(screen.getByLabelText(l === 'he' ? 'חזור' : 'Back'))).toMatch(dir)
      j.unmount()
      const n = render(<LessonNotesPage uid={null} onClose={() => {}} />)
      expect(chevron(screen.getByLabelText(l === 'he' ? 'חזור' : 'Back'))).toMatch(dir)
      n.unmount()
    }
  })
})

describe('Phase 3 files', () => {
  const files = ['MyTasks', 'JournalCard', 'Journal', 'DailyLessonCard', 'LessonNotesForm', 'LessonNotesPage', 'HabitCreationFlow', 'dashboard/WeekStrip']

  it('no hard-coded rtl, right/left alignment or physical accent stripes', () => {
    for (const f of files) {
      const src = readFileSync(`src/components/${f}.jsx`, 'utf8')
      expect(src, f).not.toMatch(/dir="rtl"|direction: 'rtl'|textAlign: '(right|left)'|border(Right|Left):/)
      expect(src, f).not.toMatch(/ChevronLeft|ChevronRight/)
    }
  })

  it('every Phase 3 key exists in both languages', () => {
    const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    for (const g of ['common', 'myTasks', 'journal', 'lesson', 'weekStrip', 'habitFlow']) {
      expect(keys(en[g]).sort(), g).toEqual(keys(he[g]).sort())
    }
  })
})
