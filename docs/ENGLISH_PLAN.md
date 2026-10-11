# PRIME — English version plan

Status: **Phase 1 (infrastructure), Phase 2 (first-run flow), Phase 3 (Home's remaining cards), Phase 4 (Workouts
tab), Phase 5 (Progress and Profile tabs) and Phase 6 (notifications + `lang` on the profile) done** — merged into
`main` (`812d3fd`) and live with English off. **Phase 7 (legal pages)** on branch `feat/english-legal` (2026-10-11),
not merged, not deployed. **Blockers before `FEATURES.english = true`:** see "Blockers" below.
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
`a931807` Home (Dashboard) · `ce7c307` tests · `497b1a6` workout intensity ids · Setup Hebrew wording (below).

- **Strings:** new groups in `he.js` / `en.js`: `welcome.*` (auth errors, email form, guest, legal modal), `social`,
  `firstWelcome`, `habitSchedule` (incl. day letters + "X times a week"), `home.*` (greeting, guest banner, ring,
  streaks, daily workout card keyed by workout id, habits card, edit-habit + set-summary modals, tab bar, level-up,
  live cardio bar, combat props). Stale "Focus Trigger" `dashboard.*` keys removed.
- **English copy** written from the current Hebrew (habits, not triggers). Hebrew text unchanged, except Setup's
  four "טריגר" strings, reworded with the owner's OK:
  `goal.sub` נתאים את הטריגרים בהתאם. → נתאים את ההרגלים בהתאם. · `trigger1.title` הגדר את טריגר המיקוד הראשון →
  הגדר את ההרגל הראשון שלך · `trigger2.title` הגדר את טריגר המיקוד השני → הגדר את ההרגל השני שלך ·
  `triggerLabel` טריגר → הרגל.
- **"Trigger" as a cue stays.** Where "טריגר" means the cue that starts a habit (edit-habit popup
  "כשאני... (הטריגר)" — that field edits `trigger.cue`; add-habit step "הוסף טריגר" — picks when; `onboarding.time`
  "זמן הטריגר") it's a real concept, not the old feature name. English says **cue** there ("When I… (the cue)",
  "Cue time"), never "habit". Only "טריגר מיקוד" as the name of the whole habit (`dashboard.modalTitle`, unused modal)
  became "New habit".
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
- ~~**Hebrew keyword lists** in `Dashboard.jsx`~~ — done in Phase 5 (moved to `utils/nicheKeywords.js`).
- ~~Child cards Home renders from their own files: My Tasks, "הראש שלי" (Journal), daily lesson, WeekStrip~~ — done in
  Phase 3. Still left: the Workouts / Progress / Profile (Settings) tabs.

### Open after Phase 2

- ~~**Workout intensity → ids**~~ — done (`497b1a6`). Checked first: intensity was never stored (only the inline
  `DAILY_WORKOUTS` list; not in Firestore, localStorage, `src/data/`, functions or rules), so no mapping of old
  Hebrew values. Now `high` / `med` / `low` with `t.home.workout.intensity` labels.
- `exerciseName` in localStorage `ft_workout_log` is now saved in the UI language (`exerciseId` stays stable).
  Nothing in the app reads the log today.

## Phase 3 — Home's remaining cards + add-habit flow (done, 2026-10-09)

Same branch. Files: `MyTasks`, `JournalCard`, `Journal`, `DailyLessonCard`, `LessonNotesForm`, `LessonNotesPage`,
`dashboard/WeekStrip`, `HabitCreationFlow`; new `src/components/DirChevron.jsx`.

- **Strings:** new groups in `he.js` / `en.js`: `common` (back, save, saved, add to My Tasks, errors — shared by My
  Tasks, Journal and lesson notes), `myTasks`, `journal`, `lesson` (`topics`, `card`, `view`, `notesForm`,
  `notesPage`), `weekStrip`, `habitFlow` (titles, steps, cue presets). Hebrew text unchanged.
- **English copy** written fresh from the Hebrew, same voice as Phase 2. "הראש שלי" → **"On my mind"**. The journal's
  two questions stay first person ("What matters most to me in all this, and why?"). "הוסף טריגר" → **"Add a cue"**;
  the presets are cues ("When I wake up", "Before bed"…).
- **`LESSON_TOPICS` labels** (the 5 topic names on the lesson card) are translated in `t.lesson.topics`, by topic id.
  `data/dailyLessons.js` is unchanged; a test keeps `he.lesson.topics` equal to the data labels. Topic `desc` (only in
  Settings) is not translated yet.
- **Lesson content stays Hebrew** (title, summary, sections, question, answer, action). Only the card UI around it is
  translated.
- **RTL:** no `dir="rtl"` / `direction: 'rtl'` left in these files (inputs and textareas inherit `<html dir>`);
  `textAlign: 'right'` → `'start'`; accent stripes `borderRight` → `borderInlineStart`; My Tasks row padding →
  `paddingInlineStart/End`. Dates: `localeFor(lang)` in `src/i18n/fmt.js` (`he-IL` / `en-US`) in Journal and the
  "What I learned" page.
- **Chevrons:** `ForwardChevron` / `BackChevron` (`DirChevron.jsx`) pick `ChevronLeft` / `ChevronRight` from `lang`.
  Used for the "הראש שלי" card arrow (left in Hebrew, right in English) and the back buttons in Journal and
  LessonNotesPage. Arrows inside strings come from the language files. `Legal.jsx` / `LegalDoc.jsx` still use fixed
  chevrons (Phase 6).
- **Cue presets by id:** `HabitCreationFlow` used to keep the cue as the label text and highlight a preset when
  `trigger === label`. It now keeps the preset id (`wake` / `bfast` / `phone` / `work` / `sleep` / `custom`) and saves
  the label in the UI language. A suggestion's Hebrew cue (`triggerSuggestionHe`) is matched to a preset by the Hebrew
  label, so in English the preset is still highlighted and saved in English. Hebrew saves exactly what it saved
  before (`habitCreationWeekly.test.jsx` unchanged). Nothing else compares the saved cue to the presets (edit-habit is
  free text; the duplicate check compares against the user's own habits).
- **Tests:** `src/__tests__/i18nHome.test.jsx` (15) — My Tasks, "On my mind" card + write / list / entry, lesson card +
  open lesson + notes form, "What I learned" empty + saved lesson, WeekStrip, add-habit custom path through every step:
  no Hebrew in English (data/ content excluded); cue highlight + saved value in both languages; chevron direction;
  no hard-coded rtl / right / left in the 8 files; key parity. `npm test`: 30 files / 520 tests. `npm run build` OK.
- **Lint:** Hebrew-in-JSX warnings 1,068 → 974; the 8 files have none.
- **390px check (dev, guest, headless):** Home in Hebrew (rtl, stripes right, card chevron left) and English (ltr,
  stripes left, chevron right), Journal write view in English. No page errors. Lesson card, WeekStrip and the add-habit
  sheet were checked by tests only, not by screenshot.

Left on purpose (Phase 3):
- **Habit suggestions** (`data/habitSuggestions.js`, 76 items: `titleHe`, `triggerSuggestionHe`) still show in Hebrew
  in the English add-habit sheet. First item of the content phase.
- **Suggestions whose cue doesn't match a preset still save Hebrew text for English users** (e.g. "שעה לפני השינה",
  "בדיקה אחרי העבודה"): the cue is kept as the suggestion's text. Fixed when habit suggestions are translated (first
  item of the content phase).

## Phase 4 — Workouts tab and the screens it opens (done, 2026-10-09)

Same branch. Files: `pages/WorkoutsScreen`, `ActiveWorkout` (cardio timer, rep counter, set summary), `TrainingMode`
(free training), `boxing/BoxingPathScreen`, `BoxingWorkoutPreview`, `BoxingDrillTimer`, `BoxingCompletion`,
`combat/CombatPathScreen`, `CombatWorkoutPreview`, `CombatActiveWorkout`, `CombatCompletion`,
`muaythai/MuayThaiPathScreen`, `Dashboard.jsx` (MT options, live cardio bar).

- **Strings:** new `workouts` group in `he.js` / `en.js` (268 keys): tab, `categories` / `exercises` / `tracks` by id,
  `cardio`, `future`, `strength`, `combat` (path, `mt`, `boxing`, `preview`, `timer`, `completion`, `difficulty`,
  `roundType`, `equipment`), `free` (TrainingMode). Hebrew text unchanged; English written fresh from the Hebrew.
- **Short labels by id:** the tab's categories and exercises, `trainingTracks.js` names / descriptions / units (data
  unchanged; a test keeps `he.workouts.tracks` equal to the data), MT training options and reflection chips, boxing
  reflection chips, TrainingMode difficulty / style / stat labels.
- **Titles in English (data):** every `titleHe` in `boxingPath.js`, `muayThaiPath.js`, `boxingDrills.js` and
  `instantWorkouts.js` has a `titleEn` next to it (208 unique titles, 333 lines). Drill categories have
  `labelEn` / `descEn`; `buildDrill()` returns `titleEn` ("Footwork — 5 min"). Screens read them with
  `byLang(obj, 'title', lang)` (`src/i18n/fmt.js`): English when present, Hebrew otherwise. A test fails if any
  level / workout / round / drill lacks an English title.
- **Equipment as ids:** `equipment: ['ללא ציוד']` → `['none']` (39 workouts), label from
  `t.workouts.combat.equipment`. Hebrew still shows "ללא ציוד" (test). Nothing compared or stored the old text.
- **TrainingMode combos** are lists of move ids (`['jab', 'cross']`) read out with the 13-term glossary
  `t.workouts.free.moves`. All 42 combos read out exactly as before in Hebrew (checked against the old file).
  Speech picks `he-IL` or `en-US` per line, so English combos aren't read by a Hebrew voice.
- **Saved names:** the set log (`prime_set_log`) and the live cardio session (`prime_cardio_live`) save the track
  name in the UI language. The live cardio bar now shows the name by `trackId`, so it follows the current language.
- **Text compared as names — found, not changed:** the path's technique list compares technique names as text
  (`learnedTechs.includes(tech)`, `combatProgress.getLearnedTechniques`). Both sides come from the same data and
  nothing is stored, so it keeps working while techniques stay Hebrew. **When technique names are translated
  (content phase), give them ids first.**
- **RTL:** no `direction: 'rtl'` / `textAlign: 'right'|'left'` / `borderRight` / `marginRight` left in these files
  (→ `start` / `end`, `borderInlineStart`, `marginInlineStart`). Hebrew content inside English screens (round
  instructions, coaching cues, goals, safety notes) has `dir="auto"` so its punctuation lays out right-to-left.
  Left physical on purpose: camera overlays in `ActiveWorkout` (corner brackets, badges, the "me vs future me" widget
  pinned top-left over the video).
- **Arrows:** inside the strings (`←` Hebrew, `→` English). The header back button stays `←` in both languages, as in
  Hebrew today (no chevron icons in these files).
- **Tests:** `src/__tests__/i18nWorkouts.test.jsx` (17) — tab, cardio, reps (camera fallback → manual → summary),
  free training, boxing path / preview / drill timer / guided timer / completion, MT path / preview with gear check /
  completion: no Hebrew in English except content; Hebrew copy and formats unchanged ("ללא ציוד", "12:34 דק׳",
  drill title); combo glossary; track labels = data; every title has English; equipment ids have labels; no
  hard-coded rtl / right / left; key parity. `npm test`: 31 files / 537 tests. `npm run build` OK.
- **Lint:** warnings 974 → 755 (Hebrew-in-JSX 963 → 744). Same 5 pre-existing errors.
- **390px check (dev, guest, headless):** Hebrew tab, boxing home, guided path, preview and timer match the branch
  before Phase 4 (no pixel differs by more than 40/255 — anti-aliasing). English: tab, boxing home, guided path,
  preview, timer, drill settings, MT path, walking timer — ltr, no page errors.

Left on purpose (Phase 4):
- **Content stays Hebrew:** round instructions, coaching cues, safety notes, workout goals and descriptions, technique
  names (path technique list, `techniques` arrays), TrainingMode's spoken coach lines (openers, motivation, form
  alerts, tips).
- **Hidden behind `FEATURES.ai`:** boxing photo / video analysis entry points (`BoxingPathScreen`), `BoxingWorkout`,
  `FeedbackModal`.
- **Not reachable from the tab:** `CombatProtocols` (only from Home's daily workout card).

### Content left in the Workouts screens (measured 2026-10-09, unique Hebrew words)

| Source | Words | Main parts |
|---|---|---|
| Boxing path `boxingPath.js` | ~3,650 | round instructions 1,310 · safety notes 700 · descriptions 450 · goals 380 · coaching cues 400 · techniques 210 |
| Muay Thai path `muayThaiPath.js` | ~1,900 | instructions 1,130 · cues 340 · safety notes 210 · goals 60 · techniques 70 |
| Quick drills `boxingDrills.js` (rounds) | ~3,300 | instructions + cues for 163 rounds |
| TrainingMode coach lines | ~250 | openers, motivation, form alerts, improvement tips |

## Phase 5 — Progress and Profile tabs (done, 2026-10-11)

Same branch. Files: `pages/AnalyticsTab` (Progress), `components/Settings`, `GrowthPillarSelector`,
`DeleteAccountSheet`, `Dashboard.jsx` (profile header numbers, keyword lists), `services/notificationService`
(`getDailyNudgeMessage` only); new `utils/nicheKeywords.js`.

- **Strings:** new groups in `he.js` / `en.js`: `progress`, `nudge`, `pillars`, `settings`, `deleteAccount`. Hebrew text
  unchanged, except the Settings language label: `שפה / Language` → `שפה` (English: "Language"), with the owner's OK.
  The option names stay in their own language (`עברית` / `English`, with a `lang` attribute) so anyone can find them.
- **Dates and numbers by language:** the 14-day chart's day letters and the insight's day name come from `Intl`
  (`localeFor(lang)`): `he-IL` gives exactly the old `א׳…ש׳` and `יום ראשון`, `en-US` gives `S M T…` and `Sunday`. XP,
  streak, level and counts use `toLocaleString(locale)` (Progress stat cards, Profile header). Counted strings use
  `plural` ("1 day" / "8 days"). Reminder times in English are written `8:00 AM` / `10 AM and 4 PM`.
- **Pillar labels by id:** `t.pillars.labels` (`data/pillars.js` unchanged; a test keeps `he.pillars.labels` equal to the
  data). Lesson topics in Settings use `t.lesson.topics` (Phase 3).
- **Delete account confirm word by language** (owner's OK): Hebrew `מחק`, English `DELETE` (case and spaces don't
  matter). Only the current language's word works. Nothing is stored. Stat cards keyed by id, not by the Hebrew label.
- **Daily nudge:** `getDailyNudgeMessage(name, streak, lang = 'he')` reads `t.nudge` (owner's OK to do it now). Hebrew is
  the default, so the in-app nudge in `checkNotifications` is unchanged (a test compares every band to the old function).
  The Progress preview card passes the UI language.
- **Keyword lists** (`NICHE_KEYWORDS`, PathBuilder only — hidden behind `FEATURES.pathBuilder`) moved to
  `utils/nicheKeywords.js`. They already had English words; added `training`, `exercise`, `technology`, `develop(ment)`,
  `programming`, `chatgpt`, `investing`, `finance`, `financial`, `sales`, `marketing`. **English keywords now match whole
  words only** (optional plural `s`; owner's OK): before, `ai` matched "daily" / "again" and `app` matched "happy". Hebrew
  keywords still match anywhere (prefixes ב/ה/ו stick to the word).
- **RTL:** no `dir="rtl"` / `direction: 'rtl'` left (nickname input, delete sheet + its input). Physical → logical with
  Hebrew unchanged: in rtl `left` = end, `right` = start (`marginLeft: 'auto'` → `marginInlineEnd: 'auto'`). Also done
  in the hidden fight-club / XP-forecast blocks. Settings' toggle knob stays physical (off left, on right in both
  languages, as today). No chevron icons in these files.
- **Tests:** `src/__tests__/i18nProgress.test.jsx` (17) — Progress in English (with data, loading, singular) and Hebrew
  (copy, `יום ראשון`, day letters, `12,345`); nudge Hebrew = old function for every band, English has no Hebrew;
  Settings signed in / guest in English, Hebrew copy; pillars by id; delete confirm word in both languages; whole-word
  keywords; no hard-coded rtl / right / left; key parity. `i18n.test.jsx` now expects the label `שפה`.
  `npm test`: 32 files / 554 tests. `npm run build` OK.
- **Lint:** warnings 755 → 648. Same 5 pre-existing errors.
- **390px check (dev, guest, headless):** Hebrew Progress identical to the branch before Phase 5 (max pixel difference
  1/255); Hebrew Profile differs only in the language label. English Progress and Profile: ltr, no Hebrew except
  `עברית`, no page errors. The delete sheet and the signed-in Settings rows were checked by tests only.

Left on purpose (Phase 5):
- **Hidden behind `false` flags, still Hebrew:** fight club + its modal (`fightClub`), XP forecast (`xpForecast`), track
  progress, rebuild path + its confirm modal, path archive (`deepTracks`), surprise-mission categories
  (`surpriseMission`).
- **"Copy summary" with a streak** puts the most active 30-day track's Hebrew title in the text (`CHALLENGES`, tracks are
  hidden; only users with old track progress). Content phase, or drop the track name.
- ~~**Other notifications** in `notificationService.js`~~ — done in Phase 6.

## Phase 6 — notifications + `lang` on the profile (done, 2026-10-11)

Same branch. Commits: `f036efa` lang + tz on `users/{uid}` · `213220b` accountability default · `aab87ac` rule ·
`58edb7e` push copy · `8f6cf7b` in-app notifications. Nothing deployed (hosting, functions, rules).

- **Where `lang` lives:** on **`users/{uid}`**, not on the profile (`focusTriggers/{uid}`). `users/{uid}` is the doc the
  Cloud Functions read (`fcmTokens`, `streak.lastDate`). `syncLocale(uid, lang)` (`focusTriggerService.js`) writes
  `{ lang, tz }` with merge from Dashboard when a signed-in user loads the app or changes language; only when it
  changed (remembered in localStorage `prime_locale_{uid}`), never for guests, skipped while an account is being deleted
  (same flag as the profile auto-create). `tz` = the device's IANA zone (`Intl…resolvedOptions().timeZone`). With
  English off, every signed-in user gets `lang: 'he'` + their `tz` once.
- **Rule:** `users/{uid}.lang` must be `'he'` or `'en'`, `tz` a string matching `[A-Za-z0-9_+/-]{1,64}`. 4 emulator
  tests (2 failed on the old rules). Not deployed.
- **Send times — found:** server push runs on **Israel time for everyone** (`dailyHabitNudge` 19:30, `accountabilityReminder`
  18:00, `Asia/Jerusalem`) and compares the Israel date with `streak.lastDate`, which the client writes as a **UTC** date.
  Fine for Israel (19:30 Israel is the same UTC day); wrong for the US. In-app notifications use the device's local time
  (`getHours()`), so they're already right abroad, but fire only while the app is open.
- **Planned, not built — local send time:** when FCM registration is wired (see "Push notifications" below), run the
  nudge every hour at :30 (UTC) and send only to users whose `tz` local time is 19:30; users without `tz` keep Israel
  time. "Done today" must then accept `streak.lastDate` equal to the UTC date of either the user's local midnight or now
  (at 19:30 in Los Angeles it's already the next UTC day).
- **Server copy** (`functions/notifyCopy.js`, used by `index.js` and its tests — the old test file tested a stale
  copy): daily nudge reworded with the owner's OK — `ה-Streak` → `הרצף`, no `1%`, `מונק מוד`, `משימות`; English
  rewritten to match. Test push and the update-broadcast default now have `he` / `en` by `users/{uid}.lang`
  (an override in `config/app` still goes to everyone as written). Every function defaults to Hebrew
  (`accountabilityReminder` used to default to English; its copy is unchanged). `ar` copy left as it was — unreachable,
  the rule allows only `he` / `en`. `index.js` has no Hebrew left (test).
- **In-app copy** (`t.notify`): habit reminder, evening recap, check-in nudge (gap line + action buttons), goal labels.
  `checkNotifications(…, lang)` and `checkNudges(…, lang)` get the UI language from Dashboard; the morning nudge passes
  it to `getDailyNudgeMessage`. Hebrew reworded with the owner's OK: `טריגר` → `הרגל` in the reminder title and recap,
  no-habits recap `לא הגדרת הרגלים להיום. מחר מתחילים מחדש 💪`, singular `השלמת את ההרגל של היום.` for one habit.
- **Tests:** `src/__tests__/i18nNotifications.test.js` (9) — recap every case in both languages, reminder, check-in
  buttons, `checkNotifications` in English, no Hebrew in `en.notify` or `notificationService.js`;
  `profileLocale.test.js` (7); functions `nudge.test.js` 22 → 29. `npm test`: 34 files / 570 tests. `npm run build` OK.

Left on purpose (Phase 6):
- `fcmService.sendForegroundTestNotif` (Hebrew) — not called anywhere.
- `accountabilityReminder` copy (TikTok / push-ups / PRO) — old feature, only the default language changed.

## Phase 7 — legal pages (2026-10-11, branch `feat/english-legal`)

Files: `src/data/legal.js`, `src/components/LegalContent.jsx`, `src/pages/Legal.jsx`, `src/pages/LegalDoc.jsx`,
`src/i18n/he.js` / `en.js` (new `legal` group).

- **Faithful translation, owner's decision:** `PRIVACY_EN` / `TERMS_EN` next to the Hebrew in `legal.js` — same
  sections, paragraphs, list items and placeholders (a test checks the shape). No new promises: Israeli law, Jerusalem
  courts and the Israeli crisis lines stay as in the Hebrew. Hebrew text untouched.
- **Config:** `legalConfig(lang)` — English overrides only `operatorName` ("Noam Cohen"), `courtCity` ("Jerusalem")
  and `updated` ("September 29, 2026"); email, age and deletion days are shared. `legalDoc(type, lang)` picks the doc.
  Owner-marker labels ("To fill in:", "For you to decide:") in both languages.
- **Layout:** the three files take `dir` from `dirFor(lang)` (no hard-coded rtl). Chevrons from Phases 3–6 fixed:
  back = `BackChevron`, the hub rows = `ForwardChevron`.
- **Tests:** `src/__tests__/i18nLegal.test.jsx` (12) — EN/HE shape + placeholder parity, config overrides, no Hebrew
  in English, key phrases kept, Hebrew output unchanged, `dir` and chevron direction on `/legal` and `/privacy` in
  both languages. `legal.test.jsx` unchanged and passing. `npm test`: 35 files / 582 tests. `npm run build` OK.
- **390px check (dev, headless, both languages):** `/legal`, `/privacy`, `/terms` — html + page `dir` right, back
  chevron at the start edge, no horizontal scroll, no Hebrew in English, no page errors.
- **Crisis line abroad (owner's exception):** one added line in both languages — "outside Israel: local emergency
  number or findahelpline.com". Separate commit, after the owner approves the Hebrew wording.

### Legal gaps for users abroad — open, for a lawyer (not fixed on purpose)

Owner's decision: translate faithfully, leave these to a legal review.

1. **GDPR rights** — no list of rights (access, correction, export, objection, complaint to a supervisory authority)
   and no legal basis per use of data.
2. **EU → US transfer** — says "US servers" but names no transfer mechanism (SCCs / Data Privacy Framework).
3. **GA consent** — **BLOCKER, see below.**
4. **Retention** — no period for inactive accounts or backups.
5. **US health data** — habits, workouts and the journal may be "consumer health data" (e.g. Washington My Health My
   Data Act). "We don't sell" already covers the CCPA sale point.
6. **Push tokens** — mentioned, but not that they go through Google FCM or how they're removed.
7. **Time zone / language** — listed, but not that they time the push and pick its language. Minor.
8. **18+** — self-declared checkbox, no verification. Usually acceptable.
9. **Israeli law / Jerusalem courts** — EU consumers usually keep their home-country protections; US-style warranty
   and liability wording is thin.

## Blockers before `FEATURES.english = true`

- **GA consent (EU).** Today GA4 starts on landing (`src/services/analytics.js`) and sets cookies with no consent.
  ePrivacy / GDPR require consent before non-essential cookies for EU users. Turning English on opens the app to EU
  users, so this must be solved first (consent banner before GA loads, or GA consent mode with analytics denied by
  default, or no GA cookies) — and the privacy policy updated to match. **Not an open item: a blocker.**
- Legal review of the gaps above.
- The visible UI translated and the RTL fixes done (below).

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
2. ~~**Home's remaining cards**~~ — done in Phase 3 (above).
3. ~~**Workouts tab**~~ — done in Phase 4 (above), titles included; instructions, cues and safety notes left.
4. ~~**Progress and Profile tabs**~~ — done in Phase 5 (above).
5. ~~**Notifications + `lang` on the profile**~~ — done in Phase 6 (above).
6. ~~**Legal pages**~~ — translated in Phase 7 (above); legal review for users abroad still open, GA consent is a
   blocker.
7. **Push notifications** (app closed) — today server push reaches no one. What's missing:
   1. **Billing (Blaze)** — off on `better-de9aa`; needed to deploy any function (incl. schedulers). FCM sending itself is
      free.
   2. **Deploy the functions** — live ones are old code on nodejs20. Deploy only the notification functions
      (`--only functions:dailyHabitNudge,…`) so the Gemini secret isn't involved.
   3. **Token registration** — `registerFcmToken` is never called, so no user has a token. Call it when notifications
      are turned on in Settings and on each app open with permission granted (tokens rotate); unregister on logout /
      opt-out; listen for the service worker's `FCM_TOKEN_REFRESH` message (nothing listens today).
   4. **VAPID key** — done: `VITE_FIREBASE_VAPID_KEY` in `.env.local`, messaging set up in `firebase.js`.
   5. **Service worker** — `sw.js` has push + click handlers. Probable bug: it reads `payload.title` at the top level,
      but FCM puts a data-only message's fields under `payload.data`, so a push would likely show "PRIME" with an empty
      body. Test with a real push.
   6. **Server logic** — Israel time + UTC-vs-Israel date (Phase 6: build the hourly local-time nudge here);
      `accountabilityReminder` only targets `isPro` users (none).
   7. **iOS** — 16.4+ only, only when added to the Home Screen (manifest `display: standalone` ✓), permission asked from
      a tap inside the installed app (Settings toggle ✓), no push in a Safari tab, every push must show a notification
      (sw.js does).
   8. **Android Chrome** — works with the app closed; some phones' battery savers delay pushes.
   9. **Before launch** — privacy policy mentions push tokens; real E2E with `sendTestNotification` on Android and an
      installed iPhone app.
8. **Content** — in this order:
   1. **Habit suggestions** (`data/habitSuggestions.js`, 76 short items) — first: they're short and on the first-habit
      path. Also fixes suggestions whose cue matches no preset saving Hebrew text for English users (Phase 3).
   2. **Daily lessons** — 35 lessons (`data/dailyLessons.js`), plus topic `desc`.
   3. **Workouts** — boxing / Muay Thai instructions, coaching cues, safety notes, goals, technique names (ids
      first) and TrainingMode's coach lines (~9k words, table in Phase 4). Titles are already done.

Turn on `FEATURES.english` only after the visible UI is translated and the RTL fixes are done, **and the GA consent
blocker is solved** (see "Blockers").

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
  **Every chevron / arrow must flip in English** — e.g. the "הראש שלי" card's chevron points left in Hebrew and must
  point right in English. Arrows inside strings come from `he.js` / `en.js`; icon components need
  `transform: scaleX(-1)` (or the opposite icon) when `dir` is ltr. Check each screen at 390px in both directions.
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
