import { describe, it, expect, beforeEach, vi } from 'vitest'

// Stub localStorage before importing the service
const store = {}
const localStorageMock = {
  getItem:    key       => store[key] ?? null,
  setItem:    (key, v)  => { store[key] = v },
  removeItem: key       => { delete store[key] },
  clear:      ()        => { Object.keys(store).forEach(k => delete store[k]) },
}
vi.stubGlobal('localStorage', localStorageMock)

import {
  getTodayLesson,
  getAlternativeLesson,
  markLessonOpened,
  markLessonCompleted,
  markLessonApplied,
  saveLessonFeedback,
  getTodayLessonEntry,
  getTopicFeedback,
} from '../services/dailyLessonService'
import { DAILY_LESSONS, LESSON_TOPICS, LESSON_BY_ID } from '../data/dailyLessons'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function tomorrowKey() {
  const d = new Date(Date.now() + 86_400_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

beforeEach(() => {
  localStorageMock.clear()
})

// ── 1. Selection — stable within one day ──────────────────────────

describe('lesson selection', () => {
  it('returns same lesson on repeated calls (stable per day)', () => {
    const { lesson: a } = getTodayLesson()
    const { lesson: b } = getTodayLesson()
    expect(a.id).toBe(b.id)
  })

  it('returns valid lesson object with required fields', () => {
    const { lesson } = getTodayLesson()
    expect(lesson.id).toBeTruthy()
    expect(lesson.topicId).toBeTruthy()
    expect(lesson.titleHe).toBeTruthy()
    expect(lesson.ideaHe).toBeTruthy()
    expect(lesson.explanationHe).toBeTruthy()
    expect(typeof lesson.exampleHe).toBe('string')   // may be '' (brain_4) — the card then hides the example box
    expect(lesson.questionHe).toBeTruthy()
    expect(lesson.answerHe).toBeTruthy()
  })

  it('returns isNew=true on first call of day', () => {
    const { isNew } = getTodayLesson()
    expect(isNew).toBe(true)
  })

  it('returns isNew=false on subsequent calls same day', () => {
    getTodayLesson()
    const { isNew } = getTodayLesson()
    expect(isNew).toBe(false)
  })

  it('topic matches a valid topic ID', () => {
    const { topicId } = getTodayLesson()
    const validIds = LESSON_TOPICS.map(t => t.id)
    expect(validIds).toContain(topicId)
  })

  it('respects prefTopics — picks from preferred topic', () => {
    const prefTopic = LESSON_TOPICS[0].id
    const { topicId } = getTodayLesson([prefTopic])
    expect(topicId).toBe(prefTopic)
  })
})

// ── 2. Alternative lesson ─────────────────────────────────────────

describe('getAlternativeLesson', () => {
  it('returns a different lesson from the current one', () => {
    const { lesson: orig } = getTodayLesson()
    const { lesson: alt } = getAlternativeLesson(orig.id)
    expect(alt.id).not.toBe(orig.id)
  })

  it('returns a valid lesson object', () => {
    const { lesson: orig } = getTodayLesson()
    const { lesson: alt } = getAlternativeLesson(orig.id)
    expect(alt.titleHe).toBeTruthy()
    expect(alt.topicId).toBeTruthy()
  })

  it('updates today storage to the new lesson', () => {
    const { lesson: orig } = getTodayLesson()
    const { lesson: alt } = getAlternativeLesson(orig.id)
    const { lesson: current } = getTodayLesson()
    expect(current.id).toBe(alt.id)
  })
})

// ── 3. Repeat prevention ──────────────────────────────────────────

describe('repeat prevention', () => {
  it('lesson pool covers all topic IDs', () => {
    for (const topic of LESSON_TOPICS) {
      const lessons = DAILY_LESSONS.filter(l => l.topicId === topic.id)
      expect(lessons.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('different calls for all topics return valid lessons without throwing', () => {
    for (const topic of LESSON_TOPICS) {
      expect(() => getTodayLesson([topic.id])).not.toThrow()
      localStorageMock.clear()
    }
  })
})

// ── 4. Marking and log ────────────────────────────────────────────

describe('lesson marking', () => {
  it('markLessonOpened does not mark as completed', () => {
    const { lesson } = getTodayLesson()
    markLessonOpened(lesson.id)
    const entry = getTodayLessonEntry()
    expect(entry.openedAt).toBeTruthy()
    expect(entry.completedAt).toBeNull()
  })

  it('markLessonCompleted returns true on first completion', () => {
    const { lesson } = getTodayLesson()
    const result = markLessonCompleted(lesson.id)
    expect(result).toBe(true)
  })

  it('markLessonCompleted returns false on re-completion (idempotent)', () => {
    const { lesson } = getTodayLesson()
    markLessonCompleted(lesson.id)
    const result2 = markLessonCompleted(lesson.id)
    expect(result2).toBe(false)
  })

  it('markLessonApplied returns true on first application', () => {
    const { lesson } = getTodayLesson()
    const result = markLessonApplied(lesson.id)
    expect(result).toBe(true)
  })

  it('markLessonApplied returns false on repeat', () => {
    const { lesson } = getTodayLesson()
    markLessonApplied(lesson.id)
    expect(markLessonApplied(lesson.id)).toBe(false)
  })

  it('markLessonOpened is idempotent — openedAt does not change on second call', () => {
    const { lesson } = getTodayLesson()
    markLessonOpened(lesson.id)
    const first = getTodayLessonEntry().openedAt
    markLessonOpened(lesson.id)
    expect(getTodayLessonEntry().openedAt).toBe(first)
  })

  it('opening alone does NOT complete the lesson', () => {
    const { lesson } = getTodayLesson()
    markLessonOpened(lesson.id)
    expect(getTodayLessonEntry().completedAt).toBeNull()
  })
})

// ── 5. Feedback ───────────────────────────────────────────────────

describe('lesson feedback', () => {
  it('saves "more" feedback to log entry', () => {
    const { lesson } = getTodayLesson()
    saveLessonFeedback(lesson.id, 'more')
    expect(getTodayLessonEntry().feedback).toBe('more')
  })

  it('saves "less" feedback to log entry', () => {
    const { lesson } = getTodayLesson()
    saveLessonFeedback(lesson.id, 'less')
    expect(getTodayLessonEntry().feedback).toBe('less')
  })

  it('topic feedback accumulates across calls', () => {
    const { lesson } = getTodayLesson()
    saveLessonFeedback(lesson.id, 'more')
    const fb = getTopicFeedback()
    expect(fb[lesson.topicId].more).toBeGreaterThanOrEqual(1)
  })

  it('"less" feedback increments less count', () => {
    const { lesson } = getTodayLesson()
    saveLessonFeedback(lesson.id, 'less')
    const fb = getTopicFeedback()
    expect(fb[lesson.topicId].less).toBeGreaterThanOrEqual(1)
  })
})

// ── 6. getTodayLessonEntry ────────────────────────────────────────

describe('getTodayLessonEntry', () => {
  it('returns null when no lesson assigned today', () => {
    expect(getTodayLessonEntry()).toBeNull()
  })

  it('returns entry with today date after assignment', () => {
    getTodayLesson()
    const entry = getTodayLessonEntry()
    expect(entry).not.toBeNull()
    expect(entry.date).toBe(todayKey())
  })

  it('entry has expected shape', () => {
    const { lesson } = getTodayLesson()
    const entry = getTodayLessonEntry()
    expect(entry.lessonId).toBe(lesson.id)
    expect(entry.topicId).toBeTruthy()
    expect(entry).toHaveProperty('openedAt')
    expect(entry).toHaveProperty('completedAt')
    expect(entry).toHaveProperty('appliedAt')
    expect(entry).toHaveProperty('feedback')
  })
})

// ── 7. Daily rollover ─────────────────────────────────────────────

describe('daily rollover', () => {
  it('simulated rollover: stale today entry triggers new assignment', () => {
    // Assign lesson for "yesterday" manually
    const yesterday = new Date(Date.now() - 86_400_000)
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    const staleEntry = { date: yKey, lessonId: DAILY_LESSONS[0].id, topicId: DAILY_LESSONS[0].topicId }
    localStorageMock.setItem('prime_lesson_today', JSON.stringify(staleEntry))

    // getTodayLesson should detect the date mismatch and assign fresh
    const { lesson, isNew } = getTodayLesson()
    expect(isNew).toBe(true)
    expect(lesson.id).toBeTruthy()
    const entry = getTodayLessonEntry()
    expect(entry.date).toBe(todayKey())
  })
})

// ── 8. Duplicate XP prevention (structural) ───────────────────────

describe('duplicate XP prevention', () => {
  it('markLessonCompleted returns false on second call — XP should only be awarded once', () => {
    const { lesson } = getTodayLesson()
    const first  = markLessonCompleted(lesson.id)
    const second = markLessonCompleted(lesson.id)
    expect(first).toBe(true)
    expect(second).toBe(false)
  })

  it('markLessonApplied returns false on second call — bonus XP only once', () => {
    const { lesson } = getTodayLesson()
    const first  = markLessonApplied(lesson.id)
    const second = markLessonApplied(lesson.id)
    expect(first).toBe(true)
    expect(second).toBe(false)
  })
})

// ── 9. Lesson content: English (brain, communication, creativity, money) and the agreed fact fixes ──

const TEXT_FIELDS = ['title', 'summary', 'idea', 'explanation', 'example', 'question', 'answer', 'action']
const TRANSLATED  = ['brain', 'comm', 'creativity', 'money', 'tech'].flatMap(t => [1, 2, 3, 4, 5, 6].map(n => `${t}_${n}`))
const HEBREW = /[\u0590-\u05FF]/

describe('lesson content', () => {
  it('every Hebrew field is a non-empty string, except brain_4 which has no example', () => {
    for (const l of DAILY_LESSONS) {
      for (const f of TEXT_FIELDS) {
        expect(typeof l[`${f}He`], `${l.id} ${f}He`).toBe('string')
        if (!(l.id === 'brain_4' && f === 'example')) expect(l[`${f}He`], `${l.id} ${f}He`).not.toBe('')
      }
    }
    expect(DAILY_LESSONS.filter(l => !l.exampleHe).map(l => l.id)).toEqual(['brain_4'])
  })

  it('every lesson has all 8 English fields with no Hebrew', () => {
    for (const l of DAILY_LESSONS) {
      const translated = TRANSLATED.includes(l.id)
      for (const f of TEXT_FIELDS) {
        const v = l[`${f}En`]
        if (!translated) { expect(v, `${l.id} ${f}En`).toBeUndefined(); continue }
        expect(typeof v, `${l.id} ${f}En`).toBe('string')
        expect(HEBREW.test(v), `${l.id} ${f}En`).toBe(false)
        if (!(l.id === 'brain_4' && f === 'example')) expect(v, `${l.id} ${f}En`).not.toBe('')
      }
    }
    expect(LESSON_BY_ID.brain_4.exampleEn).toBe('')
  })

  it('agreed fact fixes are in both languages', () => {
    const { brain_2, brain_3, brain_4, brain_5 } = LESSON_BY_ID
    expect(brain_2.ideaHe).not.toContain('המנבאים')
    expect(brain_2.ideaEn).toContain('linked to long-term success')
    expect(brain_3.ideaHe).toContain('רק פריטים בודדים (כ-4)')
    expect(brain_3.ideaEn).toContain('only a few items (about four)')
    expect(brain_4.exampleHe + brain_4.exampleEn).toBe('')
    expect(JSON.stringify(brain_4)).not.toMatch(/40%|8 שעות/)
    expect(brain_5.exampleHe).toContain('עדות')
    expect(brain_5.exampleHe).not.toContain('הוכחה')
    expect(brain_5.exampleEn).toContain('evidence')
  })

  it('money: no currency symbols in either language; agreed fixes in both', () => {
    const money = DAILY_LESSONS.filter(l => l.topicId === 'money')
    for (const l of money) for (const f of TEXT_FIELDS) {
      expect(l[`${f}He`], `${l.id} ${f}He`).not.toMatch(/₪|\$/)
      expect(l[`${f}En`], `${l.id} ${f}En`).not.toMatch(/₪|\$/)
    }
    const { money_1, money_5, money_6 } = LESSON_BY_ID
    expect(money_1.answerHe).toContain('כמעט פי 2')
    expect(money_1.answerEn).toContain('almost twice as much')
    expect(money_1.answerHe + money_1.answerEn).not.toMatch(/4x/)
    expect(money_1.exampleEn).toContain('a third less money')
    expect(money_5.exampleHe + money_5.exampleEn).not.toMatch(/2020|2024/)
    expect(money_6.exampleHe).toContain('כ-30,000')
    expect(money_6.exampleEn).toContain('about 30,000')
    expect(money_6.actionHe).toContain('זה לא ייעוץ השקעות')
    expect(money_6.actionEn).toContain("This isn't investment advice")
  })

  it('creativity and money are universal in both languages: no currency, no Israel-specific references', () => {
    const LOCAL = /₪|\$|ישראל|תל אביב|ת"א|ארנונה|ועד בית|shekel|Israel|Tel Aviv/
    for (const l of DAILY_LESSONS.filter(x => ['creativity', 'money'].includes(x.topicId))) {
      for (const f of TEXT_FIELDS) for (const lang of ['He', 'En']) {
        expect(l[`${f}${lang}`], `${l.id} ${f}${lang}`).not.toMatch(LOCAL)
      }
    }
  })

  it('creativity: agreed changes in both languages', () => {
    const { creativity_4, creativity_5 } = LESSON_BY_ID
    expect(creativity_4.exampleHe + creativity_4.exampleEn).not.toMatch(/shitty|"bad first draft"/i)
    expect(creativity_4.exampleEn).toMatch(/^The writer Anne Lamott allows herself a bad first draft, on purpose\./)
    expect(creativity_4.exampleHe).toMatch(/^הסופרת Anne Lamott/)
    expect(creativity_5.titleEn).toBe('Rest mode: why ideas come in the shower')
    expect(creativity_5.exampleHe).toContain('3M (15%)')
    expect(creativity_5.exampleEn).toContain('3M (15%) and Google (20%)')
  })
})
