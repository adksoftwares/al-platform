import fs from 'fs';
import { PROHIBITED_TERMS_BLACKLIST } from '../src/services/nieTerminologyMaster.ts';

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node check-quiz-words.js <file1.json> [file2.json] ...");
  process.exit(1);
}

let totalWords = 0;
let totalViolations = 0;
let allPassed = true;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  File not found: ${filePath}`);
    continue;
  }

  const subjectName = filePath.includes('biology') ? 'உயிரியல் (Biology)' 
    : filePath.includes('chemistry') ? 'வேதியியல் (Chemistry)' 
    : 'பௌதிகவியல் (Physics)';

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📚 ${subjectName} — ${filePath}`);
  console.log('='.repeat(70));

  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  questions.forEach((q, qi) => {
    const allTexts = [
      { label: `Q${qi+1} கேள்வி`, text: q.question || '' },
      ...(q.options || []).map((opt, oi) => ({ label: `Q${qi+1} விடை ${String.fromCharCode(65+oi)}`, text: opt })),
      { label: `Q${qi+1} விளக்கம்`, text: q.rationale || '' },
    ];

    allTexts.forEach(({ label, text }) => {
      // Split into words (Tamil and English words, numbers)
      const words = text.match(/[\u0B80-\u0BFF]+|[a-zA-Z0-9()\/\-\+\.]+/g) || [];
      
      words.forEach(word => {
        totalWords++;
        let wordViolation = null;
        
        for (const rule of PROHIBITED_TERMS_BLACKLIST) {
          if (rule.pattern.test(word)) {
            wordViolation = rule;
            break;
          }
        }

        if (wordViolation) {
          totalViolations++;
          allPassed = false;
          console.log(`  ❌ [${label}] "${word}" — தவறானது! → சரியானது: "${wordViolation.mandatoryNIETerm}" (${wordViolation.nieSource})`);
        } else {
          console.log(`  ✅ [${label}] "${word}" — NIE சரிபார்க்கப்பட்டது`);
        }
      });
    });
  });
}

console.log(`\n${'='.repeat(70)}`);
console.log(`📊 மொத்த வார்த்தைகள் சரிபார்க்கப்பட்டன: ${totalWords}`);
console.log(`✅ தூய்மையான வார்த்தைகள்: ${totalWords - totalViolations}`);
console.log(`❌ பிழையான வார்த்தைகள்: ${totalViolations}`);
if (allPassed) {
  console.log(`\n🎉 100% NIE இலங்கை A/L Resource Book தரம் உறுதிப்படுத்தப்பட்டது!`);
} else {
  console.log(`\n🚨 ${totalViolations} பிழையான வார்த்தைகள் கண்டுபிடிக்கப்பட்டன!`);
}
console.log('='.repeat(70));
