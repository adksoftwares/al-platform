/**
 * 🏛️ SRI LANKA NIE A/L RESOURCE BOOK TERMINOLOGY MASTER & VALIDATION SYSTEM
 * 
 * AUTHORITATIVE STANDARD:
 * National Institute of Education (NIE) Sri Lanka G.C.E. (Advanced Level) Resource Books:
 * - Biology: NIE A/L Resource Books (Units 1 to 10)
 * - Chemistry: NIE A/L Resource Books (Units 1 to 14)
 * - Physics: NIE A/L Resource Books (Units 1 to 11)
 * 
 * STRICT PROHIBITION:
 * Any term from NCERT, Indian Tamil Nadu textbooks, colloquial transliterations,
 * or AI-invented words is STRICTLY PROHIBITED and will cause validation/build failure.
 */

export interface NIETermMapping {
  canonicalTamil: string;
  english: string;
  subject: 'biology' | 'chemistry' | 'physics' | 'all';
  units: number[];
  nieSourceBook: string;
  prohibitedTerms: string[]; // Variations, NCERT, Indian Tamil terms that MUST NEVER be used
  notes?: string;
}

export interface TermViolation {
  offendingTerm: string;
  suggestedNIETerm: string;
  subject: string;
  unitId?: number;
  location: 'question' | 'option' | 'rationale' | 'unitName';
  nieSourceBook: string;
  textSnippet: string;
}

/**
 * 🔒 AUTHORITATIVE NIE A/L MASTER DICTIONARY
 */
export const NIE_MASTER_TERMS: NIETermMapping[] = [
  // -------------------------------------------------------------
  // 🧬 BIOLOGY (NIE A/L Biology Resource Books Units 1–10)
  // -------------------------------------------------------------
  {
    canonicalTamil: "கலம் / கலங்கள்",
    english: "Cell / Cells",
    subject: "biology",
    units: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 3: Cellular Basis of Life)",
    prohibitedTerms: ["செல்", "செல்கள்", "செல்லின்", "செல்களை", "செல்லுக்குள்"],
    notes: "Sri Lankan NIE officially uses 'கலம்/கலங்கள்', never 'செல்/செல்கள்'."
  },
  {
    canonicalTamil: "இழையம் / இழையங்கள்",
    english: "Tissue / Tissues",
    subject: "biology",
    units: [3, 4, 5, 10],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 4 & 5)",
    prohibitedTerms: ["திசு", "திசுக்கள்", "திசுவின்", "திசுக்களை"],
    notes: "Sri Lankan NIE officially uses 'இழையம்/இழையங்கள்', never 'திசு/திசுக்கள்'."
  },
  {
    canonicalTamil: "அவயவம் / அவயவங்கள்",
    english: "Organ / Organs",
    subject: "biology",
    units: [3, 5],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 5)",
    prohibitedTerms: ["உறுப்பு", "உறுப்புகள்", "உறுப்பின்"],
    notes: "Sri Lankan NIE officially uses 'அவயவம்/அங்க அமைப்பு'."
  },
  {
    canonicalTamil: "குருதி",
    english: "Blood",
    subject: "biology",
    units: [5, 6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 5 & 6)",
    prohibitedTerms: ["இரத்தம்", "ரத்தம்", "இரத்தத்தின்", "இரத்தத்தில்"],
    notes: "Sri Lankan NIE strictly uses 'குருதி', never 'இரத்தம்'."
  },
  {
    canonicalTamil: "குருதிப் பிரிவு / குருதிக் கூட்டம்",
    english: "Blood Group",
    subject: "biology",
    units: [5, 6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 6: Genetics)",
    prohibitedTerms: ["இரத்தக் குழு", "ரத்தக் குழு", "இரத்த பிரிவு", "ரத்த வகை"],
    notes: "ABO blood groups are strictly 'ABO குருதிப் பிரிவுகள்'."
  },
  {
    canonicalTamil: "அரிவாள் கலச் சோகை",
    english: "Sickle Cell Anaemia",
    subject: "biology",
    units: [5, 6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 6: Genetics)",
    prohibitedTerms: ["சிக்கிள் செல் அனீமியா", "சிக்கிள் செல்", "சிக்கில் செல்", "அனீமியா"],
    notes: "Sri Lankan NIE strictly uses 'அரிவாள் கலச் சோகை / குருதிச்சோகை'."
  },
  {
    canonicalTamil: "டவுனின் நோய்க்கூட்டறை",
    english: "Down's Syndrome",
    subject: "biology",
    units: [6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 6: Genetics)",
    prohibitedTerms: ["டவுண் கூட்டறிகுறி", "டவுண் சிண்ட்ரோம்", "டவுன் சிண்ட்ரோம்", "டவுண் நோய்க்கூட்டறை"],
    notes: "Spelled with dental ன் ('டவுனின் நோய்க்கூட்டறை')."
  },
  {
    canonicalTamil: "முந்நிறமூர்த்த நிலை (Trisomy 21)",
    english: "Trisomy",
    subject: "biology",
    units: [6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 6: Genetics)",
    prohibitedTerms: ["முக்குரோமோசோமி", "டிரைசோமி", "ட்ரைசோமி"],
    notes: "NIE terminology is 'முந்நிறமூர்த்த நிலை'."
  },
  {
    canonicalTamil: "சிங்கவாய்ப் பூ (Snapdragon - Antirrhinum)",
    english: "Snapdragon (Antirrhinum majus)",
    subject: "biology",
    units: [6],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 6: Genetics)",
    prohibitedTerms: ["அந்திய மந்தாரை", "மிராபிலிஸ் ஜலாபா", "நான்கு மணி தாவரம்"],
    notes: "NIE textbook uses Snapdragon (Antirrhinum), NOT Mirabilis jalapa."
  },
  {
    canonicalTamil: "அமுக்க அவியடுப்பு (Autoclave)",
    english: "Autoclave",
    subject: "biology",
    units: [9],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 9: Microbiology)",
    prohibitedTerms: ["ஆட்டோகிளேவ்", "ஆட்டோக்ளேவ்", "ஆட்டோகிளேவ் கருவி"],
    notes: "Strict NIE official Tamil term is 'அமுக்க அவியடுப்பு'."
  },
  {
    canonicalTamil: "தனிக்கலப் புரதம் (Single Cell Protein - SCP)",
    english: "Single Cell Protein (SCP)",
    subject: "biology",
    units: [10],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 10: Applied Biology)",
    prohibitedTerms: ["தனி செல் புரதம்", "சிங்கிள் செல் புரோட்டீன்"],
    notes: "NIE term is 'தனிக்கலப் புரதம்'."
  },
  {
    canonicalTamil: "அண்மை மடிந்த சிறுகுழாய் (PCT)",
    english: "Proximal Convoluted Tubule",
    subject: "biology",
    units: [5],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 5)",
    prohibitedTerms: ["அண்மைச் சுருள் குழாய்", "அண்மை சுருள் குழல்"],
    notes: "NIE term is 'அண்மை மடிந்த சிறுகுழாய்'."
  },
  {
    canonicalTamil: "சேய்மை மடிந்த சிறுகுழாய் (DCT)",
    english: "Distal Convoluted Tubule",
    subject: "biology",
    units: [5],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 5)",
    prohibitedTerms: ["சேய்மைச் சுருள் குழாய்", "சேய்மை சுருள் குழல்"],
    notes: "NIE term is 'சேய்மை மடிந்த சிறுகுழாய்'."
  },
  {
    canonicalTamil: "மீளஅகத்துறிஞ்சல்",
    english: "Reabsorption",
    subject: "biology",
    units: [5],
    nieSourceBook: "NIE A/L Biology Resource Book (Unit 5)",
    prohibitedTerms: ["மீளுறிஞ்சல்", "மறுஉறிஞ்சுதல்"],
    notes: "NIE term is 'மீளஅகத்துறிஞ்சல்'."
  },

  // -------------------------------------------------------------
  // 🧪 CHEMISTRY (NIE A/L Chemistry Resource Books Units 1–14)
  // -------------------------------------------------------------
  {
    canonicalTamil: "நைதரசன்",
    english: "Nitrogen",
    subject: "chemistry",
    units: [1, 2, 6, 8, 10, 14],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["நைட்ரஜன்", "நைட்ரஜனின்", "நைட்ரஜனை"],
    notes: "Strict NIE spelling is 'நைதரசன்'."
  },
  {
    canonicalTamil: "ஐதரசன்",
    english: "Hydrogen",
    subject: "chemistry",
    units: [1, 2, 4, 8, 9, 13],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["ஹைட்ரஜன்", "ஹைட்ரஜனின்", "ஹைட்ரஜனை", "ஹைட்ரஜன் பிணைப்பு"],
    notes: "Strict NIE spelling is 'ஐதரசன்'."
  },
  {
    canonicalTamil: "ஒட்சிசன்",
    english: "Oxygen",
    subject: "chemistry",
    units: [1, 2, 6, 9, 14],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["ஆக்சிஜன்", "ஆக்ஸிஜன்", "ஆக்சிஜனின்"],
    notes: "Strict NIE spelling is 'ஒட்சிசன்'."
  },
  {
    canonicalTamil: "காபனீரொட்சைட்டு",
    english: "Carbon Dioxide",
    subject: "chemistry",
    units: [3, 4, 14],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["கார்பன் டை ஆக்சைடு", "கார்பன் டை ஆக்சைட்", "கார்பனீராக்சைடு"],
    notes: "Strict NIE term is 'காபனீரொட்சைட்டு'."
  },
  {
    canonicalTamil: "காபன்",
    english: "Carbon",
    subject: "chemistry",
    units: [3, 7, 8, 9, 10],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["கார்பன்", "கார்பனின்", "கார்பனை", "கார்பன் எண்ணிக்கை"],
    notes: "Strict NIE spelling is 'காபன்'."
  },
  {
    canonicalTamil: "சாலக எந்தல்பி",
    english: "Lattice Enthalpy",
    subject: "chemistry",
    units: [5],
    nieSourceBook: "NIE A/L Chemistry Resource Book (Unit 5: Energetics)",
    prohibitedTerms: ["சாலக ஆற்றல்", "படிகக்கூடு ஆற்றல்", "சாலக எனர்ஜி"],
    notes: "Strict NIE term is 'சாலக எந்தல்பி'."
  },
  {
    canonicalTamil: "அந்திரோபி",
    english: "Entropy",
    subject: "chemistry",
    units: [5],
    nieSourceBook: "NIE A/L Chemistry Resource Book (Unit 5)",
    prohibitedTerms: ["என்ட்ரோபி", "என்ட்ரோபியின்"],
    notes: "Strict NIE spelling is 'அந்திரோபி'."
  },
  {
    canonicalTamil: "நைத்திரேற்றம்",
    english: "Nitration",
    subject: "chemistry",
    units: [8],
    nieSourceBook: "NIE A/L Chemistry Resource Book (Unit 8)",
    prohibitedTerms: ["நைட்ரோ ஏற்றம்", "நைட்ரோவாக்கம்"],
    notes: "Strict NIE term is 'நைத்திரேற்றம்'."
  },
  {
    canonicalTamil: "நைத்திரோபென்சீன்",
    english: "Nitrobenzene",
    subject: "chemistry",
    units: [8, 10],
    nieSourceBook: "NIE A/L Chemistry Resource Book (Unit 8, 10)",
    prohibitedTerms: ["நைட்ரோபென்சீன்", "நைட்ரோ பென்சீன்"],
    notes: "Strict NIE spelling is 'நைத்திரோபென்சீன்'."
  },
  {
    canonicalTamil: "பொசுபரசு / பொஸ்பேற்று",
    english: "Phosphorus / Phosphate",
    subject: "chemistry",
    units: [2, 6, 14],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["பாஸ்பரஸ்", "பாஸ்பரஸின்", "பாஸ்பேட்", "சூப்பர் பாஸ்பேட்"],
    notes: "Strict NIE spelling is 'பொசுபரசு / பொஸ்பேற்று'."
  },
  {
    canonicalTamil: "இலத்திரன் / இலத்திரன்கள்",
    english: "Electron / Electrons",
    subject: "chemistry",
    units: [1, 2, 13],
    nieSourceBook: "NIE A/L Chemistry Resource Book",
    prohibitedTerms: ["எலக்ட்ரான்", "எலக்ட்ரான்கள்", "எலக்ட்ரான்களின்"],
    notes: "Strict NIE spelling is 'இலத்திரன்'."
  },
  {
    canonicalTamil: "முக்கோண இருபிரமிட்டு",
    english: "Trigonal Bipyramidal",
    subject: "chemistry",
    units: [2],
    nieSourceBook: "NIE A/L Chemistry Resource Book (Unit 2)",
    prohibitedTerms: ["முக்கோண இருபிரமிடு", "முக்கோண பிரமிடல்"],
    notes: "Strict NIE spelling ends with 'பிரமிட்டு'."
  },

  // -------------------------------------------------------------
  // ⚛️ PHYSICS (NIE A/L Physics Resource Books Units 1–11)
  // -------------------------------------------------------------
  {
    canonicalTamil: "ஆர்முடுகல்",
    english: "Acceleration",
    subject: "physics",
    units: [2, 3, 5],
    nieSourceBook: "NIE A/L Physics Resource Book (Unit 2: Mechanics)",
    prohibitedTerms: ["முடுக்கம்", "முடுக்கத்தில்", "முடுக்கத்திற்கான", "முடுக்கமும்"],
    notes: "Sri Lankan NIE strictly uses 'ஆர்முடுகல்', never 'முடுக்கம்'."
  },
  {
    canonicalTamil: "மீடிறன்",
    english: "Frequency",
    subject: "physics",
    units: [3, 11],
    nieSourceBook: "NIE A/L Physics Resource Book (Unit 3 & 11)",
    prohibitedTerms: ["அதிர்வெண்", "அதிர்வெண்ணை", "அதிர்வெண்ணில்"],
    notes: "Sri Lankan NIE strictly uses 'மீடிறன்', never 'அதிர்வெண்'."
  },
  {
    canonicalTamil: "சடத்துவத் திருப்பம்",
    english: "Moment of Inertia",
    subject: "physics",
    units: [2],
    nieSourceBook: "NIE A/L Physics Resource Book (Unit 2)",
    prohibitedTerms: ["நிலைமத் திருப்புத்திறன்", "நிலைம திருப்பம்", "திருப்பத்திறன் மட்டும்"],
    notes: "Sri Lankan NIE strictly uses 'சடத்துவத் திருப்பம்'."
  },
  {
    canonicalTamil: "சேகரிப்பான் மின்னோட்டம் (Ic)",
    english: "Collector Current (Ic)",
    subject: "physics",
    units: [9],
    nieSourceBook: "NIE A/L Physics Resource Book (Unit 9: Electronics)",
    prohibitedTerms: ["கலெக்டர் மின்னோட்டம்", "கலெக்டருக்குப்", "கலெக்டர்"],
    notes: "In BJT transistors, Collector is 'சேகரிப்பான்', Base is 'அடி', Emitter is 'உமிழ்ப்பான்'."
  },
  {
    canonicalTamil: "வோல்ற்றளவு / வோல்ற்றளவுப் பெருக்கம்",
    english: "Voltage / Voltage Gain",
    subject: "physics",
    units: [8, 9],
    nieSourceBook: "NIE A/L Physics Resource Book (Unit 9)",
    prohibitedTerms: ["வோல்டேஜ்", "வோல்டேஜ் பெருக்கம்"],
    notes: "Sri Lankan NIE spelling is 'வோல்ற்றளவு'."
  }
];

/**
 * 🚫 COMPREHENSIVE PROHIBITED TERMS BLACKLIST FOR INSTANT SCANNING
 */
export const PROHIBITED_TERMS_BLACKLIST: Array<{
  pattern: RegExp;
  offendingTerm: string;
  mandatoryNIETerm: string;
  nieSource: string;
}> = [
  // Biology
  { pattern: /(டி\.?என்\.?ஏ\.?|டீஎன்ஏ)/, offendingTerm: "டி.என்.ஏ.", mandatoryNIETerm: "DNA", nieSource: "NIE Biology Unit 6" },
  { pattern: /(ஆர்\.?என்\.?ஏ\.?|ஆர்என்ஏ)/, offendingTerm: "ஆர்.என்.ஏ.", mandatoryNIETerm: "RNA", nieSource: "NIE Biology Unit 6" },
  { pattern: /(தாங்குருப்பி|தாங்குருப்பியை)/, offendingTerm: "தாங்குருப்பி", mandatoryNIETerm: "படிமச்சு", nieSource: "NIE Biology Unit 6" },
  { pattern: /(மெய்ப் பக்றீரியா|Eubacteria)/, offendingTerm: "மெய்ப் பக்றீரியாக்கள் (Eubacteria)", mandatoryNIETerm: "பக்றீரியாக்கள் (Bacteria / Domain Bacteria)", nieSource: "NIE Biology Unit 2" },
  { pattern: /(செல்கள்|செல்லின்|செல்களை|செல்லுக்குள்|தனி செல்|சிக்கிள் செல்)/, offendingTerm: "செல்/செல்கள்", mandatoryNIETerm: "கலம்/கலங்கள்", nieSource: "NIE Biology Unit 3" },
  { pattern: /(திசுக்கள்|திசுவின்|திசுக்களை|திசு)/, offendingTerm: "திசு", mandatoryNIETerm: "இழையம்", nieSource: "NIE Biology Unit 4" },
  { pattern: /(இரத்தக் குழு|ரத்தக் குழு|இரத்தப் பிரிவு|ரத்த பிரிவு)/, offendingTerm: "இரத்தக் குழு", mandatoryNIETerm: "குருதிப் பிரிவு", nieSource: "NIE Biology Unit 6" },
  { pattern: /(இரத்தம்|இரத்தக்|இரத்தச்|இரத்தத்)/, offendingTerm: "இரத்தம்", mandatoryNIETerm: "குருதி", nieSource: "NIE Biology Unit 5" },
  { pattern: /(சிக்கிள் செல் அனீமியா|சிக்கில் செல்|அனீமியா)/, offendingTerm: "சிக்கிள் செல் அனீமியா", mandatoryNIETerm: "அரிவாள் கலச் சோகை", nieSource: "NIE Biology Unit 6" },
  { pattern: /(டவுண் கூட்டறிகுறி|டவுண் சிண்ட்ரோம்|டவுன் சிண்ட்ரோம்|டவுண் நோய்க்கூட்டறை)/, offendingTerm: "டவுண் கூட்டறிகுறி", mandatoryNIETerm: "டவுனின் நோய்க்கூட்டறை", nieSource: "NIE Biology Unit 6" },
  { pattern: /(முக்குரோமோசோமி|டிரைசோமி|ட்ரைசோமி)/, offendingTerm: "முக்குரோமோசோமி", mandatoryNIETerm: "முந்நிறமூர்த்த நிலை (Trisomy)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(அந்திய மந்தாரை)/, offendingTerm: "அந்திய மந்தாரை", mandatoryNIETerm: "சிங்கவாய்ப் பூ (Snapdragon)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(ஆட்டோகிளேவ்|ஆட்டோக்ளேவ்)/, offendingTerm: "ஆட்டோகிளேவ்", mandatoryNIETerm: "அமுக்க அவியடுப்பு (Autoclave)", nieSource: "NIE Biology Unit 9" },
  { pattern: /(தனி செல் புரதம்)/, offendingTerm: "தனி செல் புரதம்", mandatoryNIETerm: "தனிக்கலப் புரதம் (SCP)", nieSource: "NIE Biology Unit 10" },
  { pattern: /(அண்மைச் சுருள் குழாய்|அண்மை சுருள்)/, offendingTerm: "அண்மைச் சுருள் குழாய்", mandatoryNIETerm: "அண்மை மடிந்த சிறுகுழாய் (PCT)", nieSource: "NIE Biology Unit 5" },
  { pattern: /(மீளுறிஞ்சல்)/, offendingTerm: "மீளுறிஞ்சல்", mandatoryNIETerm: "மீளஅகத்துறிஞ்சல்", nieSource: "NIE Biology Unit 5" },

  // Genetics & Evolution (Biology Unit 6)
  { pattern: /(பிற்போக்கான|பிற்போக்கு)/, offendingTerm: "பிற்போக்கான", mandatoryNIETerm: "பின்னடைவான (Recessive)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(பாய்ப்புரு|பாய்ப்புருவை|பாய்ப்புருக்கள்)/, offendingTerm: "பாய்ப்புரு", mandatoryNIETerm: "தோற்றவமைப்பு (Phenotype)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(மேலோங்கிய|மேலோங்கு)/, offendingTerm: "மேலோங்கிய", mandatoryNIETerm: "ஆட்சியுடைய (Dominant)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(அல்லெல்|அல்லெல்கள்|அல்லெலின்)/, offendingTerm: "அல்லெல்", mandatoryNIETerm: "அல்லீல் (Allele)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(வெயின்பேர்க்|வெயின்பெர்க்)/, offendingTerm: "வெயின்பேர்க்", mandatoryNIETerm: "வைன்பேக் (Weinberg)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(மரபணு|மரபணுக்கள்|மரபணுவின்)/, offendingTerm: "மரபணு", mandatoryNIETerm: "பரம்பரையலகு (Gene)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(மரபணுவாக்கம்|மரபணு அமைப்பு)/, offendingTerm: "மரபணுவாக்கம்", mandatoryNIETerm: "பிறப்புரிமையமைப்பு (Genotype)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(பாரம்பரிய|பாரம்பரியமான)/, offendingTerm: "பாரம்பரிய", mandatoryNIETerm: "பாரம்ப்பரிய (Heredity/Inheritance)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(பிறியோன் \(operon\)|ஓபரான்)/, offendingTerm: "ஓபரான் / பிறியோன் (operon)", mandatoryNIETerm: "ஒப்பரோன் (Operon)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(வெக்டர்|வெக்டர்கள்|வெக்டரின்|வெக்டர்களின்)/, offendingTerm: "வெக்டர்", mandatoryNIETerm: "காவி (Vector)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(சர்க்கரை|சர்க்கரையை)/, offendingTerm: "சர்க்கரை", mandatoryNIETerm: "வெல்லம் (Sugar)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(செய்தி ஆர்\.என்\.ஏ|செய்தி RNA)/, offendingTerm: "செய்தி ஆர்.என்.ஏ", mandatoryNIETerm: "தூது ஆர்.என்.ஏ (mRNA)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(இன்ட்ரோன்|இன்ட்ரோன்கள்|இன்ட்ரோன்களை)/, offendingTerm: "இன்ட்ரோன்", mandatoryNIETerm: "இன்றோன் (Intron)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(பாலி-A|பாலி - A|பாலி A|பாலிமரேஸ்)/, offendingTerm: "பாலி", mandatoryNIETerm: "பொலி (Poly)", nieSource: "NIE Biology Unit 6" },
  { pattern: /(தொப்பி)/, offendingTerm: "தொப்பி", mandatoryNIETerm: "மூடி (Cap)", nieSource: "NIE Biology Unit 6" },

  // Chemistry
  { pattern: /(மீத்தேன்|மீத்தேனின்|மீத்தேனை)/, offendingTerm: "மீத்தேன்", mandatoryNIETerm: "மெதேன் (Methane - CH4)", nieSource: "NIE Chemistry Unit 2 & 7" },
  { pattern: /(ஈத்தேன்|ஈத்தேனின்|ஈத்தேனை)/, offendingTerm: "ஈத்தேன்", mandatoryNIETerm: "எதேன் (Ethane - C2H6)", nieSource: "NIE Chemistry Unit 7" },
  { pattern: /(மீத்தைல்)/, offendingTerm: "மீத்தைல்", mandatoryNIETerm: "மெதில் (Methyl)", nieSource: "NIE Chemistry Unit 7" },
  { pattern: /(ஈத்தைல்)/, offendingTerm: "ஈத்தைல்", mandatoryNIETerm: "எதில் (Ethyl)", nieSource: "NIE Chemistry Unit 7" },
  { pattern: /(மீத்தனால்)/, offendingTerm: "மீத்தனால்", mandatoryNIETerm: "மெதனோல் (Methanol)", nieSource: "NIE Chemistry Unit 9" },
  { pattern: /(எத்தனால்)/, offendingTerm: "எத்தனால்", mandatoryNIETerm: "எதனோல் (Ethanol)", nieSource: "NIE Chemistry Unit 9" },
  { pattern: /(நைட்ரஜன்|நைட்ரஜனின்|நைட்ரஜனை|நைட்ரஜன் டை ஆக்சைடு)/, offendingTerm: "நைட்ரஜன்", mandatoryNIETerm: "நைதரசன்", nieSource: "NIE Chemistry Unit 1, 6, 14" },
  { pattern: /(ஹைட்ரஜன்|ஹைட்ரஜனின்|ஹைட்ரஜனை|ஹைட்ரஜன் பிணைப்பு)/, offendingTerm: "ஹைட்ரஜன்", mandatoryNIETerm: "ஐதரசன்", nieSource: "NIE Chemistry Unit 1, 2" },
  { pattern: /(ஆக்சிஜன்|ஆக்ஸிஜன்|ஆக்சிஜனின்)/, offendingTerm: "ஆக்சிஜன்", mandatoryNIETerm: "ஒட்சிசன்", nieSource: "NIE Chemistry Unit 1, 6" },
  { pattern: /(கார்பன் டை ஆக்சைடு|கார்பன் டை ஆக்சைட்)/, offendingTerm: "கார்பன் டை ஆக்சைடு", mandatoryNIETerm: "காபனீரொட்சைட்டு", nieSource: "NIE Chemistry Unit 3, 14" },
  { pattern: /(கார்பன்|கார்பனின்|கார்பனை|கார்பன் எண்ணிக்கை)/, offendingTerm: "கார்பன்", mandatoryNIETerm: "காபன்", nieSource: "NIE Chemistry Unit 7, 8" },
  { pattern: /(நைட்ரோ ஏற்றம்|நைட்ரோவாக்கம்)/, offendingTerm: "நைட்ரோ ஏற்றம்", mandatoryNIETerm: "நைத்திரேற்றம்", nieSource: "NIE Chemistry Unit 8" },
  { pattern: /(நைட்ரோபென்சீன்|நைட்ரோ பென்சீன்)/, offendingTerm: "நைட்ரோபென்சீன்", mandatoryNIETerm: "நைத்திரோபென்சீன்", nieSource: "NIE Chemistry Unit 8, 10" },
  { pattern: /(நைட்ரோனியம்)/, offendingTerm: "நைட்ரோனியம்", mandatoryNIETerm: "நைத்திரோனியம்", nieSource: "NIE Chemistry Unit 8" },
  { pattern: /(பாஸ்பரஸ்|பாஸ்பரஸின்|பாஸ்பேட்|சூப்பர் பாஸ்பேட்)/, offendingTerm: "பாஸ்பரஸ்/பாஸ்பேட்", mandatoryNIETerm: "பொசுபரசு/பொஸ்பேற்று", nieSource: "NIE Chemistry Unit 2, 6" },
  { pattern: /(எலக்ட்ரான்|எலக்ட்ரான்கள்|எலக்ட்ரான்களின்)/, offendingTerm: "எலக்ட்ரான்", mandatoryNIETerm: "இலத்திரன்", nieSource: "NIE Chemistry Unit 1, 13" },
  { pattern: /(முக்கோண இருபிரமிடு)/, offendingTerm: "முக்கோண இருபிரமிடு", mandatoryNIETerm: "முக்கோண இருபிரமிட்டு", nieSource: "NIE Chemistry Unit 2" },
  { pattern: /(அல்கைல் குளோரைடு|குளோரைடு)/, offendingTerm: "குளோரைடு", mandatoryNIETerm: "குளோரைட்டு", nieSource: "NIE Chemistry Unit 9" },
  { pattern: /(புளோரைடு)/, offendingTerm: "புளோரைடு", mandatoryNIETerm: "புளோரைட்டு", nieSource: "NIE Chemistry Unit 2" },

  // Physics
  { pattern: /(முடுக்கம்|முடுக்கத்தில்|முடுக்கத்திற்கான|முடுக்கமும்|புவியீர்ப்பு முடுக்கம்|மையநோக்கு முடுக்கம்)/, offendingTerm: "முடுக்கம்", mandatoryNIETerm: "ஆர்முடுகல்", nieSource: "NIE Physics Unit 2, 5" },
  { pattern: /(அதிர்வெண்|அதிர்வெண்ணை|அதிர்வெண்ணில்|அதிர்வெண் மட்டுமே)/, offendingTerm: "அதிர்வெண்", mandatoryNIETerm: "மீடிறன்", nieSource: "NIE Physics Unit 3, 11" },
  { pattern: /(கலெக்டர் மின்னோட்டம்|கலெக்டருக்குப்|கலெக்டர்)/, offendingTerm: "கலெக்டர்", mandatoryNIETerm: "சேகரிப்பான்", nieSource: "NIE Physics Unit 9" },
  { pattern: /(வோல்டேஜ்|வோல்டேஜ் பெருக்கம்)/, offendingTerm: "வோல்டேஜ்", mandatoryNIETerm: "வோல்ற்றளவு", nieSource: "NIE Physics Unit 9" },
  { pattern: /(நிலைமத் திருப்புத்திறன்|நிலைம திருப்பம்)/, offendingTerm: "நிலைமத் திருப்புத்திறன்", mandatoryNIETerm: "சடத்துவத் திருப்பம்", nieSource: "NIE Physics Unit 2" }
];

/**
 * 🛡️ VALIDATE ANY TEXT AGAINST NIE BLACKLIST
 */
export function scanTextForNonNIETerms(text: string, location: 'question' | 'option' | 'rationale' | 'unitName' = 'question', subject: string = 'all', unitId?: number): TermViolation[] {
  const violations: TermViolation[] = [];
  if (!text) return violations;

  for (const rule of PROHIBITED_TERMS_BLACKLIST) {
    if (rule.pattern.test(text)) {
      violations.push({
        offendingTerm: rule.offendingTerm,
        suggestedNIETerm: rule.mandatoryNIETerm,
        subject,
        unitId,
        location,
        nieSourceBook: rule.nieSource,
        textSnippet: text.length > 80 ? text.substring(0, 80) + '...' : text
      });
    }
  }

  return violations;
}

/**
 * 🛠️ AUTO-CORRECTION ENGINE
 * Automatically fixes Indian/prohibited terminology by replacing them with strictly verified NIE terminology.
 */
export function autoFixNIETerms(text: string): string {
  if (!text) return text;
  let fixedText = text;
  
  for (const rule of PROHIBITED_TERMS_BLACKLIST) {
    // Convert rule.pattern to a global regex to replace all occurrences in the string
    const globalRegex = new RegExp(rule.pattern.source, 'g');
    if (globalRegex.test(fixedText)) {
      // Use the pure Tamil word (strip english bracket if present, except if it's meant to be there. But let's just use the full mandatoryNIETerm to be safe and informative).
      fixedText = fixedText.replace(globalRegex, rule.mandatoryNIETerm);
    }
  }
  
  return fixedText;
}

export function autoFixQuizQuestion(q: any): any {
  if (!q) return q;
  const fixedQ = { ...q };
  if (fixedQ.question) fixedQ.question = autoFixNIETerms(fixedQ.question);
  if (fixedQ.rationale) fixedQ.rationale = autoFixNIETerms(fixedQ.rationale);
  if (Array.isArray(fixedQ.options)) {
    fixedQ.options = fixedQ.options.map((opt: string) => autoFixNIETerms(opt));
  }
  return fixedQ;
}

/**
 * 🛡️ VALIDATE A QUESTION OBJECT AGAINST NIE STANDARDS
 */
export function validateQuestionAgainstNIE(q: { question: string; options: string[]; rationale: string }, subject: string, unitId?: number): { isValid: boolean; violations: TermViolation[] } {
  const violations: TermViolation[] = [];

  violations.push(...scanTextForNonNIETerms(q.question, 'question', subject, unitId));

  if (Array.isArray(q.options)) {
    q.options.forEach((opt) => {
      violations.push(...scanTextForNonNIETerms(opt, 'option', subject, unitId));
    });
  }

  if (q.rationale) {
    violations.push(...scanTextForNonNIETerms(q.rationale, 'rationale', subject, unitId));
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}
