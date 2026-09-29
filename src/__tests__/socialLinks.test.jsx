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
  it('hides a profile without a URL (TikTok until the username is set)', () => {
    render(<SocialLinks />)
    const tiktok = SOCIAL.find(s => s.id === 'tiktok')
    if (!tiktok.url) expect(screen.queryByLabelText('PRIME ב-TikTok')).toBeNull()
    else expect(screen.getByLabelText('PRIME ב-TikTok')).toHaveAttribute('href', tiktok.url)
  })
})
