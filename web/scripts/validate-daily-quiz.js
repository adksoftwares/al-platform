import fs from 'fs';
import { validateQuestionPositiveNIE } from '../src/services/nieWriteGuard.ts';
import { autoFixQuizQuestion } from '../src/services/nieTerminologyMaster.ts';

const quizPath = process.argv[2];
const subject = process.argv[3] || 'unknown';

if (!quizPath || !fs.existsSync(quizPath)) {
  console.error("Quiz JSON file not provided or not found.");
  process.exit(1);
}

let quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));

// 🛠️ 1. AUTO-FIX: Automatically correct Indian/Prohibited terms to NIE terms
let fixesApplied = 0;
quizData = quizData.map(q => {
  const original = JSON.stringify(q);
  const fixed = autoFixQuizQuestion(q);
  if (original !== JSON.stringify(fixed)) {
    fixesApplied++;
  }
  return fixed;
});

// Overwrite the JSON file with the fixed data so the Python script uploads the corrected version!
if (fixesApplied > 0) {
  console.log(`🛠️ Applied ${fixesApplied} automatic NIE terminology corrections.`);
  fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2), 'utf8');
}

// 🛡️ 2. VALIDATE: Ensure no other unfixable violations exist
let hasErrors = false;

quizData.forEach((q, idx) => {
  const result = validateQuestionPositiveNIE(q, subject);
  if (!result.isValid) {
    hasErrors = true;
    console.error(`\n❌ [Question ${idx + 1}] blocked by NIE Guard!`);
    result.violations.forEach(v => {
      console.error(`   Offending: "${v.offendingTerm}" -> Required: "${v.suggestedNIETerm}"`);
    });
  }
});

if (hasErrors) {
  console.error("\n🚨 NIE Terminology Violation(s) detected even after auto-fix. Upload blocked.");
  process.exit(1);
}

console.log("✅ Passed NIE positive allowlist verification.");
process.exit(0);
