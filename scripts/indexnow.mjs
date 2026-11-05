// Tells Bing (and the other IndexNow engines: Yandex, Naver, Seznam…) about every page in the
// sitemap, so new or changed pages are crawled within hours instead of weeks.
// Run after a hosting deploy:  node scripts/indexnow.mjs
// The key file public/331223294d85998f15dfce17e24cb0e7.txt must be live first (it proves we own the domain).
import { readFileSync } from 'node:fs'

const KEY = '331223294d85998f15dfce17e24cb0e7'
const HOST = 'prime-daily.app'
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URLs)`)
// 200/202 = accepted. 403 = key file not found yet (deploy first). 422 = a URL isn't on this host.
