# PRIME — 1% Better · CLAUDE.md

> **Every feature must fit VISION.md. If a request doesn't fit the vision, say so before building it. Never add features that aren't explicitly requested.**

**Project path:** `/Users/nwmkhn/Desktop/1-percent-better`
**Stack:** React 19 + Vite 8, inline styles only, RTL Hebrew (`direction: 'rtl'`), black-and-gold design.
**Package name:** `noam-habits-ai` · **No Next.js** — plain SPA.

---

## Firebase

Single project: **`better-de9aa`**

| Resource | Detail |
|---|---|
| Firestore | User profiles, habits, XP, workout history · owner-only subcollections: My Tasks `users/{uid}/tasks`, Journal `users/{uid}/journal`, lesson notes `users/{uid}/lessons/{lessonId}`, weekly habit check-ins `users/{uid}/habitLog/{date}` |
| Hosting site `prime-app-84fe0` | Live app → https://prime-app-84fe0.web.app |
| Hosting site `1percent-better-app` | 301 redirect target only — do not deploy content here |
| Hosting site `prime-daily-app` | 302 redirect → live app, keeps path + query (`?utm_source=` survives). Link in bio points here |
| Analytics | GA4 `G-MJTZP4CKGM` (`VITE_FIREBASE_MEASUREMENT_ID` in `.env.local`) · `src/services/analytics.js`: six events, no personal data, UTM captured on landing |
| Functions | Node.js 22, region `europe-west1`, Firebase Functions v2 |
| Storage | `/workout-analysis/{uid}/{file}` — video upload for Gemini analysis |
| Secret Manager | `GEMINI_API_KEY` bound to `analyzeWithGemini` + `analyzeBoxingSession` via `defineSecret` |

`.firebaserc` targets:
- `prime-app` → `["prime-app-84fe0"]` (the live app)
- `prime` → `["1percent-better-app"]` (redirect only)
- `prime-daily` → `["prime-daily-app"]` (redirect only — deploy only when `firebase.json` redirects change)

**Never use `prime` target for real deployments.**

---

## Deploy commands

```bash
# Frontend only
npx firebase-tools deploy --only hosting:prime-app --project better-de9aa

# Functions + Storage rules only (after secret is configured)
npx firebase-tools deploy --only functions,storage --project better-de9aa

# Both at once
npx firebase-tools deploy --only hosting:prime-app,functions,storage --project better-de9aa
```

Build first: `npm run build` (outputs to `dist/`).
CLI: `npx firebase-tools` (v15.30.1, not globally installed).

**Testing:** never drive save-capable flows in the owner's signed-in Chrome. Use `npm test` (vitest), curl, headless Chrome with a throwaway profile (`~/Library/Caches/ms-playwright/chromium_headless_shell-1217/*/chrome-headless-shell --user-data-dir=<tmp> --dump-dom`), or the emulators + `scripts/emulator-seed.mjs`. `--dump-dom` with `--virtual-time-budget` is flaky against the live site (empty `#root`) — for a real check use `playwright-core` in the scratchpad with `executablePath` = that headless shell and `getByText(...).waitFor()`.
**Rules tests:** `JAVA_HOME=/opt/homebrew/opt/openjdk@21 npm run test:rules` — starts the Firestore emulator and runs `tests/rules/*.test.js` (kept out of `npm test`). Add a test for every rules change; write it against the old rules first to see it fail.
**npm cache:** some files in `~/.npm` are root-owned; if `npm i` fails with EACCES, use `--cache <scratchpad>/npmcache` (don't sudo).
**Is live == main?** `vite build --outDir <tmp>` and `cmp` each `assets/*` against the live URL — Vite hashes are deterministic.

---

## GEMINI_API_KEY — STATUS: NOT YET DEPLOYED ⚠️

**Launched without AI (2026-10-04):** `FEATURES.ai = false` — `callGemini` throws before any network call, `geminiAvailable()` is false, services use static fallbacks, boxing photo/video analysis is hidden and no clip is uploaded (`src/__tests__/aiOff.test.jsx`). To bring AI back: billing (Blaze) on, steps below, then flip the flag. Before that, add `maxInstances`, a global daily cap and App Check to `analyzeWithGemini`, plus a GCP budget alert and an AI Studio spend cap.

`functions/.env` holds a local `GEMINI_API_KEY` (git-ignored, never committed — checked 2026-10-04). Its value is 26 chars, not a 39-char `AIza…` key — check it. Remove it from `functions/.env` before deploying functions or it clashes with the secret of the same name.

Functions require `GEMINI_API_KEY` stored in Secret Manager. **Not yet configured on `better-de9aa`.**

Steps when ready:
1. Enable Secret Manager API: https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=better-de9aa
2. `npx firebase-tools functions:secrets:set GEMINI_API_KEY --project better-de9aa` (enter key at masked prompt — never paste in chat)
3. Verify: `npx firebase-tools functions:secrets:get GEMINI_API_KEY --project better-de9aa`
4. Deploy: `npx firebase-tools deploy --only functions,storage --project better-de9aa`

Until then, `analyzeWithGemini` and `analyzeBoxingSession` will fail at runtime (secret not bound).

**Billing is off on `better-de9aa`** — Secret Manager returns 403 and functions can't be deployed. Live functions (2026-10-04): only `dailyHabitNudge`, `accountabilityReminder`, `broadcastUpdate`, old code on nodejs20 — left as is on purpose (owner's decision); `analyzeWithGemini` / `analyzeBoxingSession` are not deployed.

---

## Source structure

```
src/
  pages/
    Dashboard.jsx          # Main app shell — all tabs, all modal state
    WorkoutsScreen.jsx     # Workouts tab
    AnalyticsTab.jsx       # Progress/analytics tab
    ArenaPage.jsx
    InitiationFlow.jsx
    WelcomeScreen.jsx
    OnboardingFlow.jsx / OnboardingPage.jsx
    Legal.jsx
  components/
    boxing/                # Boxing drill system (full, committed)
      BoxingPathScreen.jsx     # Home + drill selector + guided course
      BoxingDrillTimer.jsx     # Round timer with Web Audio beeps
      BoxingSessionAnalysis.jsx  # Video analysis (requires functions)
      BoxingFormAnalysis.jsx     # Single-image posture check
      BoxingCompletion.jsx / BoxingWorkoutPreview.jsx / BoxingActiveWorkout.jsx
    combat/
      CombatPathScreen.jsx   # Generic combat path (boxing course + MT)
      CombatActiveWorkout.jsx / CombatCompletion.jsx / CombatWorkoutPreview.jsx
    muaythai/
      MuayThaiPathScreen.jsx   # Thin wrapper over CombatPathScreen
    MyTasks.jsx            # My Tasks card — top of Home
    JournalCard.jsx        # "הראש שלי" card — below My Tasks
    Journal.jsx            # Full-screen journal: free text + 2 fixed questions, past entries, edit/delete
    DailyLessonCard.jsx    # Daily lesson (35 fixed lessons, not AI) + notes form + "מה למדתי" link
    LessonNotesForm.jsx    # "מה למדתי?" (required) / "איך אני משתמש בזה?" + add to My Tasks
    LessonNotesPage.jsx    # Full-screen "מה למדתי" list → saved lesson + notes, edit notes
    auth/AuthModal.jsx
    dashboard/WeekStrip.jsx
    [many other feature components]
  data/
    boxingDrills.js        # All boxing drill rounds + MT_ELBOW_ROUNDS
                           # DRILL_CATEGORIES excludes 'mt-elbows' (boxing UI isolation)
    boxingPath.js          # Boxing guided course levels/workouts
    muayThaiPath.js        # MT levels/workouts
    [challenges, habits, lessons, etc.]
  utils/
    boxingProgress.js
    muayThaiProgress.js    # Wraps combatProgress.js engine for MT
    combatProgress.js      # Generic createCombatProgressionEngine factory
    streak.js              # getEffectiveStreak() — single source for streak display
    trackDay.js            # getTrackDay() — single source for "יום X/30"
    localDate.js           # getLocalDateKey() — local date, used ONLY by My Tasks, Journal, lesson notes
  services/
    firebase.js            # Firebase init — reads VITE_* env vars
    boxingVideoService.js  # Upload video → call analyzeBoxingSession function
    fcmService.js
    myTasksService.js      # My Tasks CRUD — Firestore users/{uid}/tasks, guest → localStorage
    journalService.js      # Journal CRUD — users/{uid}/journal, guest → localStorage
    lessonNotesService.js  # Lesson notes — users/{uid}/lessons/{lessonId} (copy of lesson + notes), guest → localStorage
    dailyLessonService.js  # Picks today's lesson (rule-based), completion log in localStorage only
    [geminiClient, workoutRewardService, etc.]
  context/
    AuthContext.jsx        # useAuth() — use this, NOT react-firebase-hooks
    UserContext.jsx
  config/
    xp.js
    features.js            # FEATURES flags — hidden features (see below)
functions/
  index.js                 # All Cloud Functions
```

---

## Key architecture decisions

- **Inline styles everywhere** — no CSS files, no Tailwind. Colors via local `C = { bg, surface, border, text, muted, accent, ... }` objects.
- **`useAuth()` from `../../context/AuthContext`** — never import `react-firebase-hooks/auth` (not installed).
- **MT quick-start reuses boxing infrastructure** — `BoxingDrillTimer` launched directly from `Dashboard.jsx` state (`mtDrillActive`). No separate MT timer.
- **`mt-elbows` category** — exists in `CATEGORY_ROUNDS_MAP` + `CATEGORY_TITLES` in `boxingDrills.js` but NOT in `DRILL_CATEGORIES` array. This keeps elbows invisible in the boxing UI while MT quick-start can access it directly via `buildDrill('mt-elbows', dur)`.
- **XP guard on MT drills** — `durationSeconds >= 60 || roundsCompleted >= 1` before calling `claimDailyWorkoutReward`.
- **Gemini models** — both functions use `gemini-2.5-flash`. `gemini-2.0-flash` deprecated June 2026, `gemini-1.5-flash` also deprecated.
- **`buildDrill(categoryId, durationMin, skipWarmup?)`** and **`getLastDuration()`** exported from `boxingDrills.js`, used by both `BoxingPathScreen` and `Dashboard`.
- **Functions region** — always `europe-west1` (nearest to Israel).
- **Dates** — existing code uses UTC keys (`toISOString().slice(0,10)`); only My Tasks, Journal and lesson notes use local dates (`getLocalDateKey`). Don't mix them.
- **Feature flags (`src/config/features.js`)** — features that don't fit VISION.md are hidden, not deleted: code, services, data and stored user progress stay. Flip one to `true` to bring it back. Currently `false`: `deepTracks` (30-day tracks, Home daily mission, מסלולים עמוקים, rebuild-path), `surpriseMission`, `xpForecast`, `routineCards`, `fightClub`, `homeXpExtras` (Home XP only in header + ring), `pathBuilder` (AI path: no auto-open, no silent regen, no AI track pick in setup), `setupExtras` (setup energy/time/5-years steps), `legacyIntro` (old first-run screens, replaced by `FirstWelcome`), `ai` (every Gemini call — see GEMINI_API_KEY section). `true`: `dailyLesson` (back, with the user's own notes).
- **Setup (`/setup`)** — 5 steps: name → focus → habit 1 → habit 2 → done. Habits are skippable (`דלג`), each can be every day or X times a week (`HabitScheduleFields`, `utils/habitSchedule.js`, Sunday-start weeks). Existing users are sent away from `/setup` (`utils/setupGuard.js`). Dashboard treats `profile.onboardingDone` as progress, so a user with no habits goes straight to Home.
- **No XP/streak on writing** — My Tasks, Journal and lesson notes never award XP or bump the streak. Streak now grows only from workouts and completing all habits.
- **Combat screens** (boxing/MT path, preview, active, completion) render inside `FullScreen` in `Dashboard.jsx` — fixed overlay above tab bar.

---

## Git / GitHub

- Repo: **https://github.com/noam922008-ship-it/1percent-better** (public; transferred from `noam1better`)
- Auth: `gh` logged in as `noam922008-ship-it`. No token in the remote URL — keep it that way.
- `feat/english-phase-1` (pushed, not merged): i18n Phase 1 (infra, `FEATURES.english` off) + Phase 2 (Welcome / Setup / Home strings in `src/i18n/he.js` + `en.js`, logical RTL, ESLint warning for Hebrew in JSX). See `docs/ENGLISH_PLAN.md`.
- Branches: `main` == `origin/main` (pushed 2026-10-04); live hosting = `f2451f7` (this docs commit only changes CLAUDE.md). `analytics`, `release/v2`, `legal`, `weekly-habits`, `fix/phone-feedback` are merged into main. `journal-ai` (pushed) is NOT merged. Old: `my-tasks`, `wip/muay-thai` — pushed.

---

## Done — 2026-10-04 (launch readiness)

**Later the same day — E2E on live + 3 fixes.** Deployed `storage` (rules were never deployed before: `workout-analysis/{uid}` list returned 403, so in-app account deletion always failed with "חלק מהנתונים לא נמחקו"; rules take ~1 min to propagate), then `hosting:prime-app` from `main` @ `f2451f7`.
- **E2E on the live app** (Playwright, test account `prime-e2e-…@example.com`, now deleted): signup 18+ gate, utm → GA `app_open`, setup with a weekly habit, weekly check-in persists (server `habitLog`), "הראש שלי" save/edit/delete with 0 AI requests, My Tasks, lesson notes, boxing without AI entries + drill to the end, legal pages, rules via authenticated REST (14/14), delete account → re-login fails. No console/network errors.
- `b880643` **fix(home)** — add-habit copy said "הרגל יומי" (button aria-label, empty-state text + aria-label). Guarded by `habitCopy.test.js`.
- `2dc0a2f` **fix(home)** — users with only weekly habits saw "✓ הכל הושלם היום". Top-card choice is `homeActionType()` (`utils/homeAction.js`), counts daily habits only; My Tasks don't count (owner's decision).
- `f2451f7` **fix(habits)** — a guest completing all daily habits threw `reading 'uid'` in `updateStreak`. Streak still updates on screen; server save skipped without a signed-in user (`utils/habitStreak.js`). A guest's streak is in memory only and resets on refresh (pre-existing).
- E2E scripts live in the scratchpad only (not in the repo). To repeat: `playwright-core` + the headless shell, a dedicated persistent profile, an `@example.com` test account, and check the signed-in email before any delete.


Earlier: deployed `firestore:rules`, then `hosting:prime-app` from `main` @ `8d97e6f`. Every live asset byte-identical to the build; Playwright (fresh profile, guest): welcome + 18+ checkbox render in <1 s, no console errors, Instagram only, `prime-daily-app/?utm_source=…` → `/welcome?utm_source=…`.

- **Audit** — brand, Gemini, security, privacy. Clean: no secrets in git history (only the public Firebase web key), XSS (React escaping, no `innerHTML`), Storage rules, authorized domains (`prime-app-84fe0.web.app` + `better-de9aa.firebaseapp.com`), privacy/terms/disclaimers, in-app account deletion.
- **AI off** — `FEATURES.ai = false` (`437cac4`).
- **Rules** — `nudgeResponses`: doc id must be the caller's own `{uid}_{date}`, existing doc must be theirs (another user could overwrite it before). `challenges`: an update may change only `status` and the caller's own `reps` entry. `habitLog` covered by tests. 11 emulator tests.
- **Deps** — app: firebase 12.19, `npm audit fix`. Functions: firebase-admin 14, firebase-functions 7. Left: `@grpc/grpc-js` (pinned by firebase, Node only, not in the browser bundle), `uuid` moderate via @google-cloud/storage, `braces` via jest (dev). No fixed versions.

Open (from the audit, not done):
- Brand leftovers: root `manifest.json` still says "1% Better" (unused — `public/manifest.json` is served; delete with owner's OK), "1% better" in `functions/__tests__/nudge.test.js`.
- Rules nice-to-have: `users/{uid}` accepts any field (lock tier/pro fields).
- ער״ן / מד״א numbers exist only on `journal-ai` — consider adding to the legal page on main.
- Old preview domain `prime-app-84fe0--preview-2026-09-11-…` still in authorized domains (harmless).

## Done — 2026-09-30

Live: hosting:prime-app from `main` @ `c70ccb1`. Smoke test 2026-09-30 (curl + isolated headless Chrome + tests), all pass:
- `prime-daily-app.web.app/?utm_source=test` → 302 → `prime-app-84fe0.web.app/?utm_source=test` (200)
- `/privacy`, `/terms`, `/legal` render; only email is `prime.daily.app@gmail.com`
- `og-image.png` 200, 1200×630; og:title `PRIME`, og:description = VISION.md sentence, og:image + twitter:image absolute URLs
- Welcome screen, 18+ / terms checkbox, "הראש שלי", weekly habits, GA `G-MJTZP4CKGM`, Instagram-only footer (no TikTok link) all in the live bundle
- Every live asset byte-identical to a fresh build of main · `npm test`: 23 files / 378 tests pass

Shipped 2026-09-28 → 09-30:
- **Welcome** — single first-run screen (`FirstWelcome`) that opens the journal; old intro behind `FEATURES.legacyIntro`. Journal card/page renamed "הראש שלי".
- **Brand** — PRIME everywhere, wordmark without overlapping P, VISION.md sentence in meta, og:image 1200×630. Social links (Instagram only for now) in signup footer, Settings, legal pages.
- **Weekly habits** — every day or X times a week (in habit creation and setup), weekly progress on Home, weekly check-ins, reminders respect schedule, up to 5 habits. Guests' habits saved in the browser (`utils/guestHabits.js`).
- **Legal / privacy** — privacy policy + terms in plain Hebrew (one source), contact `prime.daily.app@gmail.com`; explicit 18+ and terms checkbox at signup; leaderboard shows no real names (optional nickname); delete account + all data in-app (client side, `accountDeletionService.js`); re-auth asked only when Firebase requires it.
- **Hosting** — `prime-daily-app` redirects to live site keeping path + query; `?utm_source` kept after landing.
- **Analytics** — GA4, six events, no personal data.
- **Security (09-26)** — rules cap XP and weekly-reps gains per write; `analyzeWithGemini` validates input, model pinned; npm audit fixes.
- **Dev** — local emulators + seed scripts (`scripts/emulator-seed*.mjs`).

Open:
- Tested E2E with an email account on 2026-10-04 (see above). Still manual: real Google sign-in and Google-account deletion (re-auth popup), real push notifications, PWA install, visual check on a phone.
- `journal-ai` branch (AI questions in journal) — pushed, not merged, not live.
- **Hebrew addresses the user in male form only ("אתה", "מסכים", "מעל 18 ומסכים").** Consider gender-neutral Hebrew across UI, legal pages, lessons and AI prompts.
- **English version** — planned, not started: see `docs/ENGLISH_PLAN.md`.
- TikTok link — hidden for now; add back when the account exists (`socialLinks.test.jsx` asserts it's absent).
- Progress leftovers: "שיעורים שהושלמו" stat counts track lessons; "העתק סיכום" share text includes the track name.
- Workout-card overlap at 390px not reproduced as guest — verify logged-in.
- Revoke the old `noam1better` token that was exposed in the remote URL.
- Pre-existing lint errors/warnings (not from this work).

---

## Recent git history

```
f2451f7  fix(habits): guest completing all daily habits no longer throws
2dc0a2f  fix(home): no false 'all done today' with only weekly habits
b880643  fix(home): add-habit copy no longer says 'daily'
5c043ed  docs: CLAUDE.md after launch-readiness audit and deploy
8d97e6f  fix(deps): firebase-admin 14 and firebase-functions 7 in functions
96cc7a1  fix(deps): firebase 12.19 and npm audit fix
5d67792  fix(rules): challenge participants can't rewrite the challenge
27b802d  fix(rules): nudgeResponses can't be overwritten by another user
437cac4  feat(ai): launch without AI behind FEATURES.ai
5b2539b  test(rules): Firestore rules tests in the emulator, starting with habitLog
c70ccb1  feat(brand): og:image for link previews; Instagram only for now
9089f82  Merge main into analytics
9ae96bc  docs: English plan for later; open item on male-only Hebrew
b0f9999  fix(habits): guests' habits are saved in the browser
e77fcb1  fix(setup): habit step copy no longer says 'daily'
1353d16  feat(account): ask to sign in again only when Firebase requires it
24d1a7c  feat(signup): explicit 18+ and terms checkbox
9c2c8d5  fix: keep ?utm_source after landing; weekly habits in setup too
04d74cc  feat(analytics): GA4 with six events and no personal data
65b31a6  fix(hosting): also redirect the root of prime-daily-app
eedf93e  chore(hosting): prime-daily-app redirects to the live site, keeping path and query
df35e23  feat(brand): PRIME's social links in the signup footer, Settings and legal pages
c8c2b01  feat(account): delete account and all data from the app (client side)
861bf55  feat(privacy): no real names on the leaderboard; optional nickname
d8ed37b  feat(legal): privacy policy and terms in plain Hebrew, one source
70485e0  feat(habits): choose every day or X times a week when creating a habit
a86c90d  feat(welcome): single first-run screen that opens the journal
```
