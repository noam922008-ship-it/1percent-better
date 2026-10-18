import { describe, it, expect } from 'vitest'
import he from '../i18n/he'
import en from '../i18n/en'

describe('setup ends with "how PRIME works"', () => {
  it('Hebrew and English explain the same three steps', () => {
    expect(he.onboarding.done.how).toHaveLength(3)
    expect(en.onboarding.done.how).toHaveLength(3)
  })
})
