// In-app browsers (Instagram, Facebook, TikTok…) open links from DMs and bios inside the app.
// Google blocks sign-in there (403 disallowed_useragent), so the welcome screen offers to
// reopen the page in the phone's real browser, and puts "continue as guest" first.

const IN_APP = [
  ['instagram', /Instagram/i],
  ['facebook',  /FBAN|FBAV|FB_IAB|FBIOS/i],
  ['tiktok',    /musical_ly|TikTok|BytedanceWebview|Bytedance/i],
  ['line',      /\bLine\//i],
  ['snapchat',  /Snapchat/i],
]

// An installed Home Screen app on iPhone also has no "Safari/" in its user agent — never call it in-app
function runningStandalone() {
  try {
    return (typeof navigator !== 'undefined' && navigator.standalone === true)
      || (typeof window !== 'undefined' && !!window.matchMedia?.('(display-mode: standalone)').matches)
  } catch { return false }
}

// Some iPhone apps open links in a bare web view that doesn't name the app (seen in TikTok DMs,
// Nov 2026: the user agent just ends in "Mobile/15E148"). Real iPhone browsers all add a token:
// Safari "Safari/…", Chrome "CriOS", Firefox "FxiOS", Edge "EdgiOS", Opera "OPiOS", Google app "GSA/".
const IOS_BROWSER = /Safari\/|CriOS|FxiOS|EdgiOS|OPiOS|GSA\//

export function inAppBrowser(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : ''), standalone = runningStandalone()) {
  for (const [name, re] of IN_APP) if (re.test(ua || '')) return name
  if (/iPhone|iPad|iPod/i.test(ua || '') && !IOS_BROWSER.test(ua) && !standalone) return 'webview'
  return null
}

/** In-app browsers without an "open in browser" menu: the way out is copying the link. */
export function needsCopyLink(name) { return name === 'tiktok' || name === 'webview' }

export function isIOS(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  return /iPhone|iPad|iPod/i.test(ua || '')
}

// A link that leaves the in-app browser: Chrome on Android (intent://, falls back to the same page
// if Chrome isn't installed). Null on iPhone — Instagram blocks the x-safari-https trick there
// (tested Oct 2026), so iPhone users get the manual "⋯ → open in external browser" hint instead.
export function externalBrowserUrl(href, ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  let u
  try { u = new URL(href) } catch { return null }
  if (u.protocol !== 'https:') return null
  if (isIOS(ua)) return null
  if (/Android/i.test(ua || '')) {
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`
  }
  return null
}
