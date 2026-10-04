import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Firebase "configured" — so anything that stays off is off because of FEATURES.ai
const { callable } = vi.hoisted(() => ({ callable: vi.fn(async () => ({ data: { text: 'x' } })) }))
vi.mock('firebase/functions', () => ({ httpsCallable: vi.fn(() => callable) }))
vi.mock('../services/firebase', () => ({ functions: {}, storage: {}, db: {}, auth: {} }))

import { FEATURES } from '../config/features'
import { callGemini, geminiAvailable } from '../services/geminiClient'
import { suggestChallenge, analyzeVideoForm, coachConfigured } from '../services/coachService'
import { analyzeBoxingVideo, videoAnalysisAvailable } from '../services/boxingVideoService'
import BoxingPathScreen from '../components/boxing/BoxingPathScreen'

describe('launch without AI (FEATURES.ai = false)', () => {
  it('the flag is off', () => {
    expect(FEATURES.ai).toBe(false)
  })

  it('callGemini fails before any network call; nothing reports AI as available', async () => {
    await expect(callGemini({ prompt: 'hi' })).rejects.toThrow('AI is turned off')
    expect(callable).not.toHaveBeenCalled()
    expect(geminiAvailable()).toBe(false)
    expect(coachConfigured()).toBe(false)
    expect(videoAnalysisAvailable()).toBe(false)
  })

  it('services fall back instead of breaking', async () => {
    const challenge = await suggestChallenge('high', 30, 'fitness')
    expect(challenge).toBeTruthy()
    expect(await analyzeVideoForm('AAAA', 'pushups')).toBeNull()
    await expect(analyzeBoxingVideo('u1', new File(['x'], 'a.mp4'))).rejects.toThrow()
    expect(callable).not.toHaveBeenCalled()
  })

  it('boxing screen hides photo and video analysis', () => {
    render(<BoxingPathScreen profile={{}} onStartWorkout={() => {}} onFreeTraining={() => {}} onClose={() => {}} onDrillComplete={() => {}} />)
    expect(screen.getByText('עבודת רגליים')).toBeInTheDocument()
    expect(screen.queryByText('בדיקת עמידה מתמונה')).toBeNull()
    expect(screen.queryByText('ניתוח סשן')).toBeNull()
  })
})
