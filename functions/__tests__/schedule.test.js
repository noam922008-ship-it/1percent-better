'use strict';

// Pure-logic tests for the daily schedule copy and helpers (no Firebase SDK).

const {
  MORNING_COPY, MIDDAY_COPY, WEEKLY_COPY,
  pickFrom, collectTokens, hasAccountabilityReminder,
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

describe('hasAccountabilityReminder', () => {
  it('is true only for PRO with at least one app', () => {
    expect(hasAccountabilityReminder({ isPro: true, accountabilityApps: ['טיקטוק'] })).toBe(true);
    expect(hasAccountabilityReminder({ isPro: true, accountabilityApps: [] })).toBe(false);
    expect(hasAccountabilityReminder({ isPro: false, accountabilityApps: ['x'] })).toBe(false);
    expect(hasAccountabilityReminder({ isPro: true })).toBe(false);
    expect(hasAccountabilityReminder({})).toBe(false);
  });
});
