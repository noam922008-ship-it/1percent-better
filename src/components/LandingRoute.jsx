import { useLayoutEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { guestDataAtStartup, hasGuestData, shouldOpenApp } from '../utils/landingEligibility'

export default function LandingRoute({ english = false }) {
  const { user, isGuest, authLoading } = useAuth()
  const { search } = useLocation()
  const openApp = !english && shouldOpenApp({
    user, isGuest,
    standalone: window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true,
    guestData: guestDataAtStartup || hasGuestData(window.localStorage),
  })

  useLayoutEffect(() => {
    if (authLoading || openApp) return
    // A client-side or offline SPA fallback must load the static English document.
    if (english) { window.location.replace('/en/index.html' + search); return }
    const html = document.documentElement
    const previous = { lang: html.lang, dir: html.dir }
    html.lang = english ? 'en' : 'he'
    html.dir = english ? 'ltr' : 'rtl'
    html.classList.remove('landing-pending')
    html.classList.add('landing-visible')
    return () => {
      html.classList.add('landing-pending')
      html.classList.remove('landing-visible')
      html.lang = previous.lang
      html.dir = previous.dir
    }
  }, [authLoading, openApp, english, search])

  if (authLoading) return null
  return openApp ? <Navigate to={{ pathname: '/welcome', search }} replace /> : null
}
