const fs = require('fs');

async function downloadQuizzes() {
  const TODAY = new Date().toISOString().split('T')[0];
  const DB_URL = 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app';
  
  // Need auth token to read? Actually, students can read daily_quizzes_v4 freely. Let's try without auth first.
  
  const dailyUrl = `${DB_URL}/daily_quizzes_v4.json`;
  console.log('Fetching all quizzes from Firebase...');
  
  const res = await fetch(dailyUrl);
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, res.statusText);
    process.exit(1);
  }
  
  const data = await res.json();
  const allQuestions = [];
  
  // Extract daily quizzes for today
  ['tamil'].forEach(lang => {
    ['biology', 'chemistry', 'physics'].forEach(subj => {
      if (data[lang] && data[lang][subj] && data[lang][subj][TODAY]) {
        const qList = data[lang][subj][TODAY];
        allQuestions.push(...qList);
      }
    });
  });
  
  // Extract unit quizzes for today
  if (data.unit_quizzes && data.unit_quizzes.tamil) {
    ['biology', 'chemistry', 'physics'].forEach(subj => {
      if (data.unit_quizzes.tamil[subj]) {
        Object.keys(data.unit_quizzes.tamil[subj]).forEach(unitKey => {
          if (data.unit_quizzes.tamil[subj][unitKey][TODAY]) {
            // It might be an array or object depending on how it was saved
            const qData = data.unit_quizzes.tamil[subj][unitKey][TODAY];
            if (Array.isArray(qData)) {
              allQuestions.push(...qData);
            } else {
              allQuestions.push(...Object.values(qData));
            }
          }
        });
      }
    });
  }
  
  fs.writeFileSync('d:\\AL\\AlApp\\scripts\\all_live_quizzes_today.json', JSON.stringify(allQuestions, null, 2), 'utf8');
  console.log(`Saved ${allQuestions.length} questions to all_live_quizzes_today.json`);
}

downloadQuizzes();
