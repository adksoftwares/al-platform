import fs from 'fs';
import { cleanQuestion } from './nieSanitizer.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
const EMAIL = process.env.FIREBASE_EMAIL || '';
const PASSWORD = process.env.FIREBASE_PASSWORD || '';
const DB_URL = process.env.FIREBASE_DB_URL || 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app';

async function run() {
  if (!FIREBASE_API_KEY || !EMAIL || !PASSWORD) {
    console.error('Missing Firebase credentials in environment variables.');
    return;
  }
  console.log('Authenticating with Firebase...');
  const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true })
  });
  const authData = await authRes.json();
  const idToken = authData.idToken;

  console.log('Fetching daily_quizzes_v4...');
  const dbRes = await fetch(`${DB_URL}/daily_quizzes_v4.json?auth=${idToken}`);
  const dbData = await dbRes.json();

  let modifiedDailyCount = 0;
  let modifiedUnitCount = 0;

  // 1. Clean daily quizzes for Tamil
  if (dbData.tamil) {
    for (const subj of ['biology', 'chemistry', 'physics']) {
      if (dbData.tamil[subj]) {
        for (const dateStr of Object.keys(dbData.tamil[subj])) {
          const originalList = dbData.tamil[subj][dateStr];
          const cleanedList = originalList.map(q => cleanQuestion(q));
          
          if (JSON.stringify(originalList) !== JSON.stringify(cleanedList)) {
            dbData.tamil[subj][dateStr] = cleanedList;
            modifiedDailyCount++;
            await fetch(`${DB_URL}/daily_quizzes_v4/tamil/${subj}/${dateStr}.json?auth=${idToken}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cleanedList)
            });
          }
        }
      }
    }
  }

  // 2. Clean unit quizzes for Tamil
  if (dbData.unit_quizzes && dbData.unit_quizzes.tamil) {
    for (const subj of Object.keys(dbData.unit_quizzes.tamil)) {
      for (const unit of Object.keys(dbData.unit_quizzes.tamil[subj])) {
        for (const dateStr of Object.keys(dbData.unit_quizzes.tamil[subj][unit])) {
          const qData = dbData.unit_quizzes.tamil[subj][unit][dateStr];
          const isArray = Array.isArray(qData);
          const originalList = isArray ? qData : Object.values(qData);
          const cleanedList = originalList.map(q => cleanQuestion(q));

          if (JSON.stringify(originalList) !== JSON.stringify(cleanedList)) {
            modifiedUnitCount++;
            await fetch(`${DB_URL}/daily_quizzes_v4/unit_quizzes/tamil/${subj}/${unit}/${dateStr}.json?auth=${idToken}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(isArray ? cleanedList : cleanedList.reduce((acc, curr, idx) => ({ ...acc, [idx]: curr }), {}))
            });
          }
        }
      }
    }
  }

  console.log(`Updated Firebase: ${modifiedDailyCount} daily quiz dates and ${modifiedUnitCount} unit quiz dates cleaned.`);
}

run().catch(console.error);
