'use strict';

const crypto = require('crypto');
const {
  RULES_BY_ACCOUNT, cleanToken, findRule, loadAccounts, accountFor, isValidSignature, makeHandler,
} = require('../igAutoDm');

const SECRET = 'app-secret';
const sign = body => 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

function fakeRes() {
  const r = { code: 0, body: '' };
  r.status = c => { r.code = c; return r; };
  r.send = b => { r.body = b; return r; };
  return r;
}
function env() {
  return {
    verifyToken: () => 'verify-me',
    appSecret: () => SECRET,
    getToken: k => (k === 'IG_ACCESS_TOKEN_2' ? ' "EAAnoam123", ' : 'EAAprime456'),
  };
}
function okFetch() {
  const calls = [];
  const fn = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, text: async () => '{}' }; };
  fn.calls = calls;
  return fn;
}
function post(payload) {
  const raw = JSON.stringify(payload);
  return { method: 'POST', rawBody: Buffer.from(raw), get: h => (h === 'x-hub-signature-256' ? sign(raw) : undefined) };
}
const comment = (entryId, text, fromId = '999', mediaId) => ({
  entry: [{ id: entryId, changes: [{ field: 'comments', value: { id: 'c1', text, from: { id: fromId, username: 'friend' }, ...(mediaId ? { media: { id: mediaId } } : {}) } }] }],
});
const PRIME = '17841426948960609';
function memoryStore() {
  const seen = new Set();
  return { seen, firstTime: async k => (seen.has(k) ? false : (seen.add(k), true)) };
}

describe('rules', () => {
  it('keywords get the rule with the public reply, any other comment gets the DM only', () => {
    for (const t of ['לינק', 'LINK!', 'אפשר קישור?', 'link please']) expect(findRule(RULES_BY_ACCOUNT.noam, t).publicReply).toBeTruthy();
    for (const t of ['אחלה סרטון', 'לינקים', '🔥']) {
      const r = findRule(RULES_BY_ACCOUNT.noam, t);
      expect(r.dm).toMatch(/^היי!/);
      expect(r.publicReply).toBeUndefined();
    }
  });
  it('prime answers in English and noam in Hebrew, both with the app link', () => {
    expect(RULES_BY_ACCOUNT.prime[0].dm).toMatch(/^Hey!/);
    expect(RULES_BY_ACCOUNT.noam[0].dm).toMatch(/^היי!/);
    for (const a of ['prime', 'noam']) expect(RULES_BY_ACCOUNT[a][0].dm).toContain('https://prime-app-84fe0.web.app');
  });
  it('cleanToken keeps only the EAA token', () => {
    expect(cleanToken(' "EAAabc123", ')).toBe('EAAabc123');
    expect(cleanToken(undefined)).toBe('');
  });
  it('accounts are found by Instagram id or page id', () => {
    const accs = loadAccounts(env().getToken);
    expect(accountFor(accs, '17841406927345682').name).toBe('noam');
    expect(accountFor(accs, '1372542799274596').name).toBe('prime');
    expect(accountFor(accs, '0')).toBeUndefined();
    expect(accs.find(a => a.name === 'noam').token).toBe('EAAnoam123');
  });
  it('signature check', () => {
    expect(isValidSignature('{"a":1}', sign('{"a":1}'), SECRET)).toBe(true);
    expect(isValidSignature('{"a":1}', sign('{"a":2}'), SECRET)).toBe(false);
    expect(isValidSignature('{"a":1}', 'sha256=bad', SECRET)).toBe(false);
    expect(isValidSignature('{"a":1}', null, SECRET)).toBe(false);
  });
});

describe('webhook handler', () => {
  beforeEach(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); jest.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => jest.restoreAllMocks());

  it('GET verifies with the right token only', async () => {
    const h = makeHandler(env(), okFetch());
    const ok = fakeRes();
    await h({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': '42' } }, ok);
    expect([ok.code, ok.body]).toEqual([200, '42']);
    const bad = fakeRes();
    await h({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'nope', 'hub.challenge': '42' } }, bad);
    expect(bad.code).toBe(403);
  });

  it('rejects a POST with a bad signature', async () => {
    const f = okFetch();
    const res = fakeRes();
    await makeHandler(env(), f)({ method: 'POST', rawBody: Buffer.from('{}'), get: () => 'sha256=00' }, res);
    expect(res.code).toBe(401);
    expect(f.calls).toHaveLength(0);
  });

  it('a "לינק" comment on noam sends the Hebrew DM from noam\'s page, then the public reply', async () => {
    const f = okFetch();
    const res = fakeRes();
    await makeHandler(env(), f)(post(comment('17841406927345682', 'לינק')), res);
    expect(res.code).toBe(200);
    expect(f.calls).toHaveLength(2);
    expect(f.calls[0].url).toBe('https://graph.facebook.com/v23.0/1365685596630668/messages');
    expect(f.calls[0].init.headers.Authorization).toBe('Bearer EAAnoam123');
    const body = JSON.parse(f.calls[0].init.body);
    expect(body.recipient).toEqual({ comment_id: 'c1' });
    expect(body.message.text).toMatch(/^היי!/);
    expect(f.calls[1].url).toBe('https://graph.facebook.com/v23.0/c1/replies');
  });

  it('ignores the account\'s own comments and unknown accounts', async () => {
    const f = okFetch();
    const h = makeHandler(env(), f);
    await h(post(comment('17841426948960609', 'link', '17841426948960609')), fakeRes());
    await h(post(comment('0', 'link')), fakeRes());
    expect(f.calls).toHaveLength(0);
  });

  it('any comment gets one DM per person: no public reply, and nothing the second time', async () => {
    const f = okFetch();
    const seen = new Set();
    const e = { ...env(), firstTime: async k => (seen.has(k) ? false : (seen.add(k), true)) };
    const h = makeHandler(e, f);
    await h(post(comment('17841426948960609', 'great video 🔥')), fakeRes());
    expect(f.calls.map(c => c.url)).toEqual(['https://graph.facebook.com/v23.0/1372542799274596/messages']);
    await h(post(comment('17841426948960609', 'link')), fakeRes());
    expect(f.calls).toHaveLength(1);
    expect([...seen]).toEqual(['prime_999']);
  });

  it('asking again on a new post gets the link again, once per post', async () => {
    const f = okFetch();
    const { firstTime } = memoryStore();
    const h = makeHandler({ ...env(), firstTime }, f);
    const dms = () => f.calls.filter(c => c.url.endsWith('/messages')).length;
    await h(post(comment(PRIME, 'link', '999', 'reelA')), fakeRes());   // first ever → DM
    expect(dms()).toBe(1);
    await h(post(comment(PRIME, 'link', '999', 'reelA')), fakeRes());   // same post again → nothing
    expect(dms()).toBe(1);
    await h(post(comment(PRIME, 'link pls', '999', 'reelB')), fakeRes()); // new post, asked → DM
    expect(dms()).toBe(2);
    await h(post(comment(PRIME, 'what app is this?', '999', 'reelC')), fakeRes()); // "app" counts as asking
    expect(dms()).toBe(3);
  });

  it('plain comments on new posts never get the link twice', async () => {
    const f = okFetch();
    const { firstTime } = memoryStore();
    const h = makeHandler({ ...env(), firstTime }, f);
    await h(post(comment(PRIME, '🔥🔥', '999', 'reelA')), fakeRes());
    await h(post(comment(PRIME, 'great video', '999', 'reelB')), fakeRes());
    await h(post(comment(PRIME, 'love it', '999', 'reelC')), fakeRes());
    expect(f.calls).toHaveLength(1);
  });

  it('a failed DM still answers 200 to Meta', async () => {
    const f = async () => ({ ok: false, status: 401, text: async () => 'Session has expired' });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = fakeRes();
    await makeHandler(env(), f)(post(comment('17841426948960609', 'link')), res);
    expect(res.code).toBe(200);
  });
});
