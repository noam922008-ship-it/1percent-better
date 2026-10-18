'use strict';

// Push copy and pure helpers for the notification functions in index.js.
// Kept in their own module so __tests__ can test the real code (no Firebase SDK needed).
// Language comes from users/{uid}.lang ('he' | 'en', enforced by firestore.rules); default Hebrew.

// ── Daily nudge ───────────────────────────────────────────────────────────────
// Three lines per language, rotated randomly per user so the nudge
// feels fresh and doesn't read as automated spam.

const NUDGE_COPY = {
  he: [
    {
      title: 'הרצף שלך בסכנה! 🔥',
      body:  'נשאר לך עוד צעד קטן כדי לסגור את היום.',
    },
    {
      title: 'אל תוותר לעצמך היום ⚔️',
      body:  'כנס לסמן את ההרגלים שלך עכשיו.',
    },
    {
      title: 'ההרגלים שלך מחכים 🧠',
      body:  'כמה דקות עכשיו, והרצף נשמר.',
    },
  ],
  en: [
    {
      title: 'Your streak is at risk! 🔥',
      body:  'One small step left to close out today.',
    },
    {
      title: "Don't give up on yourself today ⚔️",
      body:  'Open the app and mark your habits now.',
    },
    {
      title: 'Your habits are waiting 🧠',
      body:  'A few minutes now, and your streak stays alive.',
    },
  ],
  // No user can have lang 'ar' (firestore.rules allows he/en only); kept as it was.
  ar: [
    {
      title: 'سلسلتك في خطر! 🔥',
      body:  'أكمل يومك الآن لتكون أفضل بنسبة 1٪.',
    },
    {
      title: 'لا تتخلى عن نفسك اليوم ⚔️',
      body:  'سجّل عاداتك وأغلق يومك بقوة.',
    },
    {
      title: 'وضع الرهبان مفعّل؟ 🧠',
      body:  'لا تكسر السلسلة، مهامك بانتظارك.',
    },
  ],
};

// ── Accountability reminder ──────────────────────────────────────────────────

const ACCOUNTABILITY_COPY = {
  he: (appName) => ({
    title: `🔐 לפני שתפתח את ${appName}…`,
    body:  'עשית 15 שכיבות סמיכה? בוא להרוויח את ה-XP שלך ולפתוח את הגלילה.',
    lang:  'he',
  }),
  en: (appName) => ({
    title: `🔐 Before you open ${appName}…`,
    body:  'Did you do your 15 push-ups? Come earn your XP and unlock your scroll time.',
    lang:  'en',
  }),
  ar: (appName) => ({
    title: `🔐 قبل أن تفتح ${appName}…`,
    body:  'هل أنهيت 15 ضغطة أرضية؟ تعال واكسب XP الخاص بك.',
    lang:  'ar',
  }),
};

// ── Test push + update broadcast ─────────────────────────────────────────────

const TEST_COPY = {
  he: { title: '🧪 PRIME — בדיקת Push', body: 'ההתראה הגיעה! כל המערכת עובדת.' },
  en: { title: '🧪 PRIME — Push test',  body: 'The notification arrived! Everything works.' },
};

// Default update broadcast; config/app broadcastTitle / broadcastBody override it for everyone.
const BROADCAST_COPY = {
  he: { title: '🚀 PRIME השתפר!',          body: 'גרסה חדשה של PRIME כבר כאן. פתח את האפליקציה כדי לראות מה חדש.' },
  en: { title: '🚀 PRIME just got better!', body: '🚀 Upgrade Alert: The new version of PRIME is live! Open the app to experience the latest features.' },
};

// ── Daily schedule: morning kickoff, midday nudge, weekly goals ───────────────
// Pools are rotated randomly per user (like NUDGE_COPY). Hebrew uses masculine address.

// 08:00 every day, everyone with a token.
const MORNING_COPY = {
  he: [
    { title: 'בוקר טוב 🌅',                body: 'הצעד הראשון של היום מחכה לך. 5 דקות וסגרת אותו.' },
    { title: 'היום אתה 1% יותר טוב ⚡',     body: 'פתח את PRIME ובחר מה סוגרים קודם.' },
    { title: 'תתחיל חזק ✊',                body: 'משימה אחת עכשיו וכל היום נראה אחרת.' },
  ],
  en: [
    { title: 'Good morning 🌅',            body: "Your first step is waiting. Five minutes and it's done." },
    { title: 'Be 1% better today ⚡',       body: 'Open PRIME and pick what you close first.' },
    { title: 'Start strong ✊',             body: 'One task now and the whole day looks different.' },
  ],
};

// 15:30 every day, only users who have not completed today.
const MIDDAY_COPY = {
  he: [
    { title: 'חצי יום כבר עבר ⏳',          body: '10 דקות עכשיו והיום שלך נסגר כמו שצריך.' },
    { title: 'זמן לזוז 💪',                 body: 'שכיבות סמיכה או ריצה קצרה? בחר אחד וסגור.' },
    { title: 'השיעור היומי מחכה 📚',        body: '3 דקות של קריאה ואתה צעד קדימה.' },
  ],
  en: [
    { title: 'Half the day is gone ⏳',     body: 'Ten minutes now and your day closes right.' },
    { title: 'Time to move 💪',             body: 'Push-ups or a short run? Pick one and close it.' },
    { title: "Today's lesson is waiting 📚", body: "Three minutes of reading and you're a step ahead." },
  ],
};

// Sunday 10:00, everyone with a token.
const WEEKLY_COPY = {
  he: { title: 'שבוע חדש מתחיל 🗓️',        body: 'בוא תרשום את המטרות שלך לשבוע ותתחיל אותו בראש ברור.' },
  en: { title: 'A new week begins 🗓️',      body: 'Write down your goals for the week and start with a clear head.' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Copy for a user's lang from a { he, en, … } map, Hebrew when missing or unknown. */
function copyFor(map, lang) {
  return map[lang] || map.he;
}

/**
 * YYYY-MM-DD in Israel local time. The client saves streak.lastDate as a UTC date;
 * at 19:30 Israel time (the nudge) both give the same day.
 */
function todayIsraelDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(now);
}

function pickCopy(lang) {
  const pool = copyFor(NUDGE_COPY, lang);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Random line from a { he: [...], en: [...] } pool, Hebrew when lang is missing or unknown. */
function pickFrom(map, lang, rand = Math.random) {
  const pool = copyFor(map, lang);
  return pool[Math.floor(rand() * pool.length)];
}

const DEVICE_MAX_AGE_MS = 60 * 86400000;   // a device not seen for 60 days gets no pushes

/**
 * A user's FCM tokens, deduplicated.
 * New clients save one token per device in fcmDevices: { [deviceId]: { token, updatedAt } } —
 * when that map exists it is the only source, so the old pile-up in fcmTokens (several tokens for
 * one phone → duplicate pushes) is ignored. Devices not updated for 60 days are skipped.
 * Users without fcmDevices yet: fcmTokens array + fcmToken scalar, as before.
 */
function collectTokens(userData, now = Date.now()) {
  const devices = userData && userData.fcmDevices;
  if (devices && typeof devices === 'object' && Object.keys(devices).length) {
    const set = new Set();
    for (const d of Object.values(devices)) {
      if (!d || typeof d.token !== 'string' || !d.token) continue;
      if (Number.isFinite(d.updatedAt) && now - d.updatedAt > DEVICE_MAX_AGE_MS) continue;
      set.add(d.token);
    }
    return set;
  }
  const set = new Set(Array.isArray(userData.fcmTokens) ? userData.fcmTokens : []);
  if (userData.fcmToken) set.add(userData.fcmToken);
  return set;
}

/**
 * [{ token, lang }] — one entry per device, each with the language that device's UI is in
 * (fcmDevices[id].lang), falling back to the user's lang (the last device that opened Home).
 * Same devices and age limit as collectTokens; a token listed twice keeps its first entry.
 */
function collectDevices(userData, now = Date.now()) {
  const fallback = userData && userData.lang;
  const devices = userData && userData.fcmDevices;
  const out = [];
  const seen = new Set();
  if (devices && typeof devices === 'object' && Object.keys(devices).length) {
    for (const d of Object.values(devices)) {
      if (!d || typeof d.token !== 'string' || !d.token || seen.has(d.token)) continue;
      if (Number.isFinite(d.updatedAt) && now - d.updatedAt > DEVICE_MAX_AGE_MS) continue;
      seen.add(d.token);
      out.push({ token: d.token, lang: d.lang === 'he' || d.lang === 'en' ? d.lang : fallback });
    }
    return out;
  }
  for (const token of collectTokens(userData || {}, now)) out.push({ token, lang: fallback });
  return out;
}

/**
 * True when the 18:00 accountabilityReminder targets this user (PRO + at least one
 * app configured). They skip the 19:30 nudge so they never get both in one evening.
 */
function hasAccountabilityReminder(userData) {
  return userData.isPro === true
    && Array.isArray(userData.accountabilityApps)
    && userData.accountabilityApps.length > 0;
}

/**
 * Returns true if the user has already completed their daily activity today.
 * Uses two independent signals so a syncing delay in one doesn't cause false nudges.
 */
function isCompletedToday(userData, today) {
  const streak = userData.streak || {};
  // Client saves streak.lastDate (not lastPostDate — fixed field name)
  if (streak.lastDate === today) return true;

  const quests = userData[`dailyQuests_${today}`] || {};
  if (quests.pushup && quests.monkMode && quests.quickReview) return true;

  return false;
}

// ── Per-user local time ───────────────────────────────────────────────────────
// One scheduler runs every 30 minutes (index.js localScheduler). For each user it reads
// users/{uid}.tz (IANA name saved by the client, e.g. 'America/New_York') and sends the
// pushes whose local time is now. Missing or invalid tz → Israel time, as before.

const DEFAULT_TZ = 'Asia/Jerusalem';

// at: local "HH:MM" (on the :00 / :30 grid). weekday: 0 = Sunday (only for weekly).
const PUSH_SLOTS = [
  { kind: 'morning',        at: '08:00' },
  { kind: 'weekly',         at: '10:00', weekday: 0 },
  { kind: 'midday',         at: '15:30' },
  { kind: 'accountability', at: '18:00' },
  { kind: 'nudge',          at: '19:30' },
];

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

/**
 * The user's local clock at `now`: { date: 'YYYY-MM-DD', weekday: 0-6, slot: 'HH:MM' }.
 * slot is floored to the half hour, so a run that starts a few seconds late still matches.
 */
function localClock(now, tz) {
  const zone  = isValidTimeZone(tz) ? tz : DEFAULT_TZ;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
  }).formatToParts(now).map(p => [p.type, p.value]));
  const hour = parts.hour === '24' ? '00' : parts.hour;
  const half = Number(parts.minute) < 30 ? '00' : '30';
  return {
    date:    `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAYS[parts.weekday],
    slot:    `${hour}:${half}`,
  };
}

/** Push slots due for a user's local clock right now. */
function dueSlots(clock) {
  return PUSH_SLOTS.filter(s => s.at === clock.slot && (s.weekday === undefined || s.weekday === clock.weekday));
}

/**
 * Done today? The client saves streak.lastDate as a UTC date, so check the user's local
 * date and the current UTC date (a user west of UTC who finished in the evening has a
 * lastDate one day "ahead" of their local date).
 */
function isDoneForUser(userData, clock, now) {
  return isCompletedToday(userData, clock.date)
      || isCompletedToday(userData, now.toISOString().slice(0, 10));
}

/** Whether `kind` goes to this user (same rules the five separate schedulers had). */
function shouldPush(kind, userData, clock, now) {
  switch (kind) {
    case 'morning':
    case 'weekly':         return true;
    case 'midday':         return !isDoneForUser(userData, clock, now);
    case 'accountability': return hasAccountabilityReminder(userData);
    case 'nudge':          return !isDoneForUser(userData, clock, now) && !hasAccountabilityReminder(userData);
    default:               return false;
  }
}

/** { title, body, url, tag, lang? } for one push kind in the user's language. */
function buildPush(kind, userData, appUrl, rand = Math.random) {
  const lang = userData.lang;
  switch (kind) {
    case 'morning': return { ...pickFrom(MORNING_COPY, lang, rand), url: appUrl, tag: 'morning-kickoff' };
    case 'midday':  return { ...pickFrom(MIDDAY_COPY, lang, rand),  url: appUrl, tag: 'midday-nudge' };
    case 'weekly':  return { ...copyFor(WEEKLY_COPY, lang),         url: appUrl, tag: 'weekly-goals' };
    case 'nudge':   return { ...pickFrom(NUDGE_COPY, lang, rand),   url: `${appUrl}#hub`, tag: 'daily-nudge' };
    case 'accountability': {
      const app = userData.accountabilityApps[0];
      return { ...copyFor(ACCOUNTABILITY_COPY, lang)(app), url: `${appUrl}#focus-gate`, tag: 'accountability-lock' };
    }
    default: return null;
  }
}

module.exports = {
  NUDGE_COPY, ACCOUNTABILITY_COPY, TEST_COPY, BROADCAST_COPY,
  MORNING_COPY, MIDDAY_COPY, WEEKLY_COPY,
  copyFor, todayIsraelDateKey, pickCopy, pickFrom, collectTokens, collectDevices,
  hasAccountabilityReminder, isCompletedToday,
  DEFAULT_TZ, PUSH_SLOTS, isValidTimeZone, localClock, dueSlots, isDoneForUser, shouldPush, buildPush,
};
