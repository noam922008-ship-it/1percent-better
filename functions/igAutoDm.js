'use strict';

// Instagram comment -> auto DM. Moved from the Supabase Edge Function "ig-autodm" (2026-10-18)
// because the free Supabase project pauses after a week without traffic.
// GET  = Meta webhook verification (hub.challenge)
// POST = new comment -> keyword match -> private reply (DM) + optional public reply
// Meta app: "Noam Auto Reply", Instagram API with Facebook Login (pages send the DMs).

const crypto = require('crypto');

// Words that mean "send me the link". These also get the link again on a new post (see handleComment).
const ASK_WORDS = ['לינק', 'link', 'קישור', 'app', 'אפליקציה', 'prime', 'פריים'];

// ===== Rules per account (prime = English, noam = Hebrew) =====
// keywords: ["*"] = every comment gets the DM. mediaIds empty = all posts and reels.
const RULES_BY_ACCOUNT = {
  // @prime.daily.app (English videos)
  prime: [
    {
      keywords: ASK_WORDS,
      dm: "Hey! 🙌 Here's your link to PRIME Daily:\nhttps://prime-daily.app/?utm_source=instagram&utm_medium=dm&utm_campaign=prime\n\nPick a good habit to start, or a bad one to quit. Free, takes a minute 💪\nSo which habit would you most like to start, or quit? 👀",
      publicReply: 'Sent you a DM 📩',
    },
    // Any other comment: the same DM, no public reply (so "Sent you a DM" isn't under every 🔥)
    {
      keywords: ['*'],
      dm: "Thanks for the comment 🙏\nWant to start a good habit or quit a bad one? Free, takes a minute:\nhttps://prime-daily.app/?utm_source=instagram&utm_medium=dm&utm_campaign=prime",
    },
  ],
  // @noam_cohen_02 (Hebrew videos)
  noam: [
    {
      keywords: ASK_WORDS,
      dm: 'היי! 🙌 הנה הלינק לאפליקציה:\nhttps://prime-daily.app/?utm_source=instagram&utm_medium=dm&utm_campaign=noam\n\nנכנסים ובוחרים הרגל טוב להתחיל, או הרגל רע להפסיק. חינם ולוקח דקה 💪\nאז איזה הרגל הכי היית רוצה להתחיל, או להפסיק? 👀',
      publicReply: 'שלחתי לך בפרטי 📩',
    },
    // כל תגובה אחרת: אותו DM, בלי תגובה ציבורית
    {
      keywords: ['*'],
      dm: 'תודה על התגובה 🙏\nאם בא לך להתחיל הרגל טוב או להפסיק הרגל רע (חינם, לוקח דקה):\nhttps://prime-daily.app/?utm_source=instagram&utm_medium=dm&utm_campaign=noam',
    },
  ],
};

// IDs are public (not secrets): the Instagram business account and the Facebook page behind it.
// Tokens come from Secret Manager: IG_ACCESS_TOKEN (prime) and IG_ACCESS_TOKEN_2 (noam).
const ACCOUNT_DEFS = [
  { name: 'prime', igUserId: '17841426948960609', pageId: '1372542799274596', tokenKey: 'IG_ACCESS_TOKEN' },
  { name: 'noam',  igUserId: '17841406927345682', pageId: '1365685596630668', tokenKey: 'IG_ACCESS_TOKEN_2' },
];

const API_VERSION = 'v23.0';
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

/** Keep only the token itself (EAA...): pasted values sometimes carry spaces, quotes or commas. */
function cleanToken(raw) {
  const s = String(raw || '');
  const m = s.match(/EAA[A-Za-z0-9]+/);
  return m ? m[0] : s.trim();
}

/** Lowercase, punctuation to spaces, single spaces. */
function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findRule(rules, text, mediaId) {
  const words = normalize(text).split(' ');
  return rules.find(r => {
    if (r.mediaIds && r.mediaIds.length && (!mediaId || !r.mediaIds.includes(mediaId))) return false;
    return r.keywords.some(k => k === '*' || words.includes(normalize(k)));
  });
}

/** Accounts with their tokens; getToken(key) reads a secret. */
function loadAccounts(getToken) {
  return ACCOUNT_DEFS.map(d => ({
    name: d.name,
    igUserId: d.igUserId,
    pageId: d.pageId,
    token: cleanToken(getToken(d.tokenKey)),
    rules: RULES_BY_ACCOUNT[d.name] || [],
  }));
}

function accountFor(accounts, entryId) {
  return accounts.find(a => a.igUserId === entryId || a.pageId === entryId);
}

/** Meta signs the raw body with the app secret: x-hub-signature-256: sha256=<hex>. */
function isValidSignature(rawBody, header, appSecret) {
  if (!header || !header.startsWith('sha256=') || !appSecret) return false;
  const expected = Buffer.from(header.slice(7), 'utf8');
  const actual = Buffer.from(crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex'), 'utf8');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function sendPrivateReply(acc, commentId, text, fetchFn) {
  const res = await fetchFn(`${GRAPH}/${acc.pageId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${acc.token}` },
    body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text } }),
  });
  const body = await res.text().catch(e => `(could not read body: ${e})`);
  if (!res.ok) console.error('DM failed', res.status, body);
  else console.log('DM sent', commentId, res.status);
  return res.ok;
}

async function sendPublicReply(acc, commentId, text, fetchFn) {
  const res = await fetchFn(`${GRAPH}/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${acc.token}` },
    body: new URLSearchParams({ message: text }).toString(),
  });
  if (!res.ok) console.error('Public reply failed', res.status, await res.text().catch(() => ''));
  else console.log('Public reply sent', commentId);
  return res.ok;
}

/**
 * firstTime(key) → true the first time a key is seen (the store remembers every key).
 * - Anyone's first comment ever on this account gets the DM.
 * - After that, only someone who asks again (a word from ASK_WORDS) on a post where they
 *   didn't get it yet gets it again. Plain comments ("🔥", "great") never get it twice, so
 *   people who comment on every video aren't spammed.
 * Without a store: always true.
 * release(key) undoes a firstTime() of this comment when the DM didn't go out, so the person
 * isn't marked as "sent" for a DM they never got (the next comment or a Meta retry can send it).
 * Logs carry no comment text or usernames (personal data) — only ids.
 */
async function handleComment(acc, v, fetchFn, firstTime = async () => true, release = async () => {}) {
  // Ignore the account's own comments, or the bot would answer itself
  if (!v || !v.text || (v.from && v.from.id === acc.igUserId)) return 'ignored';
  const rule = findRule(acc.rules, v.text, v.media && v.media.id);
  if (!rule) return 'no-match';
  const who = v.from && v.from.id;
  const claimed = [];
  const claim = async key => { const first = await firstTime(key); if (first) claimed.push(key); return first; };
  if (who) {
    const mediaId = v.media && v.media.id;
    const firstEver = await claim(`${acc.name}_${who}`);
    // Always mark the post too, so a "link" on the post where they first got it doesn't resend
    const firstOnPost = mediaId ? await claim(`${acc.name}_${who}_${mediaId}`) : firstEver;
    const asked = !rule.keywords.includes('*');
    if (!firstEver && !(asked && firstOnPost)) {
      console.log(`[${acc.name}] already sent for comment ${v.id}, skipping`);
      return 'already-sent';
    }
  }

  console.log(`[${acc.name}] match on comment ${v.id}`);
  let sent = false;
  try { sent = await sendPrivateReply(acc, v.id, rule.dm, fetchFn); } catch (e) { console.error('DM error', e && e.message); }
  if (!sent) {
    // Not delivered: forget the marks of this comment, and don't claim "Sent you a DM" publicly
    await Promise.all(claimed.map(k => Promise.resolve().then(() => release(k)).catch(() => {})));
    return 'dm-failed';
  }
  if (rule.publicReply) {
    try { await sendPublicReply(acc, v.id, rule.publicReply, fetchFn); } catch (e) { console.error('Public reply error', e); }
  }
  return 'sent';
}

/**
 * The HTTP handler. env = { verifyToken, appSecret, getToken(key), firstTime?(key), release?(key) }.
 * req/res are Express-style (Cloud Functions): req.rawBody is the exact body Meta signed.
 */
function makeHandler(env, fetchFn = globalThis.fetch) {
  let accounts = null;
  return async (req, res) => {
    if (req.method === 'GET') {
      const q = req.query || {};
      if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === env.verifyToken() && q['hub.challenge']) {
        res.status(200).send(String(q['hub.challenge']));
      } else {
        res.status(403).send('Forbidden');
      }
      return;
    }

    if (req.method === 'POST') {
      const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
      if (!isValidSignature(raw, req.get ? req.get('x-hub-signature-256') : req.headers['x-hub-signature-256'], env.appSecret())) {
        console.warn('bad signature');
        res.status(401).send('Unauthorized');
        return;
      }
      if (!accounts) {
        accounts = loadAccounts(env.getToken);
        console.log('accounts', accounts.map(a => ({ name: a.name, tokenLength: a.token.length, startsWithEAA: a.token.startsWith('EAA') })));
      }

      let payload;
      try { payload = JSON.parse(raw); } catch { res.status(400).send('Bad JSON'); return; }
      const jobs = [];
      for (const entry of payload.entry || []) {
        const acc = accountFor(accounts, String(entry.id ?? ''));
        if (!acc) { console.warn('event for unknown account', entry.id); continue; }
        for (const change of entry.changes || []) {
          if (change.field === 'comments' || change.field === 'live_comments') {
            jobs.push(handleComment(acc, change.value, fetchFn, env.firstTime, env.release).catch(e => console.error(e)));
          }
        }
      }
      // Finish the work before answering (Meta waits up to 20 seconds)
      await Promise.all(jobs);
      res.status(200).send('EVENT_RECEIVED');
      return;
    }

    res.status(405).send('Method Not Allowed');
  };
}

module.exports = {
  RULES_BY_ACCOUNT, ACCOUNT_DEFS, ASK_WORDS,
  cleanToken, normalize, findRule, loadAccounts, accountFor, isValidSignature, handleComment, makeHandler,
};
