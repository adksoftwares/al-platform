import fs from 'fs';
import { PROHIBITED_TERMS_BLACKLIST } from '../src/services/nieTerminologyMaster.ts';

const d = JSON.parse(fs.readFileSync('d:\\AL\\AlApp\\scripts\\all_quizzes_combined_latest.json', 'utf8'));
let totalWords = 0;
let errs = [];
let logLines = ['# Live Firebase Quizzes (Daily & Unit) வார்த்தை சரிபார்ப்பு\n', '```text'];

d.forEach((q, i) => {
  let textToParse = q.question + ' ' + (q.options||[]).join(' ') + ' ' + (q.rationale||'');
  let t = textToParse.match(/[\u0B80-\u0BFF]+|[a-zA-Z0-9()\/\-\+\.]+/g) || [];
  totalWords += t.length;
  t.forEach(w => {
    let v = PROHIBITED_TERMS_BLACKLIST.find(r => r.pattern.test(w));
    // Substring false positive guard for blood ("ரத்த")
    if (v && v.mandatoryNIETerm === 'குருதி' && !w.match(/^(இரத்தம்|இரத்த|இரத்தக்|இரத்தச்)$/)) {
        v = undefined;
    }
    if(v) {
      errs.push({q: i, word: w, correct: v.mandatoryNIETerm});
      logLines.push(`❌ [Q${i+1}] "${w}" — தவறு! சரியான சொல்: ${v.mandatoryNIETerm}`);
    } else {
      logLines.push(`✅ [Q${i+1}] "${w}" — NIE சரிபார்க்கப்பட்டது`);
    }
  });
});

logLines.push('======================================================================');
logLines.push('📊 மொத்த வார்த்தைகள் சரிபார்க்கப்பட்டன: ' + totalWords);
logLines.push('✅ தூய்மையான வார்த்தைகள்: ' + (totalWords - errs.length));
logLines.push('❌ பிழையான வார்த்தைகள்: ' + errs.length);
logLines.push('======================================================================');
logLines.push('```');

fs.writeFileSync('C:\\Users\\Arikarran\\.gemini\\antigravity\\brain\\2fa628cd-9717-49a6-99d4-03d63bf7ca4b\\full_nie_word_confirmation_latest.md', logLines.join('\n'), 'utf8');

console.log('Total Words:', totalWords, 'Errors:', errs.length);
