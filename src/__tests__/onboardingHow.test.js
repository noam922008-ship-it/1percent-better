import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'

describe('setup explains how PRIME works before the habits', () => {
  it('Hebrew and English explain the same three steps', () => {
    expect(he.onboarding.how.lines).toHaveLength(3)
    expect(en.onboarding.how.lines).toHaveLength(3)
  })
  it('both languages have the same keys on the explanation and the last screen', () => {
    expect(Object.keys(en.onboarding.how)).toEqual(Object.keys(he.onboarding.how))
    expect(Object.keys(en.onboarding.done)).toEqual(Object.keys(he.onboarding.done))
  })
})
