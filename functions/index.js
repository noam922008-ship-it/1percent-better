'use strict';

const { onSchedule }              = require('firebase-functions/v2/scheduler');
const { onDocumentWritten }       = require('firebase-functions/v2/firestore');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret }            = require('firebase-functions/params');
const { initializeApp }           = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging }            = require('firebase-admin/messaging');
const { GoogleGenerativeAI }      = require('@google/generative-ai');
const { GoogleAIFileManager }     = require('@google/generative-ai/server');
const { getStorage }              = require('firebase-admin/storage');
const {
  TEST_COPY, BROADCAST_COPY,
  copyFor, todayIsraelDateKey, collectTokens, collectDevices,
  localClock, dueSlots, shouldPush, buildPush,
} = require('./notifyCopy');

const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Instagram auto-DM (functions/igAutoDm.js) — values set with `firebase functions:secrets:set <NAME>`
const igVerifyToken  = defineSecret('IG_VERIFY_TOKEN');
const igAppSecret    = defineSecret('IG_APP_SECRET');
const igAccessToken  = defineSecret('IG_ACCESS_TOKEN');    // page token, @prime.daily.app
const igAccessToken2 = defineSecret('IG_ACCESS_TOKEN_2');  // page token, @noam_cohen_02

initializeApp();

// ── analyzeWithGemini — secure Gemini proxy ───────────────────────────────────
// Callable from the frontend. Requires Firebase Auth (blocks unauthenticated
// and guest callers — those fall back to static responses on the client).
//
// Request data:
//   prompt          string?            — text prompt, ≤ 40,000 chars
//   imageBase64     string?            — plain base64 image (no data: prefix), ≤ ~5 MB
//   imageMimeType   string?            — image/jpeg (default) | image/png | image/webp
//   systemInstruction string?          — optional, ≤ 2,000 chars
// The model is fixed server-side (GEMINI_MODEL); a client-sent `model` is ignored.
// Invalid input is rejected before it counts against the daily limit.
//
// Response: { text: string }

const GEMINI_DAILY_LIMIT = 20;

// Atomically increments the daily call counter for uid.
// Returns false and does NOT increment if the limit is already reached.
// Uses a transaction so concurrent calls don't race past the cap.
async function checkGeminiRateLimit(db, uid) {
  const today = todayIsraelDateKey();
  const ref   = db.collection('geminiUsage').doc(uid);
  let allowed = false;
  await db.runTransaction(async (txn) => {
    const snap  = await txn.get(ref);
    const data  = snap.data() || {};
    const calls = (data.date === today ? (data.calls || 0) : 0);
    if (calls >= GEMINI_DAILY_LIMIT) { allowed = false; return; }
    txn.set(ref, { date: today, calls: calls + 1 }, { merge: false });
    allowed = true;
  });
  return allowed;
}

// Input limits for analyzeWithGemini — the client never picks the model.
const GEMINI_MODEL              = 'gemini-2.5-flash';
const MAX_PROMPT_CHARS          = 40000;
const MAX_SYSTEM_INSTRUCTION    = 2000;
const MAX_IMAGE_BASE64_CHARS    = 7 * 1024 * 1024;   // ~5 MB image (callable requests cap at 10 MB)
const ALLOWED_IMAGE_MIME_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];

// Returns sanitized { prompt, imageBase64, imageMimeType, systemInstruction } or throws invalid-argument.
function validateGeminiRequest(data) {
  const { prompt, imageBase64, imageMimeType = 'image/jpeg', systemInstruction } = data || {};
  const bad = msg => { throw new HttpsError('invalid-argument', msg); };

  if (prompt !== undefined && typeof prompt !== 'string') bad('prompt must be a string.');
  if (prompt && prompt.length > MAX_PROMPT_CHARS) bad('prompt too long.');

  if (imageBase64 !== undefined) {
    if (typeof imageBase64 !== 'string' || !imageBase64) bad('imageBase64 must be a non-empty string.');
    if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) bad('image too large.');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64)) bad('imageBase64 must be plain base64 (no data: prefix).');
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(imageMimeType)) bad('unsupported image type.');
  }

  if (systemInstruction !== undefined &&
      (typeof systemInstruction !== 'string' || systemInstruction.length > MAX_SYSTEM_INSTRUCTION)) {
    bad('systemInstruction must be a string of at most 2000 characters.');
  }

  if (!prompt && !imageBase64) bad('prompt or imageBase64 required.');
  return { prompt, imageBase64, imageMimeType, systemInstruction };
}

exports.analyzeWithGemini = onCall(
  {
    region:          'europe-west1',
    memory:          '512MiB',
    timeoutSeconds:  30,
    secrets:         [geminiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    // Validate before counting against the daily limit; any client-sent `model` is ignored.
    const { prompt, imageBase64, imageMimeType, systemInstruction } = validateGeminiRequest(request.data);

    const uid = request.auth.uid;
    const db  = getFirestore();
    const allowed = await checkGeminiRateLimit(db, uid);
    if (!allowed) {
      throw new HttpsError(
        'resource-exhausted',
        `Daily AI limit of ${GEMINI_DAILY_LIMIT} calls reached. Try again tomorrow.`
      );
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Gemini API key not configured.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    // Build content array
    let contents;
    if (imageBase64) {
      contents = [{
        parts: [
          ...(prompt ? [{ text: prompt }] : []),
          { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
        ],
      }];
    } else {
      contents = prompt;  // plain string (validated above)
    }

    try {
      const result = await model.generateContent(contents);
      return { text: result.response.text().trim() };
    } catch (err) {
      console.error('[analyzeWithGemini] Gemini error:', err?.message);
      throw new HttpsError('internal', 'Gemini request failed.');
    }
  }
);

// ── analyzeBoxingSession — temporal video analysis ────────────────────────────
// Downloads video from Firebase Storage to a Buffer (no temp file), uploads to
// Gemini Files API, polls until ACTIVE, analyzes with structured JSON prompt,
// then deletes the file from both Gemini and Storage.
//
// Request data:
//   storagePath  string  — path in Firebase Storage ("workout-analysis/{uid}/{file}")
//
// Response: { analysis: { canAssess, limitations, strength, priorityCorrections,
//                         repeatedMistakes, timelineObservations, practiceAction } }

const SERVER_VALIDATION = {
  MAX_BYTES:    100 * 1024 * 1024,           // 100 MB
  TS_PATTERN:   /^\d+:\d{2}$/,              // "M:SS" or "MM:SS"
  CATEGORIES:   new Set(['guard','punch','footwork','defense']),
};

function sanitizeAnalysis(obj) {
  // Sanitize timestamps; ensure category values are in allowed set
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.canAssess !== 'boolean') return false;
  if (!obj.canAssess) return true; // only limitations needed when canAssess=false

  // Normalize priority corrections
  if (!Array.isArray(obj.priorityCorrections)) return false;
  for (const c of obj.priorityCorrections) {
    if (c.timestamp !== null && !SERVER_VALIDATION.TS_PATTERN.test(String(c.timestamp ?? ''))) {
      c.timestamp = null;
    }
    if (!SERVER_VALIDATION.CATEGORIES.has(c.category)) c.category = 'guard';
  }
  // Enforce exactly 2 items
  while (obj.priorityCorrections.length < 2) obj.priorityCorrections.push({ category: 'guard', he: '', timestamp: null });
  obj.priorityCorrections = obj.priorityCorrections.slice(0, 2);

  // Normalize timeline observations
  if (!Array.isArray(obj.timelineObservations)) obj.timelineObservations = [];
  for (const o of obj.timelineObservations) {
    if (o.time !== null && !SERVER_VALIDATION.TS_PATTERN.test(String(o.time ?? ''))) o.time = null;
    if (!SERVER_VALIDATION.CATEGORIES.has(o.category)) o.category = 'guard';
  }
  obj.timelineObservations = obj.timelineObservations.slice(0, 6);

  if (!Array.isArray(obj.repeatedMistakes)) obj.repeatedMistakes = [];
  return true;
}

exports.analyzeBoxingSession = onCall(
  {
    region:         'europe-west1',
    memory:         '1GiB',
    timeoutSeconds: 120,
    secrets:        [geminiApiKey],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = request.auth.uid;
    const { storagePath } = request.data || {};

    if (!storagePath || typeof storagePath !== 'string') {
      throw new HttpsError('invalid-argument', 'storagePath required.');
    }

    // Ownership check — path must start with the caller's uid segment
    const expectedPrefix = `workout-analysis/${uid}/`;
    if (!storagePath.startsWith(expectedPrefix)) {
      throw new HttpsError('permission-denied', 'Access denied.');
    }

    // No path traversal
    const filename = storagePath.slice(expectedPrefix.length);
    if (filename.includes('/') || filename.includes('..')) {
      throw new HttpsError('invalid-argument', 'Invalid storagePath.');
    }

    const db      = getFirestore();
    const allowed = await checkGeminiRateLimit(db, uid);
    if (!allowed) {
      throw new HttpsError('resource-exhausted', `Daily AI limit of ${GEMINI_DAILY_LIMIT} calls reached.`);
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey || apiKey.startsWith('PASTE_')) {
      throw new HttpsError('failed-precondition', 'Gemini API key not configured.');
    }

    const bucket      = getStorage().bucket();
    const storageFile = bucket.file(storagePath);
    let geminiFileName = null;

    try {
      // 1. Server-side file metadata validation (before downloading)
      const [metadata] = await storageFile.getMetadata();
      const contentType = metadata.contentType || '';
      if (!contentType.startsWith('video/')) {
        throw new HttpsError('invalid-argument', 'File must be a video.');
      }
      const sizeBytes = parseInt(metadata.size, 10);
      if (isNaN(sizeBytes) || sizeBytes > SERVER_VALIDATION.MAX_BYTES) {
        throw new HttpsError('invalid-argument', 'File exceeds 100 MB limit.');
      }

      // 2. Download to Buffer — no temp file needed; uploadFile() accepts Buffer directly
      const [videoBuffer] = await storageFile.download();

      // 3. Upload to Gemini Files API
      const fileManager   = new GoogleAIFileManager(apiKey);
      const uploadResult  = await fileManager.uploadFile(videoBuffer, {
        mimeType:    contentType,
        displayName: `boxing-${uid}`,
      });
      geminiFileName       = uploadResult.file.name;
      const fileUri        = uploadResult.file.uri;

      // 4. Poll until ACTIVE (Gemini processes video server-side before analysis)
      let fileState = uploadResult.file;
      let polls     = 0;
      while (fileState.state === 'PROCESSING' && polls < 18) {
        await new Promise(r => setTimeout(r, 5000));
        fileState = await fileManager.getFile(geminiFileName);
        polls++;
      }
      if (fileState.state !== 'ACTIVE') {
        throw new HttpsError('internal', `Video processing failed (state: ${fileState.state}).`);
      }

      // 5. Analyze — gemini-2.5-flash supports video via Files API and structured JSON output
      //    responseMimeType enforces JSON output; supported since SDK v0.12.0
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model:            'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt =
`You are an expert boxing coach reviewing a training session video.

Analyze the footage. Return ONLY valid JSON — no markdown, no prose outside JSON:
{
  "canAssess": true,
  "limitations": "describe what you cannot assess from this footage, or null if footage is fully usable",
  "strength": { "he": "one specific thing they do well — in Hebrew" },
  "priorityCorrections": [
    { "category": "guard|punch|footwork|defense", "he": "specific issue in Hebrew", "timestamp": "M:SS or null" },
    { "category": "guard|punch|footwork|defense", "he": "specific issue in Hebrew", "timestamp": "M:SS or null" }
  ],
  "repeatedMistakes": ["mistake in Hebrew"],
  "timelineObservations": [
    { "time": "M:SS", "category": "guard|punch|footwork|defense", "he": "observation in Hebrew" }
  ],
  "practiceAction": {
    "titleHe": "drill name in Hebrew",
    "instructionHe": "3-minute corrective drill instructions in Hebrew",
    "durationMinutes": 3
  }
}

Rules:
- Set canAssess=false and limitations=reason if footage is too dark, wrong angle, or not boxing. All other fields null.
- Use video timestamps like "0:05" or "1:23". If timestamp is uncertain, use null — do NOT guess.
- priorityCorrections: exactly 2 items addressing the two most important issues.
- timelineObservations: 3–6 key moments you can clearly see. Do not invent observations.
- repeatedMistakes: only mistakes that appear more than once in the footage.
- practiceAction.instructionHe must target the first priorityCorrection specifically.
- All Hebrew fields in Hebrew only. No markdown inside field values.`;

      const result = await model.generateContent([
        { text: prompt },
        { fileData: { mimeType: contentType, fileUri } },
      ]);

      const raw   = result.response.text().trim();
      const start = raw.indexOf('{');
      const end   = raw.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new HttpsError('internal', 'Model returned non-JSON response.');
      }

      let analysis;
      try {
        analysis = JSON.parse(raw.slice(start, end + 1));
      } catch {
        throw new HttpsError('internal', 'Failed to parse analysis JSON.');
      }

      if (!sanitizeAnalysis(analysis)) {
        throw new HttpsError('internal', 'Analysis response missing required fields.');
      }

      return { analysis };

    } finally {
      // Cleanup: delete Gemini file and Storage file regardless of outcome
      // Note: if the function is killed by timeout, this block does not run.
      // The Storage file will be cleaned up by the client; the Gemini file
      // expires automatically after 48 hours per Files API policy.
      if (geminiFileName) {
        const fm = new GoogleAIFileManager(apiKey);
        fm.deleteFile(geminiFileName).catch(() => {});
      }
      storageFile.delete().catch(() => {});
    }
  }
);

// ── Helper: stale token cleanup (shared) ─────────────────────────────────────

async function purgeStaleTokens(db, staleTokens, tokenToUid) {
  if (!staleTokens.size) return;
  const affectedUids = new Set(
    [...staleTokens].map(t => tokenToUid.get(t)).filter(Boolean)
  );
  for (const uid of affectedUids) {
    const ref  = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) continue;
    const { fcmTokens = [], fcmToken, fcmDevices = {} } = snap.data();
    const clean  = fcmTokens.filter(t => !staleTokens.has(t));
    const update = { fcmTokens: clean };
    const liveDeviceTokens = [];
    for (const [id, d] of Object.entries(fcmDevices || {})) {
      if (d && staleTokens.has(d.token)) update[`fcmDevices.${id}`] = FieldValue.delete();
      else if (d && d.token) liveDeviceTokens.push(d.token);
    }
    if (fcmToken && staleTokens.has(fcmToken)) update.fcmToken = liveDeviceTokens.at(-1) ?? clean.at(-1) ?? '';
    await ref.update(update);
  }
  console.log(`[purgeStaleTokens] purged ${staleTokens.size} tokens from ${affectedUids.size} users`);
}

// ── FCM push notification functions ──────────────────────────────────────────
// broadcastUpdate, sendTestNotification and localScheduler use Firebase Cloud Messaging
// (Admin SDK) and need the Blaze plan. Tokens come from the client (fcmService.js).

// The daily pushes (morning, weekly, midday, accountability, evening nudge) are all sent by
// localScheduler at the bottom of this file, in each user's own time zone.

// ── broadcastUpdate ───────────────────────────────────────────────────────────
// Triggered when config/app is written.
// Set pendingBroadcast: true (+ version + message) via broadcast-update.cjs or
// the Firebase console — this function fires, pushes to every user with an FCM
// token, then resets pendingBroadcast to false and logs stats.
//
// Firestore config/app schema:
//   version:          string   — current app version, e.g. "2.0.0"
//   forceUpdate:      boolean  — if true, client blocks until user refreshes
//   pendingBroadcast: boolean  — set true to trigger this function
//   broadcastTitle:   string?  — optional override push title (all users, any language)
//   broadcastBody:    string?  — optional override push body
// Without an override each user gets BROADCAST_COPY in their lang (notifyCopy.js).

const APP_URL                  = 'https://prime-app-84fe0.web.app/';

exports.broadcastUpdate = onDocumentWritten(
  {
    document:       'config/app',
    region:         'europe-west1',
    memory:         '256MiB',
    timeoutSeconds: 300,
  },
  async (event) => {
    const after  = event.data?.after?.data();
    const before = event.data?.before?.data();

    // Only proceed if pendingBroadcast just became true
    if (!after?.pendingBroadcast) return;
    if (before?.pendingBroadcast === true) return; // already processed

    const db        = getFirestore();
    const messaging = getMessaging();
    const version   = after.version || 'latest';

    console.log(`[broadcastUpdate] version=${version} — collecting tokens`);

    // Reset flag immediately so a retry doesn't double-send
    await db.collection('config').doc('app').update({
      pendingBroadcast:  false,
      lastBroadcastAt:   new Date().toISOString(),
      lastBroadcastVersion: version,
    });

    const usersSnap = await db.collection('users').get();
    if (usersSnap.empty) {
      console.log('[broadcastUpdate] no users');
      return;
    }

    const messages   = [];
    const tokenToUid = new Map();

    for (const doc of usersSnap.docs) {
      const d = doc.data();
      const tokenSet = collectTokens(d);
      if (!tokenSet.size) continue;

      const copy  = copyFor(BROADCAST_COPY, d.lang);
      const title = after.broadcastTitle || copy.title;
      const body  = after.broadcastBody  || copy.body;

      for (const token of tokenSet) {
        tokenToUid.set(token, doc.id);
        messages.push({
          token,
          webpush: {
            headers: { Urgency: 'high' },
            data: {
              title,
              body,
              url:   APP_URL,
              icon:  '/icon-192.png',
              badge: '/icon-192.png',
              tag:   'app-update',
            },
          },
        });
      }
    }

    if (!messages.length) {
      console.log('[broadcastUpdate] no tokens found — no notifications sent');
      return;
    }

    let sent = 0, failed = 0;
    const staleTokens = new Set();

    for (let i = 0; i < messages.length; i += 500) {
      const chunk  = messages.slice(i, i + 500);
      const result = await messaging.sendEach(chunk);
      result.responses.forEach((r, idx) => {
        if (r.success) {
          sent++;
        } else {
          failed++;
          const code = r.error?.code || '';
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            staleTokens.add(chunk[idx].token);
          }
          console.warn(`[broadcastUpdate] token error uid=${tokenToUid.get(chunk[idx].token)} code=${code}`);
        }
      });
    }

    await purgeStaleTokens(db, staleTokens, tokenToUid);

    // Write final stats back to config doc
    await db.collection('config').doc('app').update({
      lastBroadcastStats: { sent, failed, stale: staleTokens.size, total: messages.length },
    });

    console.log(`[broadcastUpdate] version=${version} sent=${sent} failed=${failed} stale=${staleTokens.size} total=${messages.length}`);
  }
);

// ── sendTestNotification ──────────────────────────────────────────────────────
// Callable from the client. Sends a real FCM push to all registered tokens for
// the authenticated user — useful for end-to-end testing without waiting for the
// scheduled nudge. Requires the user to be registered (tokens in users/{uid}).

exports.sendTestNotification = onCall(
  {
    region:         'europe-west1',
    memory:         '256MiB',
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = request.auth.uid;
    const db        = getFirestore();
    const messaging = getMessaging();

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User document not found. Register a push token first.');
    }

    const userData = userDoc.data();
    const copy = copyFor(TEST_COPY, userData.lang);
    const tokenSet = collectTokens(userData);

    if (!tokenSet.size) {
      throw new HttpsError('failed-precondition', 'No FCM tokens registered for this user.');
    }

    let sent = 0, failed = 0;
    const staleTokens = new Set();
    const tokenToUid  = new Map([[...tokenSet].join(','), uid]);

    for (const token of tokenSet) {
      tokenToUid.set(token, uid);
      try {
        await messaging.send({
          token,
          webpush: {
            headers: { Urgency: 'high' },
            data: {
              title: copy.title,
              body:  copy.body,
              url:   '/',
              icon:  '/icon-192.png',
              badge: '/icon-192.png',
              tag:   'prime-test-backend',
            },
          },
        });
        sent++;
      } catch (err) {
        failed++;
        const code = err?.errorInfo?.code || '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          staleTokens.add(token);
        }
        console.warn(`[sendTestNotification] uid=${uid} token_error=${code}`);
      }
    }

    await purgeStaleTokens(db, staleTokens, tokenToUid);
    console.log(`[sendTestNotification] uid=${uid} sent=${sent} failed=${failed}`);
    return { sent, failed, total: tokenSet.size };
  }
);

// ── localScheduler: all daily pushes, in each user's local time ──────────────
// Runs every 30 minutes. For each user with a push token it works out the local time from
// users/{uid}.tz (fallback Israel) and sends the pushes due now — see PUSH_SLOTS and
// shouldPush in notifyCopy.js:
//   08:00 morning (everyone) · Sun 10:00 weekly goals (everyone)
//   15:30 midday (not done yet) · 18:00 accountability (PRO with apps)
//   19:30 evening nudge (not done yet, not PRO-with-apps)
// Every push has its own tag, so a later one never replaces an earlier one on the device.
// Replaces the five fixed-time (Israel) schedulers: dailyHabitNudge, accountabilityReminder,
// morningKickoff, middayNudge, weeklyGoals.

const PUSH_APP_URL = 'https://prime-app-84fe0.web.app/';

exports.localScheduler = onSchedule(
  {
    schedule:       '0,30 * * * *',
    timeZone:       'UTC',
    region:         'europe-west1',
    memory:         '256MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const db        = getFirestore();
    const messaging = getMessaging();
    const now       = new Date();

    const usersSnap = await db.collection('users').get();
    if (usersSnap.empty) return;

    const messages   = [];
    const tokenToUid = new Map();
    const perKind    = {};

    for (const doc of usersSnap.docs) {
      const d       = doc.data();
      const devices = collectDevices(d);
      if (!devices.length) continue;

      const clock = localClock(now, d.tz);
      for (const { kind } of dueSlots(clock)) {
        if (!shouldPush(kind, d, clock, now)) continue;
        perKind[kind] = (perKind[kind] || 0) + 1;
        // One copy per language, so each device gets the language its own UI is in.
        const byLang = new Map();
        for (const { token, lang } of devices) {
          if (!byLang.has(lang)) byLang.set(lang, buildPush(kind, { ...d, lang }, PUSH_APP_URL));
          const push = byLang.get(lang);
          if (!push) continue;
          tokenToUid.set(token, doc.id);
          messages.push({
            token,
            webpush: {
              headers: { Urgency: 'high' },
              // Flat webpush.data keys — the service worker's push handler reads them directly.
              data: {
                title: push.title,
                body:  push.body,
                url:   push.url,
                icon:  '/icon-192.png',
                badge: '/icon-192.png',
                tag:   push.tag,
                ...(push.lang ? { lang: push.lang } : {}),
              },
            },
          });
        }
      }
    }

    if (!messages.length) return;

    let sent = 0, failed = 0;
    const staleTokens = new Set();

    for (let i = 0; i < messages.length; i += 500) {
      const chunk  = messages.slice(i, i + 500);
      const result = await messaging.sendEach(chunk);
      result.responses.forEach((r, idx) => {
        if (r.success) {
          sent++;
        } else {
          failed++;
          const code = r.error?.code || '';
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            staleTokens.add(chunk[idx].token);
          }
          console.warn(`[localScheduler] token error uid=${tokenToUid.get(chunk[idx].token)} code=${code}`);
        }
      });
    }

    await purgeStaleTokens(db, staleTokens, tokenToUid);
    console.log(`[localScheduler] ${now.toISOString()} users=${JSON.stringify(perKind)} sent=${sent} failed=${failed} stale_cleaned=${staleTokens.size}`);
  }
);

// ── dailyStats: internal usage numbers (no Google Analytics, no cookies) ─────────
// Every day at 03:15 UTC: counts from focusTriggers + users for the previous UTC day, written to
// stats/{YYYY-MM-DD}. Only counts — no uids, names or emails. Clients can't read it
// (firestore.rules has no stats match); open it in the Firebase console → Firestore → stats.
// See computeStats in stats.js for what each number means.

const { computeStats, dateKey: statsDateKey } = require('./stats');

exports.dailyStats = onSchedule(
  {
    schedule:       '15 3 * * *',
    timeZone:       'UTC',
    region:         'europe-west1',
    memory:         '256MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const db         = getFirestore();
    const reportDate = statsDateKey(Date.now() - 86400000);
    const [profilesSnap, usersSnap] = await Promise.all([
      db.collection('focusTriggers').get(),
      db.collection('users').get(),
    ]);
    const stats = computeStats(
      profilesSnap.docs.map(d => d.data()),
      usersSnap.docs.map(d => d.data()),
      reportDate,
    );
    await db.collection('stats').doc(reportDate).set({ ...stats, computedAt: new Date().toISOString() });
    console.log(`[dailyStats] ${reportDate} ${JSON.stringify(stats)}`);
  }
);

// ── igAutoDm — Instagram comment "לינק" → DM with the app link ─────────────────
// Meta webhook (app "Noam Auto Reply", Instagram object, field `comments`) points here.
// Replaces the Supabase Edge Function, which paused after a week without traffic.
exports.igAutoDm = onRequest(
  {
    region:         'europe-west1',
    memory:         '256MiB',
    timeoutSeconds: 30,
    maxInstances:   5,
    secrets:        [igVerifyToken, igAppSecret, igAccessToken, igAccessToken2],
  },
  require('./igAutoDm').makeHandler({
    verifyToken: () => igVerifyToken.value(),
    appSecret:   () => igAppSecret.value(),
    getToken:    key => (key === 'IG_ACCESS_TOKEN_2' ? igAccessToken2 : igAccessToken).value(),
    // igAutoDmSent/{account_userId}: create() fails if it exists → one DM per person per account.
    // Clients can't read it (catch-all deny in firestore.rules). A store error lets the DM go out.
    firstTime: async key => {
      try {
        await getFirestore().collection('igAutoDmSent').doc(key).create({ at: FieldValue.serverTimestamp() });
        return true;
      } catch (e) {
        if (e && (e.code === 6 || e.code === 'already-exists')) return false;
        console.error('igAutoDmSent store error', e && e.message);
        return true;
      }
    },
  }),
);
