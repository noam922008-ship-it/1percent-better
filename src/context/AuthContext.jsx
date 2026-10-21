import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect, getRedirectResult, browserPopupRedirectResolver, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured, googleProvider } from '../services/firebase'

const Ctx = createContext(null)

// Set just before a Google redirect sign-in, so the redirect result is only fetched when one is pending
const REDIRECT_FLAG = 'prime_auth_redirect'
// Never keep the whole app on the loading spinner longer than this
const AUTH_WAIT_MS = 3000

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isGuest,     setIsGuest]     = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured) { setAuthLoading(false); return }
    // Finish a Google redirect sign-in — only when one was started on this device
    let pending = false
    try { pending = sessionStorage.getItem(REDIRECT_FLAG) === '1'; sessionStorage.removeItem(REDIRECT_FLAG) } catch {}
    if (pending) getRedirectResult(auth, browserPopupRedirectResolver).catch(() => {})
    // Slow networks / in-app browsers: show the app after a few seconds even if auth hasn't answered yet;
    // a signed-in user still lands where they should once it does (WelcomeScreen redirects on user).
    const timer = setTimeout(() => setAuthLoading(false), AUTH_WAIT_MS)
    const unsub = onAuthStateChanged(auth, u => {
      clearTimeout(timer)
      setUser(u)
      if (u) setIsGuest(false)
      setAuthLoading(false)
    })
    return () => { clearTimeout(timer); unsub() }
  }, [])

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !googleProvider)
      return Promise.reject({ code: 'auth/not-configured' })
    try {
      return await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
    } catch (err) {
      // Popup blocked or unsupported (PWA, Safari, some mobile browsers) — fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-cancelled' || err.code === 'auth/cancelled-popup-request') {
        try { sessionStorage.setItem(REDIRECT_FLAG, '1') } catch {}
        return signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver)
      }
      throw err
    }
  }

  const loginWithEmail = (email, password) => {
    if (!isFirebaseConfigured) return Promise.reject({ code: 'auth/not-configured' })
    return signInWithEmailAndPassword(auth, email, password)
  }

  const registerWithEmail = (email, password) => {
    if (!isFirebaseConfigured) return Promise.reject({ code: 'auth/not-configured' })
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const loginAsGuest = () => {
    setIsGuest(true)
    setUser(null)
  }

  const logout = async () => {
    if (isFirebaseConfigured && !isGuest) await signOut(auth)
    setUser(null)
    setIsGuest(false)
  }

  return (
    <Ctx.Provider value={{ user, authLoading, isFirebaseConfigured, isGuest, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
