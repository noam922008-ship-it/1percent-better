import { describe, it, expect } from 'vitest'
import { inAppBrowser, externalBrowserUrl } from '../utils/inAppBrowser'

const IG_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 345.0.0.0 (iPhone15,2; iOS 17_5; he_IL)'
const IG_ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0 Mobile Safari/537.36 Instagram 345.0.0.0 Android'
const TIKTOK = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_34.1.0 BytedanceWebview/d8a21c6'
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

describe('inAppBrowser', () => {
  it('spots Instagram, TikTok and Facebook', () => {
    expect(inAppBrowser(IG_IOS)).toBe('instagram')
    expect(inAppBrowser(IG_ANDROID)).toBe('instagram')
    expect(inAppBrowser(TIKTOK)).toBe('tiktok')
    expect(inAppBrowser('Mozilla/5.0 [FBAN/FBIOS;FBAV/450.0]')).toBe('facebook')
  })
  it('leaves real browsers alone', () => {
    expect(inAppBrowser(SAFARI)).toBeNull()
    expect(inAppBrowser('')).toBeNull()
  })
})

describe('externalBrowserUrl', () => {
  const href = 'https://prime-app-84fe0.web.app/welcome?utm_source=instagram'
  it('iOS → Safari scheme', () => {
    expect(externalBrowserUrl(href, IG_IOS)).toBe('x-safari-' + href)
  })
  it('Android → Chrome intent with a fallback to the same page', () => {
    const u = externalBrowserUrl(href, IG_ANDROID)
    expect(u.startsWith('intent://prime-app-84fe0.web.app/welcome?utm_source=instagram#Intent;scheme=https;package=com.android.chrome;')).toBe(true)
    expect(u).toContain('S.browser_fallback_url=' + encodeURIComponent(href))
  })
  it('nothing for desktop or non-https', () => {
    expect(externalBrowserUrl(href, 'Mozilla/5.0 (Macintosh)')).toBeNull()
    expect(externalBrowserUrl('http://x.com', IG_IOS)).toBeNull()
  })
})
