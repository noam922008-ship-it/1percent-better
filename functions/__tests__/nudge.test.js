'use strict';

// Pure-logic tests — no Firebase SDK required. Copy and helpers come from ../notifyCopy,
// the same module index.js uses.

const {
  NUDGE_COPY, ACCOUNTABILITY_COPY, TEST_COPY, BROADCAST_COPY,
  copyFor, todayIsraelDateKey, pickCopy, isCompletedToday,
} = require('../notifyCopy');

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('todayIsraelDateKey', () => {
  it('returns a YYYY-MM-DD string', () => {
    const key = todayIsraelDateKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses Israel timezone (UTC+2/+3), not UTC', () => {
    // At 23:30 UTC (which is 01:30 Israel next day), the Israel date is different from UTC.
    const utcMidnight = new Date('2024-03-15T23:30:00Z');
    const israelKey   = todayIsraelDateKey(utcMidnight);
    const utcKey      = utcMidnight.toISOString().split('T')[0];
    // Israel date should be 2024-03-16 (next day), UTC date is 2024-03-15
    expect(israelKey).toBe('2024-03-16');
    expect(utcKey).toBe('2024-03-15');
  });
});

describe('isCompletedToday', () => {
  const TODAY = '2024-06-10';

  it('ignores the old lastPostDate field', () => {
    expect(isCompletedToday({ streak: { lastPostDate: TODAY } }, TODAY)).toBe(false);
  });

  it('returns true when streak.lastDate === today', () => {
    expect(isCompletedToday({ streak: { lastDate: TODAY } }, TODAY)).toBe(true);
  });

  it('returns false when streak.lastDate is yesterday', () => {
    expect(isCompletedToday({ streak: { lastDate: '2024-06-09' } }, TODAY)).toBe(false);
  });

  it('returns true when all 3 daily quests are complete', () => {
    const userData = {
      streak: { lastDate: '2024-06-09' },
      [`dailyQuests_${TODAY}`]: { pushup: true, monkMode: true, quickReview: true },
    };
    expect(isCompletedToday(userData, TODAY)).toBe(true);
  });

  it('returns false when only some quests complete', () => {
    const userData = {
      [`dailyQuests_${TODAY}`]: { pushup: true, monkMode: false, quickReview: true },
    };
    expect(isCompletedToday(userData, TODAY)).toBe(false);
  });

  it('returns false for empty user doc', () => {
    expect(isCompletedToday({}, TODAY)).toBe(false);
  });

  it('returns false when no streak and no quests', () => {
    expect(isCompletedToday({ name: 'test', fcmToken: 'abc' }, TODAY)).toBe(false);
  });
});

describe('pickCopy', () => {
  it('returns Hebrew copy for "he"', () => {
    const copy = pickCopy('he');
    expect(NUDGE_COPY.he).toContainEqual(copy);
  });

  it('returns English copy for "en"', () => {
    const copy = pickCopy('en');
    expect(NUDGE_COPY.en).toContainEqual(copy);
  });

  it('falls back to Hebrew for unknown lang', () => {
    const copy = pickCopy('jp');
    expect(NUDGE_COPY.he).toContainEqual(copy);
  });

  it('copy has non-empty title and body', () => {
    for (const lang of ['he', 'en', 'ar']) {
      for (const copy of NUDGE_COPY[lang]) {
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.body.length).toBeGreaterThan(0);
      }
    }
  });

  it('produces all 3 variants across many calls (not stuck on one)', () => {
    const seen = new Set();
    for (let i = 0; i < 300; i++) seen.add(pickCopy('he').title);
    expect(seen.size).toBe(3);
  });
});

// ── accountabilityReminder helpers ────────────────────────────────────────────

function buildAccountabilityMessages(users) {
  const messages   = [];
  const tokenToUid = new Map();

  for (const { uid, data: d } of users) {
    const apps = Array.isArray(d.accountabilityApps) ? d.accountabilityApps : [];
    if (!d.isPro || apps.length === 0) continue;

    const tokenSet = new Set(Array.isArray(d.fcmTokens) ? d.fcmTokens : []);
    if (d.fcmToken) tokenSet.add(d.fcmToken);
    if (!tokenSet.size) continue;

    const lang    = d.lang || 'he';
    const appName = apps[0];
    const copy    = copyFor(ACCOUNTABILITY_COPY, lang)(appName);

    for (const token of tokenSet) {
      tokenToUid.set(token, uid);
      messages.push({ token, copy });
    }
  }
  return { messages, tokenToUid };
}

describe('accountabilityReminder message builder', () => {
  it('skips non-PRO users', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u1', data: { isPro: false, accountabilityApps: ['TikTok'], fcmTokens: ['tok1'] } },
    ]);
    expect(messages).toHaveLength(0);
  });

  it('skips PRO users with no accountability apps', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u2', data: { isPro: true, accountabilityApps: [], fcmTokens: ['tok2'] } },
    ]);
    expect(messages).toHaveLength(0);
  });

  it('skips PRO users with no FCM tokens', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u3', data: { isPro: true, accountabilityApps: ['Instagram'], fcmTokens: [] } },
    ]);
    expect(messages).toHaveLength(0);
  });

  it('builds message for PRO user with app + token', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u4', data: { isPro: true, accountabilityApps: ['TikTok'], fcmTokens: ['tok4'], lang: 'en' } },
    ]);
    expect(messages).toHaveLength(1);
    expect(messages[0].copy.title).toContain('TikTok');
    expect(messages[0].copy.lang).toBe('en');
  });

  it('uses first app in list for the notification', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u5', data: { isPro: true, accountabilityApps: ['TikTok', 'Instagram'], fcmTokens: ['tok5'], lang: 'he' } },
    ]);
    expect(messages[0].copy.title).toContain('TikTok');
    expect(messages[0].copy.title).not.toContain('Instagram');
  });

  it('sends Hebrew copy for lang=he', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u6', data: { isPro: true, accountabilityApps: ['YouTube'], fcmTokens: ['tok6'], lang: 'he' } },
    ]);
    expect(messages[0].copy.lang).toBe('he');
    expect(messages[0].copy.title).toContain('YouTube');
  });

  it('falls back to Hebrew for unknown or missing lang', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u7', data: { isPro: true, accountabilityApps: ['Reddit'], fcmTokens: ['tok7'], lang: 'jp' } },
      { uid: 'u9', data: { isPro: true, accountabilityApps: ['Reddit'], fcmTokens: ['tok9'] } },
    ]);
    expect(messages.map(m => m.copy.lang)).toEqual(['he', 'he']);
  });

  it('deduplicates tokens from fcmToken scalar + fcmTokens array', () => {
    const { messages } = buildAccountabilityMessages([
      { uid: 'u8', data: {
        isPro: true, accountabilityApps: ['X'],
        fcmToken: 'same-tok', fcmTokens: ['same-tok', 'other-tok'], lang: 'en',
      }},
    ]);
    expect(messages).toHaveLength(2); // 'same-tok' deduped, 'other-tok' added
    const tokens = messages.map(m => m.token);
    expect(new Set(tokens).size).toBe(2);
  });

  it('handles multiple users correctly', () => {
    const users = [
      { uid: 'a', data: { isPro: true,  accountabilityApps: ['TikTok'],    fcmTokens: ['t1'], lang: 'en' } },
      { uid: 'b', data: { isPro: false, accountabilityApps: ['Instagram'], fcmTokens: ['t2'], lang: 'he' } },
      { uid: 'c', data: { isPro: true,  accountabilityApps: [],            fcmTokens: ['t3'], lang: 'ar' } },
      { uid: 'd', data: { isPro: true,  accountabilityApps: ['YouTube'],   fcmTokens: ['t4'], lang: 'ar' } },
    ];
    const { messages } = buildAccountabilityMessages(users);
    expect(messages).toHaveLength(2); // only a and d qualify
    expect(messages.map(m => m.token)).toEqual(['t1', 't4']);
  });
});

// ── Copy in both languages ───────────────────────────────────────────────────

const HEBREW = /[\u0590-\u05FF]/;

describe('push copy — Hebrew and English', () => {
  it('nudge has the same number of lines in he and en, English without Hebrew', () => {
    expect(NUDGE_COPY.en).toHaveLength(NUDGE_COPY.he.length);
    for (const { title, body } of NUDGE_COPY.en) {
      expect(title).not.toMatch(HEBREW);
      expect(body).not.toMatch(HEBREW);
    }
  });

  it('Hebrew nudge has none of the old wording (1%, Monk Mode, missions, triggers, Streak)', () => {
    const all = NUDGE_COPY.he.map(c => c.title + ' ' + c.body).join(' ');
    for (const old of ['1%', 'מונק', 'משימות', 'טריגר', 'Streak']) expect(all).not.toContain(old);
  });

  it("nudge 3's body doesn't repeat its title", () => {
    expect(NUDGE_COPY.he[2].body).not.toContain('מחכים');
    expect(NUDGE_COPY.en[2].body).not.toContain('waiting');
  });

  it('test push and broadcast exist in he and en', () => {
    for (const map of [TEST_COPY, BROADCAST_COPY]) {
      expect(map.he.title).toMatch(HEBREW);
      expect(map.he.body).toMatch(HEBREW);
      expect(map.en.title).not.toMatch(HEBREW);
      expect(map.en.body).not.toMatch(HEBREW);
    }
  });

  it('copyFor picks the lang and falls back to Hebrew', () => {
    expect(copyFor(TEST_COPY, 'en')).toBe(TEST_COPY.en);
    expect(copyFor(TEST_COPY, 'he')).toBe(TEST_COPY.he);
    expect(copyFor(TEST_COPY, undefined)).toBe(TEST_COPY.he);
    expect(copyFor(TEST_COPY, 'ar')).toBe(TEST_COPY.he);
  });

  it('index.js has no Hebrew of its own — all copy lives in notifyCopy.js', () => {
    const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.js'), 'utf8');
    expect(src).not.toMatch(HEBREW);
  });
});
