import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import he from '../i18n/he'
import en from '../i18n/en'
import { BOXING_LEVELS, L1_TECHNIQUES } from '../data/boxingPath'
import { MT_LEVELS, MT_L1_TECHNIQUES } from '../data/muayThaiPath'
import { DRILL_CATEGORIES, DRILL_DURATIONS, buildDrill } from '../data/boxingDrills'
import { INSTANT_BOXING_WORKOUT, INSTANT_MT_WORKOUT } from '../data/instantWorkouts'
import { TRAINING_TRACKS, TRACK_MAP } from '../data/trainingTracks'

// Phase 4: the Workouts tab and every screen it opens have no Hebrew UI left when English is on.
// Content stays Hebrew for now: round instructions, safety notes, coaching cues, workout goals, technique names
// and TrainingMode's spoken coach lines. Level / workout / round titles have English (titleEn).
const lang = { current: 'en' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he, englishEnabled: true }),
}))
vi.mock('../services/poseService', () => ({
  loadPoseLandmarker: async () => null, analyzeFrame: () => ({}), analyzeBoxingForm: () => ({ violations: [] }), drawSkeleton: () => {},
}))
vi.mock('../services/squadService', () => ({ syncWeeklyReps: async () => {} }))
vi.mock('../services/coachService', () => ({ analyzeSession: async () => '', coachConfigured: () => false }))
vi.mock('../services/hapticService', () => ({ hapticRep: () => {}, hapticMilestone: () => {}, hapticGoal: () => {} }))
vi.mock('../services/boxingVideoService', () => ({}))

import WorkoutsScreen from '../pages/WorkoutsScreen'
import ActiveWorkout from '../components/ActiveWorkout'
import TrainingMode from '../components/TrainingMode'
import BoxingPathScreen from '../components/boxing/BoxingPathScreen'
import BoxingWorkoutPreview from '../components/boxing/BoxingWorkoutPreview'
import BoxingDrillTimer from '../components/boxing/BoxingDrillTimer'
import BoxingCompletion from '../components/boxing/BoxingCompletion'
import MuayThaiPathScreen from '../components/muaythai/MuayThaiPathScreen'
import CombatWorkoutPreview from '../components/combat/CombatWorkoutPreview'
import CombatActiveWorkout from '../components/combat/CombatActiveWorkout'
import CombatCompletion from '../components/combat/CombatCompletion'

const HEBREW = /[֐-׿]/

// Same check as i18nHome.test.jsx: visible text plus placeholder / aria-label / title.
// `allowed`: Hebrew content from data/ that stays Hebrew in this phase.
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

// Content of a workout that stays Hebrew in this phase
const content = w => [
  w.goalHe, w.descriptionHe, ...(w.safetyNotesHe ?? []), ...(w.techniques ?? []),
  ...(w.rounds ?? []).flatMap(r => [r.instructionHe, ...(r.coachingCuesHe ?? [])]),
]

const L1_W1 = BOXING_LEVELS[0].workouts[0]
const MT_W1 = MT_LEVELS[0].workouts[0]
const mtOptions = t => [{ id: 'shadow', emoji: '👤' }, { id: 'bag', emoji: '🥊' }].map(o => ({ ...o, ...t.workouts.combat.mt.options[o.id] }))
const mtReflect = t => Object.entries(t.workouts.combat.mt.reflect).map(([id, label]) => ({ id, label }))

beforeEach(() => {
  lang.current = 'en'
  localStorage.clear()
})

describe('English Workouts tab has no Hebrew', () => {
  it('tab: categories, exercise cards, start buttons', () => {
    const onStart = vi.fn()
    const { container } = render(<WorkoutsScreen onStartWorkout={onStart} />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('Choose a workout')).toBeTruthy()
    fireEvent.click(screen.getByLabelText('Start Dips'))
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'dips', name: 'Dips', desc: 'Triceps and chest' }))
  })

  it('cardio: timer, start and done screens', () => {
    const { container } = render(<ActiveWorkout track={TRACK_MAP['cardio-walk']} goal={15} onComplete={() => {}} onClose={() => {}} />)
    expect(hebrewIn(container)).toEqual([])
    expect(screen.getByText('Walking')).toBeTruthy()
    expect(screen.getAllByText('Goal: 15 min')).toHaveLength(2) // header + timer ring
  })

  it('reps: camera fallback, manual entry and the set summary', async () => {
    const { container } = render(<ActiveWorkout track={TRACK_MAP['strength-squats']} goal={10} onComplete={() => {}} onClose={() => {}} />)
    await screen.findByText('Or enter by hand')
    expect(hebrewIn(container)).toEqual([])
    fireEvent.change(screen.getByPlaceholderText('Goal: 10 reps'), { target: { value: '4' } })
    fireEvent.click(screen.getByText('Save →'))
    await screen.findByText('Save and close →')
    expect(hebrewIn(container)).toEqual([])
    expect(JSON.parse(localStorage.getItem('prime_set_log'))[0].exerciseName).toBe('Squats')
  })

  it('free training: style and intensity picker', () => {
    const { container } = render(<TrainingMode onClose={() => {}} onAwardXP={() => {}} />)
    expect(hebrewIn(container)).toEqual([])
    fireEvent.click(screen.getByText('Muay Thai'))
    expect(screen.getByText(/Muay Thai — choose intensity/)).toBeTruthy()
    expect(hebrewIn(container)).toEqual([])
  })

  it('boxing path: home, guided path open, drill settings (technique names excluded)', () => {
    const { container } = render(<BoxingPathScreen profile={null} onStartWorkout={() => {}} onFreeTraining={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText('Guided path'))
    expect(hebrewIn(container, L1_TECHNIQUES)).toEqual([])
    expect(screen.getAllByText('Level 1 · Stance and guard').length).toBeGreaterThan(0)
    expect(screen.getByText(/No equipment/)).toBeTruthy()
    fireEvent.click(screen.getByText('Footwork'))
    expect(screen.getByText('How long?')).toBeTruthy()
    expect(hebrewIn(container)).toEqual([])
  })

  it('boxing preview, drill timer, guided timer and completion (content excluded)', () => {
    let r = render(<BoxingWorkoutPreview workout={L1_W1} levelNum={1} onStart={() => {}} onInstant={() => {}} onBack={() => {}} />)
    expect(hebrewIn(r.container, content(L1_W1))).toEqual([])
    expect(screen.getByText('Fighting stance and guard')).toBeTruthy()
    r.unmount()

    const drill = buildDrill('footwork', 5)
    r = render(<BoxingDrillTimer workout={drill} onComplete={() => {}} onExit={() => {}} />)
    expect(hebrewIn(r.container, content(drill))).toEqual([])
    expect(screen.getByText('Footwork — 5 min')).toBeTruthy()
    r.unmount()

    r = render(<CombatActiveWorkout workout={L1_W1} onComplete={() => {}} onExit={() => {}} />)
    expect(hebrewIn(r.container, content(L1_W1))).toEqual([])
    r.unmount()

    r = render(<BoxingCompletion workout={L1_W1} stats={{ durationSeconds: 754, roundsCompleted: 3, techniques: ['a'] }} xpAwarded={0} nextWorkout={BOXING_LEVELS[0].workouts[1]} levelJustCompleted={null} onDone={() => {}} />)
    expect(hebrewIn(r.container)).toEqual([])
    expect(screen.getByText('12:34 min')).toBeTruthy()
  })

  it('Muay Thai path, preview with gear check and completion (content excluded)', () => {
    let r = render(<MuayThaiPathScreen profile={null} onStartWorkout={() => {}} onFreeTraining={() => {}} onClose={() => {}} onQuickLegWork={() => {}} onQuickHandsElbows={() => {}} quickDuration={5} />)
    expect(hebrewIn(r.container, MT_L1_TECHNIQUES)).toEqual([])
    expect(screen.getByText(/No equipment/)).toBeTruthy()
    r.unmount()

    r = render(<CombatWorkoutPreview workout={MT_W1} levelNum={1} trainingOptions={mtOptions(en)} bagWarningLabel={en.home.combat.bagWarning} onStart={() => {}} onInstant={() => {}} onBack={() => {}} />)
    fireEvent.click(screen.getByText('Bag'))
    expect(screen.getByText('Confirm your gear first')).toBeTruthy()
    expect(hebrewIn(r.container, content(MT_W1))).toEqual([])
    r.unmount()

    r = render(<CombatCompletion disciplineEmoji="🦵" completionTitle={en.home.combat.complete} levels={MT_LEVELS} reflectionOptions={mtReflect(en)} workout={MT_W1} stats={{ durationSeconds: 40, roundsCompleted: 2 }} xpAwarded={20} nextWorkout={MT_LEVELS[0].workouts[1]} levelJustCompleted={1} onDone={() => {}} />)
    expect(hebrewIn(r.container)).toEqual([])
    expect(screen.getByText('Level 1 complete!')).toBeTruthy()
  })
})

describe('Hebrew is unchanged', () => {
  beforeEach(() => { lang.current = 'he' })

  it('tab keeps its Hebrew copy and passes the Hebrew name', () => {
    const onStart = vi.fn()
    render(<WorkoutsScreen onStartWorkout={onStart} />)
    expect(screen.getByText('בחר אימון')).toBeTruthy()
    expect(screen.getByText('— שכיבות, מתח, סקוואטים')).toBeTruthy()
    fireEvent.click(screen.getByLabelText('התחל מקבילים'))
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ name: 'מקבילים', desc: 'טריצפס וחזה' }))
  })

  it('equipment id "none" still shows "ללא ציוד"', () => {
    render(<BoxingWorkoutPreview workout={L1_W1} levelNum={1} onStart={() => {}} onBack={() => {}} />)
    expect(screen.getAllByText('ללא ציוד').length).toBeGreaterThan(0)
    expect(screen.queryByText('none')).toBeNull()
  })

  it('boxing path card says "ללא ציוד", titles and drill labels stay Hebrew', () => {
    render(<BoxingPathScreen profile={null} onStartWorkout={() => {}} onFreeTraining={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText('מסלול מודרך'))
    expect(screen.getByText(/15 דקות · מתחילים · ללא ציוד|12 דקות · מתחילים · ללא ציוד/)).toBeTruthy()
    expect(screen.getAllByText('רמה 1 · עמידה והגנה').length).toBeGreaterThan(0)
    expect(screen.getByText('עבודת רגליים')).toBeTruthy()
  })

  it('timer and completion keep their Hebrew format', () => {
    let r = render(<BoxingDrillTimer workout={buildDrill('footwork', 5)} onComplete={() => {}} onExit={() => {}} />)
    expect(screen.getByText('עבודת רגליים — 5 דקות')).toBeTruthy()
    r.unmount()
    r = render(<BoxingCompletion workout={L1_W1} stats={{ durationSeconds: 754, roundsCompleted: 3 }} xpAwarded={0} nextWorkout={BOXING_LEVELS[0].workouts[1]} onDone={() => {}} />)
    expect(screen.getByText('12:34 דק׳')).toBeTruthy()
    expect(screen.getByText('XP כבר נצבר היום')).toBeTruthy()
    expect(screen.getByText('אימון 2 מתוך 6 · 15 דקות')).toBeTruthy()
  })

  it('combo glossary reads out the same Hebrew combos as before', () => {
    const m = he.workouts.free.moves
    expect([m.jab, m.cross].join(', ')).toBe('ג׳אב, קרוס')
    expect([m.doubleJab, m.cross, m.hook, m.lowKick, m.knee].join(', ')).toBe('ג׳אב כפול, קרוס, הוק, בעיטה נמוכה, ברך')
  })

  it('track labels in he.js match data/trainingTracks.js', () => {
    for (const tr of TRAINING_TRACKS) {
      expect(he.workouts.tracks[tr.id], tr.id).toEqual({ name: tr.name, description: tr.description, unit: tr.unit })
    }
  })
})

describe('Phase 4 data', () => {
  // Walks exported data; every object with titleHe has a non-empty English title
  function missingEn(root) {
    const missing = []
    const seen = new Set()
    const walk = o => {
      if (!o || typeof o !== 'object' || seen.has(o)) return
      seen.add(o)
      if (typeof o.titleHe === 'string' && !(typeof o.titleEn === 'string' && o.titleEn && !HEBREW.test(o.titleEn))) missing.push(o.titleHe)
      if (typeof o.labelHe === 'string' && !o.labelEn) missing.push(o.labelHe)
      if (typeof o.descHe === 'string' && !o.descEn) missing.push(o.descHe)
      Object.values(o).forEach(walk)
    }
    walk(root)
    return missing
  }

  it('every level, workout, round and drill has an English title', () => {
    const drills = DRILL_CATEGORIES.map(c => c.id).concat('mt-elbows').flatMap(id => DRILL_DURATIONS.map(d => buildDrill(id, d)))
    expect(missingEn([BOXING_LEVELS, MT_LEVELS, DRILL_CATEGORIES, INSTANT_BOXING_WORKOUT, INSTANT_MT_WORKOUT, drills])).toEqual([])
  })

  it('equipment is stored as ids with a label in both languages', () => {
    const ids = new Set([...BOXING_LEVELS, ...MT_LEVELS].flatMap(l => l.workouts.flatMap(w => w.equipment ?? []))
      .concat(INSTANT_BOXING_WORKOUT.equipment, INSTANT_MT_WORKOUT.equipment))
    for (const id of ids) {
      expect(he.workouts.combat.equipment[id], id).toBeTruthy()
      expect(en.workouts.combat.equipment[id], id).toBeTruthy()
    }
  })
})

describe('Phase 4 files', () => {
  const files = [
    'pages/WorkoutsScreen', 'components/ActiveWorkout', 'components/TrainingMode',
    'components/boxing/BoxingPathScreen', 'components/boxing/BoxingWorkoutPreview', 'components/boxing/BoxingDrillTimer',
    'components/boxing/BoxingCompletion', 'components/combat/CombatPathScreen', 'components/combat/CombatWorkoutPreview',
    'components/combat/CombatActiveWorkout', 'components/combat/CombatCompletion', 'components/muaythai/MuayThaiPathScreen',
  ]

  it('no hard-coded rtl, right/left alignment or physical accent stripes', () => {
    for (const f of files) {
      // Camera overlays sit on the video at fixed corners in both directions (the "me vs future me" widget is top-left)
      const src = readFileSync(`src/${f}.jsx`, 'utf8').replace("cursor: 'pointer', textAlign: 'left',", '')
      expect(src, f).not.toMatch(/dir="rtl"|direction: 'rtl'|textAlign: '(right|left)'|border(Right|Left):|margin(Right|Left):/)
    }
  })

  it('every workouts key exists in both languages', () => {
    const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    expect(keys(en.workouts).sort()).toEqual(keys(he.workouts).sort())
  })
})
