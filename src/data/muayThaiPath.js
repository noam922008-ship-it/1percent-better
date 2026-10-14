/**
 * muayThaiPath.js
 * Muay Thai training path — 7 levels, Level 1 fully implemented.
 * Discipline: "muay-thai" — separate from boxing, never shared with Boxing progression.
 */

// ---------------------------------------------------------------------------
// Level 1 — עמידה, שמירה ותנועה
// ---------------------------------------------------------------------------

const L1_WORKOUTS = [
  // ── L1-W1 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W1',
    discipline:       'muay-thai',
    level:            1,
    order:            1,
    titleHe:          'עמידת מואי תאי ושמירה',
    titleEn:          'Muay Thai stance and guard',
    descriptionHe:    'לומדים את עמידת הבסיס של מואי תאי ואת שמירת הידיים. בסיס איתן = הכל.',
    goalHe:           'לבנות עמידה נכונה ושמירת ידיים גבוהה שתישאר גם תחת לחץ.',
    estimatedMinutes: 12,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['עמידת מואי תאי', 'שמירת ידיים', 'בסיס יציב'],
    techniquesEn: ['Muay Thai stance', 'Hand guard', 'Solid base'],
    prerequisites:    [],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'פנה שטח פתוח סביבך — לפחות 2 מטר.',
      'עצור אם יש כאב חד בברכיים, קרסוליים, או גב תחתון.',
      'אימון זה הוא צל בלבד — אין צורך בציוד.',
      'האפליקציה לא רואה אותך ולא מחליפה מאמן מוסמך.',
    ],
    descriptionEn: 'Learn the base stance of Muay Thai and how to keep your hands up. A solid base is everything.',
    goalEn: 'Build a correct stance and a high guard that stays up even under pressure.',
    safetyNotesEn: [
      'Clear an open space around you — at least 2 metres.',
      'Stop if you feel sharp pain in the knees, ankles or lower back.',
      'This workout is shadow only — no equipment needed.',
      'The app cannot see you and does not replace a certified coach.',
    ],
    rounds: [
      {
        id:            'MT-L1-W1-R1',
        type:          'warmup',
        titleHe:       'שחרור מפרקים',
        titleEn:       'Joint mobility',
        instructionHe: 'מסתובבים ברצפה במקום: סיבובי כתפיים קדימה ואחורה 10 פעמים, סיבובי ירך 10 כל כיוון, עיגולי קרסול 10 כל רגל. מסיימים עם 20 קפיצות קטנות במקום.',
        instructionEn:
          'Loosen the joints in place: 10 forward and 10 backward shoulder rolls, 10 hip circles in each direction, 10 ankle circles per leg. Finish with 20 small jumps in place.',
        coachingCuesEn: [],
        durationSeconds: 180,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W1-R2',
        type:          'technique',
        titleHe:       'הסבר עמידה: רגליים ומרחק',
        titleEn:       'Stance: feet and distance',
        instructionHe: 'עמוד עם רגל ימין מעט קדימה, רגל שמאל אחורה. מרחק בין כפות הרגליים — רוחב כתפיים בערך, מעט יותר. משקל שווה 50/50. אצבעות הרגל הקדמית מכוונות קדימה-קצת-החוצה. קרסול הרגל האחורית מוגבה מעט. אל תנעל ברכיים — הישאר קצת כפוף.',
        instructionEn:
          'Stand with your right foot slightly forward and your left foot back. Feet about shoulder-width apart, a little wider. Weight evenly 50/50. The front toes point forward and slightly outward. The back heel is raised slightly. Don\'t lock your knees — stay slightly bent.',
        coachingCuesEn: [
          'Knees always slightly bent.',
          'Weight on the front of the foot — not the heel.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'ברכיים מעט כפופות תמיד.',
          'משקל על חלק הקדמי של כף הרגל — לא עקב.',
        ],
      },
      {
        id:            'MT-L1-W1-R3',
        type:          'technique',
        titleHe:       'הסבר שמירה: ידיים ומרפקים',
        titleEn:       'Guard: hands and elbows',
        instructionHe: 'הרם ידיים: יד קדמית (ימין) בגובה הסנטר, יד אחורית (שמאל) ליד הלחי. מרפקים כלפי מטה ומעט פנימה — מגינים על גוף. סנטר מעט לכיוון החזה. אל תמשוך את הסנטר קדימה. נשום טבעי.',
        instructionEn:
          'Raise your hands: front hand (right) at chin height, rear hand (left) by your cheek. Elbows point down and slightly in — they protect your body. Chin slightly toward your chest. Don\'t push your chin forward. Breathe naturally.',
        coachingCuesEn: [
          'Hands high — not below nose height.',
          'Keep shoulders relaxed, not tense.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'ידיים גבוהות — לא מתחת לגובה האף.',
          'שמור כתפיים מרופות, לא מתוחות.',
        ],
      },
      {
        id:            'MT-L1-W1-R4',
        type:          'work',
        titleHe:       'תרגול עמידה בסיסית',
        titleEn:       'Basic stance drill',
        instructionHe: 'קח את עמידת מואי תאי. החזק 3 שניות, שחרר, חזור לאימון. חזור 15 פעמים. אחר כך: עמוד במשך 30 שניות רצוף ובדוק שהמשקל שווה, הברכיים כפופות, והאצבעות מכוונות נכון.',
        instructionEn:
          'Take the Muay Thai stance. Hold for 3 seconds, release, and return to the workout. Repeat 15 times. Then stand for 30 seconds straight and check that your weight is even, your knees are bent and your toes point the right way.',
        coachingCuesEn: [
          'Is your weight even between both feet?',
          'Check your knees — they don\'t lock.',
          'Don\'t put weight on your heels.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'האם המשקל שווה בין שתי הרגליים?',
          'בדוק ברכיים — לא ננעלות.',
          'אל תשים משקל על העקבים.',
        ],
      },
      {
        id:            'MT-L1-W1-R5',
        type:          'work',
        titleHe:       'תרגול שמירה מלאה',
        titleEn:       'Full guard drill',
        instructionHe: 'עמוד בעמידת מואי תאי מלאה עם שמירה. החזק 10 שניות, שחרר ידיים, חזור לשמירה. חזור 10 פעמים. עכשיו: עמוד עם שמירה מלאה 60 שניות רצוף — בדוק שהידיים לא יורדות.',
        instructionEn:
          'Stand in the full Muay Thai stance with guard. Hold for 10 seconds, release your hands, return to guard. Repeat 10 times. Now: stand with full guard for 60 seconds straight — check that your hands don\'t drop.',
        coachingCuesEn: [
          'High guard — hands don\'t drop.',
          'Elbows down protect your body.',
          'Breathe — don\'t hold your breath.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'שמירה גבוהה — ידיים לא יורדות.',
          'מרפקים כלפי מטה מגינים על גוף.',
          'נשום — אל תעצור נשימה.',
        ],
      },
      {
        id:            'MT-L1-W1-R6',
        type:          'work',
        titleHe:       'עמידה ושמירה — בדיקה סופית',
        titleEn:       'Stance and guard — final check',
        instructionHe: 'עמוד בעמידה מלאה עם שמירה. מצא נקודה קדמית לעיניים ותקועת עליה. החזק 90 שניות. בכל 30 שניות — בדוק: האם הידיים עדיין גבוהות? האם הברכיים עדיין כפופות? האם המשקל עדיין שווה?',
        instructionEn:
          'Stand in the full stance with guard. Pick a focus point in front of your eyes and fix on it. Hold for 90 seconds. Every 30 seconds check: are your hands still high? Are your knees still bent? Is your weight still even?',
        coachingCuesEn: [
          'Front eye focus — look at an imaginary opponent.',
          'Body relaxed but alert.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'מוקד עיניים קדמי — מסתכל על "יריב" דמיוני.',
          'גוף מרופה אבל ערני.',
        ],
      },
      {
        id:            'MT-L1-W1-R7',
        type:          'cooldown',
        titleHe:       'שחרור ומתיחות',
        titleEn:       'Cool-down and stretching',
        instructionHe: 'עמוד ישר, הושיט ידיים לצדדים ומתח כתפיים 20 שניות. גלגל צוואר לאט שמאלה וימינה 5 פעמים כל צד. מתח ירכיים: שים רגל אחת קדימה, כפוף ברך ודחוף ירך קדימה 20 שניות. חלף לרגל שנייה.',
        instructionEn:
          'Stand straight, extend your arms to the sides and stretch your shoulders for 20 seconds. Slowly roll your neck left and right 5 times each side. Stretch your hips: put one foot forward, bend the knee and push the hip forward for 20 seconds. Switch to the other leg.',
        coachingCuesEn: [],
        durationSeconds: 90,
        coachingCuesHe: [],
      },
    ],
  },

  // ── L1-W2 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W2',
    discipline:       'muay-thai',
    level:            1,
    order:            2,
    titleHe:          'תנועה קדימה ואחורה',
    titleEn:          'Moving forward and back',
    descriptionHe:    'לומדים לנוע קדימה ואחורה תוך שמירה על עמידה ובסיס יציב.',
    goalHe:           'לשלוט בתנועה ליניארית מבלי לאבד את הבסיס, השמירה, ומרחק הרגליים.',
    estimatedMinutes: 14,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['תנועה קדימה', 'תנועה אחורה', 'שמירת בסיס בתנועה'],
    techniquesEn: ['Moving forward', 'Moving back', 'Keeping your base in motion'],
    prerequisites:    ['MT-L1-W1'],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'פנה שטח — אתה תנוע קדימה ואחורה מספר צעדים.',
      'תנועה קטנה ומבוקרת — אל תרוץ.',
      'עצור אם חש חוסר שיווי משקל או סחרחורת.',
    ],
    descriptionEn: 'Learn to move forward and back while keeping your stance and your base.',
    goalEn: 'Control linear movement without losing your base, your guard or your foot distance.',
    safetyNotesEn: [
      'Clear space — you will move forward and back several steps.',
      'Keep movement small and controlled — don\'t run.',
      'Stop if you feel unbalanced or dizzy.',
    ],
    rounds: [
      {
        id:            'MT-L1-W2-R1',
        type:          'warmup',
        titleHe:       'חימום: הליכה קלה ושחרור',
        titleEn:       'Warm-up: easy walking and loosening',
        instructionHe: 'הלך במקום 60 שניות, הרם ברכיים בגובה בינוני. אחר כך: 10 קפיצות קלות, 10 סיבובי כתפיים, 10 עיגולי ירך כל צד. ממשיך עם עמידת מואי תאי ו-20 שניות החזקה — חזור לתנועה קדימה-אחורה במקום.',
        instructionEn:
          'Walk in place for 60 seconds, lifting your knees to medium height. Then: 10 light jumps, 10 shoulder rolls, 10 hip circles each side. Continue with the Muay Thai stance and hold for 20 seconds — then return to forward-and-back movement in place.',
        coachingCuesEn: [],
        durationSeconds: 180,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W2-R2',
        type:          'technique',
        titleHe:       'הסבר: צעד קדימה',
        titleEn:       'How to: step forward',
        instructionHe: 'מתוך עמידת מואי תאי: קח צעד קדימה עם הרגל הקדמית (ימין), גרור את הרגל האחורית (שמאל) כדי לשמור על מרחק. לא מצמיד רגליים! שמור בסיס. קרסול אחורי נשאר מוגבה. חזור למיקום. עשה זאת לאט 5 פעמים.',
        instructionEn:
          'From the Muay Thai stance: take a step forward with the front foot (right) and drag the back foot (left) to keep your distance. Don\'t bring your feet together! Keep your base. The back ankle stays raised. Return to position. Do this slowly 5 times.',
        coachingCuesEn: [
          'The front foot moves first.',
          'The back foot drags — doesn\'t jump.',
          'Keep a constant distance between your feet.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'הרגל הקדמית זזה ראשונה.',
          'האחורית גוררת — לא קופצת.',
          'שמור מרחק קבוע בין הרגליים.',
        ],
      },
      {
        id:            'MT-L1-W2-R3',
        type:          'technique',
        titleHe:       'הסבר: צעד אחורה',
        titleEn:       'How to: step back',
        instructionHe: 'מתוך עמידת מואי תאי: קח צעד אחורה עם הרגל האחורית (שמאל), גרור את הרגל הקדמית (ימין) לאחור — שמור מרחק. לא מנעל ברכיים. חזור למיקום. חזור 5 פעמים לאט.',
        instructionEn:
          'From the Muay Thai stance: step back with the rear foot (left) and drag the front foot (right) back — keep the distance. Don\'t lock your knees. Return to position. Repeat 5 times slowly.',
        coachingCuesEn: [
          'The rear foot moves first when stepping back.',
          'Don\'t raise your body — stay low.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'הרגל האחורית זזה ראשונה כשזזים אחורה.',
          'אל תרים את הגוף — הישאר נמוך.',
        ],
      },
      {
        id:            'MT-L1-W2-R4',
        type:          'work',
        titleHe:       'תרגול: קדימה-אחורה',
        titleEn:       'Drill: forward and back',
        instructionHe: 'עם עמידה ושמירה: צעד קדימה, חזור למיקום, צעד אחורה, חזור. חזור על הרצף 10 פעמים. הישאר בעמידה נכונה לאורך כל התרגיל. תנועה איטית ומבוקרת.',
        instructionEn:
          'In stance with guard: step forward, return to position, step back, return. Repeat the sequence 10 times. Stay in correct stance throughout the drill. Slow, controlled movement.',
        coachingCuesEn: [
          'Hands still high while moving.',
          'No limping — smooth movement.',
          'Keep a constant height — don\'t rise and drop.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'ידיים עדיין גבוהות בזמן התנועה.',
          'לא צולע — תנועה חלקה.',
          'שמור גובה קבוע — אל תעלה ותרד.',
        ],
      },
      {
        id:            'MT-L1-W2-R5',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו ורפו ידיים. בסיבוב הבא: תנועה קדימה-אחורה ברצף מהיר יותר.',
        instructionEn:
          'Rest and relax your hands. Next round: forward-and-back movement in a faster sequence.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W2-R6',
        type:          'work',
        titleHe:       'תנועה מהירה יותר',
        titleEn:       'Faster movement',
        instructionHe: 'עמוד בשמירה. נוע קדימה-אחורה ברצף — קצת מהר יותר מהסיבוב הקודם. המטרה: לשמור על בסיס יציב גם כשהתנועה מהירה יותר. 4 צעדים קדימה, 4 צעדים אחורה. חזור 5 פעמים.',
        instructionEn:
          'Stand in guard. Move forward and back in a sequence, a little faster than the previous round. The goal: keep a stable base even when moving faster. 4 steps forward, 4 steps back. Repeat 5 times.',
        coachingCuesEn: [
          'Shoulders relaxed — not stiff.',
          'Breathe at the pace of the movement — don\'t hold your breath.',
          'Keep hands high even while moving.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'כתפיים מרופות — לא נוקשות.',
          'נשום בקצב — אל תחזיק נשימה.',
          'שמור ידיים גבוהות גם בתנועה.',
        ],
      },
      {
        id:            'MT-L1-W2-R7',
        type:          'work',
        titleHe:       'סיכום: תנועה חופשית',
        titleEn:       'Review: free movement',
        instructionHe: 'תנוע קדימה ואחורה באופן חופשי — כמה שנוח לך. ניסה לשנות קצב: 3 צעדים מהירים ואחר כך עצור, ו-3 צעדים איטיים. שמור עמידה ושמירה לאורך כל הסיבוב.',
        instructionEn:
          'Move forward and back freely, however feels comfortable. Try changing pace: 3 fast steps then stop, and 3 slow steps. Keep stance and guard throughout the round.',
        coachingCuesEn: [
          'Imagined eye contact with the opponent in front.',
          'Solid base — no wobbling.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'קשר עין דמיוני עם יריב קדמי.',
          'בסיס איתן — לא מתנדנד.',
        ],
      },
      {
        id:            'MT-L1-W2-R8',
        type:          'cooldown',
        titleHe:       'שחרור',
        titleEn:       'Cool-down',
        instructionHe: 'עמוד ישר ומתח שרירי שוק: עמוד על אצבעות 10 שניות, ירד לעקב 10 שניות, חזור 5 פעמים. מתח ירכיים קדמיות: עמד על רגל אחת, אחוז בקרסול הרגל האחרת מאחורה למשך 20 שניות. חלף.',
        instructionEn:
          'Stand straight and stretch your calf muscles: stand on your toes for 10 seconds, drop to your heels for 10 seconds, repeat 5 times. Stretch the front of your hips: stand on one leg and hold the other ankle behind you for 20 seconds. Switch.',
        coachingCuesEn: [],
        durationSeconds: 90,
        coachingCuesHe: [],
      },
    ],
  },

  // ── L1-W3 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W3',
    discipline:       'muay-thai',
    level:            1,
    order:            3,
    titleHe:          'תנועה לצדדים ושמירת בסיס',
    titleEn:          'Moving sideways and keeping your base',
    descriptionHe:    'לומדים תנועה לטרלית תוך שמירה מלאה על עמידה ובסיס.',
    goalHe:           'לנוע שמאלה וימינה בצורה חלקה ולשמור על בסיס יציב בכל מיקום.',
    estimatedMinutes: 14,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['תנועה לצד', 'שמירת זווית', 'צעד לטרלי'],
    techniquesEn: ['Moving sideways', 'Holding the angle', 'Lateral step'],
    prerequisites:    ['MT-L1-W1', 'MT-L1-W2'],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'פנה שטח לטרלי — אתה תנוע שמאלה וימינה.',
      'תנועה בקרה — אל תצלוב רגליים.',
      'עצור אם אתה מאבד שיווי משקל.',
    ],
    descriptionEn: 'Learn lateral movement while fully keeping your stance and base.',
    goalEn: 'Move left and right smoothly and keep a stable base in every position.',
    safetyNotesEn: [
      'Clear space for lateral movement — you will move left and right.',
      'Controlled movement — don\'t cross your feet.',
      'Stop if you lose your balance.',
    ],
    rounds: [
      {
        id:            'MT-L1-W3-R1',
        type:          'warmup',
        titleHe:       'חימום: הליכה לצדדים',
        titleEn:       'Warm-up: side walking',
        instructionHe: 'הלך לצד ימין 5 צעדים ובחזרה. חזור 5 פעמים. אחר כך: 10 קפיצות קלות, 10 סיבובי ירך כל צד. ממשיך לעמידת מואי תאי למשך 20 שניות.',
        instructionEn:
          'Walk 5 steps to the right and back. Repeat 5 times. Then: 10 light jumps, 10 hip circles each side. Continue to the Muay Thai stance for 20 seconds.',
        coachingCuesEn: [],
        durationSeconds: 180,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W3-R2',
        type:          'technique',
        titleHe:       'הסבר: צעד לצד ימין',
        titleEn:       'How to: step to the right',
        instructionHe: 'מתוך עמידת מואי תאי: קח צעד ימינה עם הרגל הימנית, גרור שמאל כדי לשמור מרחק. אל תצלוב רגליים! המרחק בין הרגליים נשמר. הרגל הנעה לא מתרחקת יותר מצעד אחד. בצע לאט 5 פעמים.',
        instructionEn:
          'From the Muay Thai stance: step right with the right foot and drag the left to keep the distance. Don\'t cross your feet! The distance between your feet is kept. The moving leg doesn\'t go further than one step. Do it slowly 5 times.',
        coachingCuesEn: [
          'The leg in the direction of movement moves first.',
          'Don\'t cross — don\'t bring the feet together.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'הרגל לכיוון התנועה זזה ראשונה.',
          'לא מצלב — לא מקרב רגליים.',
        ],
      },
      {
        id:            'MT-L1-W3-R3',
        type:          'technique',
        titleHe:       'הסבר: צעד לצד שמאל',
        titleEn:       'How to: step to the left',
        instructionHe: 'מתוך עמידת מואי תאי: צעד שמאלה עם הרגל השמאלית, גרור ימין. שמור מרחק קבוע בין הרגליים. בצע לאט 5 פעמים. שים לב: בשני הכיוונים הגוף נשאר פונה קדימה.',
        instructionEn:
          'From the Muay Thai stance: step left with the left foot and drag the right. Keep a constant distance between your feet. Do it slowly 5 times. Note: in both directions the body stays facing forward.',
        coachingCuesEn: [
          'Body faces forward — doesn\'t turn with the movement.',
          'Keep high guard during the step.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'גוף פונה קדימה — לא מסתובב עם התנועה.',
          'שמירה גבוהה גם בזמן הצעד.',
        ],
      },
      {
        id:            'MT-L1-W3-R4',
        type:          'work',
        titleHe:       'תרגול לטרלי: ימין-שמאל',
        titleEn:       'Lateral drill: right and left',
        instructionHe: 'עם שמירה מלאה: 3 צעדים ימינה, עצור, 3 צעדים שמאלה, עצור. חזור 8 פעמים. שמור שמירה לאורך כל הזמן. תנועה מבוקרת ואחידה.',
        instructionEn:
          'With full guard: 3 steps right, stop, 3 steps left, stop. Repeat 8 times. Keep guard the whole time. Controlled, even movement.',
        coachingCuesEn: [
          'Stay at a constant height — don\'t jump.',
          'Hands don\'t drop.',
          'The base doesn\'t collapse.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'הישאר בגובה קבוע — לא קופץ.',
          'ידיים לא יורדות.',
          'בסיס לא מצטמק.',
        ],
      },
      {
        id:            'MT-L1-W3-R5',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו. בסיבוב הבא — תנועה לצדדים ביחד עם קדימה-אחורה.',
        instructionEn:
          'Rest and breathe. Next round: sideways movement combined with forward-and-back.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W3-R6',
        type:          'work',
        titleHe:       'תנועה חופשית 4 כיוונים',
        titleEn:       'Free movement in 4 directions',
        instructionHe: 'נוע חופשי בכל 4 הכיוונים: קדימה, אחורה, ימינה, שמאלה. שנה כיוון כל 3-4 צעדים. המטרה: תנועה חלקה וטבעית. שמור שמירה. 90 שניות רצוף.',
        instructionEn:
          'Move freely in all 4 directions: forward, back, right, left. Change direction every 3-4 steps. The goal: smooth, natural movement. Keep guard. 90 seconds straight.',
        coachingCuesEn: [
          'Attention to your feet — don\'t cross.',
          'Eyes forward — don\'t look at the floor.',
          'Breathe at a steady pace.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'קשב לרגליים — לא מצלב.',
          'עיניים קדימה, לא מסתכל על הרצפה.',
          'נשום בקצב.',
        ],
      },
      {
        id:            'MT-L1-W3-R7',
        type:          'work',
        titleHe:       'שמירת זווית',
        titleEn:       'Holding the angle',
        instructionHe: 'תנסה לנוע בזווית — לא בקו ישר. לדוגמה: צעד ימינה ואז צעד קצת קדימה. ו: צעד שמאלה ואז צעד קצת אחורה. זוהי "הזזת זווית" בסיסית — דרך להסתיר מיריב. בצע 60 שניות.',
        instructionEn:
          'Try to move at an angle, not in a straight line. For example: step right, then step slightly forward. And: step left, then step slightly back. This is basic \'angle movement\' — a way to hide your movement from an opponent. Do 60 seconds.',
        coachingCuesEn: [
          'Small, controlled movements.',
          'Keep your base at every angle.',
        ],
        durationSeconds: 60,
        coachingCuesHe: [
          'תנועות קטנות ומבוקרות.',
          'שמור בסיס בכל זוית.',
        ],
      },
      {
        id:            'MT-L1-W3-R8',
        type:          'cooldown',
        titleHe:       'שחרור',
        titleEn:       'Cool-down',
        instructionHe: 'שב על הרצפה ומשוך רגל אחת ישרה קדימה — מתח שרירי הירך האחורית 20 שניות. חלף. עמוד ומתח שרירי שוק — עמוד על אצבעות 5 שניות, ירד 5 שניות, חזור 5 פעמים.',
        instructionEn:
          'Sit on the floor and extend one straight leg forward — stretch the back of the thigh for 20 seconds. Switch. Stand and stretch your calf muscles: stand on your toes for 5 seconds, drop for 5 seconds, repeat 5 times.',
        coachingCuesEn: [],
        durationSeconds: 90,
        coachingCuesHe: [],
      },
    ],
  },

  // ── L1-W4 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W4',
    discipline:       'muay-thai',
    level:            1,
    order:            4,
    titleHe:          'הרמת ברך בסיסית',
    titleEn:          'Basic knee raise',
    descriptionHe:    'לומדים להרים ברך מעמידת מואי תאי. לא חבטה — אנחנו עדיין בשלב הטכניקה.',
    goalHe:           'הרמת ברך מבוקרת, עם שיווי משקל, תוך שמירה על עמידה ושמירה.',
    estimatedMinutes: 15,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['הרמת ברך', 'שיווי משקל ברגל אחת', 'תנוחת כוננות'],
    techniquesEn: ['Knee raise', 'Single-leg balance', 'Ready stance'],
    prerequisites:    ['MT-L1-W1', 'MT-L1-W2', 'MT-L1-W3'],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'הרמת ברך היא תנועה — לא חבטה. לא מכים בשלב זה.',
      'אם יש בעיות ברך, עצור ויעץ לרופא לפני המשך.',
      'עצור אם חש כאב בברך, ירך, או גב תחתון.',
      'אחוז בקיר או כיסא לתמיכה בזמן תרגול ראשוני.',
      'האפליקציה לא מחליפה מאמן מוסמך.',
    ],
    descriptionEn: 'Learn to raise the knee from the Muay Thai stance. This is not a strike — we are still at the technique stage.',
    goalEn: 'Controlled knee raise with balance, while keeping your stance and guard.',
    safetyNotesEn: [
      'A knee raise is a movement — not a strike. No striking at this stage.',
      'If you have knee problems, stop and consult a doctor before continuing.',
      'Stop if you feel pain in the knee, hip or lower back.',
      'Hold a wall or chair for support during the first practice.',
      'The app does not replace a certified coach.',
    ],
    rounds: [
      {
        id:            'MT-L1-W4-R1',
        type:          'warmup',
        titleHe:       'חימום מפרקי ירך וברך',
        titleEn:       'Hip and knee warm-up',
        instructionHe: 'שכב על הגב: משוך ברך ימין לחזה 10 שניות, חלף. עמוד: סיבובי ירך גדולים 10 כל צד. הרם ברך קלה 5 פעמים כל רגל. ממשיך ל-20 צעדים עם הרמת ברך בהליכה במקום.',
        instructionEn:
          'Lie on your back: pull your right knee to your chest for 10 seconds, then switch. Stand: 10 large hip circles each side. Lift a light knee 5 times each leg. Continue with 20 steps of knee-raise marching in place.',
        coachingCuesEn: [],
        durationSeconds: 180,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W4-R2',
        type:          'technique',
        titleHe:       'הסבר: הרמת ברך בסיסית',
        titleEn:       'How to: basic knee raise',
        instructionHe: 'מתוך עמידת מואי תאי: העבר משקל לרגל הקדמית (ימין). הרם את הברך השמאלית — בגובה מפרק ירך לפחות, אם אפשר גבוה יותר. ירך תומכת. החזק שנייה. ירד בשליטה. שמור שמירה לאורך כל התנועה. בצע לאט 3 פעמים כל רגל.',
        instructionEn:
          'From the Muay Thai stance: shift your weight to the front leg (right). Lift the left knee — to at least hip height, higher if possible. The hip supports. Hold for one second. Lower with control. Keep guard throughout the movement. Do it slowly 3 times per leg.',
        coachingCuesEn: [
          'Lift fast — lower with control.',
          'Keep your hands in guard.',
          'Lean back slightly for balance.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'הרמה מהירה — ירידה מבוקרת.',
          'שמור כפות ידיים בשמירה.',
          'הישען קצת אחורה לשיווי משקל.',
        ],
      },
      {
        id:            'MT-L1-W4-R3',
        type:          'work',
        titleHe:       'תרגול הרמת ברך × 5',
        titleEn:       'Knee raise drill × 5',
        instructionHe: 'עמוד בשמירה. הרם ברך שמאל 5 פעמים לאט עם החזקה שנייה בכל הרמה. אחר כך הרם ברך ימין 5 פעמים. חזור על הרצף 3 פעמים. סה"כ 15 הרמות כל רגל.',
        instructionEn:
          'Stand in guard. Lift the left knee 5 times slowly, holding for one second at each lift. Then lift the right knee 5 times. Repeat the sequence 3 times. Total: 15 lifts per leg.',
        coachingCuesEn: [
          'Keep your body straight — don\'t lean to the side.',
          'Hands high always.',
          'Breathe — don\'t hold your breath.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'שמור גוף ישר — לא מתכופף הצידה.',
          'ידיים גבוהות תמיד.',
          'נשום — אל תחזיק נשימה.',
        ],
      },
      {
        id:            'MT-L1-W4-R4',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו. נערו רגליים. בסיבוב הבא: הרמות ברך רצופות מהירות יותר.',
        instructionEn:
          'Rest and shake out your legs. Next round: faster continuous knee raises.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W4-R5',
        type:          'work',
        titleHe:       'הרמות ברך רצופות',
        titleEn:       'Continuous knee raises',
        instructionHe: 'עמוד בשמירה. הרם ברכיים בסירוגין — שמאל, ימין, שמאל, ימין. קצב בינוני — לא ריצה, לא עצירה מלאה. 20 הרמות סה"כ (10 כל רגל). מנוחה 10 שניות. חזור על הרצף 3 פעמים.',
        instructionEn:
          'Stand in guard. Lift knees alternating: left, right, left, right. Medium pace — not running, not fully stopping. 20 lifts total (10 per leg). Rest 10 seconds. Repeat the sequence 3 times.',
        coachingCuesEn: [
          'Keep a constant height — don\'t jump.',
          'Knees high — not below hip level.',
          'High guard.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'שמור גובה קבוע — לא קופץ.',
          'ברכיים גבוהות — לא נמוכות מהירך.',
          'שמירה גבוהה.',
        ],
      },
      {
        id:            'MT-L1-W4-R6',
        type:          'work',
        titleHe:       'שיווי משקל ברגל אחת',
        titleEn:       'Single-leg balance',
        instructionHe: 'עמוד על רגל ימין. הרם ברך שמאל בגובה ירך. החזק 3 שניות. ירד. חזור 8 פעמים. אחר כך: עמוד על רגל שמאל. הרם ברך ימין. החזק 3 שניות. 8 פעמים. המטרה — לחזק שיווי משקל ברגל אחת.',
        instructionEn:
          'Stand on the right leg. Lift the left knee to hip height. Hold for 3 seconds. Lower. Repeat 8 times. Then stand on the left leg and lift the right knee. Hold for 3 seconds. 8 times. The goal: strengthen single-leg balance.',
        coachingCuesEn: [
          'Look forward — don\'t look down.',
          'Hold a wall if unsteady — that\'s fine.',
          'The standing knee isn\'t locked — keep it slightly bent.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'מבט קדמי — לא מסתכל מטה.',
          'אחוז בקיר אם לא יציב — בסדר גמור.',
          'ברך הנשענת לא ננעלת — קצת כפופה.',
        ],
      },
      {
        id:            'MT-L1-W4-R7',
        type:          'cooldown',
        titleHe:       'שחרור ומתיחות ירך',
        titleEn:       'Cool-down and hip stretches',
        instructionHe: 'שב על הרצפה בתנוחת חצי-ברך (Lunge): קח את הרגל הימנית קדימה וברך שמאל על הרצפה. דחוף ירך שמאל קדימה ומטה 20 שניות. חלף. עמוד ומשוך קרסול מאחורה לישבן 20 שניות כל רגל.',
        instructionEn:
          'Sit in a half-kneeling lunge position: take the right leg forward and place the left knee on the floor. Push the left hip forward and down for 20 seconds. Release. Stand and pull the ankle back toward the buttocks for 20 seconds per leg.',
        coachingCuesEn: [],
        durationSeconds: 90,
        coachingCuesHe: [],
      },
    ],
  },

  // ── L1-W5 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W5',
    discipline:       'muay-thai',
    level:            1,
    order:            5,
    titleHe:          'שילוב תנועה, שמירה וברך',
    titleEn:          'Movement, guard and knee together',
    descriptionHe:    'מקשרים את כל מה שלמדנו: תנועה בכל כיוון + שמירה + הרמת ברך.',
    goalHe:           'ביצוע רצפים קצרים של תנועה → שמירה → ברך בצורה זורמת ומבוקרת.',
    estimatedMinutes: 17,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['שילוב תנועה-ברך', 'רצפי פעולה', 'זרימה'],
    techniquesEn: ['Movement–knee combination', 'Action sequences', 'Flow'],
    prerequisites:    ['MT-L1-W1', 'MT-L1-W2', 'MT-L1-W3', 'MT-L1-W4'],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'אם הרגל עייפה — מנוחה לפני הרמת ברך.',
      'הברך לא מכה בשלב זה — רק הרמה מבוקרת.',
      'עצור לפני כל כאב חד.',
    ],
    descriptionEn: 'Connect everything we have learned: movement in every direction, guard and knee raise.',
    goalEn: 'Perform short sequences of movement → guard → knee in a smooth, controlled flow.',
    safetyNotesEn: [
      'If your leg is tired — rest before raising the knee.',
      'The knee does not strike at this stage — only a controlled raise.',
      'Stop before any sharp pain.',
    ],
    rounds: [
      {
        id:            'MT-L1-W5-R1',
        type:          'warmup',
        titleHe:       'חימום פעיל',
        titleEn:       'Active warm-up',
        instructionHe: 'הליכה במקום עם הרמת ברכיים 45 שניות. אחר כך: 10 קפיצות קטנות, 10 סיבובי ירך, 10 עיגולי קרסול. עמוד בעמידת מואי תאי ובצע 10 צעדים קדימה-אחורה, 10 לטרליים.',
        instructionEn:
          'Walk in place lifting your knees for 45 seconds. Then: 10 small jumps, 10 hip circles, 10 ankle circles. Stand in the Muay Thai stance and take 10 steps forward and back, then 10 lateral steps.',
        coachingCuesEn: [],
        durationSeconds: 180,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W5-R2',
        type:          'technique',
        titleHe:       'הסבר: רצף צעד-ברך',
        titleEn:       'How to: step–knee sequence',
        instructionHe: 'נלמד רצף בסיסי: (1) צעד קדימה עם הרגל הקדמית, (2) גרור רגל אחורית, (3) הרם ברך אחורית (שמאל). חזור לעמידה. בצע 3 פעמים לאט. אחר כך: (1) צעד אחורה, (2) גרור קדמית, (3) הרם ברך קדמית (ימין). 3 פעמים.',
        instructionEn:
          'Learning a basic sequence: (1) step forward with the front foot, (2) drag the back foot, (3) lift the back knee (left). Return to stance. Do this 3 times slowly. Then: (1) step back, (2) drag the front foot, (3) lift the front knee (right). 3 times.',
        coachingCuesEn: [
          'Finish each step before the next — don\'t rush.',
          'Keep guard throughout the sequence.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'כל שלב מסתיים לפני הבא — לא ממהרים.',
          'שמור שמירה לאורך כל הרצף.',
        ],
      },
      {
        id:            'MT-L1-W5-R3',
        type:          'work',
        titleHe:       'רצף צעד-ברך × 10',
        titleEn:       'Step–knee sequence × 10',
        instructionHe: 'בצע את הרצף: צעד קדימה → ברך שמאל. חזור למיקום. צעד אחורה → ברך ימין. חזור. זהו סיבוב אחד. בצע 10 סיבובים. קצב בינוני — לא מהיר מדי.',
        instructionEn:
          'Perform the sequence: step forward → lift the left knee. Return to position. Step back → lift the right knee. Return. That is one round. Do 10 rounds. Medium pace — not too fast.',
        coachingCuesEn: [
          'Hands in guard the whole time.',
          'Knee high — not low.',
          'Breathe: let your mouth open as you lift the knee.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'ידיים בשמירה לאורך הכל.',
          'ברך גבוהה — לא נמוכה.',
          'נשום: פתיחת פה בזמן הרמת ברך.',
        ],
      },
      {
        id:            'MT-L1-W5-R4',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו. בסיבוב הבא: תנועה לטרלית ברצף עם ברך.',
        instructionEn:
          'Rest and breathe. Next round: lateral movement in sequence with the knee.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W5-R5',
        type:          'work',
        titleHe:       'תנועה לטרלית + ברך',
        titleEn:       'Lateral movement + knee',
        instructionHe: 'בצע רצף: צעד ימינה × 2, עצור, הרם ברך שמאל. חזור למיקום. צעד שמאלה × 2, עצור, הרם ברך ימין. חזור. זהו סיבוב. בצע 8 סיבובים.',
        instructionEn:
          'Perform the sequence: step right × 2, stop, lift the left knee. Return to position. Step left × 2, stop, lift the right knee. Return. That is one round. Do 8 rounds.',
        coachingCuesEn: [
          'Clear stop before lifting the knee.',
          'Balance before you lift.',
          'High guard.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'עצירה ברורה לפני הרמת ברך.',
          'שיווי משקל לפני שמרים.',
          'שמירה גבוהה.',
        ],
      },
      {
        id:            'MT-L1-W5-R6',
        type:          'rest',
        titleHe:       'מנוחה קצרה',
        titleEn:       'Short rest',
        instructionHe: 'נשמו. הסיבוב הבא הוא האחרון — שילוב חופשי של כל מה שלמדנו.',
        instructionEn:
          'Rest and breathe. The next round is the last: a free combination of everything we learned.',
        coachingCuesEn: [],
        durationSeconds: 30,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W5-R7',
        type:          'work',
        titleHe:       'שילוב חופשי',
        titleEn:       'Free combination',
        instructionHe: 'נוע חופשי בכל כיוון, ובכל פעם שמרגיש נוח — הרם ברך. לפחות 10 הרמות ברך בסיבוב. שמור שמירה. 90 שניות.',
        instructionEn:
          'Move freely in any direction, and whenever it feels right, lift a knee. At least 10 knee raises in the round. Keep guard. 90 seconds.',
        coachingCuesEn: [
          'Some movement before lifting.',
          'Don\'t over-exert — your own pace.',
          'Eyes forward.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'חשוב תנועה קצת לפני הרמה.',
          'אל תתאמץ יתר — קצב שלך.',
          'עיניים קדימה.',
        ],
      },
      {
        id:            'MT-L1-W5-R8',
        type:          'cooldown',
        titleHe:       'שחרור מלא',
        titleEn:       'Full cool-down',
        instructionHe: 'מתח ירכיים קדמיות: עמד, אחוז קרסול מאחורה 20 שניות כל רגל. שב: כרעיים לחזה 20 שניות כל רגל. שכב: מתיחת ירך — פרפר (כפות רגל אל רגל) 30 שניות.',
        instructionEn:
          'Stretch the front of your hips: stand and hold the ankle behind you for 20 seconds per leg. Sit: knees to chest for 20 seconds per leg. Lie down: butterfly stretch (soles of feet together) for 30 seconds.',
        coachingCuesEn: [],
        durationSeconds: 120,
        coachingCuesHe: [],
      },
    ],
  },

  // ── L1-W6 ────────────────────────────────────────────────────────────────
  {
    id:               'MT-L1-W6',
    discipline:       'muay-thai',
    level:            1,
    order:            6,
    titleHe:          'אימון סיכום יסודות',
    titleEn:          'Fundamentals review',
    descriptionHe:    'אימון סיכום מלא של רמה 1: עמידה, שמירה, תנועה בכל כיוון, הרמת ברך, ורצפים.',
    goalHe:           'להגיע לרמה שבה כל יסודות רמה 1 מתבצעים בצורה זורמת וטבעית.',
    estimatedMinutes: 20,
    difficulty:       'beginner',
    equipment:        [],
    techniques:       ['סיכום רמה 1', 'עמידה', 'שמירה', 'תנועה', 'ברך', 'שילוב'],
    techniquesEn: ['Level 1 review', 'Stance', 'Guard', 'Movement', 'Knee', 'Combination'],
    prerequisites:    ['MT-L1-W1', 'MT-L1-W2', 'MT-L1-W3', 'MT-L1-W4', 'MT-L1-W5'],
    supportedModes:   ['shadow'],
    safetyNotesHe: [
      'זהו אימון ארוך יותר — עצור ונוח אם עייף מאד.',
      'שתה מים לפני ובסיום.',
      'כל הרמות ברך בשלב זה הן עדיין תנועה מבוקרת — לא חבטה.',
      'אם יש כאב — עצור.',
    ],
    descriptionEn: 'A full Level 1 review: stance, guard, movement in every direction, knee raises and sequences.',
    goalEn: 'Reach the point where all Level 1 fundamentals are performed in a smooth, natural flow.',
    safetyNotesEn: [
      'This is a longer workout — stop and rest if very tired.',
      'Drink water before and after.',
      'Every knee raise at this stage is still controlled movement — not a strike.',
      'If there is pain — stop.',
    ],
    rounds: [
      {
        id:            'MT-L1-W6-R1',
        type:          'warmup',
        titleHe:       'חימום מלא',
        titleEn:       'Full warm-up',
        instructionHe: 'הליכה עם הרמת ברכיים גבוהות 60 שניות. 10 קפיצות. 10 סיבובי ירך. 10 עיגולי קרסול. עמידת מואי תאי 20 שניות. 10 צעדים קדימה-אחורה. 10 לטרליים. 5 הרמות ברך כל רגל.',
        instructionEn:
          'Walk with high knees for 60 seconds. 10 jumps. 10 hip circles. 10 ankle circles. Muay Thai stance for 20 seconds. 10 steps forward and back. 10 lateral steps. 5 knee raises each leg.',
        coachingCuesEn: [],
        durationSeconds: 240,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W6-R2',
        type:          'work',
        titleHe:       'סיבוב 1: עמידה ושמירה',
        titleEn:       'Round 1: stance and guard',
        instructionHe: 'עמוד בעמידת מואי תאי מלאה עם שמירה. החזק 90 שניות. בדוק כל 30 שניות: ידיים גבוהות? ברכיים כפופות? משקל שווה? בסוף: עשה 10 שיפטים קלים של משקל קדימה-אחורה.',
        instructionEn:
          'Stand in the full Muay Thai stance with guard. Hold for 90 seconds. Check every 30 seconds: hands high? knees bent? weight even? At the end: do 10 light weight shifts forward and back.',
        coachingCuesEn: [
          'This is the base — keep it at every moment.',
          'Body relaxed but alert.',
          'Breathe naturally.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'זהו הבסיס — שמור אותו בכל רגע.',
          'גוף מרופה אבל ערני.',
          'נשום טבעי.',
        ],
      },
      {
        id:            'MT-L1-W6-R3',
        type:          'rest',
        titleHe:       'מנוחה קצרה',
        titleEn:       'Short rest',
        instructionHe: 'נערו ידיים ורגליים. בסיבוב הבא — תנועה בכל כיוון.',
        instructionEn:
          'Shake out your hands and legs. Next round: movement in all directions.',
        coachingCuesEn: [],
        durationSeconds: 30,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W6-R4',
        type:          'work',
        titleHe:       'סיבוב 2: תנועה בכל 4 כיוונים',
        titleEn:       'Round 2: movement in all 4 directions',
        instructionHe: 'נוע חופשי בכל 4 הכיוונים עם שמירה. שנה כיוון כל 4 צעדים. 90 שניות. אל תחשוב יותר מדי — תן לרגליים לנוע טבעי. שמור גובה קבוע ועיניים קדימה.',
        instructionEn:
          'Move freely in all 4 directions with guard. Change direction every 4 steps. 90 seconds. Don\'t overthink — let your legs move naturally. Keep a constant height and your eyes forward.',
        coachingCuesEn: [
          'Smooth movement — not stomping.',
          'Hands high the whole time.',
          'Breathe at the pace of the movement.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'תנועה חלקה — לא צלייה.',
          'ידיים גבוהות לאורך הכל.',
          'נשום בקצב התנועה.',
        ],
      },
      {
        id:            'MT-L1-W6-R5',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו. בסיבוב הבא — הרמות ברך רצופות.',
        instructionEn:
          'Rest and breathe. Next round: consecutive knee raises.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W6-R6',
        type:          'work',
        titleHe:       'סיבוב 3: הרמות ברך',
        titleEn:       'Round 3: knee raises',
        instructionHe: 'הרם ברכיים בסירוגין: שמאל, ימין, שמאל, ימין. 20 הרמות. מנוחה 10 שניות. עוד 20 הרמות. מנוחה 10 שניות. עוד 10 הרמות — ידיים קדימה כאילו מכוון ברך לאמצע.',
        instructionEn:
          'Lift knees alternating: left, right, left, right. 20 lifts. Rest 10 seconds. Another 20 lifts. Rest 10 seconds. Another 10 lifts, with your hands forward as if aiming the knee at the middle.',
        coachingCuesEn: [
          'Knee high — at least hip height.',
          'Body straight — don\'t bend.',
          'Keep guard.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'ברך גבוהה — עד גובה ירך לפחות.',
          'גוף ישר — לא מתכופף.',
          'שמור שמירה.',
        ],
      },
      {
        id:            'MT-L1-W6-R7',
        type:          'rest',
        titleHe:       'מנוחה',
        titleEn:       'Rest',
        instructionHe: 'נשמו. הסיבוב הבא הוא הגדול — שילוב כל מה שלמדנו.',
        instructionEn:
          'Rest and breathe. The next round is the big one: combining everything we learned.',
        coachingCuesEn: [],
        durationSeconds: 45,
        coachingCuesHe: [],
      },
      {
        id:            'MT-L1-W6-R8',
        type:          'work',
        titleHe:       'סיבוב 4: שילוב מלא',
        titleEn:       'Round 4: everything together',
        instructionHe: 'בצע רצפים חופשיים: תנועה קדימה → ברך. תנועה לצד → ברך. תנועה אחורה → עצור ושמירה. חזור. שנה קצב. לפחות 15 הרמות ברך ב-90 שניות. שמור שמירה לאורך כל הזמן.',
        instructionEn:
          'Perform free sequences: forward movement → knee. Sideways movement → knee. Backward movement → stop and guard. Repeat. Change pace. At least 15 knee raises in 90 seconds. Keep guard the whole time.',
        coachingCuesEn: [
          'Movement → stop → knee — this order.',
          'Don\'t rush — quality over quantity.',
          'Breathe. Breathe. Breathe.',
        ],
        durationSeconds: 120,
        coachingCuesHe: [
          'תנועה → עצירה → ברך — הסדר הזה.',
          'לא ממהרים — איכות על כמות.',
          'נשום. נשום. נשום.',
        ],
      },
      {
        id:            'MT-L1-W6-R9',
        type:          'work',
        titleHe:       'סיבוב 5: אימון חופשי סופי',
        titleEn:       'Round 5: final free round',
        instructionHe: 'עכשיו — תנוע כמו שנוח לך. בצע כל שילוב שמרגיש זורם. מטרת הסיבוב האחרון: לחוות כיצד כל יסודות רמה 1 עובדים יחד. 90 שניות רצוף.',
        instructionEn:
          'Now, move the way that feels natural. Do any combination that flows. The goal of the last round: experience how all Level 1 fundamentals work together. 90 seconds straight.',
        coachingCuesEn: [
          'You know what to do — trust yourself.',
          'Stance, guard, movement, knee.',
          'Good work.',
        ],
        durationSeconds: 90,
        coachingCuesHe: [
          'אתה יודע מה לעשות — בטח בעצמך.',
          'עמידה, שמירה, תנועה, ברך.',
          'יפה עבודה.',
        ],
      },
      {
        id:            'MT-L1-W6-R10',
        type:          'cooldown',
        titleHe:       'שחרור מלא — סוף רמה 1',
        titleEn:       'Full cool-down — end of level 1',
        instructionHe: 'שב על הרצפה. מתיחת ירך: פרפר (כפות רגל) 30 שניות. מתיחת ירך: רגל ישרה קדימה 20 שניות כל רגל. שכב — ברכיים לחזה 20 שניות. עמוד. כפוף קדימה בנינוחות 20 שניות. עמוד ישר ונשום עמוק 3 פעמים.',
        instructionEn:
          'Sit on the floor. Butterfly stretch (soles of feet together) for 30 seconds. Leg-extended forward stretch for 20 seconds per leg. Lie down — knees to chest for 20 seconds. Stand. Bend forward relaxed for 20 seconds. Stand straight and take 3 deep breaths.',
        coachingCuesEn: [],
        durationSeconds: 150,
        coachingCuesHe: [],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Levels 2–7 (structure; content in future phases)
// ---------------------------------------------------------------------------

const PLACEHOLDER_WORKOUTS = (levelId, count) =>
  Array.from({ length: count }, (_, i) => ({
    id:               `MT-L${levelId}-W${i + 1}`,
    discipline:       'muay-thai',
    level:            levelId,
    order:            i + 1,
    titleHe:          `אימון ${i + 1} — בקרוב`,
    titleEn:          `Workout ${i + 1} — coming soon`,
    descriptionHe:    'תוכן אימון זה יתווסף בשלב הבא.',
    descriptionEn:    'Content for this workout will be added in the next phase.',
    goalHe:           '',
    estimatedMinutes: 15,
    difficulty:       levelId <= 3 ? 'beginner' : levelId <= 5 ? 'intermediate' : 'advanced',
    equipment:        [],
    techniques:       [],
    prerequisites:    i === 0
      ? (levelId === 2 ? ['MT-L1-W6'] : [`MT-L${levelId - 1}-W6`])
      : [`MT-L${levelId}-W${i}`],
    safetyNotesHe:    [],
    rounds:           [],
  }))

export const MT_LEVELS = [
  {
    level:    1,
    titleHe:  'עמידה, שמירה ותנועה',
    titleEn:  'Stance, guard and movement',
    workouts: L1_WORKOUTS,
  },
  {
    level:    2,
    titleHe:  'טיפ — בעיטת דחיפה ושליטה במרחק',
    titleEn:  'Teep — push kick and distance control',
    workouts: PLACEHOLDER_WORKOUTS(2, 6),
  },
  {
    level:    3,
    titleHe:  'אגרופים ומרפקים',
    titleEn:  'Punches and elbows',
    workouts: PLACEHOLDER_WORKOUTS(3, 6),
  },
  {
    level:    4,
    titleHe:  'בעיטות עגולות ובעיטות נמוכות',
    titleEn:  'Roundhouse kicks and low kicks',
    workouts: PLACEHOLDER_WORKOUTS(4, 6),
  },
  {
    level:    5,
    titleHe:  'ברכיים ויסודות קלינץ׳',
    titleEn:  'Knees and clinch basics',
    workouts: PLACEHOLDER_WORKOUTS(5, 6),
  },
  {
    level:    6,
    titleHe:  'הגנות, חסימות בעיטה והתחמקויות',
    titleEn:  'Defense, kick checks and evasion',
    workouts: PLACEHOLDER_WORKOUTS(6, 6),
  },
  {
    level:    7,
    titleHe:  'קומבינציות, קצב וסיבולת',
    titleEn:  'Combinations, pace and endurance',
    workouts: PLACEHOLDER_WORKOUTS(7, 6),
  },
]

export const MT_LEVEL_MAP = Object.fromEntries(MT_LEVELS.map((lv) => [lv.level, lv]))

export const MT_L1_TECHNIQUES = [
  'עמידת מואי תאי',
  'שמירת ידיים',
  'בסיס יציב',
  'תנועה קדימה',
  'תנועה אחורה',
  'שמירת בסיס בתנועה',
  'תנועה לצד',
  'שמירת זווית',
  'צעד לטרלי',
  'הרמת ברך',
  'שיווי משקל ברגל אחת',
  'תנוחת כוננות',
  'שילוב תנועה-ברך',
  'רצפי פעולה',
  'זרימה',
]

export const MT_SAFETY_NOTES_HE = [
  'פנה שטח פתוח לפני כל אימון.',
  'חמם תמיד לפני עבודה.',
  'כל הרמות ברך ברמה 1 הן תנועה מבוקרת — לא חבטה.',
  'לשק כבד — רצועות וכפפות חובה. אין מרפקים על שק רגיל.',
  'לפדים — ייעץ עם מדריך מוסמך לביצוע בטוח.',
  'עצור מיד לפני כאב חד, סחרחורת, קוצר נשימה חריג.',
  'האפליקציה לא מחליפה מאמן מוסמך בשום שלב.',
]

/** Level 1 techniques for the overview screen — English */
export const MT_L1_TECHNIQUES_EN = ['Muay Thai stance', 'Hand guard', 'Solid base', 'Moving forward', 'Moving back', 'Keeping base in motion', 'Moving sideways', 'Holding the angle', 'Lateral step', 'Knee raise', 'Single-leg balance', 'Ready stance', 'Movement–knee combination', 'Action sequences', 'Flow']

/** Standard safety notes shown before every Muay Thai workout — English */
export const MT_SAFETY_NOTES_EN = [
  'Clear an open space before every workout.',
  'Always warm up before working.',
  'All knee raises at Level 1 are controlled movement — not a strike.',
  'Heavy bag — wraps and gloves are required. No elbows on a regular bag.',
  'Pads — consult a certified instructor for safe practice.',
  'Stop immediately for sharp pain, dizziness or unusual shortness of breath.',
  'The app never replaces a certified coach at any stage.',
]
