import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { buildFromZero, BAD_IDS, GOOD, REPLACE, shiftTime } from '../utils/fromZero'
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
