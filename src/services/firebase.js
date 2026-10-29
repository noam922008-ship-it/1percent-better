import { initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'

// Sign-in runs through the domain the page is on, so it stays same-site (fast, and Safari's
// tracking prevention leaves it alone). Both addresses serve the same Hosting site; each one's
// /__/auth/handler is an authorized redirect URI. Anything else (localhost, previews) uses .env.
const OWN_DOMAINS = ['prime-daily.app', 'prime-app-84fe0.web.app']
const pageHost = typeof window !== 'undefined' ? window.location.hostname : ''

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        OWN_DOMAINS.includes(pageHost) ? pageHost : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,   // GA4 (services/analytics.js)
}

export const isFirebaseConfigured = !!(config.apiKey && config.projectId)

let _auth      = null
let _db        = null
let _storage   = null
let _functions = null
let _messaging = null

let _app = null

if (isFirebaseConfigured) {
  _app       = initializeApp(config)
  // No popup/redirect resolver at start-up: with one, auth waits for a hidden iframe from the auth
  // domain before it reports the user, and inside Instagram / TikTok browsers that iframe can hang
  // for minutes (the app sat on a spinner). Sign-in passes the resolver itself (context/AuthContext).
  try {
    _auth = initializeAuth(_app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] })
  } catch {
    _auth = getAuth(_app)   // already initialised (dev hot reload)
  }
  _db        = getFirestore(_app)
  _storage   = getStorage(_app)
  _functions = getFunctions(_app, 'europe-west1')
  // Local testing only: `VITE_USE_EMULATORS=true npm run dev` talks to the Firebase emulators
  // (firebase.json → emulators), never to production. Ignored in production builds.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(_auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(_db, '127.0.0.1', 8085)
    connectFunctionsEmulator(_functions, '127.0.0.1', 5001)
    connectStorageEmulator(_storage, '127.0.0.1', 9199)
  }
  // Messaging only available in browsers that support service workers
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try { _messaging = getMessaging(_app) } catch {}
  }
}

export const app            = _app
export const auth           = _auth
export const db             = _db
export const storage        = _storage
export const functions      = _functions
export const messaging      = _messaging
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null
