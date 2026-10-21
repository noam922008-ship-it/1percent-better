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

export function inAppBrowser(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  for (const [name, re] of IN_APP) if (re.test(ua || '')) return name
  return null
}

export function isIOS(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  return /iPhone|iPad|iPod/i.test(ua || '')
}

// A link that leaves the in-app browser: Safari on iOS 17+ (x-safari-https), Chrome on Android
// (intent://, falls back to the same page if Chrome isn't installed). Null when there's no trick.
export function externalBrowserUrl(href, ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  let u
  try { u = new URL(href) } catch { return null }
  if (u.protocol !== 'https:') return null
  if (isIOS(ua)) return 'x-safari-' + u.href
  if (/Android/i.test(ua || '')) {
    return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`
  }
  return null
}
