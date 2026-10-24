import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quizPoolPath = path.resolve(__dirname, '../src/services/quizPool.ts');

if (!fs.existsSync(quizPoolPath)) {
  console.error(`❌ Error: quizPool.ts not found at ${quizPoolPath}`);
  process.exit(1);
}

const quizPoolContent = fs.readFileSync(quizPoolPath, 'utf8');

// 🔒 STRICT SRI LANKAN NIE RESOURCE BOOK VALIDATION RULES
const PROHIBITED_RULES = [
  // 🧬 Biology Prohibited Rules
  { regex: /மெய்ப் பக்றீரியா|Eubacteria/, term: "மெய்ப் பக்றீரியாக்கள் (Eubacteria)", nie: "பக்றீரியாக்கள் (Bacteria / Domain Bacteria)", source: "NIE Biology Resource Book Unit 2 (Diversity of Organisms)" },
  { regex: /செல்கள்|செல்லின்|செல்களை|செல்லுக்குள்|தனி செல்|சிக்கிள் செல்/, term: "செல்/செல்கள்", nie: "கலம்/கலங்கள்", source: "NIE Biology Resource Book Unit 3" },
  { regex: /திசுக்கள்|திசுவின்|திசுக்களை|\bதிசு\b/, term: "திசு", nie: "இழையம்", source: "NIE Biology Resource Book Unit 4" },
  { regex: /இரத்தக் குழு|ரத்தக் குழு|இரத்தப் பிரிவு|ரத்த பிரிவு/, term: "இரத்தக் குழு", nie: "குருதிப் பிரிவு / குருதிக் கூட்டம்", source: "NIE Biology Resource Book Unit 6" },
  { regex: /இரத்தம்|இரத்தத்தில்|இரத்தத்தின்|இரத்த அழுத்தம்/, term: "இரத்தம்", nie: "குருதி", source: "NIE Biology Resource Book Unit 5 & 6" },
  { regex: /சிக்கிள் செல் அனீமியா|சிக்கில் செல்|\bஅனீமியா\b/, term: "சிக்கிள் செல் அனீமியா", nie: "அரிவாள் கலச் சோகை", source: "NIE Biology Resource Book Unit 6" },
  { regex: /டவுண் கூட்டறிகுறி|டவுண் சிண்ட்ரோம்|டவுன் சிண்ட்ரோம்|டவுண் நோய்க்கூட்டறை/, term: "டவுண் கூட்டறிகுறி", nie: "டவுனின் நோய்க்கூட்டறை", source: "NIE Biology Resource Book Unit 6" },
  { regex: /முக்குரோமோசோமி|டிரைசோமி|ட்ரைசோமி/, term: "முக்குரோமோசோமி", nie: "முந்நிறமூர்த்த நிலை (Trisomy 21)", source: "NIE Biology Resource Book Unit 6" },
  { regex: /அந்திய மந்தாரை/, term: "அந்திய மந்தாரை", nie: "சிங்கவாய்ப் பூ (Snapdragon - Antirrhinum)", source: "NIE Biology Resource Book Unit 6" },
  { regex: /ஆட்டோகிளேவ்|ஆட்டோக்ளேவ்/, term: "ஆட்டோகிளேவ்", nie: "அமுக்க அவியடுப்பு (Autoclave)", source: "NIE Biology Resource Book Unit 9" },
  { regex: /தனி செல் புரதம்/, term: "தனி செல் புரதம்", nie: "தனிக்கலப் புரதம் (SCP)", source: "NIE Biology Resource Book Unit 10" },
  { regex: /அண்மைச் சுருள் குழாய்/, term: "அண்மைச் சுருள் குழாய்", nie: "அண்மை மடிந்த சிறுகுழாய் (PCT)", source: "NIE Biology Resource Book Unit 5" },
  { regex: /சூப்பர் பாஸ்பேட்/, term: "சூப்பர் பாஸ்பேட்", nie: "சூப்பர்பொஸ்பேற்று (Superphosphate)", source: "NIE Biology Unit 10 / Agriculture" },
  { regex: /பொட்டாஷ் உரம்/, term: "பொட்டாஷ் உரம்", nie: "பொற்றாசு உரம்", source: "NIE Biology Unit 10" },
  { regex: /என்டரோகைனேஸ்/, term: "என்டரோகைனேஸ்", nie: "என்டரோகைனேசு (Enterokinase)", source: "NIE Biology Unit 5" },
  { regex: /அல்டோஸ்டிரோன்/, term: "அல்டோஸ்டிரோன்", nie: "அல்டோசிரோன் (Aldosterone)", source: "NIE Biology Unit 5" },

  { regex: /(பிற்போக்கான|பிற்போக்கு)/, term: "பிற்போக்கான", nie: "பின்னடைவான (Recessive)", source: "NIE Biology Unit 6" },
  { regex: /(பாய்ப்புரு|பாய்ப்புருவை|பாய்ப்புருக்கள்)/, term: "பாய்ப்புரு", nie: "தோற்றவமைப்பு (Phenotype)", source: "NIE Biology Unit 6" },
  { regex: /(மேலோங்கிய|மேலோங்கு)/, term: "மேலோங்கிய", nie: "ஆட்சியுடைய (Dominant)", source: "NIE Biology Unit 6" },
  { regex: /(அல்லெல்|அல்லெல்கள்|அல்லெலின்)/, term: "அல்லெல்", nie: "அல்லீல் (Allele)", source: "NIE Biology Unit 6" },
  { regex: /(வெயின்பேர்க்|வெயின்பெர்க்)/, term: "வெயின்பேர்க்", nie: "வைன்பேக் (Weinberg)", source: "NIE Biology Unit 6" },
  { regex: /(மரபணு|மரபணுக்கள்|மரபணுவின்)/, term: "மரபணு", nie: "பரம்பரையலகு (Gene)", source: "NIE Biology Unit 6" },
  { regex: /(மரபணுவாக்கம்|மரபணு அமைப்பு)/, term: "மரபணுவாக்கம்", nie: "பிறப்புரிமையமைப்பு (Genotype)", source: "NIE Biology Unit 6" },
  { regex: /(பிறியோன் \(operon\)|ஓபரான்)/, term: "ஓபரான் / பிறியோன் (operon)", nie: "ஒப்பரோன் (Operon)", source: "NIE Biology Unit 6" },
  { regex: /(வெக்டர்|வெக்டர்கள்|வெக்டரின்|வெக்டர்களின்)/, term: "வெக்டர்", nie: "காவி (Vector)", source: "NIE Biology Unit 6" },
  { regex: /(சர்க்கரை|சர்க்கரையை)/, term: "சர்க்கரை", nie: "வெல்லம் (Sugar)", source: "NIE Biology Unit 6" },
  { regex: /(செய்தி ஆர்\.என்\.ஏ|செய்தி RNA)/, term: "செய்தி ஆர்.என்.ஏ", nie: "தூது ஆர்.என்.ஏ (mRNA)", source: "NIE Biology Unit 6" },
  { regex: /(இன்ட்ரோன்|இன்ட்ரோன்கள்|இன்ட்ரோன்களை)/, term: "இன்ட்ரோன்", nie: "இன்றோன் (Intron)", source: "NIE Biology Unit 6" },
  { regex: /(பாலி-A|பாலி - A|பாலி A|பாலிமரேஸ்)/, term: "பாலி", nie: "பொலி (Poly)", source: "NIE Biology Unit 6" },
  { regex: /(தொப்பி)/, term: "தொப்பி", nie: "மூடி (Cap)", source: "NIE Biology Unit 6" },

  // 🧪 Chemistry Prohibited Rules
  { regex: /மீத்தேன்|மீத்தேனின்|மீத்தேனை/, term: "மீத்தேன்", nie: "மெதேன் (Methane - CH4)", source: "NIE Chemistry Resource Book Unit 2 & 7" },
  { regex: /ஈத்தேன்|ஈத்தேனின்|ஈத்தேனை/, term: "ஈத்தேன்", nie: "எதேன் (Ethane - C2H6)", source: "NIE Chemistry Resource Book Unit 7" },
  { regex: /மீத்தைல்/, term: "மீத்தைல்", nie: "மெதில் (Methyl)", source: "NIE Chemistry Resource Book Unit 7" },
  { regex: /ஈத்தைல்/, term: "ஈத்தைல்", nie: "எதில் (Ethyl)", source: "NIE Chemistry Resource Book Unit 7" },
  { regex: /மீத்தனால்/, term: "மீத்தனால்", nie: "மெதனோல் (Methanol)", source: "NIE Chemistry Resource Book Unit 9" },
  { regex: /எத்தனால்/, term: "எத்தனால்", nie: "எதனோல் (Ethanol)", source: "NIE Chemistry Resource Book Unit 9" },
  { regex: /நைட்ரஜன்|நைட்ரஜனின்|நைட்ரஜனை/, term: "நைட்ரஜன்", nie: "நைதரசன்", source: "NIE Chemistry Resource Book Unit 1, 6, 14" },
  { regex: /ஹைட்ரஜன்|ஹைட்ரஜனின்|ஹைட்ரஜனை|ஹைட்ரஜன் பிணைப்பு/, term: "ஹைட்ரஜன்", nie: "ஐதரசன்", source: "NIE Chemistry Resource Book Unit 1, 2" },
  { regex: /ஆக்சிஜன்|ஆக்ஸிஜன்|ஆக்சிஜனின்/, term: "ஆக்சிஜன்", nie: "ஒட்சிசன்", source: "NIE Chemistry Resource Book Unit 1, 6" },
  { regex: /கார்பன் டை ஆக்சைடு|கார்பன் டை ஆக்சைட்/, term: "கார்பன் டை ஆக்சைடு", nie: "காபனீரொட்சைட்டு", source: "NIE Chemistry Resource Book Unit 3, 14" },
  { regex: /கார்பன்|கார்பனின்|கார்பனை|கார்பன் எண்ணிக்கை/, term: "கார்பன்", nie: "காபன்", source: "NIE Chemistry Resource Book Unit 7, 8" },
  { regex: /நைட்ரோ ஏற்றம்|நைட்ரோவாக்கம்/, term: "நைட்ரோ ஏற்றம்", nie: "நைத்திரேற்றம்", source: "NIE Chemistry Resource Book Unit 8" },
  { regex: /நைட்ரோபென்சீன்|நைட்ரோ பென்சீன்/, term: "நைட்ரோபென்சீன்", nie: "நைத்திரோபென்சீன்", source: "NIE Chemistry Resource Book Unit 8, 10" },
  { regex: /நைட்ரோனியம்/, term: "நைட்ரோனியம்", nie: "நைத்திரோனியம்", source: "NIE Chemistry Resource Book Unit 8" },
  { regex: /பாஸ்பரஸ்|பாஸ்பரஸின்|பாஸ்பேட்/, term: "பாஸ்பரஸ்/பாஸ்பேட்", nie: "பொசுபரசு/பொஸ்பேற்று", source: "NIE Chemistry Resource Book Unit 2, 6" },
  { regex: /எலக்ட்ரான்|எலக்ட்ரான்கள்|எலக்ட்ரான்களின்/, term: "எலக்ட்ரான்", nie: "இலத்திரன்", source: "NIE Chemistry Resource Book Unit 1, 13" },
  { regex: /முக்கோண இருபிரமிடு/, term: "முக்கோண இருபிரமிடு", nie: "முக்கோண இருபிரமிட்டு", source: "NIE Chemistry Resource Book Unit 2" },
  { regex: /அல்கைல் குளோரைடு|குளோரைடு/, term: "குளோரைடு", nie: "குளோரைட்டு (Chloride)", source: "NIE Chemistry Resource Book Unit 9" },
  { regex: /புளோரைடு/, term: "புளோரைடு", nie: "புளோரைட்டு (Fluoride)", source: "NIE Chemistry Resource Book Unit 2" },
  { regex: /புரோமைடு/, term: "புரோமைடு", nie: "புரோமைட்டு (Bromide)", source: "NIE Chemistry Resource Book Unit 9" },
  { regex: /அயோடைடு/, term: "அயோடைடு", nie: "அயடைட்டு (Iodide)", source: "NIE Chemistry Resource Book Unit 9" },
  { regex: /பைகார்பனேற்று/, term: "பைகார்பனேற்று", nie: "ஐதரசன் காபனேற்று / இருகாபனேற்று", source: "NIE Chemistry Unit 6" },

  // ⚛️ Physics Prohibited Rules
  { regex: /முடுக்கம்|முடுக்கத்தில்|முடுக்கத்திற்கான|முடுக்கமும்|புவியீர்ப்பு முடுக்கம்|மையநோக்கு முடுக்கம்/, term: "முடுக்கம்", nie: "ஆர்முடுகல்", source: "NIE Physics Resource Book Unit 2, 5" },
  { regex: /அதிர்வெண்|அதிர்வெண்ணை|அதிர்வெண்ணில்/, term: "அதிர்வெண்", nie: "மீடிறன்", source: "NIE Physics Resource Book Unit 3, 11" },
  { regex: /கலெக்டர் மின்னோட்டம்|கலெக்டருக்குப்/, term: "கலெக்டர்", nie: "சேகரிப்பான் (Collector)", source: "NIE Physics Resource Book Unit 9" },
  { regex: /வோல்டேஜ்|வோல்டேஜ் பெருக்கம்/, term: "வோல்டேஜ்", nie: "வோல்ற்றளவு / வோல்ற்றளவுப் பெருக்கம்", source: "NIE Physics Resource Book Unit 9" },
  { regex: /நிலைமத் திருப்புத்திறன்|நிலைம திருப்பம்/, term: "நிலைமத் திருப்புத்திறன்", nie: "சடத்துவத் திருப்பம்", source: "NIE Physics Resource Book Unit 2" }
];

const lines = quizPoolContent.split('\n');
const violations = [];

lines.forEach((lineText, lineIdx) => {
  const lineNum = lineIdx + 1;
  for (const rule of PROHIBITED_RULES) {
    if (rule.regex.test(lineText)) {
      violations.push({
        lineNum,
        lineContent: lineText.trim(),
        prohibitedTerm: rule.term,
        requiredNIETerm: rule.nie,
        nieSource: rule.source
      });
    }
  }
});

// Statistics
const totalWords = quizPoolContent.split(/\s+/).filter(Boolean).length;
const totalCharacters = quizPoolContent.length;
const totalLines = lines.length;

console.log("\n=======================================================");
console.log("🏛️ SRI LANKAN NIE A/L RESOURCE BOOK TERMINOLOGY AUDITOR");
console.log("=======================================================");
console.log(`📁 Target File: quizPool.ts`);
console.log(`📊 Lines Scanned: ${totalLines}`);
console.log(`📝 Words Scanned: ${totalWords}`);
console.log(`🔤 Characters Scanned: ${totalCharacters}`);
console.log(`🔍 NIE Rules Checked: ${PROHIBITED_RULES.length}`);

if (violations.length > 0) {
  console.error(`\n❌ BUILD BLOCKED! Found ${violations.length} Non-NIE / Prohibited Term Violations:\n`);
  violations.forEach((v, i) => {
    console.error(`  [${i + 1}] Line ${v.lineNum}:`);
    console.error(`      ❌ Prohibited Term : "${v.prohibitedTerm}"`);
    console.error(`      ✅ Mandatory NIE   : "${v.requiredNIETerm}"`);
    console.error(`      📖 Official Source : ${v.nieSource}`);
    console.error(`      📄 Code Snippet   : "${v.lineContent.substring(0, 85)}..."\n`);
  });
  console.error(`🚨 DEPLOYMENT & BUILD HALTED. Correct all terms to pure Sri Lankan NIE terms.`);
  process.exit(1);
} else {
  console.log(`\n✅ 100% COMPLIANT WITH SRI LANKAN NIE A/L RESOURCE BOOKS.`);
  console.log(`🎉 0 Prohibited / Non-NIE Terms Found.`);
  console.log(`🛡️ Build verification passed.\n`);
  process.exit(0);
}
