import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SocialLinks from '../components/SocialLinks'
import { SOCIAL } from '../config/social'

describe('SocialLinks', () => {
  it('links to Instagram in a new tab, safely', () => {
    render(<SocialLinks />)
    const ig = screen.getByLabelText('PRIME ב-Instagram')
    expect(ig).toHaveAttribute('href', 'https://instagram.com/prime.daily.app')
    expect(ig).toHaveAttribute('target', '_blank')
    expect(ig).toHaveAttribute('rel', 'noopener noreferrer')
  })
  it('shows only Instagram (no TikTok for now)', () => {
    render(<SocialLinks />)
    expect(SOCIAL.map(s => s.id)).toEqual(['instagram'])
    expect(screen.queryByLabelText('PRIME ב-TikTok')).toBeNull()
  })
})
