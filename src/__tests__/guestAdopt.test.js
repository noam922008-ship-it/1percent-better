import { describe, it, expect, beforeEach } from 'vitest'
import { guestTriggersToAdopt, markGuestTriggersAdopted, loadGuestTriggers } from '../utils/guestHabits'

const habit = { id: 't1', title: 'Water' }

describe('guest habits → account', () => {
  beforeEach(() => localStorage.clear())

  it('adopts guest habits into an account with no habits', () => {
    expect(guestTriggersToAdopt({}, [habit])).toEqual([habit])
    expect(guestTriggersToAdopt({ triggers: [] }, [habit])).toEqual([habit])
  })

  it('never touches an account that already has habits', () => {
    expect(guestTriggersToAdopt({ triggers: [{ id: 'x' }] }, [habit])).toBeNull()
  })

  it('does nothing without guest habits', () => {
    expect(guestTriggersToAdopt({}, [])).toBeNull()
  })

  it('moves the guest list aside after adopting so it is not adopted twice', () => {
    localStorage.setItem('prime_guest_triggers', JSON.stringify([habit]))
    markGuestTriggersAdopted()
    expect(loadGuestTriggers()).toEqual([])
    expect(JSON.parse(localStorage.getItem('prime_guest_triggers_adopted'))).toEqual([habit])
  })
})
