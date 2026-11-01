# Starting from zero (Nov 2026)

Problem: 0 of 3 new users came back on day 2. Someone with no good habits picks something too big,
breaks it by day 3 and leaves. They also don't know what to quit first and what to add when.

Decision (Noam, 2026-11-01): fix the leak and fill the bucket at the same time, as ONE pair.
"When I feel like X, I do Y instead."

Flow (src/components/FromZeroFlow.jsx, opened from the first-run welcome):
1. Where are you starting? zero / I have some (regular flow) / only quit (regular flow)
2. One bad habit: scrolling, smoking, alcohol, junk food, late nights, snooze, or own text.
   Smoking and alcohol show a short note with free professional help (MoH quit line *6800, Kol Zchut).
3. One tiny good habit that replaces it, amount adjustable: 2 pages, 15 push-ups, 5 min run/walk.
4. When does it usually happen → that is the reminder time.
5. Summary ("the deal") → saves a quit habit (clean-day count) + a daily build habit with cue "when I feel like X".

Week one: only this pair. After 7 days suggest adding another (not a lock, adding earlier is allowed).

Not built yet:
- Day-7 "ready to add another?" card on Home
- After the first check-in: "what time tomorrow?" + notification permission (+ install on iPhone)
