import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getMessaging } from 'firebase/messaging'

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
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
  _auth      = getAuth(_app)
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
