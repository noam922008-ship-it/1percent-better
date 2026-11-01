import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { buildFromZero, BAD_IDS, GOOD } from '../utils/fromZero'
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
      for (const id of Object.keys(GOOD)) expect(t.fromZero.good[id].title).toContain('{n}')
      expect(t.fromZero.titles).toHaveLength(5)
    }
  })
  it('Hebrew flow copy does not address the user as "אתה"', () => {
    expect(JSON.stringify(he.fromZero)).not.toMatch(/אתה/)
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
    fireEvent.click(screen.getByText(/עמודים בספר/))
    fireEvent.click(screen.getByLabelText(he.fromZero.more))
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.times[3].label))
    fireEvent.click(screen.getByText(he.fromZero.next))
    fireEvent.click(screen.getByText(he.fromZero.save))
    const list = onSave.mock.calls[0][0]
    expect(list).toHaveLength(2)
    expect(list[1]).toMatchObject({ habit: '3 עמודים בספר', cue: 'כשבא לי לעשן', time: '23:00' })
  })
  it('"I have some habits" goes to the regular flow', () => {
    const onRegular = vi.fn()
    render(<FromZeroFlow onSave={() => {}} onRegular={onRegular} onClose={() => {}} />)
    fireEvent.click(screen.getByText(he.fromZero.start.some))
    expect(onRegular).toHaveBeenCalled()
  })
})
