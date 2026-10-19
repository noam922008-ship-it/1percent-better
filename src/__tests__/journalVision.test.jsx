import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import he from '../i18n/he'
import en from '../i18n/en'

const lang = { current: 'he' }
vi.mock('../context/LangContext', () => ({
  useLang: () => ({ lang: lang.current, setLang: () => {}, t: lang.current === 'en' ? en : he }),
}))
vi.mock('../services/analytics', () => ({ track: () => {} }))
vi.mock('../services/myTasksService', () => ({ addTask: async () => 'x' }))
vi.mock('../services/journalService', () => ({
  MAX_TEXT_LEN: 5000, MAX_ANSWER_LEN: 1000,
  isEmptyEntry: e => !e.text && !e.important && !e.step,
  firstLine: e => e.text,
  subscribeEntries: (uid, cb) => { cb([]); return () => {} },
  addEntry: async () => {}, updateEntry: async () => {}, deleteEntry: async () => {},
}))

import Journal from '../components/Journal'

describe('vision at the top of the progress journal', () => {
  beforeEach(() => { lang.current = 'he' })

  it('shows the vision written at setup', () => {
    render(<Journal uid="u1" onClose={() => {}} vision="בעוד שנה אני רץ 10 ק״מ" onSaveVision={async () => {}} />)
    expect(screen.getByText(he.journal.visionLabel)).toBeInTheDocument()
    expect(screen.getByText('בעוד שנה אני רץ 10 ק״מ')).toBeInTheDocument()
  })

  it('no vision yet: invites to add one and saves it', async () => {
    const save = vi.fn(async () => {})
    lang.current = 'en'
    render(<Journal uid="u1" onClose={() => {}} vision="" onSaveVision={save} />)
    expect(screen.getByText(en.journal.visionEmpty)).toBeInTheDocument()
    fireEvent.click(screen.getByText(en.journal.visionAdd))
    fireEvent.change(screen.getByPlaceholderText(en.journal.visionPh), { target: { value: '  Run a half marathon  ' } })
    fireEvent.click(screen.getByText(en.journal.visionSave))
    await waitFor(() => expect(save).toHaveBeenCalledWith('Run a half marathon'))
  })

  it('guests (no save function) see no vision card', () => {
    render(<Journal uid={null} onClose={() => {}} />)
    expect(screen.queryByText(he.journal.visionLabel)).toBeNull()
  })

  it('Hebrew and English have the same journal keys', () => {
    expect(Object.keys(en.journal).sort()).toEqual(Object.keys(he.journal).sort())
  })
})
