import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import he from '../i18n/he'

const counted = vi.hoisted(() => [])
vi.mock('../services/funnel', () => ({ countFunnel: k => { counted.push(k); return true } }))
vi.mock('../context/LangContext', () => ({ useLang: () => ({ t: he, lang: 'he' }) }))

const { default: FromZeroFlow } = await import('../components/FromZeroFlow')

describe('first-run flow funnel counters', () => {
  beforeEach(() => { counted.length = 0 })

  it('opened → picked a bad habit → closed', () => {
    const onClose = vi.fn()
    render(<FromZeroFlow onSave={() => {}} onRegular={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.scroll.label)))
    fireEvent.click(screen.getByLabelText(he.fromZero.close))
    expect(counted).toEqual(['fz_open', 'fz_bad', 'fz_close'])
    expect(onClose).toHaveBeenCalled()
  })

  it('saving is not a close, and going back to step 1 counts the bad habit once', async () => {
    const onSave = vi.fn().mockResolvedValue()
    render(<FromZeroFlow onSave={onSave} onRegular={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.scroll.label)))
    fireEvent.click(screen.getByText(he.fromZero.back))
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.smoke.label)))
    fireEvent.click(screen.getByText(/נשימות עמוקות/))
    fireEvent.click(screen.getByText(he.fromZero.save))
    await Promise.resolve()
    expect(counted).toEqual(['fz_open', 'fz_bad'])
  })

  it('"add habit" later counts nothing', () => {
    render(<FromZeroFlow later onSave={() => {}} onRegular={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByText(new RegExp(he.fromZero.bad.scroll.label)))
    fireEvent.click(screen.getByLabelText(he.fromZero.close))
    expect(counted).toEqual([])
  })
})
