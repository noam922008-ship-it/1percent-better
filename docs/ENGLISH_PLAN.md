# PRIME — English version plan

Status: **not started** (decided 2026-09-30: not now). Written from the codebase as of that date.

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

- First visit: from the device language — Hebrew if `navigator.language` starts with `he`, otherwise English.
- Later: the existing EN/עב toggle on the welcome screen, plus a picker in Settings.
- Stored in `localStorage` (`ft_lang`) and on the profile (`lang`), so server push copy matches.

## Decisions needed before building

1. **AI journal questions in English** need an English distress phrase list — **approved by the owner**, like the
   Hebrew one — and international crisis resources: ער״ן and סה״ר are Israeli services.
2. **Gendered Hebrew** — the Hebrew UI addresses the user in the masculine form only ("אתה"). English avoids it;
   consider gender-neutral Hebrew at the same time (see CLAUDE.md open items).
3. **Library** — keep the existing lightweight `translations.js` (recommended: split into `he.js` / `en.js`, no new
   dependency) or move to `react-i18next`.
