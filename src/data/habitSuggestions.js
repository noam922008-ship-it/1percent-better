// Curated habit suggestion library — 15+ habits per pillar
// Shape: { id, pillar, titleHe, titleEn, triggerSuggestionHe, cueId | triggerSuggestionEn, frequency, difficulty, estimatedMinutes, tags }
// cueId: the cue is one of the add-habit presets (labels in t.habitFlow.cues); otherwise triggerSuggestionEn.

export const HABIT_SUGGESTIONS = [
  // ── BODY ─────────────────────────────────────────────────────────
  { id: 'h_body_01', pillar: 'body', titleHe: 'שתה כוס מים', titleEn: 'Drink a glass of water', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 1, tags: ['hydration', 'morning'] },
  { id: 'h_body_02', pillar: 'body', titleHe: 'עשה 10 שכיבות סמיכה', titleEn: 'Do 10 push-ups', triggerSuggestionHe: 'אחרי ארוחת הבוקר', cueId: 'bfast', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 3, tags: ['strength', 'morning'] },
  { id: 'h_body_03', pillar: 'body', titleHe: 'מתיחות 5 דקות', titleEn: 'Stretch for 5 minutes', triggerSuggestionHe: 'אחרי שעה ישיבה', triggerSuggestionEn: 'After an hour of sitting', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['mobility', 'recovery'] },
  { id: 'h_body_04', pillar: 'body', titleHe: 'ריצה קצרה', titleEn: 'Go for a short run', triggerSuggestionHe: 'אחרי העבודה', triggerSuggestionEn: 'After work', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 20, tags: ['cardio', 'energy'] },
  { id: 'h_body_05', pillar: 'body', titleHe: 'פלאנק 30 שניות', titleEn: '30-second plank', triggerSuggestionHe: 'אחרי ארוחת הבוקר', cueId: 'bfast', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 1, tags: ['core', 'quick'] },
  { id: 'h_body_06', pillar: 'body', titleHe: 'לישון בשעה קבועה', titleEn: 'Go to bed at the same time', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['sleep', 'recovery'] },
  { id: 'h_body_07', pillar: 'body', titleHe: 'אין אוכל שעתיים לפני שינה', titleEn: 'No food 2 hours before bed', triggerSuggestionHe: 'שעתיים לפני השינה', triggerSuggestionEn: '2 hours before bed', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['nutrition', 'sleep'] },
  { id: 'h_body_08', pillar: 'body', titleHe: '7,000 צעדים ביום', titleEn: '7,000 steps a day', triggerSuggestionHe: 'בדיקה אחרי העבודה', triggerSuggestionEn: 'After work', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 30, tags: ['walking', 'movement'] },
  { id: 'h_body_09', pillar: 'body', titleHe: 'מקלחת קרה', titleEn: 'Take a cold shower', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'hard', estimatedMinutes: 3, tags: ['discipline', 'energy', 'morning'] },
  { id: 'h_body_10', pillar: 'body', titleHe: 'אכול פרי אחד', titleEn: 'Eat one piece of fruit', triggerSuggestionHe: 'אחרי ארוחת הצהריים', triggerSuggestionEn: 'After lunch', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['nutrition', 'health'] },
  { id: 'h_body_11', pillar: 'body', titleHe: 'אל תיגע בטלפון שעה לפני שינה', titleEn: 'No phone an hour before bed', triggerSuggestionHe: 'שעה לפני השינה', triggerSuggestionEn: 'An hour before bed', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['sleep', 'digital'] },
  { id: 'h_body_12', pillar: 'body', titleHe: 'shadow boxing 5 דקות', titleEn: '5 minutes of shadow boxing', triggerSuggestionHe: 'אחרי ארוחת הבוקר', cueId: 'bfast', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['combat', 'energy', 'morning'] },
  { id: 'h_body_13', pillar: 'body', titleHe: 'סקוואטים 15 חזרות', titleEn: '15 squats', triggerSuggestionHe: 'לפני שאני פותח את הטלפון', cueId: 'phone', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['strength', 'morning'] },
  { id: 'h_body_14', pillar: 'body', titleHe: 'לא לשבת יותר מ-45 דקות ברצף', titleEn: "Don't sit for more than 45 minutes straight", triggerSuggestionHe: 'בזמן עבודה', triggerSuggestionEn: 'While I work', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 2, tags: ['movement', 'posture'] },
  { id: 'h_body_15', pillar: 'body', titleHe: 'אכול ארוחת בוקר', titleEn: 'Eat breakfast', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['nutrition', 'morning'] },

  // ── DISCIPLINE ────────────────────────────────────────────────────
  { id: 'h_dis_01', pillar: 'discipline', titleHe: 'כתוב 3 עדיפויות ליום', titleEn: 'Write 3 priorities for the day', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['planning', 'focus'] },
  { id: 'h_dis_02', pillar: 'discipline', titleHe: 'עבוד 25 דקות ללא הסחות', titleEn: 'Work 25 minutes with no distractions', triggerSuggestionHe: 'בתחילת יום העבודה', triggerSuggestionEn: 'When I start work', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 25, tags: ['focus', 'deep-work'] },
  { id: 'h_dis_03', pillar: 'discipline', titleHe: 'ללא סושיאל מדיה עד 10:00', titleEn: 'No social media before 10 AM', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['digital', 'morning'] },
  { id: 'h_dis_04', pillar: 'discipline', titleHe: 'הכן את מה שצריך ללמחרת', titleEn: "Get tomorrow's things ready", triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['planning', 'evening'] },
  { id: 'h_dis_05', pillar: 'discipline', titleHe: 'עשה את המשימה הכי קשה ראשונה', titleEn: 'Do the hardest task first', triggerSuggestionHe: 'בתחילת יום העבודה', triggerSuggestionEn: 'When I start work', frequency: 'daily', difficulty: 'hard', estimatedMinutes: 30, tags: ['focus', 'procrastination'] },
  { id: 'h_dis_06', pillar: 'discipline', titleHe: 'בצע כוונה ערב לפני', titleEn: 'Set your intention the night before', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 3, tags: ['planning', 'evening'] },
  { id: 'h_dis_07', pillar: 'discipline', titleHe: 'אל תיגע בטלפון חצי שעה אחרי קימה', titleEn: 'No phone for 30 minutes after waking up', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['digital', 'morning'] },
  { id: 'h_dis_08', pillar: 'discipline', titleHe: 'סגור tabs שלא נחוצים', titleEn: "Close the tabs you don't need", triggerSuggestionHe: 'בסוף שעת עבודה', triggerSuggestionEn: 'At the end of a work hour', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['focus', 'organization'] },
  { id: 'h_dis_09', pillar: 'discipline', titleHe: 'כתוב יומן 5 דקות', titleEn: 'Journal for 5 minutes', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['reflection', 'evening'] },
  { id: 'h_dis_10', pillar: 'discipline', titleHe: 'מדיטציה 5 דקות', titleEn: 'Meditate for 5 minutes', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 5, tags: ['mindset', 'morning'] },
  { id: 'h_dis_11', pillar: 'discipline', titleHe: 'בדוק ה-inbox פעמיים ביום בלבד', titleEn: 'Check your inbox only twice a day', triggerSuggestionHe: 'בצהריים ובסוף יום', triggerSuggestionEn: 'At noon and at the end of the day', frequency: 'daily', difficulty: 'hard', estimatedMinutes: 0, tags: ['digital', 'focus'] },
  { id: 'h_dis_12', pillar: 'discipline', titleHe: 'סקור את ה-to-do list', titleEn: 'Review your to-do list', triggerSuggestionHe: 'בסוף היום', triggerSuggestionEn: 'At the end of the day', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['planning', 'reflection'] },
  { id: 'h_dis_13', pillar: 'discipline', titleHe: 'קבע שעת עבודה עמוקה', titleEn: 'Book an hour of deep work', triggerSuggestionHe: 'בתחילת השבוע', triggerSuggestionEn: 'At the start of the week', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 90, tags: ['deep-work', 'planning'] },
  { id: 'h_dis_14', pillar: 'discipline', titleHe: 'דחה גירוי אחד שרצית להיכנע לו', titleEn: 'Resist one urge you wanted to give in to', triggerSuggestionHe: 'בכל פעם שמרגיש', triggerSuggestionEn: 'Whenever I feel it', frequency: 'daily', difficulty: 'hard', estimatedMinutes: 0, tags: ['discipline', 'focus'] },
  { id: 'h_dis_15', pillar: 'discipline', titleHe: 'שגרת בוקר של 15 דקות', titleEn: 'A 15-minute morning routine', triggerSuggestionHe: 'כשאני מתעורר', cueId: 'wake', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, tags: ['morning', 'routine'] },

  // ── GROWTH ────────────────────────────────────────────────────────
  { id: 'h_gro_01', pillar: 'growth', titleHe: 'קרא 10 עמודים', titleEn: 'Read 10 pages', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 15, tags: ['reading', 'learning'] },
  { id: 'h_gro_02', pillar: 'growth', titleHe: 'שמע podcast ב-1.5x בדרך', titleEn: 'Listen to a podcast at 1.5x', triggerSuggestionHe: 'בדרך לעבודה', triggerSuggestionEn: 'On my way to work', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 20, tags: ['learning', 'commute'] },
  { id: 'h_gro_03', pillar: 'growth', titleHe: 'למד מילה חדשה בשפה זרה', titleEn: 'Learn a new word in a foreign language', triggerSuggestionHe: 'אחרי ארוחת הבוקר', cueId: 'bfast', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['language', 'growth'] },
  { id: 'h_gro_04', pillar: 'growth', titleHe: 'כתוב רעיון חדש אחד', titleEn: 'Write down one new idea', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['creativity', 'growth'] },
  { id: 'h_gro_05', pillar: 'growth', titleHe: 'Duolingo 5 דקות', titleEn: '5 minutes of Duolingo', triggerSuggestionHe: 'אחרי ארוחת הבוקר', cueId: 'bfast', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['language', 'app'] },
  { id: 'h_gro_06', pillar: 'growth', titleHe: 'שמע שיעור אחד ב-YouTube', titleEn: 'Listen to one lesson on YouTube', triggerSuggestionHe: 'בזמן אכילה', triggerSuggestionEn: 'While I eat', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['learning', 'video'] },
  { id: 'h_gro_07', pillar: 'growth', titleHe: 'כתוב מה למדת היום', titleEn: 'Write down what you learned today', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['reflection', 'learning'] },
  { id: 'h_gro_08', pillar: 'growth', titleHe: 'קרא מאמר מקצועי אחד', titleEn: 'Read one professional article', triggerSuggestionHe: 'בצהריים', triggerSuggestionEn: 'At noon', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, tags: ['professional', 'reading'] },
  { id: 'h_gro_09', pillar: 'growth', titleHe: 'פרק Flashcards 10 דקות', titleEn: '10 minutes of flashcards', triggerSuggestionHe: 'לפני שאני פותח את הטלפון', cueId: 'phone', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['memorization', 'learning'] },
  { id: 'h_gro_10', pillar: 'growth', titleHe: 'שאל שאלה אחת שלא ידעת תשובתה', titleEn: "Ask one question you didn't know the answer to", triggerSuggestionHe: 'בכל מפגש מקצועי', triggerSuggestionEn: 'At every work meeting', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 0, tags: ['curiosity', 'growth'] },
  { id: 'h_gro_11', pillar: 'growth', titleHe: 'התקדם 15 דקות בcourse שהתחלת', titleEn: 'Spend 15 minutes on a course you started', triggerSuggestionHe: 'אחרי העבודה', triggerSuggestionEn: 'After work', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, tags: ['course', 'consistency'] },
  { id: 'h_gro_12', pillar: 'growth', titleHe: 'כתוב סיכום שיחה אחת', titleEn: 'Write a summary of one conversation', triggerSuggestionHe: 'אחרי פגישה חשובה', triggerSuggestionEn: 'After an important meeting', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['professional', 'reflection'] },
  { id: 'h_gro_13', pillar: 'growth', titleHe: 'עיין בספר אחד שלא פתחת', titleEn: "Look through a book you haven't opened", triggerSuggestionHe: 'פעם בשבוע', triggerSuggestionEn: 'Once a week', frequency: 'weekly', difficulty: 'easy', estimatedMinutes: 10, tags: ['books', 'growth'] },
  { id: 'h_gro_14', pillar: 'growth', titleHe: 'בצע שיפור קטן אחד בעבודה שלך', titleEn: 'Make one small improvement to your work', triggerSuggestionHe: 'בסוף יום העבודה', triggerSuggestionEn: 'At the end of the workday', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, tags: ['professional', 'improvement'] },
  { id: 'h_gro_15', pillar: 'growth', titleHe: 'קרא ביוגרפיה של אדם שאתה מעריץ', titleEn: 'Read a biography of someone you admire', triggerSuggestionHe: 'פעם בשבוע', triggerSuggestionEn: 'Once a week', frequency: 'weekly', difficulty: 'easy', estimatedMinutes: 20, tags: ['inspiration', 'learning'] },

  // ── PEOPLE ────────────────────────────────────────────────────────
  { id: 'h_peo_01', pillar: 'people', titleHe: 'שלח הודעה לחבר שלא דיברת איתו', titleEn: "Message a friend you haven't talked to in a while", triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 3, tags: ['friendship', 'connection'] },
  { id: 'h_peo_02', pillar: 'people', titleHe: 'התקשר להורה', titleEn: 'Call a parent', triggerSuggestionHe: 'אחרי העבודה', triggerSuggestionEn: 'After work', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['family', 'connection'] },
  { id: 'h_peo_03', pillar: 'people', titleHe: 'תן מחמאה אמיתית לאדם אחד', titleEn: 'Give one person a real compliment', triggerSuggestionHe: 'בכל אינטראקציה', triggerSuggestionEn: 'Whenever I talk to someone', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 1, tags: ['social', 'kindness'] },
  { id: 'h_peo_04', pillar: 'people', titleHe: 'הקשב לאחד עד הסוף', titleEn: 'Listen to someone all the way through', triggerSuggestionHe: 'בכל שיחה', triggerSuggestionEn: 'In every conversation', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 0, tags: ['listening', 'empathy'] },
  { id: 'h_peo_05', pillar: 'people', titleHe: 'ארגן פגישה חברתית אחת לשבוע', titleEn: 'Plan one social meetup a week', triggerSuggestionHe: 'בתחילת השבוע', triggerSuggestionEn: 'At the start of the week', frequency: 'weekly', difficulty: 'medium', estimatedMinutes: 0, tags: ['social', 'planning'] },
  { id: 'h_peo_06', pillar: 'people', titleHe: 'פתח שיחה עם אדם חדש', titleEn: 'Start a conversation with someone new', triggerSuggestionHe: 'בכל מפגש חברתי', triggerSuggestionEn: 'At every social event', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 5, tags: ['confidence', 'social'] },
  { id: 'h_peo_07', pillar: 'people', titleHe: 'שתף מידע שימושי עם מישהו', titleEn: 'Share something useful with someone', triggerSuggestionHe: 'כשאני לומד משהו', triggerSuggestionEn: 'When I learn something', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['sharing', 'connection'] },
  { id: 'h_peo_08', pillar: 'people', titleHe: 'כתוב אחד שאתה מכיר על מי שעזר לך', titleEn: 'Write to someone who helped you', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 3, tags: ['gratitude', 'people'] },
  { id: 'h_peo_09', pillar: 'people', titleHe: 'אמור "אני לא מסכים" בכבוד', titleEn: 'Say "I disagree" respectfully', triggerSuggestionHe: 'כשמתאים', triggerSuggestionEn: 'When it fits', frequency: 'daily', difficulty: 'hard', estimatedMinutes: 0, tags: ['confidence', 'assertiveness'] },
  { id: 'h_peo_10', pillar: 'people', titleHe: 'שאל שאלה אחת מעמיקה', titleEn: 'Ask one deeper question', triggerSuggestionHe: 'בכל שיחה', triggerSuggestionEn: 'In every conversation', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 0, tags: ['curiosity', 'connection'] },
  { id: 'h_peo_11', pillar: 'people', titleHe: 'בלה שעה עם אנשים ללא מסכים', titleEn: 'Spend an hour with people, no screens', triggerSuggestionHe: 'בערב', triggerSuggestionEn: 'In the evening', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 60, tags: ['presence', 'family'] },
  { id: 'h_peo_12', pillar: 'people', titleHe: 'הגב לאחד שחלק תוכן שעזר לך', titleEn: 'Reply to someone who shared something that helped you', triggerSuggestionHe: 'כשאני צורך תוכן', triggerSuggestionEn: 'When I read or watch something', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['community', 'gratitude'] },
  { id: 'h_peo_13', pillar: 'people', titleHe: 'הציע עזרה קונקרטית', titleEn: 'Offer concrete help', triggerSuggestionHe: 'כשאני רואה צורך', triggerSuggestionEn: 'When I see someone needs it', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 10, tags: ['generosity', 'people'] },
  { id: 'h_peo_14', pillar: 'people', titleHe: 'זכור יום הולדת של מישהו', titleEn: "Remember someone's birthday", triggerSuggestionHe: 'בתחילת השבוע', triggerSuggestionEn: 'At the start of the week', frequency: 'weekly', difficulty: 'easy', estimatedMinutes: 2, tags: ['connection', 'memory'] },
  { id: 'h_peo_15', pillar: 'people', titleHe: 'הצטרף לאירוע חברתי אחד', titleEn: 'Go to one social event', triggerSuggestionHe: 'פעם בשבוע', triggerSuggestionEn: 'Once a week', frequency: 'weekly', difficulty: 'medium', estimatedMinutes: 60, tags: ['social', 'community'] },

  // ── LIFE & CREATIVITY ────────────────────────────────────────────
  { id: 'h_lif_01', pillar: 'life', titleHe: 'ציירתי משהו 5 דקות', titleEn: 'Draw something for 5 minutes', triggerSuggestionHe: 'אחרי ארוחת הצהריים', triggerSuggestionEn: 'After lunch', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['art', 'creativity'] },
  { id: 'h_lif_02', pillar: 'life', titleHe: 'כתוב דבר אחד שהפתיע אותך היום', titleEn: 'Write down one thing that surprised you today', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 3, tags: ['writing', 'reflection'] },
  { id: 'h_lif_03', pillar: 'life', titleHe: 'בשל ארוחה אחת ביום', titleEn: 'Cook one meal a day', triggerSuggestionHe: 'בצהריים', triggerSuggestionEn: 'At noon', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 30, tags: ['cooking', 'creativity'] },
  { id: 'h_lif_04', pillar: 'life', titleHe: 'צלם תמונה אחת שאהבת', titleEn: 'Take one photo you love', triggerSuggestionHe: 'כשאני בחוץ', triggerSuggestionEn: "When I'm outside", frequency: 'daily', difficulty: 'easy', estimatedMinutes: 2, tags: ['photography', 'creativity'] },
  { id: 'h_lif_05', pillar: 'life', titleHe: 'שמע לאלבום שלם ברצף', titleEn: 'Listen to a whole album, start to finish', triggerSuggestionHe: 'בדרך', triggerSuggestionEn: 'On the go', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 45, tags: ['music', 'mindfulness'] },
  { id: 'h_lif_06', pillar: 'life', titleHe: '10 דקות בחוץ ללא מטרה', titleEn: '10 minutes outside, no goal', triggerSuggestionHe: 'אחרי אכילה', triggerSuggestionEn: 'After I eat', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['nature', 'presence'] },
  { id: 'h_lif_07', pillar: 'life', titleHe: 'נסה מתכון חדש', titleEn: 'Try a new recipe', triggerSuggestionHe: 'פעם בשבוע', triggerSuggestionEn: 'Once a week', frequency: 'weekly', difficulty: 'medium', estimatedMinutes: 45, tags: ['cooking', 'adventure'] },
  { id: 'h_lif_08', pillar: 'life', titleHe: 'כתוב ב-journal יצירתי', titleEn: 'Write in a creative journal', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['writing', 'reflection'] },
  { id: 'h_lif_09', pillar: 'life', titleHe: 'שחק משחק אסטרטגיה', titleEn: 'Play a strategy game', triggerSuggestionHe: 'בערב', triggerSuggestionEn: 'In the evening', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 20, tags: ['games', 'strategy'] },
  { id: 'h_lif_10', pillar: 'life', titleHe: 'בצע מלאכת יד קטנה', titleEn: 'Make a small craft', triggerSuggestionHe: 'בסוף השבוע', triggerSuggestionEn: 'On the weekend', frequency: 'weekly', difficulty: 'medium', estimatedMinutes: 30, tags: ['crafts', 'creativity'] },
  { id: 'h_lif_11', pillar: 'life', titleHe: 'קרא דף מספר שאינו מקצועי', titleEn: "Read a page of a book that isn't for work", triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 10, tags: ['reading', 'pleasure'] },
  { id: 'h_lif_12', pillar: 'life', titleHe: 'נגן על כלי מוזיקה', titleEn: 'Play a musical instrument', triggerSuggestionHe: 'בערב', triggerSuggestionEn: 'In the evening', frequency: 'daily', difficulty: 'medium', estimatedMinutes: 15, tags: ['music', 'creativity'] },
  { id: 'h_lif_13', pillar: 'life', titleHe: 'ביקור בטבע פעם בשבוע', titleEn: 'Get out into nature once a week', triggerSuggestionHe: 'בסוף השבוע', triggerSuggestionEn: 'On the weekend', frequency: 'weekly', difficulty: 'easy', estimatedMinutes: 60, tags: ['nature', 'adventure'] },
  { id: 'h_lif_14', pillar: 'life', titleHe: 'כתוב שתי שורות שיר', titleEn: 'Write two lines of a poem', triggerSuggestionHe: 'לפני השינה', cueId: 'sleep', frequency: 'daily', difficulty: 'easy', estimatedMinutes: 5, tags: ['writing', 'creativity'] },
  { id: 'h_lif_15', pillar: 'life', titleHe: 'נסה פעילות שמעולם לא עשית', titleEn: "Try something you've never done", triggerSuggestionHe: 'פעם בשבוע', triggerSuggestionEn: 'Once a week', frequency: 'weekly', difficulty: 'hard', estimatedMinutes: 60, tags: ['adventure', 'growth'] },
]

export function getSuggestionsForPillars(pillarIds = []) {
  if (!pillarIds.length) return HABIT_SUGGESTIONS
  return HABIT_SUGGESTIONS.filter(h => pillarIds.includes(h.pillar))
}

export function getTopSuggestionsForPillars(pillarIds = [], count = 5) {
  const all = getSuggestionsForPillars(pillarIds.length ? pillarIds : ['discipline', 'body'])
  // distribute across pillars
  const byPillar = {}
  for (const h of all) {
    if (!byPillar[h.pillar]) byPillar[h.pillar] = []
    byPillar[h.pillar].push(h)
  }
  const result = []
  const perPillar = Math.ceil(count / Math.max(Object.keys(byPillar).length, 1))
  for (const pId of (pillarIds.length ? pillarIds : Object.keys(byPillar))) {
    const items = byPillar[pId] || []
    result.push(...items.slice(0, perPillar))
  }
  return result.slice(0, count)
}
