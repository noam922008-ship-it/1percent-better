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
| Firestore | User profiles, habits, XP, workout history · owner-only subcollections: My Tasks `users/{uid}/tasks`, Journal `users/{uid}/journal`, lesson notes `users/{uid}/lessons/{lessonId}` |
| Hosting site `prime-app-84fe0` | Live app → https://prime-app-84fe0.web.app |
| Hosting site `1percent-better-app` | 301 redirect target only — do not deploy content here |
| Functions | Node.js 22, region `europe-west1`, Firebase Functions v2 |
| Storage | `/workout-analysis/{uid}/{file}` — video upload for Gemini analysis |
| Secret Manager | `GEMINI_API_KEY` bound to `analyzeWithGemini` + `analyzeBoxingSession` via `defineSecret` |

`.firebaserc` targets:
- `prime-app` → `["prime-app-84fe0"]` (the live app)
- `prime` → `["1percent-better-app"]` (redirect only)

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

---

## GEMINI_API_KEY — STATUS: NOT YET DEPLOYED ⚠️

Functions require `GEMINI_API_KEY` stored in Secret Manager. **Not yet configured on `better-de9aa`.**

Steps when ready:
1. Enable Secret Manager API: https://console.cloud.google.com/apis/library/secretmanager.googleapis.com?project=better-de9aa
2. `npx firebase-tools functions:secrets:set GEMINI_API_KEY --project better-de9aa` (enter key at masked prompt — never paste in chat)
3. Verify: `npx firebase-tools functions:secrets:get GEMINI_API_KEY --project better-de9aa`
4. Deploy: `npx firebase-tools deploy --only functions,storage --project better-de9aa`

Until then, `analyzeWithGemini` and `analyzeBoxingSession` will fail at runtime (secret not bound).

**Journal AI questions depend on this.** Deploy order for journal-ai: firestore:rules (done 2026-09-27) → secret + `functions` → `hosting`. If hosting goes first, the consent invite shows but the AI call fails and the flow drops to the step question.
Use a billing-enabled (paid) Gemini key or Vertex AI — on the free tier Google may use prompts to improve its products, which doesn't fit a private journal.

`analyzeWithGemini` (on `main`, not yet deployed) validates input: model fixed server-side (`gemini-2.5-flash`, client `model` ignored), prompt ≤ 40,000 chars, `systemInstruction` ≤ 2,000, image plain base64 ≤ ~5 MB jpeg/png/webp; invalid requests don't count against the 20/day limit.

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
    JournalCard.jsx        # "מה בראש שלך?" card — below My Tasks
    Journal.jsx            # Full-screen journal: free text + 2 fixed questions, past entries, edit/delete
    JournalReflection.jsx  # After saving: consent invite → up to 2 AI questions → fixed step question
    JournalSupport.jsx     # Distress message (ער״ן 1201, eran.org.il, סה״ר, 101/100) — approved wording
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
    distress.js            # detectDistress() — local Hebrew phrase list (approved), runs before any AI
  services/
    firebase.js            # Firebase init — reads VITE_* env vars
    boxingVideoService.js  # Upload video → call analyzeBoxingSession function
    fcmService.js
    myTasksService.js      # My Tasks CRUD — Firestore users/{uid}/tasks, guest → localStorage
    journalService.js      # Journal CRUD — users/{uid}/journal, guest → localStorage; saveReflections()
    journalReflectionService.js  # Gemini prompt + reply parsing for journal follow-up questions
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
- **Feature flags (`src/config/features.js`)** — features that don't fit VISION.md are hidden, not deleted: code, services, data and stored user progress stay. Flip one to `true` to bring it back. Currently `false`: `deepTracks` (30-day tracks, Home daily mission, מסלולים עמוקים, rebuild-path), `surpriseMission`, `xpForecast`, `routineCards`, `fightClub`, `homeXpExtras` (Home XP only in header + ring), `pathBuilder` (AI path: no auto-open, no silent regen, no AI track pick in setup), `setupExtras` (setup energy/time/5-years steps). `true`: `dailyLesson` (back, with the user's own notes).
- **Setup (`/setup`)** — 5 steps: name → focus → habit 1 → habit 2 → done. Habits are skippable (`דלג`). Dashboard treats `profile.onboardingDone` as progress, so a user with no habits goes straight to Home.
- **Journal AI questions (branch `journal-ai`)** — VISION.md: the AI reads the journal only with consent. Nothing is sent before the user taps "כן" on the invite; "תמיד אפשר" saves `profile.journalAiConsent` (focusTriggers doc), turned off with "כבה" on the Journal page. Local `detectDistress()` runs first on the entry and every answer → `JournalSupport`, no questions; the AI's `distress` flag does the same. AI asks at most 2 WHY/HOW questions (never advice), then the fixed step question unless the entry already has a step. "מספיק" skips to the step question. AI failure/unparseable reply → step question. Guests: no AI. Saved as `entry.reflections: [{ q, a, source: 'ai'|'fixed' }]` (max 3). The distress phrase list and support wording were approved by the product owner — don't change them without approval.
- **XP cap** — `XP.MAX_PER_AWARD = 1000` clamps `awardXP`; firestore.rules reject a profile write adding > 1000 XP, a leaderboard xp above the profile xp, and weeklyReps gains > 1000 per write. Keep the two in sync. XP is still client-written — the real fix is a Cloud Function.
- **No XP/streak on writing** — My Tasks, Journal and lesson notes never award XP or bump the streak. Streak now grows only from workouts and completing all habits.
- **Combat screens** (boxing/MT path, preview, active, completion) render inside `FullScreen` in `Dashboard.jsx` — fixed overlay above tab bar.

---

## Git / GitHub

- Repo: **https://github.com/noam922008-ship-it/1percent-better** (public; transferred from `noam1better`)
- Auth: `gh` logged in as `noam922008-ship-it`. No token in the remote URL — keep it that way.
- Branches: `main` (@ `e6e4bca`) — pushed, live. **`journal-ai`** (this docs commit) — pushed, **not merged into main**, hosting not deployed. All other branches (`journal`, `cleanup`, `lesson-notes`, `security-fixes`, `fix/setup-habits-align`, `my-tasks`, `wip/muay-thai`, `clean-slate-app`) are merged into main.

---

## Done — 2026-09-27

Live: hosting:prime-app from `main` @ `e6e4bca`. firestore:rules from `journal-ai` (= main + `reflections` on journal entries). Functions: **not deployed**.

- **Journal AI questions** (branch `journal-ai`, not live) — see Key architecture decisions. Tests: `distress.test.js`, `journalReflection.test.js`, `journalReflectionUI.test.jsx`.
- **Security fixes** (live except functions) — `analyzeWithGemini` input validation + fixed model; `npm audit fix` (app 0 vulnerabilities; functions 9 moderate left, need firebase-admin 14); XP cap in rules + `awardXP`.
- **Setup** — habits box aligned to reading direction, arrow ← in Hebrew.
- 2026-09-26: VISION.md, Journal, cleanup flags, setup + Welcome, lesson notes, guest greeting fix.
- 2026-09-24: 6 bug fixes, My Tasks, Home reorder, tasks rule.

Open:
- **journal-ai go-live:** set the Gemini secret (paid tier) → deploy functions → merge `journal-ai` into main → deploy hosting. Then test at 390px in the browser (never done — Chrome was disconnected): consent invite, 2 questions, מספיק, step + add task, support message, entry view with reflections, "כבה".
- Not tested live: new XP rules (workout → XP + leaderboard, camera set → weeklyReps, undo); new user with no habits → Home; guest greeting; saving/editing lesson notes and Journal while signed in.
- Security findings skipped for now (features hidden): squads (joiner can edit name/telegramChatId/members; join-by-code broken by read rule), challenges (either side edits any field), nudgeResponses (not tied to owner on update), posts (no `hasOnly`). CSP allows `'unsafe-inline'` scripts.
- Free training now capped at 1000 XP per session (from the XP cap).
- Site title still "PRIME — Discipline Course" (doesn't match VISION.md).
- Progress leftovers: "שיעורים שהושלמו" stat counts track lessons; "העתק סיכום" includes the track name. Hidden setup steps still use `textAlign: 'left'`.
- Workout-card overlap at 390px not reproduced as guest — verify logged-in.
- Revoke the old `noam1better` token; check the Firebase web API key is referrer-restricted in Google Cloud Console.
- Pre-existing lint: 5 errors / 11 warnings.
- Local `origin/HEAD` points at the old `claude/build-fitness-pwa-app-dywQR` — `git remote set-head origin -a` (GitHub default is `main`).

---

## Recent git history

```
ec0452e  test(journal-ai): conversation flow — consent, distress, מספיק, fallbacks   ← journal-ai
94b7212  feat(journal-ai): calm follow-up conversation after saving an entry
b7aabba  feat(journal-ai): AI follow-up question service and reflections field
2547677  feat(journal-ai): local distress check for journal text
e6e4bca  fix(rules): cap XP and weekly reps gains per write                    ← main (live)
a0498b9  chore(deps): npm audit fix in functions (12 → 9 moderate)
24fc686  chore(deps): npm audit fix — react-router 7.18.4, protobufjs 7.6.6
7370243  fix(functions): validate analyzeWithGemini input and pin the model
5e79b08  fix(setup): point the habit arrow in the reading direction
b67a29a  fix(setup): align the habits box on the done step to the reading direction
1bd3e10  docs: update CLAUDE.md after journal, cleanup and lesson notes
f9e674b  feat(lesson-notes): write notes after the daily lesson, link from Home
5be0d12  feat(lesson-notes): notes form and 'מה למדתי' page
a595db6  feat(lesson-notes): service and owner-only Firestore rules
124e50e  fix: greet guests without the placeholder name 'Guest'
c1bbe66  feat(setup): habits are optional so new users reach Home fast
691ae4f  feat(setup): cut setup to name, focus and two habits
1de141b  feat(setup): hide the AI track pick behind FEATURES.pathBuilder
62422de  feat(welcome): selling points follow VISION.md — write, understand, one step
2ec8038  feat(cleanup): never open the AI path builder automatically
afdb053  feat(cleanup): show XP on Home only in header and ring
…        feat(cleanup): one commit per flag (fa816fe..ec8aeb5)
95dc90c  feat(journal): open the journal from Home, below My Tasks
256d167  feat(journal): journal page and Home card
52b3a06  feat(journal): service and owner-only Firestore rules
08c0894  docs: add VISION.md and vision rule to CLAUDE.md
```
