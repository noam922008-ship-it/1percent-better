import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Habits can be "every day" or "X times a week" — Home copy mustn't call every habit daily.
describe('Home habit copy', () => {
  const src = readFileSync('src/pages/Dashboard.jsx', 'utf8')

  it('the add-habit button and empty state never say "הרגל יומי"', () => {
    expect(src).not.toMatch(/הוסף הרגל יומי/)
  })
})
