import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import { FEATURES } from '../config/features'

// FEATURES.ai off → no proxy: callGemini throws before any network call and
// geminiAvailable() is false, so every caller takes its non-AI fallback.
const _proxy = FEATURES.ai && functions
  ? httpsCallable(functions, 'analyzeWithGemini', { timeout: 30000 })
  : null

/**
 * Call the secure Gemini proxy Cloud Function.
 * Throws if Firebase is not configured or the request fails.
 *
 * @param {{ prompt?, imageBase64?, imageMimeType?, systemInstruction?, model? }} data
 * @returns {Promise<string>} — Gemini response text
 */
export async function callGemini(data) {
  if (!_proxy) throw new Error(FEATURES.ai ? 'Firebase not configured' : 'AI is turned off')
  const result = await _proxy(data)
  return result.data.text
}

export function geminiAvailable() {
  return !!_proxy
}
