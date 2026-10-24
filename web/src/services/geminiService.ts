import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';
import type { AnalyticsData } from '../types';

export async function generateStudentAnalytics(
  userId: string,
  userLanguage: string = 'tamil'
): Promise<AnalyticsData> {
  // 1. Fetch History Data
  let quizzesList: any[] = [];
  let latestQuizTimestamp = 0;
  try {
    const quizzesSnapshot = await get(ref(database, `users/${userId}/history/quizzes`));
    if (quizzesSnapshot.exists()) {
      quizzesSnapshot.forEach((child) => {
        const item = child.val();
        if (item) {
          quizzesList.push(item);
          if (item.timestamp > latestQuizTimestamp) {
            latestQuizTimestamp = item.timestamp;
          }
        }
      });
    }
  } catch (e) {
    console.warn('Error reading quiz history', e);
  }

  let documentsList: any[] = [];
  let latestDocTimestamp = 0;
  try {
    const documentsSnapshot = await get(ref(database, `users/${userId}/history/documents`));
    if (documentsSnapshot.exists()) {
      documentsSnapshot.forEach((child) => {
        const item = child.val();
        if (item) {
          documentsList.push(item);
          if (item.timestamp > latestDocTimestamp) {
            latestDocTimestamp = item.timestamp;
          }
        }
      });
    }
  } catch (e) {
    console.warn('Error reading doc history', e);
  }

  const latestActivityTimestamp = Math.max(latestQuizTimestamp, latestDocTimestamp);

  // 2. Check 24-hour Cache
  const cacheRef = ref(database, `users/${userId}/analytics_cache`);
  try {
    const cacheSnapshot = await get(cacheRef);
    if (cacheSnapshot.exists()) {
      const cacheData = cacheSnapshot.val();
      const cacheTimestamp = cacheData.timestamp || 0;
      const currentTime = Date.now();
      const isWithin24Hours = (currentTime - cacheTimestamp) < 86400000;

      if (isWithin24Hours && cacheTimestamp >= latestActivityTimestamp && cacheData.json) {
        return JSON.parse(cacheData.json);
      }
    }
  } catch (e) {
    console.warn('Cache read bypass', e);
  }

  // 3. Read Gemini API Key from Firebase
  let apiKey = '';
  try {
    const keySnap = await get(ref(database, 'admin_settings/gemini_api_key'));
    if (keySnap.exists()) {
      apiKey = keySnap.val();
    }
  } catch (e) {
    console.warn('Cannot read admin Gemini key, checking fallback', e);
  }

  // Fallback defaults if user has no quiz history yet
  if (quizzesList.length === 0 && documentsList.length === 0) {
    return {
      summary_metrics: {
        total_quizzes_taken: 0,
        overall_accuracy_percentage: 0,
        total_study_time_minutes: 0,
      },
      strengths: [
        {
          subject: userLanguage === 'tamil' ? 'ஆரம்ப நிலை' : 'Getting Started',
          topic: userLanguage === 'tamil' ? 'சுய கற்றல்' : 'Self Learning',
          reason: userLanguage === 'tamil' ? 'நீங்கள் இன்னும் வினாடி வினாக்களில் பங்கேற்கவில்லை. முதல் வினாடி வினாவை எடுத்து உங்கள் திறனை அறிந்து கொள்ளுங்கள்!' : 'Take your first quiz to unlock personalized strengths analysis!'
        }
      ],
      weaknesses_and_gaps: [],
      study_habit_insights: [
        {
          insight_type: userLanguage === 'tamil' ? 'தினசரி பயிற்சி' : 'Daily Practice',
          description: userLanguage === 'tamil' ? 'ஒவ்வொரு பாடத்திற்கும் தினமும் வினாடி வினா செய்து வந்தால் நினைவாற்றல் அதிகரிக்கும்.' : 'Practicing daily quizzes improves retention significantly.'
        }
      ],
      actionable_recommendations: [
        {
          action_item: userLanguage === 'tamil' ? 'முதல் வினாடி வினாவைத் தொடங்குங்கள்' : 'Start Your First Daily Quiz',
          target_document_or_topic: 'Biology / Chemistry / Physics',
          estimated_benefit: userLanguage === 'tamil' ? '+15% நினைவாற்றல் முன்னேற்றம்' : '+15% retention boost'
        }
      ]
    };
  }

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Gemini API Key missing! Ask admin to configure it under Admin Settings.');
  }

  const prompt = `
You are the Analytics and Insights Engine for an educational app (EduHub). Your role is to analyze a user's quiz performance history and study documents interaction history to generate a comprehensive, actionable learning dashboard.

### 1. INPUT DATA
- Quiz History: ${JSON.stringify(quizzesList)}
- Document Interaction History: ${JSON.stringify(documentsList)}

### 2. CORE TASKS & ANALYTICAL METHOD
Analyze the provided datasets to generate insights:
- Performance Matrix: Calculate total quizzes taken, overall accuracy %, and total study time in minutes.
- Knowledge Gap Detection: Identify specific topics or subjects where the user scores below 70% or takes a long time.
- Engagement & Study Habits: Correlate document reading time with quiz performance.
- Actionable recommendations with target topics and estimated benefit.

### 3. OUTPUT SPECIFICATION
Generate all textual insights, reasons, issues, descriptions, subject names, topic names, and action items purely in the '${userLanguage}' language.
For the priority field in weaknesses_and_gaps, return only the localized translation for "High", "Medium", or "Low" in '${userLanguage}'.
Return ONLY a clean, valid JSON object with the exact schema below. Do NOT wrap it in markdown backticks.
{
  "summary_metrics": {
    "total_quizzes_taken": 10,
    "overall_accuracy_percentage": 85.5,
    "total_study_time_minutes": 120
  },
  "strengths": [
    { "subject": "string", "topic": "string", "reason": "string" }
  ],
  "weaknesses_and_gaps": [
    { "subject": "string", "topic": "string", "issue": "string", "priority": "string" }
  ],
  "study_habit_insights": [
    { "insight_type": "string", "description": "string" }
  ],
  "actionable_recommendations": [
    { "action_item": "string", "target_document_or_topic": "string", "estimated_benefit": "string" }
  ]
}
`.trim();

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          }),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errorDetails}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsedData: AnalyticsData = JSON.parse(cleanJson);

      // Save to Cache
      try {
        await set(cacheRef, {
          json: cleanJson,
          timestamp: Date.now(),
        });
      } catch (cacheErr) {
        console.warn('Cache save warning', cacheErr);
      }

      return parsedData;
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('API_KEY_INVALID')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate AI analytics');
}

export async function generateDynamicUnitQuiz(
  subject: string,
  unitId: number,
  language: string = 'tamil'
): Promise<any[]> {
  let apiKey = '';
  try {
    const keySnap = await get(ref(database, 'admin_settings/gemini_api_key'));
    if (keySnap.exists()) apiKey = keySnap.val();
  } catch (e) {
    console.warn('Cannot read admin Gemini key', e);
  }

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Gemini API Key missing! Cannot generate dynamic quiz.');
  }

  // Use the system guard prompt logic if available, else fallback
  let constraints = '';
  if (language === 'tamil') {
    constraints = `
      MANDATORY CONSTRAINTS:
      - OCR CORRECTION: Fix typos (e.g. use "கலங்களாக" instead of "கல்லாக").
      - NO ENGLISH TRANSLATION: Extract words EXACTLY as printed in Sri Lankan NIE books.
      - Never use "மீத்தேன்" (use "மெதேன்"), never use "முடுக்கம்" (use "ஆர்முடுகல்").
    `;
  }

  const prompt = `
Generate a 5-question multiple choice quiz for GCE Advanced Level (A/L) students in Sri Lanka.
Subject: ${subject}
Unit: ${unitId}
Language: ${language}

${constraints}
Requirements:
- Exactly 5 questions.
- Each question must have exactly 4 options.
- Provide a detailed rationale for the correct answer.
- Give highly varied, unpredictable, and specific questions from deep inside the unit syllabus. DO NOT repeat standard generic questions.

Output JSON format MUST be exactly:
[
  {
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answerIndex": 0,
    "rationale": "Explanation for the correct answer"
  }
]
  `.trim();

  const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9, // high temp for variety
              responseMimeType: "application/json"
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini HTTP ${response.status}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsedData = JSON.parse(cleanJson);
      
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate dynamic quiz');
}
