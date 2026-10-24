import fs from 'fs';
import { PROHIBITED_TERMS_BLACKLIST } from '../src/services/nieTerminologyMaster.ts';

const d = JSON.parse(fs.readFileSync('d:\\AL\\AlApp\\scripts\\all_quizzes_combined_latest.json', 'utf8'));

d.filter(q => q.meta_date === '2026-10-22' || q.meta_date === '2026-10-23').forEach((q, i) => {
  let textToParse = q.question + ' ' + (q.options||[]).join(' ') + ' ' + (q.rationale||'');
  let t = textToParse.match(/[\u0B80-\u0BFF]+|[a-zA-Z0-9()\/\-\+\.]+/g) || [];
  t.forEach(w => {
    let v = PROHIBITED_TERMS_BLACKLIST.find(r => r.pattern.test(w));
    if (v && v.mandatoryNIETerm === 'குருதி' && !w.match(/^(இரத்தம்|இரத்த|இரத்தக்|இரத்தச்)$/)) {
        v = undefined;
    }
    if(v) {
      console.log(`[${q.meta_date} ${q.meta_subject}] Word: '${w}' -> Flagged by '${v.offendingTerm}' -> Should be: '${v.mandatoryNIETerm}'`);
    }
  });
});
