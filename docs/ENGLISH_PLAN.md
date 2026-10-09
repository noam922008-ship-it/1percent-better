# PRIME — English version plan

Status: **Phase 1 (infrastructure) and Phase 2 (first-run flow) done** on branch `feat/english-phase-1`
(2026-10-09) — pushed, not merged, not deployed.
English is behind `FEATURES.english = false`, so production stays Hebrew + rtl. Originally written from the
codebase as of 2026-09-30 (decided then: not now).

## Phase 1 — infrastructure (done, 2026-10-09)

Branch `feat/english-phase-1`, on top of `main`:

| Commit | What |
|---|---|
| `e885f8e` feat(i18n): pick language from device and add language switch in Settings | Cherry-pick of `4e651c9` from `feat/english-infra` |
| `0bbe793` refactor(i18n): split translations into he.js and en.js | `src/i18n/he.js` (source of truth) + `en.js`; `translations.js` is now the `{ he, en }` index. Strings moved as-is |
| `7cf9d59` feat(i18n): English behind FEATURES.english, off by default | `src/i18n/detectLang.js`; flag in `src/config/features.js`; `LangContext` sets `<html dir/lang>` from one place; `index.html` starts `dir="rtl"` |
| `b36a9e1` test(i18n): key parity, detection order, dir/lang switching, flag gating | `src/__tests__/i18n.test.jsx` (11 tests) |

How it behaves:
- **Detection:** saved choice (`localStorage` `ft_lang`) → browser language (`he`/`iw` → Hebrew, anything else →
  English).
- **`FEATURES.english = false` (production):** always Hebrew + rtl, `setLang` is a no-op, the Settings picker and the
  welcome EN/עב toggle are hidden. A saved `ft_lang` is left untouched.
- **Dev (`npm run dev`):** English is always on (detection + picker) so it can be tested. An English-language browser
  opens the dev app in English.
- `npm test`: 28 files / 403 tests pass. `npm run build` OK.

## Phase 2 — first-run flow: Welcome, Setup, Home (done, 2026-10-09)

Same branch. Commits: `4c4f348` lint rule · `bf5b819` Welcome · `326d209` Setup + habit schedule + first welcome ·
`a931807` Home (Dashboard) · `ce7c307` tests.

- **Strings:** new groups in `he.js` / `en.js`: `welcome.*` (auth errors, email form, guest, legal modal), `social`,
  `firstWelcome`, `habitSchedule` (incl. day letters + "X times a week"), `home.*` (greeting, guest banner, ring,
  streaks, daily workout card keyed by workout id, habits card, edit-habit + set-summary modals, tab bar, level-up,
  live cardio bar, combat props). Stale "Focus Trigger" `dashboard.*` keys removed.
- **English copy** written from the current Hebrew (habits, not triggers). **Hebrew text unchanged** — setup still says
  "טריגר" in Hebrew (`onboarding.trigger1/2`, `triggerLabel`, `goal.sub`); rewording it is the owner's call.
- **Helpers:** `src/i18n/fmt.js` — `fmt(str, vars)` for `{n}`-style placeholders, `plural({ one, two, many }, n)` for
  Hebrew's dual ("יומיים"). `frequencyLabel(tr, t.habitSchedule)` (Hebrew by default). `LangContext` defaults to
  Hebrew when there's no provider (components rendered alone in tests).
- **RTL:** in these screens `right` → start, `left` → end (`textAlign: 'start'|'end'`, `marginInline*`,
  `insetInlineStart`, accent stripes `borderInlineStart`); `FirstWelcome` and `HabitScheduleFields` no longer force
  `dir="rtl"`. Arrows live inside the strings (`←` in Hebrew, `→` in English). Hebrew screenshots at 390px match `main`
  (one line differs by anti-aliasing only); English renders ltr with stripes on the left.
- **ESLint:** `no-restricted-syntax` **warning** for Hebrew in JSX text, string attributes and literals inside `{}`
  (`src/**/*.jsx`, tests excluded). 1,213 warnings in 63 files before Phase 2 → 1,066 in 59 after.
- **Tests:** `src/__tests__/i18nFirstRun.test.jsx` — Welcome (email form open), Setup (name → focus → weekly habit →
  done) and first welcome in English have no Hebrew in text / placeholder / aria-label / title; Hebrew copy unchanged;
  every key Dashboard reads exists in both files. `npm test`: 29 files / 503 tests.

Left on purpose in these screens (still Hebrew, shows as lint warnings):
- **Hidden behind `false` flags:** setup energy / time / AI track steps (`setupExtras`, `pathBuilder`); Home
  `deepTracks` (track day, mission card, "pick a program", tracks archive), `homeXpExtras`, `surpriseMission`.
- **Never opened today:** `WorkoutLibraryModal`, `GoalTracker` / `GoalEditModal`, `MantraCard`, `AddTriggerModal`
  in `Dashboard.jsx`.
- **Workout intensity** (`בינוני` / `גבוה` / `נמוך` in `DAILY_WORKOUTS`) — see "Open after Phase 2".
- **Hebrew keyword lists** in `Dashboard.jsx` (`physical` / `tech` / `finance` / `business`, ~line 730) match what the
  user types, not UI text. **They need English keywords in a later phase**, or English users' input won't match.
- Child cards Home renders from their own files: My Tasks, "הראש שלי" (Journal), daily lesson, WeekStrip, and the
  Workouts / Progress / Profile (Settings) tabs.

### Open after Phase 2

- **Workout intensity → ids.** Checked 2026-10-09: intensity is never stored. It lives only in the inline
  `DAILY_WORKOUTS` constant in `Dashboard.jsx`, where it's shown as a label and picks the label colour. Not in
  Firestore, localStorage (`ft_workout_log` stores `exerciseId`/`exerciseName`, not intensity), `src/data/`,
  functions or rules. Switching to `high` / `med` / `low` ids needs no mapping of old values. Waiting for the
  owner's OK.
- `exerciseName` in localStorage `ft_workout_log` is now saved in the UI language (`exerciseId` stays stable).
  Nothing in the app reads the log today.

## Still untranslated after Phase 1 (measured 2026-10-09)

- **Hard-coded Hebrew:** ~5,760 lines in 99 files (excluding `src/i18n/` and tests) — `data/` 3,830, `components/`
  1,029, `pages/` 381, `services/` 245, `utils/` + `config/` 35.
- **Screens that already use `t` are still mostly Hebrew:** Dashboard 132 Hebrew lines, Settings 40 (including the
  picker label `שפה / Language`), Welcome 23, Setup 19.
- **Stale strings:** the existing `he`/`en` strings still talk about "Focus Trigger" and tracks; the UI now says
  habits. They need rewriting, not just translating.
- **Layout:** 148 hard-coded `dir="rtl"` / `direction: 'rtl'` / `textAlign: 'right'|'left'`. With English on (dev),
  layout is mixed/broken until those are fixed.
- **Not started:** locale date/number formatting, ESLint rule flagging Hebrew literals in JSX, saving `lang` on the
  profile, Firebase Auth email language.

## Next phases (in this order)

1. ~~**Welcome / Setup / Dashboard**~~ — done in Phase 2 (above).
2. **Home's child cards + other tabs** — My Tasks, "הראש שלי", daily lesson card, WeekStrip, Workouts, Progress,
   Settings (incl. the `שפה / Language` label); the Hebrew keyword lists in `Dashboard.jsx`.
3. **Notifications + `lang` on the profile** — in-app (`notificationService.js`) and push (functions already have
   `he`/`en` copy and read the profile's `lang`); save `lang` to the profile when it changes.
4. **Legal pages** — privacy policy + terms (`src/data/legal.js`), plus legal review for users abroad.
5. **Lessons and workouts content** — 35 daily lessons, boxing / Muay Thai drills and paths.

Turn on `FEATURES.english` only after the visible UI is translated and the RTL fixes are done.

## Where things stand

- ~5,700 source lines contain Hebrew; ~3,900 of them are content files in `src/data/`.
- Only 3 files use the existing i18n (`useLang()` + `src/i18n/translations.js`, which has `he` and `en` for the
  welcome/setup screens). Everything else is hard-coded Hebrew.
- 141 places hard-code right-to-left layout (`dir="rtl"`, `direction: 'rtl'`, `textAlign: 'right'`).
- `LangContext` already sets `<html dir>` and `<html lang>` and stores the choice in `localStorage` (`ft_lang`).
- Cloud Functions push copy already has `he`/`en` variants and reads the profile's `lang`.

## What needs translating, with rough size

| Part | Size | Estimate |
|---|---|---|
| **Infrastructure** — language detection, picker in Settings, dir switching, date/number formatting by locale, an ESLint rule that flags Hebrew literals in JSX | small | ~1 day |
| **RTL → logical layout** — replace the 141 hard-coded right/left with `start`/`end` (`textAlign: 'start'`, `paddingInlineStart`, `marginInlineEnd`), mirror back/forward chevrons and arrow glyphs | medium | ~1 day + 390px QA in both directions |
| **Visible UI** — welcome, setup, Home, My Tasks, "הראש שלי", habits, Settings, Progress, Workouts; ~700–900 strings in ~60 files | large | 2–3 days to extract + ~5–7k words to translate |
| **Daily lessons** — 35 lessons (`src/data/dailyLessons.js`) | medium | ~7k words; content, needs a human read |
| **Workouts** — boxing / Muay Thai drills and paths, timers (~1,300 lines) | large | ~2 days, ~8–10k words |
| **Legal** — privacy policy + terms (`src/data/legal.js`) | small | ~2k words **plus legal review**: Israeli law and Jerusalem courts may not fit users abroad |
| **Notifications** — in-app (`notificationService.js`) and push (functions) | small | ~½ day |
| **Firebase Auth emails** — password reset, verification | small | ~1 hour: `auth.languageCode` + English template in the console |
| **Hidden features** — 30-day tracks (`lessonContent.js`, ~35–40k words), surprise missions, path builder | very large | **skip** while hidden behind `FEATURES` |

Total: roughly **7–9 working days** for visible UI + lessons + workouts + notifications, plus human
translation/review of ~20–25k words and a legal review. Can be split: (1) infrastructure + RTL + UI, (2) content.

## How RTL/LTR switching works

- Direction lives on `<html dir>` (already done by `LangContext`).
- Components use logical properties (`start`/`end`, `inline-start`/`inline-end`) instead of right/left, and
  stop setting `dir="rtl"` themselves. Flex rows flip automatically with `dir`.
- Direction-carrying icons (ChevronRight for "back", "←" in button labels) are chosen or mirrored by language.
- Dates: `toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', …)`.

## How the user picks a language

- First visit: from the device language — Hebrew if `navigator.language` starts with `he`, otherwise English
  (done in Phase 1, `src/i18n/detectLang.js`).
- Later: the existing EN/עב toggle on the welcome screen, plus a picker in Settings (both hidden while
  `FEATURES.english` is off).
- Stored in `localStorage` (`ft_lang`) and on the profile (`lang`), so server push copy matches.

## Decisions needed before building

1. **AI journal questions in English** need an English distress phrase list — **approved by the owner**, like the
   Hebrew one — and international crisis resources: ער״ן and סה״ר are Israeli services.
2. **Gendered Hebrew** — the Hebrew UI addresses the user in the masculine form only ("אתה"). English avoids it;
   consider gender-neutral Hebrew at the same time (see CLAUDE.md open items).
3. **Library** — decided in Phase 1: kept `translations.js`, split into `he.js` / `en.js`, no new dependency.
   Original note: keep the existing lightweight `translations.js` (recommended: split into `he.js` / `en.js`, no new
   dependency) or move to `react-i18next`.
