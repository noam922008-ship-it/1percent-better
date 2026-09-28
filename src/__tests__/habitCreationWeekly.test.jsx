import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HabitCreationFlow from '../components/HabitCreationFlow'

function create(existingCount = 0) {
  const saved = []
  render(<HabitCreationFlow growthPillars={['body']} existingCount={existingCount} onSave={d => saved.push(d)} onClose={() => {}} />)
  return saved
}

function toScheduleStep(title = 'ריצה') {
  fireEvent.click(screen.getByText('+ צור הרגל מותאם אישית'))
  fireEvent.change(screen.getByPlaceholderText('למשל: קרא 10 עמודים'), { target: { value: title } })
  fireEvent.click(screen.getByText('המשך ←'))
  fireEvent.click(screen.getByText('אחרי העבודה / הלימודים'))
  fireEvent.click(screen.getByText('המשך ←'))
}

describe('HabitCreationFlow — frequency', () => {
  it('saves a weekly habit with times, days and time', () => {
    const saved = create()
    toScheduleStep()
    fireEvent.click(screen.getByText('כמה פעמים בשבוע'))
    fireEvent.click(screen.getByLabelText('פחות'))          // 3 → 2
    fireEvent.click(screen.getByText('ה׳'))
    fireEvent.click(screen.getByText('א׳'))
    fireEvent.change(screen.getByLabelText('שעת תזכורת'), { target: { value: '18:30' } })
    fireEvent.click(screen.getByText('הוסף הרגל ✓'))
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      cue: 'אחרי העבודה / הלימודים', habit: 'ריצה',
      frequency: { type: 'weekly', timesPerWeek: 2 }, days: [0, 4], time: '18:30',
    })
  })

  it('defaults to every day, with no days', () => {
    const saved = create()
    toScheduleStep('קריאה')
    fireEvent.click(screen.getByText('הוסף הרגל ✓'))
    expect(saved[0]).toMatchObject({ habit: 'קריאה', frequency: { type: 'daily' }, days: [], time: null })
  })

  it('caps times per week at 6', () => {
    create()
    toScheduleStep()
    fireEvent.click(screen.getByText('כמה פעמים בשבוע'))
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByLabelText('יותר'))
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByLabelText('יותר')).toBeDisabled()
  })

  it('allows up to 5 active habits', () => {
    create(4)
    expect(screen.getByText('+ צור הרגל מותאם אישית')).toBeInTheDocument()
  })

  it('blocks a 6th habit', () => {
    create(5)
    expect(screen.getByText(/חמישה הרגלים זה המקסימום/)).toBeInTheDocument()
  })
})
