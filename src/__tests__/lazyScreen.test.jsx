import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import lazyScreen from '../utils/lazyScreen'

describe('screens load on first open', () => {
  it('renders the screen once its code arrives, passing props through', async () => {
    const Hello = lazyScreen(async () => ({ default: ({ name }) => <div>Hello {name}</div> }))
    render(<Hello name="Noam" />)
    expect(await screen.findByText('Hello Noam')).toBeInTheDocument()
  })
})
