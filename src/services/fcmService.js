import { getToken, deleteToken } from 'firebase/messaging'
import { doc, setDoc, arrayRemove, deleteField } from 'firebase/firestore'
import { messaging, db } from './firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY
const DEVICE_KEY = 'prime_device_id'

/**
 * A stable id for this browser / installed app, kept in localStorage. Tokens are saved per
 * device (users/{uid}.fcmDevices[deviceId]), so a new token replaces this device's old one
 * instead of piling up (two pushes for one phone). An installed iPhone app has its own storage,
 * so it gets its own id — it also has its own push subscription.
 */
export function getDeviceId(storage = globalThis.localStorage) {
  try {
    let id = storage.getItem(DEVICE_KEY)
    if (!id || !/^[A-Za-z0-9-]{8,64}$/.test(id)) {
      id = globalThis.crypto?.randomUUID?.() || `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
      storage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch { return null }
}

export function isFcmReady() {
  return !!messaging && !!VAPID_KEY && 'serviceWorker' in navigator
}

/**
 * Requests an FCM registration token and saves it to users/{uid}.
 * Must be called after the user has granted Notification permission.
 * Returns the token string on success, null on failure.
 */
export async function registerFcmToken(uid) {
  if (!messaging) {
    console.warn('[FCM] messaging not initialized — Firebase config missing or SW unsupported')
    return null
  }
  if (!VAPID_KEY) {
    console.error('[FCM] VITE_FIREBASE_VAPID_KEY not set — add it to .env.local')
    return null
  }
  if (!uid) {
    console.warn('[FCM] uid required to save token')
    return null
  }
  try {
    const swReg = await navigator.serviceWorker.ready
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })
    if (!token) {
      console.warn('[FCM] getToken returned empty — permission denied or browser issue')
      return null
    }
    // One token per device: this device's entry is replaced, never added to. fcmToken (latest) stays
    // for old readers. The legacy fcmTokens array is no longer grown; the server ignores it once
    // fcmDevices exists (functions/notifyCopy.js collectTokens).
    const deviceId = getDeviceId()
    await setDoc(
      doc(db, 'users', uid),
      deviceId
        ? { fcmDevices: { [deviceId]: { token, updatedAt: Date.now() } }, fcmToken: token }
        : { fcmToken: token },
      { merge: true }
    )
    console.log(`[FCM] token saved uid=${uid.slice(0, 8)}… len=${token.length}`)
    return token
  } catch (err) {
    console.error('[FCM] registerFcmToken failed:', err?.code || err?.message)
    return null
  }
}

/**
 * Deletes the current FCM token and removes it from Firestore.
 * Call when the user opts out of push notifications.
 */
export async function unregisterFcmToken(uid) {
  if (!messaging || !uid) return
  try {
    const swReg = await navigator.serviceWorker.ready
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg }).catch(() => null)
    if (!token) return
    await deleteToken(messaging)
    const deviceId = getDeviceId()
    await setDoc(
      doc(db, 'users', uid),
      deviceId
        ? { fcmTokens: arrayRemove(token), fcmDevices: { [deviceId]: deleteField() } }
        : { fcmTokens: arrayRemove(token) },
      { merge: true }
    )
    console.log(`[FCM] token removed uid=${uid.slice(0, 8)}…`)
  } catch (err) {
    console.warn('[FCM] unregisterFcmToken error:', err?.message)
  }
}

/**
 * Sends a local foreground test notification to verify the full path.
 * Requires Notification.permission === 'granted'.
 * Returns true if the notification was dispatched.
 */
export function sendForegroundTestNotif() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false
  new Notification('🧪 בדיקת PRIME Push', {
    body: 'ההתראות עובדות! ה-Push Token רשום במכשיר הזה.',
    icon: '/icon-192.png',
    tag:  'prime-test',
  })
  return true
}
