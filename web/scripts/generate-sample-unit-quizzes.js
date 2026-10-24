/**
 * Generates sample unit quizzes for all subjects and saves them as JSON files for NIE word checking.
 * Run: node scripts/generate-sample-unit-quizzes.js
 */
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

// Read API key from Firebase (same logic as QuizPage.tsx)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Set GEMINI_API_KEY env variable.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const UNITS = [
  { subject: 'biology',   unitId: 1, unitName: 'உயிர்வேதியியல்' },
  { subject: 'biology',   unitId: 6, unitName: 'மரபியல்' },
  { subject: 'chemistry', unitId: 2, unitName: 'அணு அமைப்பு' },
  { subject: 'chemistry', unitId: 7, unitName: 'கரிம வேதியியல்' },
  { subject: 'physics',   unitId: 2, unitName: 'இயக்கவியல்' },
  { subject: 'physics',   unitId: 9, unitName: 'மின்னணுவியல்' },
];

const PROMPT = (subject, unitName) => `You are a Sri Lankan A/L Tamil medium teacher. 
Generate exactly 5 MCQ questions in Tamil about "${unitName}" (${subject}) for Sri Lankan A/L students.
Use ONLY Sri Lankan NIE Resource Book terminology.
Return a raw JSON array (no markdown). Each object:
{ "question": "...", "options": ["A","B","C","D"], "answerIndex": 0, "rationale": "..." }`;

async function main() {
  const allSaved = [];
  
  for (const { subject, unitId, unitName } of UNITS) {
    console.log(`Generating ${subject} Unit ${unitId} (${unitName})...`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: PROMPT(subject, unitName),
      });
      const text = response.text().trim().replace(/^```json\s*/,'').replace(/\s*```$/,'');
      const questions = JSON.parse(text);
      const filename = `d:\\AL\\AlApp\\scripts\\quiz_unit_${subject}_unit${unitId}_2026-09-13.json`;
      fs.writeFileSync(filename, JSON.stringify(questions, null, 2), 'utf8');
      console.log(`  Saved: ${filename}`);
      allSaved.push(filename);
    } catch(e) {
      console.error(`  Failed: ${e.message}`);
    }
    // Rate limit pause
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log('\nAll unit quiz samples saved:');
  allSaved.forEach(f => console.log(' -', f));
}

main();
