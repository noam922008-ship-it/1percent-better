import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { buildFromZero, BAD_IDS, GOOD, REPLACE, shiftTime, fromZeroAge, moreCardDismissed, dismissMoreCard, guideFor, GUIDE_FOR, EN_GUIDES, allGuides } from '../utils/fromZero'
import he from '../i18n/he'
import en from '../i18n/en'

vi.mock('../context/LangContext', async () => {
  const he = (await import('../i18n/he')).default
  return { useLang: () => ({ t: he, lang: 'he' }) }
})
import FromZeroFlow from '../components/FromZeroFlow'

describe('buildFromZero', () => {
  it('makes a quit habit and a daily habit that replaces it, at the chosen time', () => {
    const [quit, build] = buildFromZero({ bad: { quit: 'בלי עישון', cue: 'כשבא לי לעשן' }, good: { title: '2 עמודים בספר' }, time: '23:00' }, '2026-11-01')
    expect(quit.frequency).toEqual({ type: 'quit' })
    expect(quit.quitStart).toBe('2026-11-01')
    expect(quit.habit).toBe('בלי עישון')
    expect(build).toMatchObject({ cue: 'כשבא לי לעשן', habit: '2 עמודים בספר', source: 'from-zero', frequency: { type: 'daily' }, time: '23:00' })
  })
})

describe('copy', () => {
  it('has every bad and good habit in both languages', () => {
    for (const t of [he, en]) {
      for (const id of BAD_IDS) expect(t.fromZero.bad[id].label && t.fromZero.bad[id].quit && t.fromZero.bad[id].cue).toBeTruthy()
      for (const [id, g] of Object.entries(GOOD)) {
        expect(t.fromZero.good[id].title).toBeTruthy()
        expect(t.fromZero.good[id].title.includes('{n}')).toBe(g.n != null)   // amount in the copy only where it can change
      }
      expect(t.fromZero.titles).toHaveLength(5)
    }
  })
  it('Hebrew flow copy does not address the user as "אתה"', () => {
    expect(JSON.stringify(he.fromZero)).not.toMatch(/אתה/)
  })
})

describe('replacements', () => {
  it('every bad habit has 3 replacements that exist', () => {
    for (const id of [...BAD_IDS, 'other']) {
      expect(REPLACE[id]).toHaveLength(3)
      for (const o of REPLACE[id]) expect(GOOD[o.id]).toBeTruthy()
    }
  })
  it('late nights get no push-ups', () => {
    expect(REPLACE.late.map(o => o.id)).not.toContain('push')
  })
  it('shiftTime moves the reminder earlier and wraps past midnight', () => {
    expect(shiftTime('23:00', 60)).toBe('22:00')
    expect(shiftTime('00:30', 60)).toBe('23:30')
    expect(shiftTime('08:00', 0)).toBe('08:00')
  })
})

describe('FromZeroFlow', () => {
  it('goes zero → bad → good → time → saves two habits', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<FromZeroFlow onSave={onSave} onRegular={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText(he.fromZero.start.zero))
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.smoke.label)))
    expect(screen.getByRole('note').textContent).toContain('6800')   // help note for smoking
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(/נשימות עמוקות/))   // smoking → breaths, not reading
    fireEvent.click(screen.getByLabelText(he.fromZero.more))
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.times[3].label))
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.save))
    const list = onSave.mock.calls[0][0]
    expect(list).toHaveLength(2)
    expect(list[1]).toMatchObject({ habit: '11 נשימות עמוקות', cue: 'כשבא לי לעשן', time: '23:00' })
  })
  it('late nights: no amount stepper for a fixed action, reminder an hour before bedtime', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<FromZeroFlow onSave={onSave} onRegular={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText(he.fromZero.start.zero))
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.late.label)))
    fireEvent.click(screen.getByText(he.fromZero.next))
    expect(screen.queryByText(/שכיבות סמיכה/)).toBeNull()
    fireEvent.click(screen.getByText(/הטלפון מחוץ למיטה/))
    expect(screen.queryByLabelText(he.fromZero.more)).toBeNull()
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.times[3].label))
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.save))
    expect(onSave.mock.calls[0][0][1]).toMatchObject({ habit: 'הטלפון מחוץ למיטה', time: '22:00' })
  })
  it('"I have some habits" goes to the regular flow', () => {
    const onRegular = vi.fn()
    render(<FromZeroFlow onSave={() => {}} onRegular={onRegular} onClose={() => {}} />)
    fireEvent.click(screen.getByText(he.fromZero.start.some))
    expect(onRegular).toHaveBeenCalled()
  })
})

describe('from-zero first week', () => {
  const pair = d => buildFromZero({ bad: { quit: 'בלי גלילה', cue: 'כשבא לי לגלול' }, good: { title: 'לקרוא' }, time: '20:00' }, d)
  it('counts days since the pair was made, null for everyone else', () => {
    expect(fromZeroAge(pair('2026-11-01'), '2026-11-01')).toBe(0)
    expect(fromZeroAge(pair('2026-11-01'), '2026-11-07')).toBe(6)
    expect(fromZeroAge(pair('2026-11-01'), '2026-11-08')).toBe(7)
    expect(fromZeroAge([{ habit: 'x', createdAt: '2026-11-01' }], '2026-11-08')).toBeNull()
    expect(fromZeroAge(pair('2026-11-01').map(t => ({ ...t, archived: true })), '2026-11-08')).toBeNull()
    expect(fromZeroAge([], '2026-11-08')).toBeNull()
  })
  it('the "add more" card is dismissed once per device', () => {
    const m = new Map(); const store = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }
    expect(moreCardDismissed(store)).toBe(false)
    dismissMoreCard(store)
    expect(moreCardDismissed(store)).toBe(true)
  })
})

describe('guide on Home', () => {
  it('keeps the bad habit on both habits and finds its guide', () => {
    const pair = buildFromZero({ bad: { quit: 'בלי גלילה', cue: 'כשבא לי לגלול' }, good: { title: 'לקרוא' }, time: '20:00', badId: 'scroll' }, '2026-11-04')
    expect(pair.every(t => t.badId === 'scroll')).toBe(true)
    expect(guideFor(pair)).toEqual({ id: 'scroll', slug: 'stop-scrolling', href: '/guides/stop-scrolling' })
    expect(guideFor(pair, 'en').href).toBe('/en/guides/stop-scrolling')
    const smoke = buildFromZero({ bad: { quit: 'q', cue: 'c' }, good: { title: 'g' }, time: '', badId: 'smoke' })
    expect(guideFor(smoke, 'en')).toBeNull()
    expect(guideFor(smoke, 'he').href).toBe('/guides/quit-smoking')
  })
  it('no guide for "other", unknown ids or older habits', () => {
    expect(buildFromZero({ bad: { quit: 'x', cue: 'y' }, good: { title: 'z' }, time: '', badId: 'other' })[0].badId).toBeUndefined()
    expect(guideFor([{ habit: 'old' }])).toBeNull()
    expect(guideFor([{ badId: 'smoke', archived: true }])).toBeNull()
  })
  it('every bad habit in the flow has a guide page', () => {
    for (const id of BAD_IDS) expect(GUIDE_FOR[id]).toBeTruthy()
  })
  it('every guide has a static page in each language it is listed in', async () => {
    const { existsSync } = await import('node:fs')
    for (const slug of Object.values(GUIDE_FOR)) expect(existsSync(`public/guides/${slug}/index.html`)).toBe(true)
    for (const slug of EN_GUIDES) expect(existsSync(`public/en/guides/${slug}/index.html`)).toBe(true)
  })
  it('allGuides lists every guide in the UI language', () => {
    expect(allGuides('he').map(g => g.id)).toEqual(BAD_IDS)
    const en = allGuides('en')
    expect(en.map(g => g.slug)).toEqual(BAD_IDS.map(id => GUIDE_FOR[id]).filter(s => EN_GUIDES.includes(s)))
    expect(en.find(g => g.id === 'porn').href).toBe('/en/guides/quit-porn')
    expect(allGuides('he').find(g => g.id === 'weed').href).toBe('/guides/quit-weed')
  })
})
