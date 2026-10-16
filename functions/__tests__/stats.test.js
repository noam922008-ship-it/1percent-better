'use strict';

const { computeStats, dayNReturn, shiftKey } = require('../stats');

const R = '2026-10-15';   // report date
const p = (created, days = [], streak) => ({ createdAt: `${created}T10:00:00.000Z`, activityLog: days, ...(streak ? { streak } : {}) });

describe('shiftKey', () => {
  it('moves across months', () => {
    expect(shiftKey('2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftKey('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('computeStats — active users', () => {
  const profiles = [
    p('2026-09-01', ['2026-10-15']),                 // active today
    p('2026-09-01', ['2026-10-10']),                 // this week
    p('2026-09-01', ['2026-09-20']),                 // this month
    p('2026-08-01', ['2026-08-02']),                 // gone
    p('2026-10-15', ['2026-10-15']),                 // new today
  ];
  const s = computeStats(profiles, [], R);
  it('day / week / month', () => {
    expect(s.activeDay).toBe(2);
    expect(s.activeWeek).toBe(3);
    expect(s.activeMonth).toBe(4);
    expect(s.accounts).toBe(5);
    expect(s.newUsers).toBe(1);
    expect(s.stickiness).toBe(50);
  });
  it('week window is 7 days including the report day', () => {
    expect(computeStats([p('2026-09-01', ['2026-10-09'])], [], R).activeWeek).toBe(1);
    expect(computeStats([p('2026-09-01', ['2026-10-08'])], [], R).activeWeek).toBe(0);
  });
});

describe('dayNReturn — rolling week of cohorts', () => {
  it('day 1: came back the day after signing up', () => {
    const profiles = [
      p('2026-10-14', ['2026-10-14', '2026-10-15']),  // returned
      p('2026-10-13', ['2026-10-13']),                // did not
      p('2026-10-15', ['2026-10-15']),                // too new — not in cohort
    ];
    expect(dayNReturn(profiles, R, 1)).toEqual({ cohort: 2, returned: 1, pct: 50 });
  });
  it('day 7: signed up 7–13 days ago and active on their own day 7', () => {
    const profiles = [
      p('2026-10-08', ['2026-10-15']),                // day 7 = 10-15 ✓
      p('2026-10-02', ['2026-10-09']),                // day 7 = 10-09 ✓ (oldest cohort day)
      p('2026-10-05', ['2026-10-11']),                // day 6 only ✗
      p('2026-10-01', ['2026-10-08']),                // signed up 14 days ago — out
    ];
    expect(dayNReturn(profiles, R, 7)).toEqual({ cohort: 3, returned: 2, pct: 67 });
  });
  it('no cohort → pct null, profiles without createdAt are skipped', () => {
    expect(dayNReturn([{ activityLog: ['2026-10-15'] }], R, 7)).toEqual({ cohort: 0, returned: 0, pct: null });
  });
});

describe('computeStats — streaks, push, languages', () => {
  it('counts only live streaks (last active within 2 days)', () => {
    const s = computeStats([
      p('2026-09-01', [], { count: 8, lastDate: '2026-10-15' }),
      p('2026-09-01', [], { count: 4, lastDate: '2026-10-13' }),
      p('2026-09-01', [], { count: 20, lastDate: '2026-10-01' }),   // broken
    ], [], R);
    expect(s.streak3plus).toBe(2);
    expect(s.streak7plus).toBe(1);
  });
  it('push, languages and users outside Israel', () => {
    const s = computeStats([], [
      { fcmTokens: ['a'], lang: 'he', tz: 'Asia/Jerusalem' },
      { fcmToken: 'b', lang: 'en', tz: 'America/New_York' },
      { lang: 'xx' },
    ], R);
    expect(s.pushEnabled).toBe(2);
    expect(s.langs).toEqual({ he: 2, en: 1 });
    expect(s.outsideIsrael).toBe(1);
  });
  it('result holds counts only — no ids or personal fields', () => {
    const s = computeStats([{ ...p('2026-10-15', ['2026-10-15']), name: 'Noam', email: 'x@y.z' }], [{ email: 'x@y.z', fcmToken: 't' }], R);
    const json = JSON.stringify(s);
    expect(json).not.toContain('Noam');
    expect(json).not.toContain('x@y.z');
    expect(json).not.toContain('"t"');
  });
});
