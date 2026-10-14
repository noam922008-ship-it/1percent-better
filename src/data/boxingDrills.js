// boxingDrills.js — drill data for the Hebrew boxing fast-start experience
// All text is RTL Hebrew. Round shape matches CombatActiveWorkout expectations.

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

export const DRILL_CATEGORIES = [
  {
    id: 'footwork',
    labelHe: 'עבודת רגליים',
    labelEn: 'Footwork',
    emoji: '👟',
    descHe: 'תנועה, מיקום ויציאות זווית',
    descEn: 'Movement, position and angling out',
  },
  {
    id: 'punch-technique',
    labelHe: 'ידיים ומכות',
    labelEn: 'Punches',
    emoji: '🥊',
    descHe: 'ג׳אב, קרוס, הוק, אפרקט וחזרה להגנה',
    descEn: 'Jab, cross, hook, uppercut and back to guard',
  },
  {
    id: 'defense',
    labelHe: 'הגנה ושמירת פנים',
    labelEn: 'Defense and guard',
    emoji: '🛡️',
    descHe: 'גארד, סנטר מורד, השתחמות והתאוששות',
    descEn: 'Guard, chin down, slipping and recovering',
  },
  {
    id: 'combinations',
    labelHe: 'קומבינציות',
    labelEn: 'Combinations',
    emoji: '⚡',
    descHe: 'מכות משולבות עם הגנה ותנועה',
    descEn: 'Punches together with defense and movement',
  },
  {
    id: 'free-training',
    labelHe: 'אימון חופשי',
    labelEn: 'Free training',
    emoji: '🔥',
    descHe: 'סיבובים לפי בחירתך',
    descEn: 'Rounds your way',
  },
  {
    id: 'analysis',
    labelHe: 'בדיקת עמידה מתמונה',
    labelEn: 'Stance check from a photo',
    emoji: '📸',
    descHe: 'צלם תנוחה וקבל משוב על מה שנראה בתמונה',
    descEn: 'Take a photo of your stance and get feedback on what it shows',
  },
]

// ---------------------------------------------------------------------------
// Duration options (minutes)
// ---------------------------------------------------------------------------

export const DRILL_DURATIONS = [3, 5, 10, 15]

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------

export const LAST_DURATION_KEY = 'prime_boxing_last_duration'

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

export function getLastDuration() {
  try {
    const raw = localStorage.getItem(LAST_DURATION_KEY)
    if (raw === null) return 5
    const n = parseInt(raw, 10)
    return DRILL_DURATIONS.includes(n) ? n : 5
  } catch {
    return 5
  }
}

export function saveLastDuration(min) {
  try {
    localStorage.setItem(LAST_DURATION_KEY, String(min))
  } catch {
    // ignore (private browsing / storage full)
  }
}

// ---------------------------------------------------------------------------
// Round builders — one per category × duration
// ---------------------------------------------------------------------------

// ── FOOTWORK ──────────────────────────────────────────────────────────────

const FOOTWORK_ROUNDS = {
  3: [
    {
      id: 'ft-3-tech',
      type: 'technique',
      titleHe: 'טכניקה: צעד קדימה ואחורה',
      titleEn: 'Technique: step forward and back',
      instructionHe:
        'עמוד בתנוחת אגרוף: רגל שמאל קדמית, ימין אחורית, כתפיים מעט אלכסוניות. לצעד קדימה — הרגל הקדמית זז ראשונה, הרגל האחורית גוררת בדיוק אותו מרחק. לצעד אחורה — הרגל האחורית זז ראשונה, הקדמית גוררת. שמור על רוחב הכתפיים בין הרגליים בכל עת. אל תצלב את הרגליים ואל תשכח לרחף על קצות האצבעות.',
      instructionEn:
        'Stand in a boxing stance: left foot forward, right foot back, shoulders slightly angled. To step forward, the front foot moves first and the back foot drags the same distance. To step back, the back foot moves first and the front foot drags. Keep your shoulder width between your feet at all times. Don\'t cross your feet, and remember to stay light on the balls of your feet.',
      coachingCuesEn: [],
      durationSeconds: 40,
      coachingCuesHe: [],
    },
    {
      id: 'ft-3-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — תנועה קדימה-אחורה',
      titleEn: 'Round 1 — moving forward and back',
      instructionHe:
        'שלושה צעדים קדימה, עצור, שלושה צעדים אחורה, עצור. חזור על הרצף לכל אורך הסיבוב. התמקד בכך שהרגל הגוררת נחה בדיוק במקום הנכון — לא רחוק מדי ולא קרוב מדי. הידיים נשארות בגארד, מבט ישיר קדימה.',
      instructionEn:
        'Three steps forward, stop, three steps back, stop. Repeat the sequence for the whole round. Focus on the trailing foot landing in exactly the right spot — not too far and not too close. Hands stay in guard, eyes straight ahead.',
      coachingCuesEn: [
        'Lead foot moves first — always',
        'Don\'t cross, keep shoulder width',
        'Stay light on the balls of your feet',
        'Guard up at every step',
      ],
      durationSeconds: 100,
      coachingCuesHe: [
        'רגל קדמית זה ראשון — תמיד',
        'אל תצלב, שמור על רוחב כתפיים',
        'קצות האצבעות — נשאר קל',
        'גארד למעלה בכל שלב',
      ],
    },
    {
      id: 'ft-3-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'צעד איטי במקום, הורד את הידיים, נשום עמוק. מתח את שרירי השוקיים — עמוד על עקבים לשניות ספורות, חזור לכפות. סובב את הקרסוליים בעדינות לשני הכיוונים.',
      instructionEn:
        'Step in place slowly, lower your hands, breathe deeply. Stretch your calves — stand on your heels for a few seconds, then return to the balls of your feet. Gently rotate your ankles in both directions.',
      coachingCuesEn: [],
      durationSeconds: 40,
      coachingCuesHe: [],
    },
  ],

  5: [
    {
      id: 'ft-5-warm',
      type: 'warmup',
      titleHe: 'חימום — ריצה קלה במקום',
      titleEn: 'Warm-up — light jog in place',
      instructionHe:
        'ריצה קלה במקום, קצב נוח. הרם את הברכיים מעט — לא ריצת ברכיים גבוהות, רק הפעלת שרירים. לאחר 30 שניות הוסף תנועה קטנה קדימה ואחורה תוך כדי הריצה.',
      instructionEn:
        'Light jog in place at a comfortable pace. Lift your knees slightly — not high-knee running, just waking up the muscles. After 30 seconds, add small movements forward and back while you jog.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-5-tech',
      type: 'technique',
      titleHe: 'טכניקה: צעד לצד',
      titleEn: 'Technique: side step',
      instructionHe:
        'שאפל לצד ימין: רגל ימין זז ראשונה לצד, רגל שמאל עוקבת בדיוק אותו מרחק. לצד שמאל: רגל שמאל זז ראשונה. הרגליים נשארות מקבילות, אל תביא את העקב פנימה. שמור על כיפוף קל בברכיים כל הזמן — "ספוגי", לא נוקשה.',
      instructionEn:
        'Side step to the right: the right foot moves first to the side, and the left foot follows the exact same distance. To the left: the left foot moves first. Feet stay parallel, don\'t bring the heel inward. Keep a slight bend in the knees the whole time — springy, not stiff.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-5-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — תנועה לצדדים',
      titleEn: 'Round 1 — moving sideways',
      instructionHe:
        'שני שאפלים לצד ימין, עצור, שני שאפלים לצד שמאל, עצור. חזור. שים לב שהגוף לא מתנדנד — הכתפיים נשארות יציבות, התנועה מגיעה מהרגליים בלבד. אל תניח לרגליים להתקרב אחת לשנייה.',
      instructionEn:
        'Two side steps to the right, stop, two side steps to the left, stop. Repeat. Make sure your body doesn\'t sway — shoulders stay stable, and the movement comes from the legs only. Don\'t let your feet get closer together.',
      coachingCuesEn: [
        'Feet parallel, not a V',
        'Knees bent — springy',
        'Guard up the whole round',
        'Don\'t stomp — land softly',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'רגליים מקבילות, לא V',
        'ברכיים כפופות — ספוגי',
        'גארד למעלה לאורך כל הסיבוב',
        'אל תשמיע דריכה — נחית בעדינות',
      ],
    },
    {
      id: 'ft-5-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — תנועה קדימה + לצד + אחורה',
      titleEn: 'Round 2 — forward + side + back',
      instructionHe:
        'רצף בצורת L: שני צעדים קדימה, שני שאפלים לצד שמאל, שני צעדים אחורה. חזור לנקודת ההתחלה ועשה את הרצף בצד הנגדי: קדימה, לצד ימין, אחורה. תנועה רציפה ושקטה — דמיין שאתה על קרח דק.',
      instructionEn:
        'L-shaped sequence: two steps forward, two side steps to the left, two steps back. Return to the starting point and do the sequence on the other side: forward, right, back. Smooth and quiet movement — imagine you\'re on thin ice.',
      coachingCuesEn: [
        'Smooth movement, no unnecessary stops',
        'Hands in guard between every change of direction',
        'Head up — don\'t look at the floor',
        'Steady pace, not rushed',
      ],
      durationSeconds: 60,
      coachingCuesHe: [
        'תנועה רציפה, בלי עצירות מיותרות',
        'הידיים בגארד בין כל שינוי כיוון',
        'ראש למעלה — אל תסתכל ברצפה',
        'קצב שווה, לא בהול',
      ],
    },
    {
      id: 'ft-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'עמוד ישר, נשום עמוק. מתח את חזית הירך — אחוז ברגל אחת מאחור ל-10 שניות לכל צד. סובב את הקרסוליים. לאט לאט.',
      instructionEn:
        'Stand tall and breathe deeply. Stretch the front of your thigh — hold one foot behind you for 10 seconds on each side. Rotate your ankles. Slowly.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'ft-10-warm',
      type: 'warmup',
      titleHe: 'חימום — הפעלת גוף',
      titleEn: 'Warm-up — get the body moving',
      instructionHe:
        'ריצה קלה במקום 30 שניות, לאחר מכן סיבובי ירכיים 10 חזרות לכל כיוון, ואז כיפוף קל של הברכיים — סקוואט רדוד 10 פעמים. הכל בקצב נוח.',
      instructionEn:
        'Light jog in place for 30 seconds, then 10 hip circles in each direction, then a light knee bend — 10 shallow squats. All at a comfortable pace.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-10-tech',
      type: 'technique',
      titleHe: 'טכניקה: ציר וסיבוב',
      titleEn: 'Technique: pivot and turn',
      instructionHe:
        'ציר: הרגל הקדמית נשארת במקום ומשמשת כציר. הרגל האחורית מסתובבת החוצה ב-45–90 מעלות. לאחר הסיבוב — אתה עכשיו פונה לזווית שונה. זוהי יציאת זווית — להשתמש אחרי מכה כדי לצאת מהקו הישר. תרגל סיבוב לשמאל ואחר כך לימין לסירוגין.',
      instructionEn:
        'Pivot: the front foot stays in place and serves as the axis. The back foot turns outward 45–90 degrees. After the turn, you are now facing a different angle. This is an angle-out — use it after a punch to get off the straight line. Practice turning left and then right, alternating.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — תנועה קדימה-אחורה',
      titleEn: 'Round 1 — moving forward and back',
      instructionHe:
        'שלושה צעדים קדימה, שלושה אחורה, ברציפות. קצב בינוני-מהיר. הרגל הגוררת אף פעם לא חוצה את הרגל המובילה.',
      instructionEn:
        'Three steps forward, three steps back, continuously. Medium-fast pace. The trailing foot never crosses the leading foot.',
      coachingCuesEn: [
        'Lead foot moves first — iron rule',
        'Don\'t cross your feet',
        'Stay on the balls of your feet',
        'Guard up',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'רגל מובילה זז ראשון — כלל ברזל',
        'אל תצלב רגליים',
        'נשאר על קצות האצבעות',
        'גארד למעלה',
      ],
    },
    {
      id: 'ft-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום עמוק. נשיפה ארוכה. הכן את עצמך לסיבוב הבא.',
      instructionEn:
        'Breathe deeply. Long exhale. Get ready for the next round.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — צעדים לצד',
      titleEn: 'Round 2 — side steps',
      instructionHe:
        'שאפל שלושה צעדים לצד ימין, שלושה לשמאל. לאחר 45 שניות — האץ את הקצב, שני שאפלים מהירים לכל כיוון. שמור על גובה קבוע — לא לקפוץ למעלה בין הצעדים.',
      instructionEn:
        'Shuffle three steps to the right, three to the left. After 45 seconds, speed up — two quick shuffles in each direction. Keep a constant height — don\'t bounce up between steps.',
      coachingCuesEn: [
        'Constant height — don\'t jump',
        'Feet parallel the whole time',
        'Breathe with the movement',
        'Hands in guard, elbows in',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'גובה קבוע — אל תקפוץ',
        'רגליים מקבילות לכל אורך',
        'נשום בקצב התנועה',
        'ידיים בגארד, מרפקים פנימה',
      ],
    },
    {
      id: 'ft-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה את הכתפיים.',
      instructionEn:
        'Breathe. Let your shoulders relax.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — ציר ויציאת זווית',
      titleEn: 'Round 3 — pivot and angle out',
      instructionHe:
        'צעד קדימה, ציר על הרגל הקדמית לשמאל — כעת אתה פונה לכיוון חדש. צעד קדימה שוב, ציר לימין. הרצף: קדימה → ציר שמאל → קדימה → ציר ימין. דמיין שאתה עוקף יריב בכל ציר.',
      instructionEn:
        'Step forward, pivot on the front foot to the left — now you are facing a new direction. Step forward again, pivot to the right. The sequence: forward → pivot left → forward → pivot right. Imagine you are getting around an opponent with every pivot.',
      coachingCuesEn: [
        'Pivot on the ball of the front foot',
        'The body turns, not just the legs',
        'Guard immediately after the pivot',
        'Don\'t stand upright after the pivot — stay in position',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'ציר על כדור כף הרגל הקדמית',
        'הגוף סובב, לא רק הרגליים',
        'אחרי הציר — גארד מיידי',
        'אל תעמוד זקוף אחרי הציר — הישאר בתנוחה',
      ],
    },
    {
      id: 'ft-10-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון קרב.',
      instructionEn:
        'Breathe. Last round coming up.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-10-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — תנועה + ג׳אב',
      titleEn: 'Round 4 — movement + jab',
      instructionHe:
        'שני צעדים קדימה → ג׳אב אחד → שני צעדים אחורה. חזור על הרצף. המכה מגיעה בסוף התנועה קדימה, לא תוך כדי. לאחר הג׳אב — חזור מיד לגארד לפני שאתה נסוג אחורה. זהו שילוב בסיסי: תנועה → כניסה → מכה → יציאה.',
      instructionEn:
        'Two steps forward → one jab → two steps back. Repeat the sequence. The punch comes at the end of the forward movement, not while moving. After the jab, return to guard right away, before you step back. This is a basic combination: movement → entry → punch → exit.',
      coachingCuesEn: [
        'Movement first, punch after',
        'Return to guard right after the jab',
        'Step back — don\'t stay on the line',
        'Don\'t look at the floor',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'תנועה קודם, מכה אחר כך',
        'חזור לגארד אחרי הג׳אב מיד',
        'צא אחורה — אל תישאר על הקו',
        'לא להסתכל ברצפה',
      ],
    },
    {
      id: 'ft-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'הליכה איטית במקום. מתח את הירכיים והשוקיים. גלגל את הכתפיים אחורה. נשום עמוק דרך האף, שחרר דרך הפה.',
      instructionEn:
        'Walk slowly in place. Stretch your hips and calves. Roll your shoulders back. Breathe deeply through the nose, release through the mouth.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'ft-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה במקום 30 שניות. קפיצות קטנות על שתי רגליים 15 שניות — הגוף מתחמם ומוכן. 15 שניות אחרונות: סיבובי ירכיים ופתיחת כתפיים.',
      instructionEn:
        'Light jog in place for 30 seconds. Small two-foot hops for 15 seconds — the body warms up and gets ready. For the last 15 seconds: hip circles and opening the shoulders.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-tech',
      type: 'technique',
      titleHe: 'טכניקה: יציאת זווית',
      titleEn: 'Technique: angling out',
      instructionHe:
        'יציאת זווית היא שילוב של צעד לצד וציר. לאחר ג׳אב-קרוס: צעד לצד שמאל עם הרגל השמאלית בו זמנית שאתה מסיים את הקרוס, ואז ציר קל — עכשיו אתה מחוץ לקו הישר. תרגל: צעד → ציר לשמאל. צעד → ציר לימין.',
      instructionEn:
        'Angling out is a combination of a side step and a pivot. After a jab-cross: step to the left with your left foot at the same time you finish the cross, then a light pivot — now you are off the straight line. Practice: step → pivot left. Step → pivot right.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — צעדים קדימה-אחורה',
      titleEn: 'Round 1 — steps forward and back',
      instructionHe:
        'ארבעה צעדים קדימה, ארבעה אחורה. לאחר 60 שניות — שני צעדים קדימה, שני אחורה, בקצב כפול. שמור על תנוחת אגרוף לאורך כל הסיבוב.',
      instructionEn:
        'Four steps forward, four steps back. After 60 seconds — two steps forward, two back, at double the pace. Keep a boxing stance the whole round.',
      coachingCuesEn: [
        'Lead foot — always first',
        'Balls of the feet, not the whole foot',
        'Guard — hands by the cheeks',
        'Knees slightly bent',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'רגל מובילה — תמיד ראשון',
        'קצות האצבעות, לא כל כף הרגל',
        'גארד — ידיים ליד הלחיים',
        'ברכיים כפופות מעט',
      ],
    },
    {
      id: 'ft-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום עמוק. שאיפה 4 שניות, נשיפה 4 שניות.',
      instructionEn:
        'Breathe deeply. Inhale for 4 seconds, exhale for 4 seconds.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — שאפל לצדדים',
      titleEn: 'Round 2 — side shuffle',
      instructionHe:
        'שלושה שאפלים ימינה, שלושה שמאלה. לאחר 60 שניות — הוסף ג׳אב בסוף כל רצף: שאפל ימינה × 3 → ג׳אב, שאפל שמאלה × 3 → ג׳אב.',
      instructionEn:
        'Three shuffles to the right, three to the left. After 60 seconds — add a jab at the end of each sequence: shuffle right × 3 → jab, shuffle left × 3 → jab.',
      coachingCuesEn: [
        'Even height — don\'t sink',
        'The jab comes straight from the guard',
        'Return to guard right after the jab',
        'Breathe — don\'t hold your breath',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'גובה אחיד — אל תשקע',
        'ג׳אב מגיע מהגארד ישר',
        'חזור לגארד מיד אחרי הג׳אב',
        'נשום — אל תחסום נשימה',
      ],
    },
    {
      id: 'ft-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. כתפיים רפויות.',
      instructionEn:
        'Breathe. Shoulders loose.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — ציר ויציאה',
      titleEn: 'Round 3 — pivot and exit',
      instructionHe:
        'צעד קדימה → ציר לשמאל → שני שאפלים לצד → ציר חזרה. חזור לכיוון הנגדי. הרצף דומה לריקוד — תנועה זורמת, לא מדורגת. תרגל יציאה משני הצדדים לסירוגין.',
      instructionEn:
        'Step forward → pivot left → two side shuffles → pivot back. Repeat in the opposite direction. The sequence is like a dance — flowing movement, not step by step. Practice exiting from both sides alternately.',
      coachingCuesEn: [
        'Pivot on the ball of the front foot',
        'Eyes forward on every pivot',
        'Keep your body low — don\'t straighten up',
        'Flow — no stops',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'ציר על כדור כף הרגל הקדמית',
        'מבט קדימה בכל ציר',
        'גוף נמוך — אל תזדקף',
        'זרימה — לא עצירות',
      ],
    },
    {
      id: 'ft-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'מתח קל את הירכיים, נשום.',
      instructionEn:
        'Gently stretch your hips, breathe.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — שילוב תנועה + ג׳אב',
      titleEn: 'Round 4 — movement + jab together',
      instructionHe:
        'שני צעדים קדימה → ג׳אב → שני צעדים אחורה → ציר לצד. חזור. ג׳אב תמיד בסוף הכניסה, ואז יציאה מיידית. לאחר 60 שניות — הוסף קרוס לאחר הג׳אב: כניסה → 1-2 → יציאה.',
      instructionEn:
        'Two steps forward → jab → two steps back → pivot to the side. Repeat. The jab always comes at the end of the entry, then an immediate exit. After 60 seconds — add a cross after the jab: entry → 1-2 → exit.',
      coachingCuesEn: [
        'Entry → punch → exit: this sequence is everything',
        'Don\'t stay on the line after the punch',
        'Return to guard before you move',
        'Hands don\'t drop during movement',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'כניסה → מכה → יציאה: הרצף הזה הוא הכל',
        'אל תישאר על הקו אחרי המכה',
        'חזור לגארד לפני שאתה זז',
        'ידיים לא יורדות בתנועה',
      ],
    },
    {
      id: 'ft-15-rest4',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'סיבוב אחרון — תן הכל.',
      instructionEn:
        'Last round — give it everything.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ft-15-w5',
      type: 'work',
      titleHe: 'סיבוב 5 — אימון חופשי של עבודת רגליים',
      titleEn: 'Round 5 — free footwork',
      instructionHe:
        'שלב את כל מה שתרגלת: קדימה-אחורה, לצד, ציר, יציאות זווית. אין הוראות — תנוע לפי האינסטינקט. האם אתה עדיין על קצות האצבעות? האם הגארד למעלה? האם אתה לא מצלב רגליים? בדוק את עצמך.',
      instructionEn:
        'Combine everything you practiced: forward and back, sideways, pivots, angling out. No instructions — move by instinct. Are you still on the balls of your feet? Is your guard up? Are you not crossing your feet? Check yourself.',
      coachingCuesEn: [
        'Balls of the feet — always',
        'Guard up',
        'Don\'t cross your feet',
        'Keep moving without stopping',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'קצות האצבעות — תמיד',
        'גארד למעלה',
        'לא לצלב רגליים',
        'תנוע ללא הפסקה',
      ],
    },
    {
      id: 'ft-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'הליכה איטית. מתח את שרירי השוקיים, הירכיים, הגב התחתון. גלגל את הכתפיים. נשום עמוק ושחרר.',
      instructionEn:
        'Walk slowly. Stretch your calves, thighs, and lower back. Roll your shoulders. Breathe deeply and release.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],
}

// ── PUNCH TECHNIQUE ──────────────────────────────────────────────────────

const PUNCH_ROUNDS = {
  3: [
    {
      id: 'pt-3-tech',
      type: 'technique',
      titleHe: 'טכניקה: הג׳אב',
      titleEn: 'Technique: the jab',
      instructionHe:
        'ג׳אב הוא היד הקדמית (שמאל אם אתה ימני). שלב 1: מהגארד — דחף את האגרוף ישר קדימה, סובב את האמה כך שהמפרקים פונים כלפי מעלה בנקודת ההשפעה. שלב 2: החזר את היד חזרה לגארד בדיוק באותו הנתיב. לא לזרוק ולהשאיר — כל מכה מסתיימת בחזרה לגארד. הכתף עולה מעט להגן על הסנטר.',
      instructionEn:
        'The jab is the front hand (left if you\'re right-handed). Step 1: from the guard, drive the fist straight forward, turning the forearm so the knuckles face up at the point of impact. Step 2: bring the hand back to guard along exactly the same path. Don\'t throw it and leave it out — every punch ends back in guard. The shoulder rises slightly to protect the chin.',
      coachingCuesEn: [],
      durationSeconds: 40,
      coachingCuesHe: [],
    },
    {
      id: 'pt-3-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — ג׳אב איטי ומדויק',
      titleEn: 'Round 1 — slow, precise jab',
      instructionHe:
        'ג׳אב אחד כל שתי שניות. לא מהירות — דיוק. ספור: 1…2…ג׳אב. 1…2…ג׳אב. בכל חזרה בדוק: האם האגרוף חזר לגארד? האם הכתף הגנה על הסנטר? האם המפרקים היו ישרים בנקודת ההשפעה?',
      instructionEn:
        'One jab every two seconds. Not speed — precision. Count: 1…2…jab. 1…2…jab. On every rep, check: did the fist return to guard? Did the shoulder protect the chin? Were the knuckles straight at the point of impact?',
      coachingCuesEn: [
        'Back to guard — right away, not lazy',
        'Front shoulder rises to protect the chin',
        'Elbow not out — keep it tight',
        'Short exhale with every punch',
      ],
      durationSeconds: 100,
      coachingCuesHe: [
        'חזרה לגארד — מיידית, לא עצלה',
        'כתף קדמית עולה להגן על הסנטר',
        'מרפק לא בחוץ — שמור אותו צמוד',
        'נשיפה קצרה עם כל מכה',
      ],
    },
    {
      id: 'pt-3-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'פתח וסגור את האגרופים לאט. נער את הידיים. מתח את האמות.',
      instructionEn:
        'Slowly open and close your fists. Shake out your hands. Stretch your forearms.',
      coachingCuesEn: [],
      durationSeconds: 40,
      coachingCuesHe: [],
    },
  ],

  5: [
    {
      id: 'pt-5-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה במקום 30 שניות. סיבובי כתפיים קדימה × 10, אחורה × 10. פתח וסגור אגרופים × 15. הכן את פרקי הידיים לעבודה.',
      instructionEn:
        'Light jog in place for 30 seconds. Shoulder circles forward × 10, back × 10. Open and close your fists × 15. Get your wrists ready to work.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'pt-5-tech',
      type: 'technique',
      titleHe: 'טכניקה: הקרוס',
      titleEn: 'Technique: the cross',
      instructionHe:
        'קרוס הוא היד האחורית (ימין אם אתה ימני). מנגנון: סובב את הירך האחורית קדימה, הדחיפה מגיעה מהרגל האחורית דרך הירך אל הכתף. המרפק נשאר למטה בתחילה, עולה רק בסוף. פיבוט על כדור כף הרגל האחורית — הרגל לא מרימה את העקב מוקדם מדי. אחרי הקרוס — ידיים לגארד מיידית.',
      instructionEn:
        'The cross is the rear hand (right if you\'re right-handed). How it works: turn the rear hip forward — the drive comes from the back leg, through the hip, to the shoulder. The elbow stays down at first and rises only at the end. Pivot on the ball of the back foot — don\'t lift the heel too early. After the cross — hands back to guard right away.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'pt-5-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — ג׳אב בלבד',
      titleEn: 'Round 1 — jab only',
      instructionHe:
        'ג׳אב בלבד, 2–3 שניות בין מכה למכה. התמקד בנתיב חזרה — היד חוזרת ישר לפנים, לא בורחת לצד. 30 שניות — קצב שווה. 60 שניות — מעט מהיר יותר, אבל לא על חשבון הדיוק.',
      instructionEn:
        'Jab only, 2–3 seconds between punches. Focus on the return path — the hand comes straight back to the face, not out to the side. 30 seconds at a steady pace. 60 seconds a little faster, but not at the cost of precision.',
      coachingCuesEn: [
        'Straight back — not to the side',
        'Shoulder rises on every jab',
        'Exhale with every punch',
        'The other hand keeps the guard',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'חזרה ישר — לא לצד',
        'כתף עולה בכל ג׳אב',
        'נשיפה עם כל מכה',
        'הגארד נשמר ביד הנגדית',
      ],
    },
    {
      id: 'pt-5-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — קרוס בלבד',
      titleEn: 'Round 2 — cross only',
      instructionHe:
        'קרוס בלבד. ספור את הפיבוט — בכל מכה שמע את כדור כף רגלך האחורית משפשף ברצפה. זו ראיה שהפיבוט הוא אמיתי. שמור את הגארד ביד הקדמית במלואו — אל תוריד אותו.',
      instructionEn:
        'Cross only. Count the pivot — on every punch, hear the ball of your back foot brush the floor. That\'s proof the pivot is real. Keep the front-hand guard fully up — don\'t drop it.',
      coachingCuesEn: [
        'Pivot on the ball of the foot',
        'Hip turns — power comes from the floor',
        'Front guard stays closed',
        'Back to guard right away',
      ],
      durationSeconds: 60,
      coachingCuesHe: [
        'פיבוט על כדור כף הרגל',
        'ירך מסתובבת — כוח מגיע מהרצפה',
        'גארד קדמי נשאר סגור',
        'חזרה לגארד מיד',
      ],
    },
    {
      id: 'pt-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'נער ידיים, פתח אגרופים, מתח אמות. נשום עמוק.',
      instructionEn:
        'Shake out your hands, open your fists, stretch your forearms. Breathe deeply.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'pt-10-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10 לכל כיוון. מתיחת אמות: הושט יד, כופף את כף היד כלפיך, אחוז 10 שניות. חזור לשנייה. סיבובי פרקי כף יד × 10.',
      instructionEn:
        'Light jog for 30 seconds. Shoulder circles × 10 in each direction. Forearm stretch: reach your arm out, bend your hand toward you, hold for 10 seconds. Repeat on the other side. Wrist circles × 10.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'pt-10-tech',
      type: 'technique',
      titleHe: 'טכניקה: הוק וחזרה להגנה',
      titleEn: 'Technique: hook and back to guard',
      instructionHe:
        'הוק הוא מכת חצי-עיגול מהצד. אל תסובב את האגרוף — הוא נשאר אנכי (בלחי) או אופקי (למקדש). המרפק עולה לגובה הכתף. הכוח מגיע מסיבוב הפלג העליון — לא מהיד בלבד. נקודת מפתח: הגוף צריך לסובב לפני שהיד זזה. אחרי הוק — חזור לגארד עם שתי הידיים.',
      instructionEn:
        'The hook is a half-circle punch from the side. Don\'t turn the fist — it stays vertical (to the cheek) or horizontal (to the temple). The elbow rises to shoulder height. The power comes from turning the upper body — not from the arm alone. Key point: the body has to turn before the hand moves. After a hook — return to guard with both hands.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'pt-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — ג׳אב ואיכות מכה',
      titleEn: 'Round 1 — jab and punch quality',
      instructionHe:
        'ג׳אב בקצב נוח, מכה אחת כל שנייה וחצי. בכל מכה שאל את עצמך: האם חזרתי לגארד? האם הכתף הגנה? האם הרגליים נשארו מקבילות? 60 שניות קצב בינוני, 60 שניות קצב מהיר יותר.',
      instructionEn:
        'Jab at a comfortable pace, one punch every second and a half. On every punch, ask yourself: did I return to guard? Did the shoulder protect? Did my feet stay parallel? 60 seconds at a medium pace, 60 seconds at a faster pace.',
      coachingCuesEn: [
        'Back to guard — always',
        'Front shoulder rises',
        'Exhale with every punch',
        'Feet don\'t move — stay stable',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'חזרה לגארד — תמיד',
        'כתף קדמית עולה',
        'נשיפה עם כל מכה',
        'רגליים לא זזות — יציבות',
      ],
    },
    {
      id: 'pt-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. נער את הידיים.',
      instructionEn:
        'Breathe. Shake out your hands.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'pt-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — קרוס ופיבוט',
      titleEn: 'Round 2 — cross and pivot',
      instructionHe:
        'קרוס בלבד, כל שתי שניות. בדוק בכל חזרה: האם אתה שומע/מרגיש פיבוט? האם הירך מובילה? האם חזרת לגארד אחרי? 60 שניות בינוני, 60 שניות — קצב גבוה יותר, כוח מלא.',
      instructionEn:
        'Cross only, every two seconds. Check on every rep: do you hear or feel the pivot? Is the hip leading? Did you return to guard after? 60 seconds medium, 60 seconds — higher pace, full power.',
      coachingCuesEn: [
        'Hip turns before the fist',
        'A real pivot — not a fake one',
        'Front guard closed',
        'Power from the leg, not just the arm',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        'ירך מסתובבת לפני האגרוף',
        'פיבוט אמיתי — לא מזוייף',
        'גארד קדמי סגור',
        'כוח מהרגל, לא רק מהיד',
      ],
    },
    {
      id: 'pt-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה כתפיים.',
      instructionEn:
        'Breathe. Relax your shoulders.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'pt-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — ג׳אב-קרוס ואיכות 1-2',
      titleEn: 'Round 3 — jab-cross and a clean 1-2',
      instructionHe:
        'ג׳אב-קרוס (1-2). הקרוס יוצא כשהג׳אב חוזר — ידיים בתנועה מתחלפת, לא בו-זמנית. לאחר ה-2 — שתי ידיים חוזרות לגארד. 60 שניות קצב נוח, 60 שניות — 1-2 מהיר ועצמתי.',
      instructionEn:
        'Jab-cross (1-2). The cross goes out as the jab comes back — the hands alternate, not at the same time. After the 2 — both hands return to guard. 60 seconds at a comfortable pace, 60 seconds — a fast, powerful 1-2.',
      coachingCuesEn: [
        '1 and 2 not together — they alternate',
        'After 2 — both hands to guard',
        'The jab sets up, the cross finishes',
        'Exhale on every pair of punches',
      ],
      durationSeconds: 120,
      coachingCuesHe: [
        '1 ו-2 לא ביחד — מתחלפות',
        'אחרי 2 — שתי ידיים לגארד',
        'ג׳אב מכין, קרוס מסיים',
        'נשיפה בכל זוג מכות',
      ],
    },
    {
      id: 'pt-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'נער ידיים ואמות. מתח כל אמה × 10 שניות. סיבובי כתפיים. נשום ושחרר.',
      instructionEn:
        'Shake out your hands and forearms. Stretch each forearm × 10 seconds. Shoulder circles. Breathe and release.',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'pt-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 45 שניות. סיבובי כתפיים × 15 לכל כיוון. פתיחה וסגירה של האגרופים × 20. מתיחת אמות × 10 שניות לכל יד. שייק-אאוט — נער את כל הגוף 15 שניות.',
      instructionEn:
        'Light jog for 45 seconds. Shoulder circles × 15 in each direction. Open and close your fists × 20. Forearm stretch × 10 seconds per hand. Shake-out — shake your whole body for 15 seconds.',
      coachingCuesEn: [],
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-tech',
      type: 'technique',
      titleHe: 'טכניקה: הוק והאפרקט',
      titleEn: 'Technique: hook and uppercut',
      instructionHe:
        'הוק: מרפק בגובה הכתף, גוף מסתובב, מכה בצד. האפרקט: יד עולה מלמטה, מרפק מופנה למטה, מכה לסנטר. שני הנשקים מגיעים בטווח קצר. תרגל: הוק שמאל → הוק ימין → אפרקט שמאל → אפרקט ימין, בתנועה איטית ומדויקת.',
      instructionEn:
        'Hook: elbow at shoulder height, body turns, punch from the side. Uppercut: the hand comes up from below, elbow pointing down, punch to the chin. Both are short-range weapons. Practice: left hook → right hook → left uppercut → right uppercut, slowly and precisely.',
      coachingCuesEn: [],
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — ג׳אב',
      titleEn: 'Round 1 — jab',
      instructionHe:
        'ג׳אב בלבד, 90 שניות. הפוך כל מכה לשאלה: האם זה היה מושלם? קצב נוח. לא מהירות — איכות.',
      instructionEn:
        'Jab only, 90 seconds. Turn every punch into a question: was that perfect? Comfortable pace. Not speed — quality.',
      coachingCuesEn: [
        'Back to guard, always',
        'Shoulder rises to protect',
        'Exhale with every punch',
        'Eyes forward',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'חזרה לגארד תמיד',
        'כתף עולה להגן',
        'נשיפה עם כל מכה',
        'עיניים קדימה',
      ],
    },
    {
      id: 'pt-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. נשיפה ארוכה.',
      instructionEn:
        'Breathe. Long exhale.',
      coachingCuesEn: [],
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — קרוס',
      titleEn: 'Round 2 — cross',
      instructionHe:
        'קרוס בלבד, 90 שניות. דגש על פיבוט ועל ירך. 45 שניות קצב נוח, 45 שניות — כוח מלא.',
      instructionEn:
        'Cross only, 90 seconds. Focus on the pivot and the hip. 45 seconds at a comfortable pace, 45 seconds — full power.',
      coachingCuesEn: [
        'A real pivot',
        'Hip leads',
        'Front guard closed',
        'Back to guard right away',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'פיבוט אמיתי',
        'ירך מובילה',
        'גארד קדמי סגור',
        'חזרה לגארד מיד',
      ],
    },
    {
      id: 'pt-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה כתפיים.',
      instructionEn:
        'Breathe. Relax your shoulders.',
      coachingCuesEn: [],
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — הוק',
      titleEn: 'Round 3 — hook',
      instructionHe:
        'הוק בלבד — שמאל וימין לסירוגין. 45 שניות איטי ומדויק, 45 שניות — קצב מהיר. בדוק: האם המרפק בגובה הכתף? האם הגוף מסתובב?',
      instructionEn:
        'Hook only — left and right, alternating. 45 seconds slow and precise, 45 seconds — fast pace. Check: is the elbow at shoulder height? Is the body turning?',
      coachingCuesEn: [
        'Elbow at shoulder height',
        'Body turns — not just the arm',
        'Back to guard right away',
        'Other hand in guard at all times',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        'מרפק בגובה הכתף',
        'גוף מסתובב — לא יד בלבד',
        'חזרה לגארד מיד',
        'גארד ביד הנגדית בכל רגע',
      ],
    },
    {
      id: 'pt-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הכן לקומבינציה.',
      instructionEn:
        'Breathe. Get ready for the combination.',
      coachingCuesEn: [],
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — ג׳אב-קרוס-הוק',
      titleEn: 'Round 4 — jab-cross-hook',
      instructionHe:
        'קומבינציה: 1-2-3 (ג׳אב-קרוס-הוק שמאל). חזור. 45 שניות בקצב נוח, 45 שניות — קצב מהיר עם כוח. חזרה לגארד אחרי ה-3.',
      instructionEn:
        'Combination: 1-2-3 (jab-cross-left hook). Repeat. 45 seconds at a comfortable pace, 45 seconds — fast pace with power. Back to guard after the 3.',
      coachingCuesEn: [
        '1-2-3 — not all at once',
        'Each punch finishes before the next one goes',
        'Always back to guard',
        'Short exhale with every set of three',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        '1-2-3 — לא 123 ביחד',
        'כל מכה מסתיימת לפני שהבאה יוצאת',
        'גארד תמיד בחזרה',
        'נשיפה קצרה עם כל שלישייה',
      ],
    },
    {
      id: 'pt-15-rest4',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון — כוח מלא.',
      instructionEn:
        'Breathe. Last round — full power.',
      coachingCuesEn: [],
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'pt-15-w5',
      type: 'work',
      titleHe: 'סיבוב 5 — כל 4 המכות',
      titleEn: 'Round 5 — all 4 punches',
      instructionHe:
        'ג׳אב → קרוס → הוק שמאל → אפרקט ימין. רצף מלא. 1-2-3-4. לאחר 45 שניות — הגבר קצב. כל מכה שלמה לפני הבאה.',
      instructionEn:
        'Jab → cross → left hook → right uppercut. Full sequence. 1-2-3-4. After 45 seconds — raise the pace. Each punch complete before the next.',
      coachingCuesEn: [
        '1-2-3-4 — not all together',
        'Guard closes at the end of the sequence',
        'Power in every punch',
        'Exhale at the end of every 4',
      ],
      durationSeconds: 90,
      coachingCuesHe: [
        '1-2-3-4 — לא ביחד',
        'גארד נסגר בסוף הרצף',
        'כוח מכל מכה',
        'נשיפה בסוף כל 4',
      ],
    },
    {
      id: 'pt-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'נער ידיים, פתח אגרופים לאט. מתח כל אמה × 15 שניות. סיבובי כתפיים. נשום עמוק ושחרר. עבודה טובה.',
      instructionEn:
        'Shake out your hands, open your fists slowly. Stretch each forearm × 15 seconds. Shoulder circles. Breathe deeply and release. Good work.',
      coachingCuesEn: [],
      durationSeconds: 90,
      coachingCuesHe: [],
    },
  ],
}

// ── DEFENSE ──────────────────────────────────────────────────────────────

const DEFENSE_ROUNDS = {
  3: [
    {
      id: 'def-3-tech',
      type: 'technique',
      titleHe: 'טכניקה: גארד וסנטר מורד',
      titleEn: 'Technique: guard and chin down',
      instructionHe:
        'גארד בסיסי: ידיים ליד הלחיים, מרפקים מכסים את הצלעות, אגרופים מופנים קדימה. סנטר מורד: לשמור את הסנטר מאחורי כתף קדמית — לא לחשוף אותו. בדוק: אם מישהו יזרוק ג׳אב ישר, האם הכתף שלך מגנה? התרגל בתנועת ראש קטנה לצד ימין ושמאל תוך שמירת גארד.',
      durationSeconds: 40,
      coachingCuesHe: [],
    },
    {
      id: 'def-3-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — תנועת ראש + גארד',
      titleEn: 'Round 1 — head movement + guard',
      instructionHe:
        'תנועה איטית: ראש לצד ימין → חזרה → ראש לצד שמאל → חזרה. בכל תנועה — הגארד נשאר סגור, הסנטר מורד. אל תניע רק את הצוואר — הפלג העליון מסתובב מעט. אחרי 45 שניות — תוסיף קצב: תנועת ראש מהירה יותר, כמו שאתה מתחמק ממכות.',
      durationSeconds: 100,
      coachingCuesHe: [
        'גארד לא יורד בתנועת ראש',
        'סנטר מורד — תמיד',
        'מרפקים פנימה',
        'נשום — אל תחסום',
      ],
    },
    {
      id: 'def-3-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'מתח את צוואר בעדינות לכל כיוון. גלגל כתפיים. נשום.',
      durationSeconds: 40,
      coachingCuesHe: [],
    },
  ],

  5: [
    {
      id: 'def-5-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי ראש עדינים לכל כיוון × 5. הרמת כתפיים × 10. שייק-אאוט קצר.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'def-5-tech',
      type: 'technique',
      titleHe: 'טכניקה: סליפ (החמקה)',
      titleEn: 'Technique: slip',
      instructionHe:
        'סליפ: תנועת גוף לצד כדי לחמוק ממכה ישרה. סליפ ימינה: הסט את הגוף מעל הרגל הימנית, ראש עובר מעבר לקו הישר. סליפ שמאלה: הסט מעל הרגל השמאלית. התנועה מגיעה מהירכיים — לא רק מהצוואר. גארד נשאר מורם בכל סליפ. תרגל: סליפ ימינה ← → סליפ שמאלה.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'def-5-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — תנועת ראש וסליפים',
      titleEn: 'Round 1 — head movement and slips',
      instructionHe:
        'סליפ קטן לצד ימין, חזרה, סליפ לצד שמאל, חזרה. קצב: כל שנייה. דמיין ג׳אב מגיע לפנים — אתה מחמיק ממנו בכל פעם. גארד לא יורד — ידיים עולות כשהגוף יורד מעט.',
      durationSeconds: 90,
      coachingCuesHe: [
        'תנועה מהירכיים — לא צוואר בלבד',
        'גארד עולה עם הסליפ',
        'אל תסטה יותר מדי — תנועה קטנה מנצחת',
        'חזור למרכז אחרי כל סליפ',
      ],
    },
    {
      id: 'def-5-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — גארד ושחזור עמדה',
      titleEn: 'Round 2 — guard and resetting your stance',
      instructionHe:
        'דמיין שקיבלת מכה לגארד — נסוג צעד אחורה, שקם את הגארד, חזור קדימה. חזור. הנסיגה חייבת להיות מבוקרת — לא נפילה לאחור, צעד שלם ומכוון. לאחר השחזור — עמוד יציב לפני שאתה מתקדם שוב.',
      durationSeconds: 60,
      coachingCuesHe: [
        'נסיגה מבוקרת — לא בלגן',
        'גארד מלא בזמן הנסיגה',
        'חזרה קדימה רק לאחר יציבות',
        'ראש לא מורכן — עיניים למעלה',
      ],
    },
    {
      id: 'def-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'מתח צוואר ושכמות. נשום עמוק. הרפה.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'def-10-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות, סיבובי ראש × 5 לכל כיוון, הרמת כתפיים × 10, מתיחת צוואר × 10 שניות לכל צד.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'def-10-tech',
      type: 'technique',
      titleHe: 'טכניקה: סליפ ודאק',
      titleEn: 'Technique: slip and duck',
      instructionHe:
        'סליפ: תנועה לצד לחמוק ממכה ישרה. דאק: כיפוף ברכיים כלפי מטה לחמוק ממכת הוק. בדאק — הגב נשאר ישר, הברכיים יורדות, לא להרכין ראש. לאחר הדאק — עלייה מהירה עם גארד מורם. תרגל: סליפ ימינה → דאק → עלייה → סליפ שמאלה → דאק → עלייה.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'def-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — סליפים',
      titleEn: 'Round 1 — slips',
      instructionHe:
        'סליפ ימינה ← → סליפ שמאלה, קצב נוח. כל שנייה ורבע. גארד מורם לאורך כל הסיבוב. 60 שניות נוח, 60 שניות — הגבר קצב.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד לא יורד',
        'תנועה מהירכיים',
        'אל תחמיק יותר מהנדרש',
        'חזור למרכז',
      ],
    },
    {
      id: 'def-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה כתפיים וצוואר.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'def-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — דאק ועלייה',
      titleEn: 'Round 2 — duck and come up',
      instructionHe:
        'כפוף ברכיים לדאק, עלה עם גארד. 3 שניות מחזור. בדאק — גב ישר, לא להרכין. בעלייה — גארד מורם לפני שהגוף עולה. 60 שניות נוח, 60 שניות — דאק מהיר ועלייה פורצת.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גב ישר בדאק',
        'גארד עולה לפני הגוף',
        'ברכיים — לא גב',
        'עלייה מהירה',
      ],
    },
    {
      id: 'def-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. מתיחת צוואר קצרה.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'def-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — סליפ + דאק משולב',
      titleEn: 'Round 3 — slip + duck together',
      instructionHe:
        'סליפ ימינה → דאק → עלייה → סליפ שמאלה → דאק → עלייה. רצף. קצב נוח ומבוקר. כל תנועה שלמה לפני הבאה. לאחר 60 שניות — הגבר.',
      durationSeconds: 120,
      coachingCuesHe: [
        'שלם כל תנועה לפני הבאה',
        'גארד בכל שלב',
        'עיניים קדימה',
        'נשום — לא לעצור',
      ],
    },
    {
      id: 'def-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'הליכה קלה. מתח צוואר × 15 שניות לכל צד. גלגל כתפיים. נשום עמוק.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'def-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 45 שניות. סיבובי ראש × 8 לכל כיוון. הרמת כתפיים × 15. מתיחת צוואר × 15 שניות לכל צד. שייק-אאוט כללי.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'def-15-tech',
      type: 'technique',
      titleHe: 'טכניקה: פארי (הסטת מכה)',
      titleEn: 'Technique: parry',
      instructionHe:
        'פארי: הסטה קטנה של מכה נכנסת עם כף יד פתוחה מבחוץ. לג׳אב ימני — הסט עם כף יד שמאל מבחוץ שמאלה. לג׳אב שמאלי — הסט עם כף יד ימין. התנועה קטנה ומדויקת — לא לתפוס, להסיט. רק אחרי ההסטה — תגובה עם מכה. תרגל: פארי ימין → פארי שמאל לסירוגין.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'def-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — סליפים',
      titleEn: 'Round 1 — slips',
      instructionHe:
        'סליפ ימינה ← → שמאלה, קצב נוח. 60 שניות בינוני, 60 שניות — מהיר.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד מורם תמיד',
        'תנועה מהירכיים',
        'חזרה למרכז',
        'מרפקים פנימה',
      ],
    },
    {
      id: 'def-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'def-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — דאק ועלייה',
      titleEn: 'Round 2 — duck and come up',
      instructionHe:
        'דאק מהיר ועלייה פורצת. 60 שניות נוח, 60 שניות — מהיר ומנצח.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גב ישר בדאק',
        'גארד עולה לפני הגוף',
        'עלייה מהירה',
        'נשום',
      ],
    },
    {
      id: 'def-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. מתיחת צוואר קצרה.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'def-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — פארי',
      titleEn: 'Round 3 — parry',
      instructionHe:
        'פארי ימין ← → שמאל לסירוגין. תנועה קטנה ומדויקת. 60 שניות נוח, 60 שניות — מהיר.',
      durationSeconds: 120,
      coachingCuesHe: [
        'תנועה קטנה — לא לתפוס',
        'גארד ביד שאינה מבצעת פארי',
        'אחרי פארי — גארד מלא',
        'עיניים קדימה',
      ],
    },
    {
      id: 'def-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'def-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — הגנה משולבת',
      titleEn: 'Round 4 — combined defense',
      instructionHe:
        'סליפ → דאק → עלייה → פארי. רצף מלא. קצב מבוקר. כל תנועת הגנה שלמה לפני הבאה. לאחר 60 שניות — הגבר קצב.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד בכל שלב',
        'כל תנועה שלמה',
        'עיניים קדימה',
        'נשום לאורך כל הסיבוב',
      ],
    },
    {
      id: 'def-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'הליכה קלה. מתח צוואר × 20 שניות לכל צד. גלגול כתפיים. נשום עמוק ושחרר. עבודה טובה.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
  ],
}

// ── COMBINATIONS ─────────────────────────────────────────────────────────

const COMBO_ROUNDS = {
  3: [
    {
      id: 'cb-3-tech',
      type: 'technique',
      titleHe: 'טכניקה: 1-2 (ג׳אב-קרוס)',
      titleEn: 'Technique: 1-2 (jab-cross)',
      instructionHe:
        'ג׳אב יוצא ראשון (1), הקרוס יוצא בדיוק כשהג׳אב חוזר (2) — לא ביחד. הג׳אב מכין, הקרוס מסיים. לאחר ה-2 — שתי ידיים חוזרות לגארד בו-זמנית. בדוק: האם ה-2 נפלט עם פיבוט? האם הגארד נסגר אחרי הקומבינציה?',
      durationSeconds: 40,
      coachingCuesHe: [],
    },
    {
      id: 'cb-3-w1',
      type: 'work',
      titleHe: '1-2 בקצב',
      titleEn: '1-2 on a rhythm',
      instructionHe:
        'ג׳אב-קרוס כל שתי שניות. ספור: 1…2…1-2. חזור. 45 שניות נוח ומדויק, 55 שניות — קצב גבוה יותר. שמור על חזרה לגארד אחרי כל 1-2.',
      durationSeconds: 100,
      coachingCuesHe: [
        '1 ו-2 לא ביחד',
        'גארד נסגר מיד אחרי 2',
        'פיבוט ב-2',
        'נשיפה עם כל שניים',
      ],
    },
    {
      id: 'cb-3-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'נער ידיים. פתח אגרופים. נשום.',
      durationSeconds: 40,
      coachingCuesHe: [],
    },
  ],

  5: [
    {
      id: 'cb-5-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10 לכל כיוון. תנועת ידיים בינוניות × 15 שניות.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'cb-5-tech',
      type: 'technique',
      titleHe: 'טכניקה: 1-2-3 (ג׳אב-קרוס-הוק שמאל)',
      titleEn: 'Technique: 1-2-3 (jab-cross-left hook)',
      instructionHe:
        'לאחר 1-2: הוק שמאל (3) מגיע כשהקרוס חוזר. הוק — מרפק בגובה כתף, גוף מסתובב. לאחר 3 — שתי ידיים לגארד. שלב 1 ו-2 מהירים, שלב 3 — כוח מלא עם סיבוב.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'cb-5-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — 1-2',
      titleEn: 'Round 1 — 1-2',
      instructionHe:
        '1-2 בלבד, 90 שניות. 45 שניות נוח, 45 שניות — מהיר ועצמתי.',
      durationSeconds: 90,
      coachingCuesHe: [
        '1 מכין, 2 מסיים',
        'גארד נסגר אחרי 2',
        'פיבוט ב-2',
        'נשיפה עם כל שניים',
      ],
    },
    {
      id: 'cb-5-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — 1-2-3',
      titleEn: 'Round 2 — 1-2-3',
      instructionHe:
        '1-2-3. 45 שניות בקצב נוח, 45 שניות — מהיר. הוק (3) מגיע עם כוח ועם סיבוב גוף מלא.',
      durationSeconds: 60,
      coachingCuesHe: [
        '3 — מרפק בגובה כתף',
        'גוף מסתובב ב-3',
        'חזרה לגארד אחרי 3',
        'נשיפה בסוף כל רצף',
      ],
    },
    {
      id: 'cb-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'נער ידיים. מתח אמות. נשום עמוק.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'cb-10-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10. פתיחת אגרופים × 15. תנועת ידיים ומרפקים 15 שניות.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'cb-10-tech',
      type: 'technique',
      titleHe: 'טכניקה: 1-2-3-2 (ג׳אב-קרוס-הוק-קרוס)',
      titleEn: 'Technique: 1-2-3-2 (jab-cross-hook-cross)',
      instructionHe:
        'הקומבינציה הקלאסית. 1: ג׳אב — מכין. 2: קרוס — מסיים. 3: הוק שמאל — פותח. 2: קרוס שני — חוזר ומסיים. הסיום תמיד ביד האחורית. תרגל לאט: 1…2…3…2. לאחר ה-2 האחרון — גארד מלא.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'cb-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — 1-2',
      titleEn: 'Round 1 — 1-2',
      instructionHe:
        '1-2 בלבד. 60 שניות נוח, 60 שניות — מהיר. כל פעם — גארד נסגר.',
      durationSeconds: 120,
      coachingCuesHe: [
        '1 מכין, 2 מסיים',
        'גארד נסגר מיד',
        'פיבוט ב-2',
        'נשיפה עם כל שניים',
      ],
    },
    {
      id: 'cb-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'cb-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — 1-2-3',
      titleEn: 'Round 2 — 1-2-3',
      instructionHe:
        '1-2-3. 60 שניות נוח, 60 שניות — עצמתי. הוק עם כוח מלא.',
      durationSeconds: 120,
      coachingCuesHe: [
        'מרפק בגובה כתף ב-3',
        'גוף מסתובב ב-3',
        'גארד אחרי 3',
        'כל מכה מסתיימת לפני הבאה',
      ],
    },
    {
      id: 'cb-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הכן לרביעייה.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'cb-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — 1-2-3-2',
      titleEn: 'Round 3 — 1-2-3-2',
      instructionHe:
        '1-2-3-2. 60 שניות נוח ומדויק, 60 שניות — קצב מהיר. שמור שהגארד נסגר אחרי ה-2 האחרון.',
      durationSeconds: 120,
      coachingCuesHe: [
        '1-2-3-2 — לא 1234',
        'ה-2 האחרון — כוח מלא',
        'גארד נסגר בסוף',
        'נשיפה בסוף כל רצף',
      ],
    },
    {
      id: 'cb-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'נער ידיים. מתח אמות × 10 שניות. גלגל כתפיים. נשום.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'cb-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 45 שניות. סיבובי כתפיים × 15. פתיחת אגרופים × 20. מתיחת אמות × 10 שניות לכל יד.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'cb-15-tech',
      type: 'technique',
      titleHe: 'טכניקה: קומבינציה + יציאה',
      titleEn: 'Technique: combination + exit',
      instructionHe:
        'אחרי כל קומבינציה — יש לצאת. 1-2 → צעד לצד שמאל. 1-2-3 → ציר ימינה. 1-2-3-2 → שני צעדים אחורה. לעולם לא לעמוד במקום אחרי קומבינציה — יציאה היא חלק מהמכה.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'cb-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — 1-2 + יציאה',
      titleEn: 'Round 1 — 1-2 + exit',
      instructionHe:
        '1-2 → יציאה לצד. 60 שניות נוח, 60 שניות — מהיר.',
      durationSeconds: 120,
      coachingCuesHe: [
        'יציאה היא חלק מהמכה',
        'אל תישאר על הקו',
        'גארד בכניסה וביציאה',
        'נשיפה עם 1-2',
      ],
    },
    {
      id: 'cb-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'cb-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — 1-2-3 + יציאה',
      titleEn: 'Round 2 — 1-2-3 + exit',
      instructionHe:
        '1-2-3 → ציר ויציאה. 60 שניות נוח, 60 שניות — עצמתי.',
      durationSeconds: 120,
      coachingCuesHe: [
        'הוק עם כוח',
        'ציר מיידי אחרי 3',
        'גארד ביציאה',
        'עיניים קדימה',
      ],
    },
    {
      id: 'cb-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'cb-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — 1-2-3-2 + יציאה',
      titleEn: 'Round 3 — 1-2-3-2 + exit',
      instructionHe:
        '1-2-3-2 → שני צעדים אחורה. 60 שניות נוח, 60 שניות — מהיר.',
      durationSeconds: 120,
      coachingCuesHe: [
        'ה-2 האחרון — כוח מלא',
        'יציאה מיידית אחריו',
        'גארד בכל שלב',
        'נשיפה בסוף הרצף',
      ],
    },
    {
      id: 'cb-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'cb-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — קומבינציות חופשיות + יציאה',
      titleEn: 'Round 4 — free combinations + exit',
      instructionHe:
        'בחר את הקומבינציה בעצמך: 1-2, 1-2-3, או 1-2-3-2. אחרי כל אחת — יציאה. שנה קומבינציה כל 20 שניות. הפגן כל מה שתרגלת.',
      durationSeconds: 120,
      coachingCuesHe: [
        'בחר קומבינציה ושמור עליה 20 שניות',
        'יציאה אחרי כל רצף',
        'גארד תמיד',
        'כוח ומדויק — לא אחד בלי השני',
      ],
    },
    {
      id: 'cb-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'נער ידיים. מתח אמות × 15 שניות לכל יד. גלגל כתפיים. נשום עמוק ושחרר.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
  ],
}

// ── FREE TRAINING ────────────────────────────────────────────────────────

const FREE_ROUNDS = {
  3: [
    {
      id: 'free-3-w1',
      type: 'work',
      titleHe: 'אימון חופשי',
      titleEn: 'Free training',
      instructionHe:
        'אין הוראות — תתאמן בדרכך. כל טכניקה, כל קצב, כל שילוב. הקשב לגוף שלך.',
      durationSeconds: 180,
      coachingCuesHe: [
        'ידיים למעלה — תמיד',
        'נשום בקצב',
        'תנוע — אל תעמוד במקום',
        'גארד נסגר אחרי כל מכה',
      ],
    },
  ],

  5: [
    {
      id: 'free-5-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10. תנועת ידיים × 15 שניות. הכנה לאימון.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'free-5-w1',
      type: 'work',
      titleHe: 'אימון חופשי',
      titleEn: 'Free training',
      instructionHe:
        'שלוש דקות אימון חופשי. כל טכניקה שאתה רוצה. שנה קצב, שנה טכניקות, חקור.',
      durationSeconds: 180,
      coachingCuesHe: [
        'גארד — ידיים ליד הלחיים',
        'נשום — אל תחסום',
        'תנוע — אל תעמוד',
        'חזרה לגארד אחרי כל מכה',
      ],
    },
    {
      id: 'free-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'הליכה קלה. נשום עמוק. מתח ידיים וכתפיים.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'free-10-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10. פתיחת אגרופים × 15. מתיחת אמות קצרה.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'free-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — אימון חופשי',
      titleEn: 'Round 1 — free training',
      instructionHe: 'אין הוראות. תתאמן בדרכך. שנה קצב וטכניקות.',
      durationSeconds: 140,
      coachingCuesHe: [
        'גארד למעלה',
        'נשום בקצב',
        'תנוע',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הכן לסיבוב הבא.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'free-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — אימון חופשי',
      titleEn: 'Round 2 — free training',
      instructionHe: 'המשך. נסה טכניקות שעוד לא ניסית.',
      durationSeconds: 140,
      coachingCuesHe: [
        'גארד למעלה',
        'נשום',
        'תנוע',
        'נשאר נמוך',
      ],
    },
    {
      id: 'free-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. נשיפה ארוכה.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'free-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — אימון חופשי',
      titleEn: 'Round 3 — free training',
      instructionHe: 'סיבוב אחרון. תן הכל. שנה קצב.',
      durationSeconds: 140,
      coachingCuesHe: [
        'גארד',
        'נשום',
        'תנוע',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'הליכה קלה. נשום. מתח ידיים וכתפיים.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'free-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 45 שניות. סיבובי כתפיים × 15. פתיחת אגרופים × 20. מתיחת אמות. שייק-אאוט.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'free-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — אימון חופשי',
      titleEn: 'Round 1 — free training',
      instructionHe: 'קצב נוח. חמם אותך. בחר טכניקה ועבוד עליה.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד למעלה',
        'נשום',
        'תנוע',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'free-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — אימון חופשי',
      titleEn: 'Round 2 — free training',
      instructionHe: 'הגבר. קצב מעט גבוה יותר. שנה טכניקה.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד',
        'נשום בקצב',
        'תנוע',
        'נשאר נמוך',
      ],
    },
    {
      id: 'free-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה כתפיים.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'free-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — אימון חופשי',
      titleEn: 'Round 3 — free training',
      instructionHe: 'עבוד על חולשה שלך. מה אתה צריך לשפר?',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד',
        'נשום',
        'תנוע',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. שני סיבובים נותרו.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'free-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — אימון חופשי',
      titleEn: 'Round 4 — free training',
      instructionHe: 'קצב גבוה. שנה בין קומבינציות לתנועה לגרד.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גארד למעלה',
        'נשום',
        'אל תעצור',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-15-rest4',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'free-15-w5',
      type: 'work',
      titleHe: 'סיבוב 5 — אימון חופשי',
      titleEn: 'Round 5 — free training',
      instructionHe: 'סיבוב אחרון — תן הכל. כל טכניקה שאתה רוצה.',
      durationSeconds: 60,
      coachingCuesHe: [
        'גארד',
        'נשום',
        'תנוע',
        'חזרה לגארד',
      ],
    },
    {
      id: 'free-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe:
        'הליכה קלה. מתח ידיים וכתפיים. גלגל כתפיים. נשום עמוק. עבודה טובה.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
  ],
}

// ── MUAY THAI — ELBOWS ───────────────────────────────────────────────────
// Used for the "Quick Hands & Elbows" quick-start button in the MT path.
// Elbows are NOT shown in the regular boxing drill grid.

const MT_ELBOW_ROUNDS = {
  3: [
    {
      id: 'mt-el-3-tech',
      type: 'technique',
      titleHe: 'טכניקה: מרפק אופקי (סוק ספנג 1)',
      titleEn: 'Technique: horizontal elbow',
      instructionHe:
        'מרפק אופקי: מרפק עולה לגובה הכתף ונסחף אופקית פנימה. כוח מגיע מסיבוב הפלג העליון — הגוף מסתובב, לא היד בלבד. נקודת פגיעה: ראש המרפק. הגארד ביד הנגדית נשאר מורם לאורך כל המכה. תרגל לאט: שמאל → חזרה → ימין → חזרה.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-3-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — מרפק + ג׳אב',
      titleEn: 'Round 1 — elbow + jab',
      instructionHe:
        'ג׳אב → מרפק אופקי שמאל. חזור. 60 שניות קצב נוח, 60 שניות — גבר. בכל מרפק — בדוק שהגוף מסתובב, לא רק היד. מרפק אחד שלם עדיף על שניים לא נכונים.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גוף מסתובב — לא יד בלבד',
        'מרפק בגובה הכתף',
        'גארד ביד הנגדית',
        'חזרה לגארד מיד',
      ],
    },
    {
      id: 'mt-el-3-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'גלגל כתפיים. מתח אמות. נשום עמוק ושחרר.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  5: [
    {
      id: 'mt-el-5-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים קדימה × 10, אחורה × 10. סיבובי מרפקים: פתח זרועות לצד וסובב את האמה קדימה ואחורה × 10. הכן את המפרקים למרפקים.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-5-tech',
      type: 'technique',
      titleHe: 'טכניקה: מרפק אופקי ומרפק עולה',
      titleEn: 'Technique: horizontal and rising elbow',
      instructionHe:
        'מרפק אופקי (סוק ספנג 1): מרפק עולה לגובה כתף ונסחף אופקית. מרפק עולה (סוק ספנג 6): יד עולה מלמטה, מרפק מכה כלפי מעלה לסנטר. שניהם בטווח קצר. תרגל לאט: מרפק אופקי שמאל → מרפק עולה ימין → חזרה לגארד.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-5-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — מרפק אופקי',
      titleEn: 'Round 1 — horizontal elbow',
      instructionHe:
        'מרפק אופקי שמאל וימין לסירוגין. 45 שניות איטי ומדויק, 45 שניות — קצב מהיר יותר. בדוק בכל מרפק: האם הגוף סובב? האם המרפק בגובה הכתף?',
      durationSeconds: 90,
      coachingCuesHe: [
        'גוף מסתובב עם כל מרפק',
        'מרפק בגובה כתף',
        'גארד ביד הנגדית',
        'נשיפה עם כל מרפק',
      ],
    },
    {
      id: 'mt-el-5-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — ג׳אב + מרפק',
      titleEn: 'Round 2 — jab + elbow',
      instructionHe:
        'ג׳אב → מרפק אופקי. חזור. בתוך הטווח — הג׳אב מכין את המרחק, המרפק מסיים. 45 שניות נוח, 45 שניות — קצב גבוה.',
      durationSeconds: 60,
      coachingCuesHe: [
        'ג׳אב מכין את המרחק',
        'מרפק מסיים — כוח מהגוף',
        'חזרה לגארד אחרי המרפק',
        'אל תישאר על הקו',
      ],
    },
    {
      id: 'mt-el-5-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'גלגל כתפיים. מתח אמות × 10 שניות. נשום עמוק.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
  ],

  10: [
    {
      id: 'mt-el-10-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 30 שניות. סיבובי כתפיים × 10 לכל כיוון. סיבובי מרפקים × 10. פתיחת אגרופים × 15. שייק-אאוט קצר.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-10-tech',
      type: 'technique',
      titleHe: 'טכניקה: שלושה מרפקים בסיסיים',
      titleEn: 'Technique: three basic elbows',
      instructionHe:
        'מרפק אופקי (1): מרפק עולה לגובה כתף ונסחף. מרפק עולה (6): יד עולה מלמטה, מרפק כלפי מעלה. מרפק אחורה (2): מרפק נסחף אחורה ולצד. כולם דורשים סיבוב גוף. תרגל כל אחד × 5 לאט לפני שמגבירים.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-10-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — מרפק אופקי',
      titleEn: 'Round 1 — horizontal elbow',
      instructionHe:
        'מרפק אופקי שמאל וימין לסירוגין. 60 שניות נוח, 60 שניות — מהיר. בדוק סיבוב גוף בכל חזרה.',
      durationSeconds: 120,
      coachingCuesHe: [
        'גוף מסתובב תמיד',
        'מרפק בגובה כתף',
        'גארד ביד הנגדית',
        'נשיפה עם כל מרפק',
      ],
    },
    {
      id: 'mt-el-10-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום עמוק. הרפה כתפיים ומרפקים.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-10-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — ג׳אב + מרפק אופקי',
      titleEn: 'Round 2 — jab + horizontal elbow',
      instructionHe:
        'ג׳אב → מרפק אופקי. הג׳אב מכין את המרחק, המרפק מסיים. 60 שניות נוח, 60 שניות — כוח מלא.',
      durationSeconds: 120,
      coachingCuesHe: [
        'ג׳אב קצר — אל תשכח לחזור לגארד',
        'מרפק עם כוח גוף',
        'צא אחורה אחרי הרצף',
        'נשיפה עם המרפק',
      ],
    },
    {
      id: 'mt-el-10-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הכן לסיבוב האחרון.',
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-10-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — קומבינציה: ג׳אב-קרוס-מרפק',
      titleEn: 'Round 3 — combination: jab-cross-elbow',
      instructionHe:
        'ג׳אב → קרוס → מרפק אופקי שמאל. חזור. 60 שניות קצב נוח, 60 שניות — מהיר ועצמתי. המרפק מגיע לאחר ה-1-2 — בשלב השלישי הנגד פתוח.',
      durationSeconds: 120,
      coachingCuesHe: [
        '1-2 מכינים, מרפק מסיים',
        'גוף מסתובב ב-1-2 וגם במרפק',
        'חזרה לגארד אחרי המרפק',
        'נשיפה בסוף הרצף',
      ],
    },
    {
      id: 'mt-el-10-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'גלגל כתפיים לאט. מתח אמות × 10 שניות לכל יד. נשום עמוק ושחרר.',
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],

  15: [
    {
      id: 'mt-el-15-warm',
      type: 'warmup',
      titleHe: 'חימום',
      titleEn: 'Warm-up',
      instructionHe:
        'ריצה קלה 45 שניות. סיבובי כתפיים × 15. סיבובי מרפקים × 15. פתיחת אגרופים × 20. שייק-אאוט כללי.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-15-tech',
      type: 'technique',
      titleHe: 'טכניקה: מרפקים + כניסה ויציאה',
      titleEn: 'Technique: elbows + stepping in and out',
      instructionHe:
        'מרפקים עובדים בטווח קצר — צריך להיכנס לפני המכה וצריך לצאת אחריה. כניסה: צעד קדימה עם הרגל הקדמית. יציאה: שני צעדים אחורה לאחר המרפק. אל תישאר קרוב אחרי המרפק. תרגל: כניסה → מרפק → יציאה.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-15-w1',
      type: 'work',
      titleHe: 'סיבוב 1 — מרפק אופקי',
      titleEn: 'Round 1 — horizontal elbow',
      instructionHe: 'שמאל וימין לסירוגין, 90 שניות. 45 נוח, 45 מהיר.',
      durationSeconds: 90,
      coachingCuesHe: ['גוף מסתובב', 'מרפק בגובה כתף', 'גארד ביד הנגדית', 'נשיפה'],
    },
    {
      id: 'mt-el-15-rest1',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-15-w2',
      type: 'work',
      titleHe: 'סיבוב 2 — ג׳אב + מרפק',
      titleEn: 'Round 2 — jab + elbow',
      instructionHe: 'ג׳אב → מרפק, 90 שניות. 45 נוח, 45 כוח מלא.',
      durationSeconds: 90,
      coachingCuesHe: ['ג׳אב מכין', 'מרפק מסיים', 'יציאה אחרי', 'גארד'],
    },
    {
      id: 'mt-el-15-rest2',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. הרפה.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-15-w3',
      type: 'work',
      titleHe: 'סיבוב 3 — 1-2-מרפק',
      titleEn: 'Round 3 — 1-2-elbow',
      instructionHe: 'ג׳אב-קרוס-מרפק. 45 נוח, 45 עצמתי.',
      durationSeconds: 90,
      coachingCuesHe: ['1-2 מהירים, מרפק חזק', 'גוף מסתובב', 'יציאה', 'גארד'],
    },
    {
      id: 'mt-el-15-rest3',
      type: 'rest',
      titleHe: 'מנוחה',
      titleEn: 'Rest',
      instructionHe: 'נשום. סיבוב אחרון.',
      durationSeconds: 45,
      coachingCuesHe: [],
    },
    {
      id: 'mt-el-15-w4',
      type: 'work',
      titleHe: 'סיבוב 4 — מרפקים חופשיים',
      titleEn: 'Round 4 — free elbows',
      instructionHe:
        'בחר כל שילוב: ג׳אב+מרפק, 1-2+מרפק, מרפק כפול. אחרי כל רצף — יציאה. 90 שניות מלאות.',
      durationSeconds: 90,
      coachingCuesHe: ['בחר רצף ועמוד עליו', 'יציאה אחרי כל רצף', 'גארד', 'נשיפה'],
    },
    {
      id: 'mt-el-15-cool',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'גלגל כתפיים לאט. מתח אמות × 15 שניות. נשום עמוק ושחרר. עבודה טובה.',
      durationSeconds: 90,
      coachingCuesHe: [],
    },
  ],
}

// ---------------------------------------------------------------------------
// Category titles
// ---------------------------------------------------------------------------

const CATEGORY_TITLES = {
  'footwork':        'עבודת רגליים',
  'punch-technique': 'ידיים ומכות',
  'defense':         'הגנה ושמירת פנים',
  'combinations':    'קומבינציות',
  'free-training':   'אימון חופשי',
  'analysis':        'בדיקת עמידה מתמונה',
  'mt-elbows':       'ידיים ומרפקים',
}

const CATEGORY_TITLES_EN = {
  'footwork':        'Footwork',
  'punch-technique': 'Punches',
  'defense':         'Defense and guard',
  'combinations':    'Combinations',
  'free-training':   'Free training',
  'analysis':        'Stance check from a photo',
  'mt-elbows':       'Hands and elbows',
}

const CATEGORY_ROUNDS_MAP = {
  'footwork':        FOOTWORK_ROUNDS,
  'punch-technique': PUNCH_ROUNDS,
  'defense':         DEFENSE_ROUNDS,
  'combinations':    COMBO_ROUNDS,
  'free-training':   FREE_ROUNDS,
  'mt-elbows':       MT_ELBOW_ROUNDS,
}

// ---------------------------------------------------------------------------
// buildDrill
// ---------------------------------------------------------------------------

/**
 * Build a workout-compatible drill object.
 *
 * @param {string}  categoryId   - One of the DRILL_CATEGORIES ids
 * @param {number}  durationMin  - One of DRILL_DURATIONS
 * @param {boolean} skipWarmup   - When true, filter out leading warmup rounds
 * @returns {{ id, titleHe, titleEn, categoryId, durationMin, techniques, rounds }}
 */
export function buildDrill(categoryId, durationMin, skipWarmup = false) {
  const categoryTitle = CATEGORY_TITLES[categoryId] ?? categoryId
  const titleHe = `${categoryTitle} — ${durationMin} דקות`
  const titleEn = `${CATEGORY_TITLES_EN[categoryId] ?? categoryId} — ${durationMin} min`

  if (categoryId === 'analysis') {
    return {
      id: `drill-${categoryId}-${durationMin}min`,
      titleHe,
      titleEn,
      categoryId,
      durationMin,
      techniques: [],
      rounds: [],
    }
  }

  const roundsMap = CATEGORY_ROUNDS_MAP[categoryId]
  if (!roundsMap) {
    return {
      id: `drill-${categoryId}-${durationMin}min`,
      titleHe,
      titleEn,
      categoryId,
      durationMin,
      techniques: [],
      rounds: [],
    }
  }

  const baseRounds = roundsMap[durationMin] ?? roundsMap[5] ?? []

  let rounds = baseRounds
  if (skipWarmup) {
    const firstNonWarmup = rounds.findIndex(r => r.type !== 'warmup')
    rounds = firstNonWarmup >= 0 ? rounds.slice(firstNonWarmup) : rounds
  }

  return {
    id: `drill-${categoryId}-${durationMin}min`,
    titleHe,
    titleEn,
    categoryId,
    durationMin,
    techniques: [],
    rounds,
  }
}
