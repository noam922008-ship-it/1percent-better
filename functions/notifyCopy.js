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

/** All FCM tokens of a user doc: fcmTokens array + legacy fcmToken scalar, deduplicated. */
function collectTokens(userData) {
  const set = new Set(Array.isArray(userData.fcmTokens) ? userData.fcmTokens : []);
  if (userData.fcmToken) set.add(userData.fcmToken);
  return set;
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

module.exports = {
  NUDGE_COPY, ACCOUNTABILITY_COPY, TEST_COPY, BROADCAST_COPY,
  MORNING_COPY, MIDDAY_COPY, WEEKLY_COPY,
  copyFor, todayIsraelDateKey, pickCopy, pickFrom, collectTokens,
  hasAccountabilityReminder, isCompletedToday,
};
