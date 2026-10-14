// Privacy policy + terms of use — single source for /privacy, /terms, the signup modal and Settings.
// Plain Hebrew (source of truth) + a faithful English translation: same sections, no added promises.
// Not legal advice: have a lawyer review before relying on it (open gaps for users abroad: docs/ENGLISH_PLAN.md).
//
// Anything the owner must fill in lives in LEGAL_CONFIG (null = not decided yet) or in a
// { decide: '...' } block. Both render as a highlighted "📝 להשלים / להחלטה" marker until resolved.
// Text uses {placeholders} that are filled from LEGAL_CONFIG.

import { FEATURES } from '../config/features'

export const LEGAL_CONFIG = {
  operatorName:  'נועם כהן (Noam Cohen)',
  contactEmail:  'prime.daily.app@gmail.com',
  minAge:        18,     // Gemini API terms (updated 2026-04-28): 18+, and not in apps likely used by under-18s
  deletionDays:  30,
  courtCity:     'ירושלים',
  updated:       '11.10.2026',
}

// English values that differ from the Hebrew ones; everything else comes from LEGAL_CONFIG.
const LEGAL_CONFIG_EN = {
  operatorName: 'Noam Cohen',
  courtCity:    'Jerusalem',
  updated:      'October 11, 2026',
}

// Analytics consent (FEATURES.consentBanner). Off = GA starts on landing and these aren't shown.
// When turning it on: bump LEGAL_CONFIG.updated (+ _EN) — docs/ENGLISH_PLAN.md.
const CONSENT_HE = 'Google Analytics פועל רק אם הפעלת אותו בהגדרות, והוא כבוי כברירת מחדל. עד אז, שום דבר לא נשלח אליו ושום דבר לא נשמר בשבילו במכשיר — רק הבחירה עצמה נשמרת בדפדפן. אחרי ההפעלה, Google Analytics שומר עוגיות (cookies) בדפדפן, ונשלחים אליו רק אירועים מרגע ההפעלה. אפשר לכבות בכל רגע בהגדרות, ואז העוגיות של Google Analytics נמחקות מהמכשיר.'
const CONSENT_EN = "Google Analytics runs only if you turn it on in Settings, and it is off by default. Until then, nothing is sent to it and nothing is stored for it on your device — only your choice itself is saved in the browser. After you turn it on, Google Analytics stores cookies in your browser, and only events from that point on are sent. You can turn it off anytime in Settings, which deletes the Google Analytics cookies from your device."

export function legalConfig(lang) {
  return lang === 'en' ? { ...LEGAL_CONFIG, ...LEGAL_CONFIG_EN } : LEGAL_CONFIG
}

export const PLACEHOLDER_LABELS = {
  operatorName: 'שם המפעיל',
  contactEmail: 'אימייל ליצירת קשר',
  minAge:       'גיל מינימלי',
  deletionDays: 'מספר ימים',
  courtCity:    'עיר',
}

export const PLACEHOLDER_LABELS_EN = {
  operatorName: 'operator name',
  contactEmail: 'contact email',
  minAge:       'minimum age',
  deletionDays: 'number of days',
  courtCity:    'city',
}

export const PRIVACY = {
  title: 'מדיניות פרטיות',
  intro: 'בקצרה: מה שאתה כותב ב-PRIME שייך לך. אנחנו שומרים רק את מה שצריך כדי שהאפליקציה תעבוד, לא מוכרים מידע ולא מציגים פרסומות.',
  sections: [
    {
      title: 'מי אנחנו',
      paras: [
        'PRIME היא אפליקציה אישית לכתיבה, הרגלים ואימונים. את האפליקציה מפעיל/ה {operatorName}.',
        'ליצירת קשר בכל נושא פרטיות: {contactEmail}.',
      ],
    },
    {
      title: 'מה אנחנו שומרים',
      paras: [
        { list: [
          'חשבון: אימייל ושם. אם נכנסת עם Google — גם תמונת הפרופיל שלך מ-Google.',
          'מה שאתה כותב: "המשימות שלי", "הראש שלי" (היומן), הערות "מה למדתי", ההרגלים שלך, השעות שבחרת לתזכורות, ויעדים או חזון אם כתבת.',
          'התקדמות: XP, רצף, סימוני הרגלים, אימונים ושיעורים שהשלמת.',
          'תמונות "הוכחת ביצוע" — רק אם בחרת להעלות.',
          'הגדרות: שפה, אזור זמן והעדפות.',
          'אם אישרת התראות: מזהה טכני של המכשיר לשליחת התראות.',
        ] },
        'אם אתה משתמש כאורח (בלי חשבון), הכל נשמר רק בדפדפן במכשיר שלך ולא אצלנו.',
      ],
    },
    {
      title: 'איפה זה נשמר',
      paras: [
        'המידע נשמר ב-Google Firebase (מסד נתונים, התחברות ואחסון קבצים), בשרתים של Google בארצות הברית.',
        'כללי אבטחה מגבילים את הגישה: רק אתה יכול לקרוא את המשימות, היומן, ההערות וההרגלים שלך.',
      ],
    },
    {
      title: 'מה משתמשים אחרים יכולים לראות',
      paras: [
        'כברירת מחדל השם שלך לא מופיע בטבלת המובילים — מופיעים רק XP ומספר החזרות השבועי, בלי שם. משתמשים מחוברים אחרים יכולים לראות אותם.',
        'אם תבחר בהגדרות להופיע עם כינוי, הכינוי שבחרת יוצג לצד ה-XP. אפשר לבטל בכל רגע. כל השאר פרטי.',
      ],
    },
    {
      title: 'מצלמה',
      paras: [
        'באימוני מצלמה, זיהוי התנועה וספירת החזרות קורים על המכשיר שלך. הווידאו לא נשלח ולא נשמר.',
        'רכיב זיהוי התנועה נטען מ-Google ומ-jsDelivr (שירותי קבצים), בלי לשלוח אליהם את התמונה.',
      ],
    },
    {
      title: 'בינה מלאכותית (Google Gemini)',
      paras: [
        'כשפיצ׳ר השאלות ב"הראש שלי" יושק: רק אחרי שתאשר, הטקסט של הרשומה והתשובות שלך יישלחו ל-Google Gemini כדי לנסח שאלה. אפשר לכבות את זה בכל רגע ("שאלות AI: כבה"). בלי אישור — שום דבר לא נשלח.',
        'גם ניתוח AI של תמונה או קליפ אימון, אם תבחר להשתמש בו, שולח את התמונה או הקליפ ל-Google Gemini. קליפ שהועלה לניתוח נמחק אחרי הניתוח.',
        'אנחנו מפעילים את Gemini רק עם מפתח API בתשלום. לפי התנאים של Google לשירות בתשלום, Google לא משתמשת בתוכן שנשלח או בתשובות כדי לשפר או לאמן את המוצרים שלה. Google מעבדת את המידע לפי התנאים שלה.',
        'לפי תנאי Google, פיצ׳רים של AI מיועדים לגיל 18 ומעלה בלבד.',
      ],
    },
    {
      title: 'אנליטיקה',
      paras: [
        'אנחנו משתמשים ב-Google Analytics כדי להבין איך משתמשים באפליקציה, ברמה כללית: פתיחת האפליקציה ומאיפה הגעת (למשל קישור מקמפיין), התחלה, רשומה ראשונה, הוספת משימה או הרגל, וחזרה למחרת.',
        'אנחנו לא שולחים ל-Google Analytics את מה שאתה כותב, את השם שלך או את האימייל שלך. התאמת פרסומות ו-Google Signals כבויים.',
        ...(FEATURES.consentBanner ? [CONSENT_HE] : []),
      ],
    },
    {
      title: 'מה אנחנו לא עושים',
      paras: [
        { list: [
          'לא מוכרים את המידע שלך.',
          'לא מציגים פרסומות ולא משתפים מידע למטרות פרסום.',
          'לא קוראים את היומן שלך. הוא נשלח ל-AI רק אם אישרת.',
        ] },
      ],
    },
    {
      title: 'איך מוחקים את החשבון וכל המידע',
      paras: [
        'באפליקציה: הגדרות ← חשבון ← "מחק חשבון". זה מוחק מיד את החשבון ואת כל המידע שלו — היומן, המשימות, ההרגלים, ההערות, ההתקדמות והתמונות. אי אפשר לשחזר.',
        'אם משהו לא נמחק או שאין לך גישה לחשבון: שלח בקשה ל-{contactEmail} מהאימייל שאיתו נרשמת, ונמחק הכל תוך {deletionDays} ימים.',
        'אורח: הגדרות ← "מחק את הנתונים מהמכשיר", או מחיקת נתוני האתר בדפדפן.',
      ],
    },
    {
      title: 'גיל',
      paras: [
        'השימוש ב-PRIME מגיל {minAge} ומעלה בלבד. אם נתברר שמשתמש צעיר יותר, נמחק את החשבון.',
      ],
    },
    {
      title: 'אבטחה',
      paras: [
        'התקשורת מוצפנת (HTTPS), והגישה למידע מוגבלת בכללי אבטחה. שום מערכת לא מוגנת במאה אחוז — אל תכתוב סיסמאות או מספרי כרטיס אשראי ביומן.',
      ],
    },
    {
      title: 'שינויים במדיניות',
      paras: [
        'אם נשנה משהו חשוב, נעדכן כאן ואת תאריך העדכון למטה.',
      ],
    },
  ],
}

export const TERMS = {
  title: 'תנאי שימוש',
  intro: 'השימוש ב-PRIME אומר שאתה מסכים לתנאים האלה. כתבנו אותם בשפה פשוטה.',
  sections: [
    {
      title: 'מה זה PRIME',
      paras: [
        'PRIME היא כלי אישי: כותבים, מבינים מה חשוב, עושים צעד אחד ביום, ומחזיקים הרגלים. את השירות מפעיל/ה {operatorName}.',
      ],
    },
    {
      title: 'זה לא טיפול ולא ייעוץ מקצועי',
      paras: [
        'PRIME לא מחליפה טיפול נפשי, ייעוץ רפואי, פסיכולוגי, פיננסי או משפטי. שאלות, שיעורים ותוכן באפליקציה — כולל שאלות של AI — נועדו לעזור לך לחשוב, לא לאבחן ולא לייעץ.',
        'אם קשה לך עכשיו: ער״ן 1201 (24/7), סה״ר sahar.org.il (צ׳אט אנונימי). במצב חירום: 101 (מד״א) או 100 (משטרה).',
        'מחוץ לישראל: מספר החירום המקומי, או findahelpline.com לקו תמיכה במדינה שלך.',
      ],
    },
    {
      title: 'כושר ובריאות',
      paras: [
        { list: [
          'לפני שמתחילים תוכנית אימונים — התייעץ עם רופא, במיוחד אם יש לך מצב רפואי, פציעה, הריון או שלא התאמנת הרבה זמן.',
          'האימונים הם באחריותך. התאם את העומס לגוף שלך.',
          'אם מופיעים כאב, סחרחורת, קוצר נשימה או לחץ בחזה — עצור מיד ופנה לעזרה רפואית.',
          'ספירת חזרות במצלמה היא הערכה ועלולה לטעות.',
        ] },
      ],
    },
    {
      title: 'החשבון שלך',
      paras: [
        'השימוש מגיל {minAge} ומעלה. אתה אחראי לגישה לחשבון שלך ולמה שנעשה בו.',
      ],
    },
    {
      title: 'התוכן שלך',
      paras: [
        'מה שאתה כותב ומעלה שייך לך. אתה מרשה לנו לשמור ולעבד אותו רק כדי להפעיל את השירות בשבילך (למשל להציג לך אותו, לסנכרן בין מכשירים, ולשלוח ל-AI כשאישרת).',
      ],
    },
    {
      title: 'שימוש הוגן',
      paras: [
        { list: [
          'אסור לנסות לפרוץ, לשבש או להעמיס על השירות.',
          'אסור לזייף התקדמות או XP.',
          'אסור להעלות תוכן לא חוקי או תוכן שפוגע באחרים.',
        ] },
        'אנחנו יכולים להשעות חשבון שמפר את הכללים.',
      ],
    },
    {
      title: 'זמינות',
      paras: [
        'השירות ניתן "כמו שהוא". אנחנו עושים מאמץ שיעבוד ושהמידע יישמר, אבל לא מבטיחים זמינות מלאה או שלא יאבד מידע. אנחנו יכולים לשנות פיצ׳רים או להפסיק את השירות.',
      ],
    },
    {
      title: 'אחריות',
      paras: [
        'במידה המותרת בחוק, אנחנו לא אחראים לנזק שנגרם משימוש באפליקציה, כולל מאימונים או מהחלטות שקיבלת בעקבות תוכן בה.',
      ],
    },
    {
      title: 'דין ושיפוט',
      paras: [
        'על התנאים חל הדין הישראלי. סמכות השיפוט הבלעדית — לבתי המשפט ב{courtCity}.',
      ],
    },
    {
      title: 'שינויים ויצירת קשר',
      paras: [
        'אם נשנה את התנאים, נעדכן כאן ואת תאריך העדכון. לשאלות: {contactEmail}.',
      ],
    },
  ],
}

export const PRIVACY_EN = {
  title: 'Privacy Policy',
  intro: "In short: what you write in PRIME belongs to you. We keep only what the app needs to work, we don't sell data and we don't show ads.",
  sections: [
    {
      title: 'Who we are',
      paras: [
        'PRIME is a personal app for writing, habits and workouts. The app is run by {operatorName}.',
        'For any privacy question: {contactEmail}.',
      ],
    },
    {
      title: 'What we keep',
      paras: [
        { list: [
          'Account: email and name. If you sign in with Google, also your Google profile picture.',
          'What you write: "My tasks", "On my mind" (the journal), "What I learned" notes, your habits, the reminder times you chose, and goals or a vision if you wrote them.',
          'Progress: XP, streak, habit check-ins, workouts and lessons you completed.',
          '"Proof" photos, only if you chose to upload them.',
          'Settings: language, time zone and preferences.',
          'If you allowed notifications: a technical ID of your device for sending notifications.',
        ] },
        "If you use the app as a guest (without an account), everything is saved only in the browser on your device, not with us.",
      ],
    },
    {
      title: "Where it's stored",
      paras: [
        'Data is stored in Google Firebase (database, sign-in and file storage), on Google servers in the United States.',
        'Security rules limit access: only you can read your tasks, journal, notes and habits.',
      ],
    },
    {
      title: 'What other users can see',
      paras: [
        "By default your name doesn't appear on the leaderboard. Only XP and weekly reps are shown, with no name. Other signed-in users can see them.",
        'If you choose in Settings to appear with a nickname, the nickname you chose is shown next to your XP. You can turn it off at any time. Everything else is private.',
      ],
    },
    {
      title: 'Camera',
      paras: [
        "In camera workouts, motion detection and rep counting happen on your device. The video isn't sent and isn't saved.",
        'The motion-detection component is loaded from Google and jsDelivr (file services), without sending them the image.',
      ],
    },
    {
      title: 'Artificial intelligence (Google Gemini)',
      paras: [
        'When the questions feature in "On my mind" launches: only after you approve, the text of the entry and your answers will be sent to Google Gemini to write a question. You can turn this off at any time ("AI questions: off"). Without approval, nothing is sent.',
        'AI analysis of a workout photo or clip, if you choose to use it, also sends the photo or clip to Google Gemini. A clip uploaded for analysis is deleted after the analysis.',
        "We use Gemini only with a paid API key. Under Google's terms for the paid service, Google doesn't use the content sent or the responses to improve or train its products. Google processes the data under its own terms.",
        "Under Google's terms, AI features are for ages 18 and up only.",
      ],
    },
    {
      title: 'Analytics',
      paras: [
        'We use Google Analytics to understand, at a general level, how the app is used: opening the app and where you came from (for example a campaign link), getting started, first entry, adding a task or habit, and coming back the next day.',
        "We don't send Google Analytics what you write, your name or your email. Ad personalization and Google Signals are off.",
        ...(FEATURES.consentBanner ? [CONSENT_EN] : []),
      ],
    },
    {
      title: "What we don't do",
      paras: [
        { list: [
          "We don't sell your data.",
          "We don't show ads and don't share data for advertising.",
          "We don't read your journal. It's sent to AI only if you approved.",
        ] },
      ],
    },
    {
      title: 'How to delete your account and all your data',
      paras: [
        "In the app: Settings → Account → \"Delete account\". This immediately deletes the account and all its data: the journal, tasks, habits, notes, progress and photos. It can't be undone.",
        "If something wasn't deleted or you can't access your account: send a request to {contactEmail} from the email you signed up with, and we'll delete everything within {deletionDays} days.",
        'Guest: Settings → "Delete data from this device", or clear the site data in your browser.',
      ],
    },
    {
      title: 'Age',
      paras: [
        "PRIME is for ages {minAge} and up only. If we find out a user is younger, we'll delete the account.",
      ],
    },
    {
      title: 'Security',
      paras: [
        "Communication is encrypted (HTTPS), and access to data is limited by security rules. No system is 100% secure, so don't write passwords or credit card numbers in your journal.",
      ],
    },
    {
      title: 'Changes to this policy',
      paras: [
        "If we change something important, we'll update it here along with the date below.",
      ],
    },
  ],
}

export const TERMS_EN = {
  title: 'Terms of Use',
  intro: 'Using PRIME means you agree to these terms. We wrote them in plain language.',
  sections: [
    {
      title: 'What PRIME is',
      paras: [
        'PRIME is a personal tool: you write, figure out what matters, take one step a day, and keep up habits. The service is run by {operatorName}.',
      ],
    },
    {
      title: 'Not therapy or professional advice',
      paras: [
        "PRIME doesn't replace mental health care or medical, psychological, financial or legal advice. Questions, lessons and content in the app, including AI questions, are meant to help you think, not to diagnose or advise.",
        "If you're having a hard time right now: ERAN 1201 (24/7), SAHAR sahar.org.il (anonymous chat). In an emergency: 101 (Magen David Adom) or 100 (police).",
        'Outside Israel: your local emergency number, or findahelpline.com for a helpline in your country.',
      ],
    },
    {
      title: 'Fitness and health',
      paras: [
        { list: [
          "Before starting a workout program, consult a doctor, especially if you have a medical condition, an injury, are pregnant or haven't trained in a long time.",
          'Workouts are your own responsibility. Adjust the load to your body.',
          'If you feel pain, dizziness, shortness of breath or chest pressure, stop immediately and get medical help.',
          'Camera rep counting is an estimate and can be wrong.',
        ] },
      ],
    },
    {
      title: 'Your account',
      paras: [
        "Use is for ages {minAge} and up. You're responsible for access to your account and for what's done in it.",
      ],
    },
    {
      title: 'Your content',
      paras: [
        'What you write and upload belongs to you. You allow us to store and process it only to run the service for you (for example to show it to you, sync it between devices, and send it to AI when you approved).',
      ],
    },
    {
      title: 'Fair use',
      paras: [
        { list: [
          "Don't try to hack, disrupt or overload the service.",
          "Don't fake progress or XP.",
          "Don't upload illegal content or content that harms others.",
        ] },
        'We may suspend an account that breaks these rules.',
      ],
    },
    {
      title: 'Availability',
      paras: [
        "The service is provided \"as is\". We make an effort to keep it working and your data saved, but we don't guarantee full availability or that no data will be lost. We may change features or stop the service.",
      ],
    },
    {
      title: 'Liability',
      paras: [
        "To the extent permitted by law, we're not liable for damage caused by using the app, including from workouts or from decisions you made based on its content.",
      ],
    },
    {
      title: 'Governing law and jurisdiction',
      paras: [
        'These terms are governed by Israeli law. Exclusive jurisdiction: the courts of {courtCity}.',
      ],
    },
    {
      title: 'Changes and contact',
      paras: [
        "If we change the terms, we'll update them here along with the update date. Questions: {contactEmail}.",
      ],
    },
  ],
}

export const LEGAL_DOCS = { privacy: PRIVACY, terms: TERMS }
export const LEGAL_DOCS_EN = { privacy: PRIVACY_EN, terms: TERMS_EN }

export function legalDoc(type, lang) {
  return (lang === 'en' ? LEGAL_DOCS_EN : LEGAL_DOCS)[type]
}

// Every open item — for the owner's checklist (and a test that lists them).
export function openLegalItems() {
  const items = Object.entries(LEGAL_CONFIG)
    .filter(([k, v]) => v === null && PLACEHOLDER_LABELS[k])
    .map(([k]) => `להשלים: ${PLACEHOLDER_LABELS[k]}`)
  for (const doc of [...Object.values(LEGAL_DOCS), ...Object.values(LEGAL_DOCS_EN)]) {
    for (const s of doc.sections) for (const p of s.paras) if (p?.decide) items.push(`להחלטה (${doc.title} · ${s.title}): ${p.decide}`)
  }
  return items
}
