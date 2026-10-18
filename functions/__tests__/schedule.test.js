'use strict';

// Pure-logic tests for the daily schedule copy and helpers (no Firebase SDK).

const {
  MORNING_COPY, MIDDAY_COPY, WEEKLY_COPY,
  pickFrom, collectTokens, collectDevices, hasAccountabilityReminder,
} = require('../notifyCopy');

const HEBREW = /[֐-׿]/;

describe('schedule copy', () => {
  it.each([['MORNING_COPY', MORNING_COPY], ['MIDDAY_COPY', MIDDAY_COPY]])('%s has 3 non-empty lines per language', (_n, copy) => {
    for (const lang of ['he', 'en']) {
      expect(copy[lang]).toHaveLength(3);
      for (const m of copy[lang]) {
        expect(m.title.length).toBeGreaterThan(0);
        expect(m.body.length).toBeGreaterThan(0);
      }
    }
  });

  it('Hebrew copy is Hebrew and English copy has no Hebrew', () => {
    const all = [MORNING_COPY, MIDDAY_COPY];
    for (const c of all) {
      for (const m of c.he) expect(HEBREW.test(m.title + m.body)).toBe(true);
      for (const m of c.en) expect(HEBREW.test(m.title + m.body)).toBe(false);
    }
    expect(HEBREW.test(WEEKLY_COPY.he.title + WEEKLY_COPY.he.body)).toBe(true);
    expect(HEBREW.test(WEEKLY_COPY.en.title + WEEKLY_COPY.en.body)).toBe(false);
  });

  it('weekly copy asks for the weekly goals', () => {
    expect(WEEKLY_COPY.he.body).toContain('המטרות');
    expect(WEEKLY_COPY.en.body).toMatch(/goals/i);
  });
});

describe('pickFrom', () => {
  it('picks by language and falls back to Hebrew', () => {
    expect(MORNING_COPY.en).toContain(pickFrom(MORNING_COPY, 'en'));
    expect(MORNING_COPY.he).toContain(pickFrom(MORNING_COPY, 'he'));
    expect(MORNING_COPY.he).toContain(pickFrom(MORNING_COPY, 'ar'));
    expect(MORNING_COPY.he).toContain(pickFrom(MORNING_COPY, undefined));
  });

  it('uses the injected random source (first and last item)', () => {
    expect(pickFrom(MIDDAY_COPY, 'en', () => 0)).toBe(MIDDAY_COPY.en[0]);
    expect(pickFrom(MIDDAY_COPY, 'en', () => 0.999)).toBe(MIDDAY_COPY.en[2]);
  });
});

describe('collectTokens', () => {
  it('merges array and scalar without duplicates', () => {
    const set = collectTokens({ fcmTokens: ['a', 'b'], fcmToken: 'b' });
    expect([...set].sort()).toEqual(['a', 'b']);
  });
  it('adds the scalar when the array is missing', () => {
    expect([...collectTokens({ fcmToken: 'x' })]).toEqual(['x']);
  });
  it('is empty for a user without tokens', () => {
    expect(collectTokens({}).size).toBe(0);
    expect(collectTokens({ fcmTokens: 'not-an-array' }).size).toBe(0);
  });
});

describe('collectDevices — each device in its own language', () => {
  const now = Date.parse('2026-10-18T12:00:00Z');
  it('uses the device language, and the user lang for a device without one', () => {
    const d = { lang: 'en', fcmDevices: {
      phone:  { token: 't1', updatedAt: now, lang: 'he' },
      laptop: { token: 't2', updatedAt: now },
    } };
    expect(collectDevices(d, now)).toEqual([{ token: 't1', lang: 'he' }, { token: 't2', lang: 'en' }]);
  });
  it('ignores an unknown device language', () => {
    const d = { lang: 'he', fcmDevices: { a: { token: 't', updatedAt: now, lang: 'fr' } } };
    expect(collectDevices(d, now)).toEqual([{ token: 't', lang: 'he' }]);
  });
  it('skips idle devices and duplicate tokens, like collectTokens', () => {
    const old = now - 61 * 86400000;
    const d = { fcmDevices: {
      a: { token: 't', updatedAt: now, lang: 'en' },
      b: { token: 't', updatedAt: now, lang: 'he' },
      c: { token: 'idle', updatedAt: old, lang: 'he' },
    } };
    expect(collectDevices(d, now)).toEqual([{ token: 't', lang: 'en' }]);
  });
  it('legacy tokens get the user lang', () => {
    expect(collectDevices({ lang: 'en', fcmTokens: ['x'], fcmToken: 'y' }, now))
      .toEqual([{ token: 'x', lang: 'en' }, { token: 'y', lang: 'en' }]);
    expect(collectDevices({}, now)).toEqual([]);
  });
});

describe('hasAccountabilityReminder', () => {
  it('is true only for PRO with at least one app', () => {
    expect(hasAccountabilityReminder({ isPro: true, accountabilityApps: ['טיקטוק'] })).toBe(true);
    expect(hasAccountabilityReminder({ isPro: true, accountabilityApps: [] })).toBe(false);
    expect(hasAccountabilityReminder({ isPro: false, accountabilityApps: ['x'] })).toBe(false);
    expect(hasAccountabilityReminder({ isPro: true })).toBe(false);
    expect(hasAccountabilityReminder({})).toBe(false);
  });
});

// ── Per-user local time (localScheduler) ──────────────────────────────────────
const {
  PUSH_SLOTS, isValidTimeZone, localClock, dueSlots, shouldPush, buildPush,
} = require('../notifyCopy');

const at = iso => new Date(iso);
const kinds = (now, tz) => dueSlots(localClock(now, tz)).map(s => s.kind);

describe('localClock — the user\'s own time', () => {
  it('Israel summer time (UTC+3): 05:00Z is 08:00', () => {
    expect(localClock(at('2026-10-15T05:00:00Z'), 'Asia/Jerusalem')).toEqual({ date: '2026-10-15', weekday: 4, slot: '08:00' });
  });
  it('Israel winter time (UTC+2): 06:00Z is 08:00', () => {
    expect(localClock(at('2026-12-01T06:00:00Z'), 'Asia/Jerusalem').slot).toBe('08:00');
  });
  it('New York: 12:00Z on a summer-time day is 08:00', () => {
    expect(localClock(at('2026-10-15T12:00:00Z'), 'America/New_York').slot).toBe('08:00');
  });
  it('local date can differ from the UTC date', () => {
    expect(localClock(at('2026-10-15T23:00:00Z'), 'Asia/Tokyo').date).toBe('2026-10-16');
    expect(localClock(at('2026-10-15T02:00:00Z'), 'America/Los_Angeles').date).toBe('2026-10-14');
  });
  it('floors to the half hour, so a late start still matches', () => {
    expect(localClock(at('2026-10-15T05:01:40Z'), 'Asia/Jerusalem').slot).toBe('08:00');
    expect(localClock(at('2026-10-15T12:31:00Z'), 'Asia/Jerusalem').slot).toBe('15:30');
  });
  it('half-hour and 45-minute offsets still hit each slot once', () => {
    expect(localClock(at('2026-10-15T02:30:00Z'), 'Asia/Kolkata').slot).toBe('08:00');     // +5:30
    expect(localClock(at('2026-10-15T02:30:00Z'), 'Asia/Kathmandu').slot).toBe('08:00');   // +5:45 → 08:15
  });
  it('missing or invalid tz falls back to Israel', () => {
    const israel = localClock(at('2026-10-15T05:00:00Z'), 'Asia/Jerusalem');
    expect(localClock(at('2026-10-15T05:00:00Z'), undefined)).toEqual(israel);
    expect(localClock(at('2026-10-15T05:00:00Z'), 'Not/AZone')).toEqual(israel);
    expect(isValidTimeZone(42)).toBe(false);
    expect(isValidTimeZone('Europe/London')).toBe(true);
  });
});

describe('dueSlots — which pushes are due now', () => {
  it('same five pushes and times as the old schedulers', () => {
    expect(PUSH_SLOTS.map(s => `${s.kind}@${s.at}`)).toEqual([
      'morning@08:00', 'weekly@10:00', 'midday@15:30', 'accountability@18:00', 'nudge@19:30',
    ]);
  });
  it('morning at 08:00 local for both Israel and New York users, not at the same UTC moment', () => {
    expect(kinds(at('2026-10-15T05:00:00Z'), 'Asia/Jerusalem')).toEqual(['morning']);
    expect(kinds(at('2026-10-15T05:00:00Z'), 'America/New_York')).toEqual([]);
    expect(kinds(at('2026-10-15T12:00:00Z'), 'America/New_York')).toEqual(['morning']);
  });
  it('weekly only on Sunday 10:00 local', () => {
    expect(kinds(at('2026-10-18T07:00:00Z'), 'Asia/Jerusalem')).toEqual(['weekly']);     // Sun
    expect(kinds(at('2026-10-19T07:00:00Z'), 'Asia/Jerusalem')).toEqual([]);             // Mon
  });
  it('each slot fires exactly once across a whole day of half-hour runs', () => {
    for (const tz of ['Asia/Jerusalem', 'America/New_York', 'Asia/Kathmandu', 'Australia/Sydney']) {
      const seen = [];
      for (let m = 0; m < 48; m++) {
        const now = new Date(Date.UTC(2026, 9, 14, 0, 0) + m * 30 * 60000);
        seen.push(...kinds(now, tz).filter(k => k !== 'weekly'));
      }
      expect(seen.sort()).toEqual(['accountability', 'midday', 'morning', 'nudge']);
    }
  });
});

describe('shouldPush — who gets what', () => {
  const clock = { date: '2026-10-15', weekday: 4, slot: '15:30' };
  const now   = at('2026-10-15T12:30:00Z');
  const pro   = { isPro: true, accountabilityApps: ['TikTok'] };
  it('morning and weekly go to everyone', () => {
    expect(shouldPush('morning', {}, clock, now)).toBe(true);
    expect(shouldPush('weekly', {}, clock, now)).toBe(true);
  });
  it('midday and nudge skip users who are done today', () => {
    const done = { streak: { lastDate: '2026-10-15' } };
    expect(shouldPush('midday', done, clock, now)).toBe(false);
    expect(shouldPush('midday', {}, clock, now)).toBe(true);
    expect(shouldPush('nudge', done, clock, now)).toBe(false);
  });
  it('done counts on the UTC date too (client saves lastDate in UTC)', () => {
    const laClock = { date: '2026-10-14', weekday: 3, slot: '19:30' };
    const laNow   = at('2026-10-15T02:30:00Z');
    expect(shouldPush('nudge', { streak: { lastDate: '2026-10-15' } }, laClock, laNow)).toBe(false);
  });
  it('accountability only for PRO with apps, and they skip the evening nudge', () => {
    expect(shouldPush('accountability', pro, clock, now)).toBe(true);
    expect(shouldPush('accountability', {}, clock, now)).toBe(false);
    expect(shouldPush('nudge', pro, clock, now)).toBe(false);
  });
});

describe('buildPush — message per kind', () => {
  const url = 'https://prime-app-84fe0.web.app/';
  it('each kind has its own tag and the right link', () => {
    const tags = ['morning', 'weekly', 'midday', 'nudge'].map(k => buildPush(k, { lang: 'en' }, url).tag);
    expect(new Set(tags).size).toBe(4);
    expect(buildPush('nudge', {}, url).url).toBe(`${url}#hub`);
    expect(buildPush('accountability', { accountabilityApps: ['TikTok'] }, url).url).toBe(`${url}#focus-gate`);
  });
  it('uses the user\'s language, Hebrew by default', () => {
    expect(HEBREW.test(buildPush('morning', {}, url, () => 0).title)).toBe(true);
    expect(HEBREW.test(buildPush('morning', { lang: 'en' }, url, () => 0).title)).toBe(false);
    expect(buildPush('accountability', { lang: 'en', accountabilityApps: ['TikTok'] }, url).title).toContain('TikTok');
  });
  it('unknown kind → null', () => {
    expect(buildPush('nope', {}, url)).toBeNull();
  });
});

describe('collectTokens — one token per device', () => {
  const NOW = 1_800_000_000_000;
  it('uses fcmDevices when present and ignores the old pile-up', () => {
    const u = {
      fcmTokens: ['old-1', 'old-2', 'old-3'], fcmToken: 'old-3',
      fcmDevices: { a: { token: 'phone', updatedAt: NOW }, b: { token: 'mac', updatedAt: NOW } },
    };
    expect([...collectTokens(u, NOW)].sort()).toEqual(['mac', 'phone']);
  });
  it('skips devices not seen for 60 days and bad entries', () => {
    const u = { fcmDevices: {
      a: { token: 'fresh', updatedAt: NOW - 86400000 },
      b: { token: 'gone',  updatedAt: NOW - 61 * 86400000 },
      c: { token: '' }, d: null,
    } };
    expect([...collectTokens(u, NOW)]).toEqual(['fresh']);
  });
  it('no fcmDevices → legacy array + scalar, deduplicated', () => {
    expect([...collectTokens({ fcmTokens: ['x', 'y'], fcmToken: 'x' }, NOW)]).toEqual(['x', 'y']);
    expect(collectTokens({ fcmDevices: {} , fcmToken: 'z' }, NOW).has('z')).toBe(true);
  });
});
