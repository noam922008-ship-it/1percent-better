'use strict';

// Internal usage stats from data the app already stores to work — no cookies, nothing sent to
// Google Analytics, no names or emails in the result: only counts.
//   focusTriggers/{uid}: activityLog (UTC date keys of days with any XP), createdAt (ISO), streak
//   users/{uid}:         fcmToken(s), lang, tz
// computeStats() is pure so __tests__ can check it; index.js (dailyStats) reads the collections
// and writes the result to stats/{reportDate}, readable only from the Firebase console.

const DAY = 86400000;

const dateKey  = ms => new Date(ms).toISOString().slice(0, 10);
const shiftKey = (key, days) => dateKey(Date.parse(`${key}T00:00:00Z`) + days * DAY);

function createdKey(profile) {
  const t = Date.parse(profile && profile.createdAt);
  return Number.isFinite(t) ? dateKey(t) : null;
}

function activeSet(profile) {
  return new Set(Array.isArray(profile && profile.activityLog) ? profile.activityLog : []);
}

/** Active on at least one day in [from, to] (inclusive, UTC keys). */
function activeBetween(days, from, to) {
  for (let k = from; k <= to; k = shiftKey(k, 1)) if (days.has(k)) return true;
  return false;
}

/**
 * Day-N return over a rolling week of sign-up cohorts: users who signed up on one of the 7 days
 * ending reportDate − N, and were active exactly N days after their own sign-up day.
 * Rolling over a week keeps the number meaningful with few users.
 */
function dayNReturn(profiles, reportDate, n) {
  let cohort = 0, returned = 0;
  const lastSignup  = shiftKey(reportDate, -n);
  const firstSignup = shiftKey(lastSignup, -6);
  for (const p of profiles) {
    const c = createdKey(p);
    if (!c || c < firstSignup || c > lastSignup) continue;
    cohort++;
    if (activeSet(p).has(shiftKey(c, n))) returned++;
  }
  return { cohort, returned, pct: cohort ? Math.round((returned / cohort) * 100) : null };
}

/**
 * @param {object[]} profiles  focusTriggers docs
 * @param {object[]} users     users docs
 * @param {string}   reportDate UTC 'YYYY-MM-DD' — the day being reported (normally yesterday)
 */
function computeStats(profiles, users, reportDate) {
  const weekStart  = shiftKey(reportDate, -6);
  const monthStart = shiftKey(reportDate, -29);

  let dau = 0, wau = 0, mau = 0, newUsers = 0, streak3 = 0, streak7 = 0;
  for (const p of profiles) {
    const days = activeSet(p);
    if (days.has(reportDate)) dau++;
    if (activeBetween(days, weekStart, reportDate)) wau++;
    if (activeBetween(days, monthStart, reportDate)) mau++;
    if (createdKey(p) === reportDate) newUsers++;
    const count = Number(p && p.streak && p.streak.count) || 0;
    const live  = p && p.streak && p.streak.lastDate >= shiftKey(reportDate, -2);
    if (live && count >= 3) streak3++;
    if (live && count >= 7) streak7++;
  }

  let withPush = 0, outsideIsrael = 0;
  const langs = {};
  for (const u of users) {
    const tokens = (u.fcmDevices && Object.keys(u.fcmDevices).length) || (Array.isArray(u.fcmTokens) && u.fcmTokens.length) || u.fcmToken;
    if (tokens) withPush++;
    const lang = u.lang === 'en' ? 'en' : 'he';
    langs[lang] = (langs[lang] || 0) + 1;
    if (typeof u.tz === 'string' && u.tz && u.tz !== 'Asia/Jerusalem') outsideIsrael++;
  }

  return {
    reportDate,
    accounts:      profiles.length,
    newUsers,
    activeDay:     dau,
    activeWeek:    wau,
    activeMonth:   mau,
    stickiness:    mau ? Math.round((dau / mau) * 100) : null,   // DAU / MAU, %
    return1:       dayNReturn(profiles, reportDate, 1),
    return7:       dayNReturn(profiles, reportDate, 7),
    streak3plus:   streak3,
    streak7plus:   streak7,
    pushEnabled:   withPush,
    langs,
    outsideIsrael,
  };
}

module.exports = { computeStats, dayNReturn, shiftKey, dateKey };
