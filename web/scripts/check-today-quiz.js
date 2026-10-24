import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6XxvFiLpLqAlU1N5YlFNaxB2mmTT3N24",
  authDomain: "al-students.firebaseapp.com",
  databaseURL: "https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "al-students",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const today = new Date().toISOString().split('T')[0];

async function check() {
  await signInAnonymously(auth);
  console.log("Authenticated anonymously.");

  const subjects = ['biology', 'chemistry', 'physics', 'combined maths'];
  for (const subject of subjects) {
    try {
      const dbRef = ref(database, `daily_quizzes_v4/tamil/${subject}/${today}`);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        console.log(`\n--- SUBJECT: ${subject} ---\n`);
        console.log(JSON.stringify(snapshot.val(), null, 2));
      } else {
        console.log(`No daily quiz found for ${subject} today.`);
      }
    } catch (e) {
      console.log(`Could not read ${subject}: ${e.message}`);
    }
  }
  process.exit(0);
}

check();
