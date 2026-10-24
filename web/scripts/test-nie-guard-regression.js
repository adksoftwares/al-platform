import { validateQuestionPositiveNIE } from '../src/services/nieWriteGuard.ts';

const testCases = [
  {
    name: "TEST A: Previously Discovered 'மெய்ப் பக்றீரியா (Eubacteria)'",
    subject: "biology",
    unitId: 2,
    q: {
      question: "மெய்ப் பக்றீரியாக்களின் (Eubacteria) கலச்சுவரில் காணப்படும் பொருள் எது?",
      options: ["பெப்ரிடோகிளைக்கன்", "செல்லுலோசு"],
      rationale: "மெய்ப் பக்றீரியா கலச்சுவர் சிறப்பு."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST B: Indian / NCERT Term 'இரத்தம் / இரத்தக் குழு'",
    subject: "biology",
    unitId: 5,
    q: {
      question: "மனித உடலில் இரத்தத்தின் pH என்ன?",
      options: ["7.4", "6.0"],
      rationale: "இரத்தம் ஒரு திரவ இழையம்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST C: Indian Physics Term 'முடுக்கம்'",
    subject: "physics",
    unitId: 2,
    q: {
      question: "புவியீர்ப்பு முடுக்கம் g பெறுமானம் என்ன?",
      options: ["9.8", "10"],
      rationale: "முடுக்கம் மாறிலி."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST D: Indian Physics Term 'அதிர்வெண்'",
    subject: "physics",
    unitId: 3,
    q: {
      question: "ஒலியின் அதிர்வெண் கூடும் போது என்னவாகும்?",
      options: ["மீடிறன் கூடும்"],
      rationale: "அதிர்வெண் அதிகம்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST E: Made-up / Unknown Non-NIE Scientific Phrase",
    subject: "biology",
    unitId: 6,
    q: {
      question: "அபூரண ஓங்குதன்மைக்கு உதாரணம் எது?",
      options: ["அந்திய மந்தாரை மலர்"],
      rationale: "அந்திய மந்தாரை சிறப்பு."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST F: Non-NIE Transliteration 'டவுண் கூட்டறிகுறி / முக்குரோமோசோமி'",
    subject: "biology",
    unitId: 6,
    q: {
      question: "21வது நிறமூர்த்தக் குறைபாடு எது?",
      options: ["டவுனின் நோய்க்கூட்டறை"],
      rationale: "இது முக்குரோமோசோமி டவுண் கூட்டறிகுறி ஆகும்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST G: Indian Chemical Spelling 'நைட்ரஜன் / பாஸ்பரஸ்'",
    subject: "chemistry",
    unitId: 2,
    q: {
      question: "வளிமண்டலத்தில் நைட்ரஜன் மற்றும் பாஸ்பரஸ் கலவை என்ன?",
      options: ["78%", "21%"],
      rationale: "நைட்ரஜன் அதிகம்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST H: English Transliteration 'ஆட்டோகிளேவ் / கலெக்டர்'",
    subject: "physics",
    unitId: 9,
    q: {
      question: "BJT இல் கலெக்டர் மின்னோட்டம் எது?",
      options: ["Ic"],
      rationale: "கலெக்டர் முனையம்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST I: Combination of Valid Words Forming Unverified Phrase 'கலங்களின் இரத்த ஓட்டம்'",
    subject: "biology",
    unitId: 5,
    q: {
      question: "கலங்களின் இரத்த ஓட்டம் எவ்வாறு நடைபெறுகிறது?",
      options: ["இதயம் மூலம்"],
      rationale: "இரத்த ஓட்டம் சுற்றோட்டம்."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST J: Genetics Term 'தொடர்புடைமை' (Linkage)",
    subject: "biology",
    unitId: 6,
    q: {
      question: "தொடர்புடைமை (Linkage) என்பது எதைக் குறிக்கிறது?",
      options: ["ஒரே நிறமூர்த்தத்தில் உள்ள மரபணுக்கள்"],
      rationale: "மெண்டலின் விதிகளுக்கு அப்பாற்பட்டது."
    },
    expectedBlocked: true,
  },
  {
    name: "TEST K: 100% POSITIVELY VERIFIED SRI LANKAN NIE QUESTION",
    subject: "biology",
    unitId: 2,
    q: {
      question: "பக்றீரியாக்களின் (Bacteria) கலச்சுவரில் காணப்படும் பிரதான கட்டமைப்புப் பொருள் எது?",
      options: ["பெப்ரிடோகிளைக்கன் (Peptidoglycan)", "செல்லுலோசு", "கைற்றின் (Chitin)", "பெக்ரின் (Pectin)"],
      rationale: "டொமைன் பக்றீரியாவைச் சேர்ந்த உயிரினங்களின் கலச்சுவர் பெப்ரிடோகிளைக்கன் (மியூரின்) வலையமைப்பினால் ஆனது."
    },
    expectedBlocked: false,
  }
];

console.log("\n=================================================================");
console.log("🏛️ RUNNING POSITIVE ALLOWLIST & NIE SOURCE REGRESSION TEST SUITE");
console.log("=================================================================\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach((tc, idx) => {
  const result = validateQuestionPositiveNIE(tc.q, tc.subject, tc.unitId);
  const isBlocked = !result.isValid;

  if (isBlocked === tc.expectedBlocked) {
    console.log(`✅ [PASS] ${tc.name}`);
    if (isBlocked) {
      console.log(`   🛡️ Successfully BLOCKED! Violation: "${result.violations[0].offendingTerm}" ➔ Mandatory NIE: "${result.violations[0].suggestedNIETerm}"`);
    } else {
      console.log(`   ✨ Successfully ALLOWED! Pure Sri Lankan NIE question passed positive verification.`);
    }
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${tc.name} — Expected Blocked=${tc.expectedBlocked}, Actual Blocked=${isBlocked}`);
    failedTests++;
  }
  console.log("");
});

console.log("=================================================================");
console.log(`📊 TEST RESULTS: ${passedTests}/${testCases.length} Tests Passed!`);
if (failedTests > 0) {
  console.error(`🚨 POSITIVE SOURCE VERIFICATION SUITE FAILED with ${failedTests} failures.`);
  process.exit(1);
} else {
  console.log(`🎉 100% ZERO-ERROR ENFORCEMENT PASSED — POSITIVE SOURCE LOCK ACTIVE!`);
  process.exit(0);
}
