import { describe, it, expect } from 'vitest'
import { toggleFocus, restoreFocus, MAX_FOCUS } from '../utils/focusGoals'
import he from '../i18n/he'
import en from '../i18n/en'

describe('setup: several focus areas', () => {
  it('tap adds, tap again removes', () => {
    expect(toggleFocus([], 'fitness')).toEqual(['fitness'])
    expect(toggleFocus(['fitness', 'learning'], 'fitness')).toEqual(['learning'])
  })
  it(`no more than ${MAX_FOCUS}`, () => {
    expect(toggleFocus(['a', 'b', 'c'], 'd')).toEqual(['a', 'b', 'c'])
  })
  it('restores old saved progress with one goal and the new list', () => {
    expect(restoreFocus({ goal: 'work' })).toEqual(['work'])
    expect(restoreFocus({ goals: ['work', 'creative'] })).toEqual(['work', 'creative'])
    expect(restoreFocus({})).toEqual([])
  })
  it('the screen says you can pick up to 3, in both languages', () => {
    expect(he.onboarding.goal.sub).toMatch(/3/)
    expect(en.onboarding.goal.sub).toMatch(/3/)
  })
})
