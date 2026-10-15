// Short, shadow-only instant workouts for Boxing and Muay Thai.
// Used for "אימון קליל מיידי" — bypasses guided progression and warmup.
// Total duration: ~5 minutes each. No equipment required.

export const INSTANT_BOXING_WORKOUT = {
  id: '__instant_boxing__',
  level: 0,
  order: 0,
  titleHe: 'אימון קליל — איגרוף',
  titleEn: 'Light workout — boxing',
  descriptionHe: 'אימון קליל בן 5 דקות, ללא חימום, ללא ציוד.',
  goalHe: 'לזוז קצת ולהרגיש טוב — 5 דקות וזהו.',
  estimatedMinutes: 5,
  difficulty: 'beginner',
  equipment: ['none'],
  techniques: ["ג'אב", 'קרוס'],
  prerequisites: [],
  safetyNotesHe: [],
  supportedModes: ['shadow'],
  descriptionEn: 'A 5-minute light workout, with no warm-up and no equipment.',
  goalEn: 'Move a little and feel good — 5 minutes and that\'s it.',
  techniquesEn: ['Jab', 'Cross'],
  rounds: [
    {
      id: 'ib-r1',
      type: 'technique',
      titleHe: 'עמידת מוצא',
      titleEn: 'Fighting stance',
      instructionHe: "עמוד בנוחות: רגל שמאל קדימה, ברכיים קלות כפופות. אגרופים ליד הסנטר, מרפקים לפני הגוף. נשמות.",
      instructionEn:
        'Stand comfortably: left foot forward, knees slightly bent. Fists by your chin, elbows in front of your body. Breathe.',
      coachingCuesEn: [
        'Straight back',
        'Relaxed shoulders',
      ],
      durationSeconds: 60,
      coachingCuesHe: ['גב ישר', 'כתפיים רפויות'],
    },
    {
      id: 'ib-r2',
      type: 'work',
      titleHe: "ג'אב קליל",
      titleEn: 'Light jab',
      instructionHe: "הכה ג'אב קל עם יד שמאל — להרגיש את התנועה, לא להכות חזק. חזור לגארד אחרי כל מכה. קצב נוח לגמרי.",
      instructionEn:
        'Throw a light jab with your left hand. Feel the movement — don\'t hit hard. Return to guard after every punch. A completely comfortable pace.',
      coachingCuesEn: [
        'Bring the hand back fast',
        'Keep your guard up',
      ],
      durationSeconds: 60,
      coachingCuesHe: ['להחזיר את היד מהר', 'לשמור על הגארד'],
    },
    {
      id: 'ib-r3',
      type: 'rest',
      titleHe: 'מנוחה קצרה',
      titleEn: 'Short rest',
      instructionHe: 'שאיפה מהאף, נשיפה מהפה. ניעור הידיים בקלות.',
      instructionEn:
        'Breathe in through the nose, out through the mouth. Shake your hands lightly.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'ib-r4',
      type: 'work',
      titleHe: "ג'אב-קרוס",
      titleEn: 'Jab-cross',
      instructionHe: "שתי מכות קלות: ג'אב עם שמאל, קרוס עם ימין. לסובב מעט את הגוף בקרוס. חזור לגארד. לא מהיר — לתחושה.",
      instructionEn:
        'Two light punches: a jab with the left, a cross with the right. Turn your body slightly on the cross. Return to guard. Not fast — go by feel.',
      coachingCuesEn: [
        'Turn your body on the cross',
        'Return to guard after each combination',
      ],
      durationSeconds: 90,
      coachingCuesHe: ['לסובב את הגוף בקרוס', 'להחזיר לגארד אחרי כל קומבינציה'],
    },
    {
      id: 'ib-r5',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'ניעור הידיים, מעגלים בכתפיים לשני הכיוונים. 3 נשימות עמוקות. כל הכבוד!',
      instructionEn:
        'Shake out your hands and make shoulder circles in both directions. 3 deep breaths. Well done!',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],
}

export const INSTANT_MT_WORKOUT = {
  id: '__instant_muaythai__',
  level: 0,
  order: 0,
  titleHe: 'אימון קליל — מואי תאי',
  titleEn: 'Light workout — Muay Thai',
  descriptionHe: 'אימון קליל בן 5 דקות, ללא חימום, ללא ציוד.',
  goalHe: 'לזוז קצת ולהרגיש את הגוף — 5 דקות וזהו.',
  estimatedMinutes: 5,
  difficulty: 'beginner',
  equipment: ['none'],
  techniques: ['עמידת מוצא', 'תנועת רגליים', 'הרמת ברך'],
  prerequisites: [],
  safetyNotesHe: [],
  supportedModes: ['shadow'],
  descriptionEn: 'A 5-minute light workout, with no warm-up and no equipment.',
  goalEn: 'Move a little and feel your body — 5 minutes and that\'s it.',
  techniquesEn: ['Fighting stance', 'Footwork', 'Knee raise'],
  rounds: [
    {
      id: 'imt-r1',
      type: 'technique',
      titleHe: 'עמידת מוצא מואי תאי',
      titleEn: 'Muay Thai stance',
      instructionHe: 'עמוד ברגליים ברוחת כתפיים. ברכיים קלות כפופות. אגרופים ליד הסנטר. משקל שווה על שתי הרגליים.',
      instructionEn:
        'Stand with your feet shoulder-width apart. Knees slightly bent. Fists by your chin. Weight evenly on both feet.',
      coachingCuesEn: [
        'Weight on the balls of the feet',
        'Hands protecting you',
      ],
      durationSeconds: 60,
      coachingCuesHe: ['משקל על כדורי כפות הרגליים', 'ידיים מגנות'],
    },
    {
      id: 'imt-r2',
      type: 'work',
      titleHe: 'תנועה קדימה-אחורה',
      titleEn: 'Moving forward and back',
      instructionHe: 'צעד קטן קדימה עם הרגל הקדמית — הבא את האחורית. אחורה — הרגל האחורית קודם. שמור על עמידת מוצא. קצב נוח.',
      instructionEn:
        'Take a small step forward with the front foot and bring the back foot up. Stepping back — the back foot moves first. Keep the fighting stance. Comfortable pace.',
      coachingCuesEn: [
        'Low stance',
        'Short, light steps',
      ],
      durationSeconds: 60,
      coachingCuesHe: ['עמידה נמוכה', 'צעדים קצרים וקלים'],
    },
    {
      id: 'imt-r3',
      type: 'rest',
      titleHe: 'מנוחה קצרה',
      titleEn: 'Short rest',
      instructionHe: 'נשמות. ניעור הרגליים בקלות.',
      instructionEn:
        'Breathe. Shake your legs lightly.',
      coachingCuesEn: [],
      durationSeconds: 30,
      coachingCuesHe: [],
    },
    {
      id: 'imt-r4',
      type: 'work',
      titleHe: 'הרמת ברך',
      titleEn: 'Knee raise',
      instructionHe: 'עמוד יציב על רגל ימין. הרם ברך שמאל לגובה הירך ובאט בשליטה. 10 פעמים — חלף לרגל שמאל. תמיד בשליטה.',
      instructionEn:
        'Stand steadily on your right leg. Lift the left knee to hip height and lower slowly, with control. 10 times — then switch to the left leg. Always with control.',
      coachingCuesEn: [
        'Stable fighting stance',
        'Knee as high as possible',
      ],
      durationSeconds: 90,
      coachingCuesHe: ['עמידת מוצא יציבה', 'ברך גבוה ככל שאפשר'],
    },
    {
      id: 'imt-r5',
      type: 'cooldown',
      titleHe: 'שחרור',
      titleEn: 'Cool-down',
      instructionHe: 'מתיחת ירך: כרע מעט ואחוז את קרסול הרגל האחורית מאחורך לכמה שניות. חזור לצד השני. כל הכבוד!',
      instructionEn:
        'Hip stretch: crouch slightly and hold the back ankle behind you for a few seconds. Switch to the other side. Well done!',
      coachingCuesEn: [],
      durationSeconds: 60,
      coachingCuesHe: [],
    },
  ],
}
