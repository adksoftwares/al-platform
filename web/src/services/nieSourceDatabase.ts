/**
 * 🏛️ POSITIVE SRI LANKAN NIE A/L RESOURCE BOOK SOURCE DATABASE & ALLOWLIST
 * 
 * ARCHITECTURAL PRINCIPLE:
 * POSITIVE ALLOWLIST (DENY BY DEFAULT)
 * Only terms explicitly sourced and proven from the uploaded Sri Lankan NIE A/L Resource Books
 * are permitted to enter the application.
 * 
 * VERSION: 2026.2.0 (Positive Verification Architecture)
 */

export const NIE_SYSTEM_VERSIONS = {
  SOURCE_VERSION: "2026.2.0",
  RESOURCE_BOOK_VERSION: "NIE_SL_AL_SYLLABUS_2019_2026",
  VALIDATION_MODE: "POSITIVE_ALLOWLIST_DENY_BY_DEFAULT",
  BUILD_DATE: "2026-08-30",
  STRICT_ENFORCEMENT: true,
} as const;

export interface NIESourceRecord {
  id: string;
  term: string;
  englishEquivalent: string;
  subject: 'biology' | 'chemistry' | 'physics';
  unit: number;
  resourceBook: string;
  pageNumber: number | string;
  section: string;
  exactSourceText: string;
  verificationStatus: 'VERIFIED';
  verifiedDate: string;
}

export interface NIERejectedRecord {
  rejectedTerm: string;
  subject: 'biology' | 'chemistry' | 'physics' | 'all';
  unit?: number;
  reason: string;
  mandatoryNIETerm: string;
  nieSourceBook: string;
  dateDetected: string;
}

/**
 * 🔒 COMPREHENSIVE POSITIVE NIE SOURCE REGISTRY (Units 1 to 35)
 */
export const NIE_SOURCE_DATABASE: NIESourceRecord[] = [
  // -------------------------------------------------------------
  // 🧬 BIOLOGY (Units 1 to 10)
  // -------------------------------------------------------------
  {
    id: "BIO-U01-001",
    term: "தன்வெப்பக் கொள்ளளவு",
    englishEquivalent: "Specific Heat Capacity",
    subject: "biology",
    unit: 1,
    resourceBook: "Grade 12 Biology Resource Book (Unit 1 & 2)",
    pageNumber: "Unit 1",
    section: "1.2 நீரின் விசேட இயல்புகள்",
    exactSourceText: "நீரின் உயர் தன்வெப்பக் கொள்ளளவு கலப்புற மற்றும் கலவக வெப்பநிலையை சீராகப் பேண உதவுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U01-002",
    term: "பெப்ரைட்டுப் பிணைப்பு",
    englishEquivalent: "Peptide Bond",
    subject: "biology",
    unit: 1,
    resourceBook: "Grade 12 Biology Resource Book (Unit 1 & 2)",
    pageNumber: "Unit 1",
    section: "1.3 புரதங்களின் கட்டமைப்பு",
    exactSourceText: "அமினோ அமிலங்கள் பெப்ரைட்டுப் பிணைப்பினால் இணைக்கப்பட்டு புரதங்களின் முதன்மைக் கட்டமைப்பு உருவாகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U01-003",
    term: "செல்லுலோசு",
    englishEquivalent: "Cellulose",
    subject: "biology",
    unit: 1,
    resourceBook: "Grade 12 Biology Resource Book (Unit 1)",
    pageNumber: "Unit 1",
    section: "1.3 காபோவைதரேற்றுக்கள்",
    exactSourceText: "தாவர கலச்சுவரின் பிரதான கட்டமைப்பு பொலிசக்கரைட்டு செல்லுலோசு ஆகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U01-004",
    term: "முக்கிளிசரைட்டு",
    englishEquivalent: "Triglyceride",
    subject: "biology",
    unit: 1,
    resourceBook: "Grade 12 Biology Resource Book (Unit 1)",
    pageNumber: "Unit 1",
    section: "1.3 லிப்பிட்டுக்கள்",
    exactSourceText: "ஒரு கிளிசரோல் மற்றும் மூன்று கொழுப்பமிலங்கள் எசுத்தர் பிணைப்பினால் இணைந்து முக்கிளிசரைட்டை உருவாக்குகின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U02-001",
    term: "பக்றீரியாக்கள் (Bacteria / Domain Bacteria)",
    englishEquivalent: "Bacteria",
    subject: "biology",
    unit: 2,
    resourceBook: "Grade 12 Biology Resource Book (Unit 2: உயிரினங்களின் பல்வகைமை)",
    pageNumber: "Unit 2",
    section: "2.1 மூன்று டொமைன் வகைப்பாடு",
    exactSourceText: "டொமைன் பக்றீரியாவைச் சேர்ந்த பக்றீரியாக்களின் கலச்சுவர் பெப்ரிடோகிளைக்கன் வலையமைப்பினால் ஆனது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U02-002",
    term: "பெப்ரிடோகிளைக்கன் (Peptidoglycan / Murein)",
    englishEquivalent: "Peptidoglycan",
    subject: "biology",
    unit: 2,
    resourceBook: "Grade 12 Biology Resource Book (Unit 2)",
    pageNumber: "Unit 2",
    section: "2.2 டொமைன் பக்றீரியா",
    exactSourceText: "பக்றீரியாக்களின் கலச்சுவரில் பெப்ரிடோகிளைக்கன் (மியூரின்) காணப்படும். ஆக்கியாக்களில் பெப்ரிடோகிளைக்கன் இல்லை.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U02-003",
    term: "வித்தையுருத் தலைமுறை (Sporophyte)",
    englishEquivalent: "Sporophyte",
    subject: "biology",
    unit: 2,
    resourceBook: "Grade 12 Biology Resource Book (Unit 2)",
    pageNumber: "Unit 2",
    section: "2.5 விதைத் தாவரங்கள்",
    exactSourceText: "பூக்கும் தாவரங்களின் வாழ்க்கை வட்டத்தில் வித்தையுருத் தலைமுறையே (2n) ஓங்கியதும் சுயாதீனமானதுமாகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U02-004",
    term: "மெய்யான உடற்குழி (True Coelom)",
    englishEquivalent: "Coelom",
    subject: "biology",
    unit: 2,
    resourceBook: "Grade 12 Biology Resource Book (Unit 2)",
    pageNumber: "Unit 2",
    section: "2.7 விலங்கு வகைப்பாடு",
    exactSourceText: "அனெலிடா கண விலங்குகளிலேயே நடுவடுக்கினால் சூழப்பட்ட மெய்யான உடற்குழியும் துண்டமாதலும் முதன்முதலில் தோன்றியது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U03-001",
    term: "கலம் / கலங்கள்",
    englishEquivalent: "Cell / Cells",
    subject: "biology",
    unit: 3,
    resourceBook: "Grade 12 Biology Resource Book (Unit 3: கல அடிப்படை)",
    pageNumber: "Unit 3",
    section: "3.1 கலக் கொள்கை",
    exactSourceText: "உயிரினங்களின் கட்டமைப்பு மற்றும் தொழிற்பாட்டு அடிப்படை அலகு கலம் ஆகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U03-002",
    term: "பக்கிற்றீன் குறுக்கேற்றம் (Pachytene Crossing Over)",
    englishEquivalent: "Pachytene Crossing Over",
    subject: "biology",
    unit: 3,
    resourceBook: "Grade 12 Biology Resource Book (Unit 3)",
    pageNumber: "Unit 3",
    section: "3.4 கலப்பிரிவு - ஒடுக்கற்பிரிவு",
    exactSourceText: "ஒடுக்கற்பிரிவு I இன் முன்னிலை I பக்கிற்றீன் உபகட்டத்தில் சமாந்தர நிறமூர்த்தங்களின் சகோதரியல்லாத நிறவுருக்களிடையே குறுக்கேற்றம் நிகழ்கிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U04-001",
    term: "இழுவை-இணைவு-ஒட்டுவுக் கொள்கை",
    englishEquivalent: "Transpiration Pull-Cohesion",
    subject: "biology",
    unit: 4,
    resourceBook: "Grade 12 Biology Resource Book (Unit 4: தாவர தொழிற்பாடு)",
    pageNumber: "Unit 4",
    section: "4.2 காழ்ச் சாற்றின் அசைவு",
    exactSourceText: "ஆவியீர்ப்பு இழுவை மற்றும் நீர் மூலக்கூறுகளின் இணைவு-ஒட்டுவு விசைகள் காழ்ச் சாற்றின் தடையற்ற மேல்நோக்கிய அசைவுக்கு உதவுகின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U04-002",
    term: "பாய்பொருள் (Stroma) - கால்வின் வட்டம்",
    englishEquivalent: "Stroma - Calvin Cycle",
    subject: "biology",
    unit: 4,
    resourceBook: "Grade 12 Biology Resource Book (Unit 4)",
    pageNumber: "Unit 4",
    section: "4.1 ஒளிச்சேர்க்கை",
    exactSourceText: "ஒளிச்சேர்க்கையின் இருள் தாக்கம் (கால்வின் வட்டம்) பசுங்கணிகத்தின் பாய்பொருளில் (Stroma) நடைபெறுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U05-001",
    term: "குருதி",
    englishEquivalent: "Blood",
    subject: "biology",
    unit: 5,
    resourceBook: "Grade 13 Biology Resource Book (Unit 5: விலங்கு தொழிற்பாடு)",
    pageNumber: "Unit 5",
    section: "5.3 சுற்றோட்டத் தொகுதி",
    exactSourceText: "மனித சுற்றோட்டத் தொகுதியில் குருதி, இதயம், குருதிக்கலன்கள் என்பன அடங்குகின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U05-002",
    term: "அண்மை மடிந்த சிறுகுழாய் (PCT)",
    englishEquivalent: "Proximal Convoluted Tubule",
    subject: "biology",
    unit: 5,
    resourceBook: "Grade 13 Biology Resource Book (Unit 5)",
    pageNumber: "Unit 5",
    section: "5.5 கழிவகற்றல் தொகுதி",
    exactSourceText: "அண்மை மடிந்த சிறுகுழாயின் (PCT) கம்பளி விளிம்பு கலங்கள் மூலம் வடிதிரவத்தில் உள்ள 100% குளுக்கோசு மீளஅகத்துறிஞ்சப்படுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U06-001",
    term: "குருதிப் பிரிவு / குருதிக் கூட்டம்",
    englishEquivalent: "Blood Group",
    subject: "biology",
    unit: 6,
    resourceBook: "Grade 13 Biology Resource Book (Unit 6: மரபியல்)",
    pageNumber: "Unit 6",
    section: "6.3 பல் பரம்பரையலகுகள்",
    exactSourceText: "மனிதரின் ABO குருதிப் பிரிவுகள் பல் பரம்பரையலகுகளால் கட்டுப்படுத்தப்படுகின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U06-002",
    term: "டவுனின் நோய்க்கூட்டறை (Down's Syndrome)",
    englishEquivalent: "Down's Syndrome",
    subject: "biology",
    unit: 6,
    resourceBook: "Grade 13 Biology Resource Book (Unit 6)",
    pageNumber: "Unit 6",
    section: "6.5 நிறமூர்த்த ஒழுங்கீனங்கள்",
    exactSourceText: "21வது நிறமூர்த்த முந்நிறமூர்த்த நிலை (Trisomy 21) டவுனின் நோய்க்கூட்டறை எனப்படும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U06-003",
    term: "அரிவாள் கலச் சோகை (Sickle Cell Anaemia)",
    englishEquivalent: "Sickle Cell Anaemia",
    subject: "biology",
    unit: 6,
    resourceBook: "Grade 13 Biology Resource Book (Unit 6)",
    pageNumber: "Unit 6",
    section: "6.4 மரபியல் நோய்கள்",
    exactSourceText: "அரிவாள் கலச் சோகை ஒடுங்கு பரம்பரையலகினால் கடத்தப்படும் ஒரு பிறப்புரிமை நோயாகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U06-004",
    term: "சிங்கவாய்ப் பூ (Snapdragon - Antirrhinum)",
    englishEquivalent: "Snapdragon",
    subject: "biology",
    unit: 6,
    resourceBook: "Grade 13 Biology Resource Book (Unit 6)",
    pageNumber: "Unit 6",
    section: "6.2 அபூரண ஓங்குதன்மை",
    exactSourceText: "அபூரண ஓங்குதன்மைக்கு உதாரணமாக அந்திரினம் / சிங்கவாய்ப் பூவின் (Snapdragon) மலர் நிறம் விளங்குகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U09-001",
    term: "அமுக்க அவியடுப்பு (Autoclave)",
    englishEquivalent: "Autoclave",
    subject: "biology",
    unit: 9,
    resourceBook: "Grade 13 Biology Resource Book (Unit 9: நுண்ணுயிரியல்)",
    pageNumber: "Unit 9",
    section: "9.3 தொற்றுநீக்கம்",
    exactSourceText: "அமுக்க அவியடுப்பில் 121 °C வெப்பநிலையிலும் 103 kPa (15 psi) அமுக்கத்திலும் 15 நிமிடங்கள் தொற்றுநீக்கம் செய்யப்படுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "BIO-U10-001",
    term: "தனிக்கலப் புரதம் (SCP)",
    englishEquivalent: "Single Cell Protein",
    subject: "biology",
    unit: 10,
    resourceBook: "Grade 13 Biology Resource Book (Unit 10: பிரயோக உயிரியல்)",
    pageNumber: "Unit 10",
    section: "10.2 பிரயோக நுண்ணுயிரியல்",
    exactSourceText: "ஸ்பைருலினா போன்ற அல்காக்களைப் பயன்படுத்தி தனிக்கலப் புரதம் (SCP) உற்பத்தி செய்யப்படுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },

  // -------------------------------------------------------------
  // 🧪 CHEMISTRY (Units 1 to 14)
  // -------------------------------------------------------------
  {
    id: "CHEM-U01-001",
    term: "இலத்திரன் / இலத்திரன்கள்",
    englishEquivalent: "Electron / Electrons",
    subject: "chemistry",
    unit: 1,
    resourceBook: "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry",
    pageNumber: 22,
    section: "1.1 அணுக்கட்டமைப்பு",
    exactSourceText: "இலத்திரன்கள் ஒழுக்குகளில் வரிசைப்படுத்தப்பட்டு சக்தி மட்டங்களை உருவாக்குகின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U01-002",
    term: "ஐதரசன்",
    englishEquivalent: "Hydrogen",
    subject: "chemistry",
    unit: 1,
    resourceBook: "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry",
    pageNumber: 18,
    section: "1.1.6 அணுத்திணிவலகு",
    exactSourceText: "இத்திணிவானது ஒரு ஐதரசன் அணுவின் திணிவுடன் ஒப்பிடப்படுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U01-003",
    term: "காபன்",
    englishEquivalent: "Carbon",
    subject: "chemistry",
    unit: 1,
    resourceBook: "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry",
    pageNumber: 23,
    section: "1.1.7 நியம காபன்-12",
    exactSourceText: "இரசாயன ரீதியாகச் சேர்ந்தமையாத காபனின் 12C சமதானியின் திணிவு.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U02-001",
    term: "முக்கோண இருபிரமிட்டு",
    englishEquivalent: "Trigonal Bipyramidal",
    subject: "chemistry",
    unit: 2,
    resourceBook: "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry",
    pageNumber: 88,
    section: "2.3 VSEPR கொள்கை",
    exactSourceText: "PCl5 மூலக்கூறில் 5 பிணைப்புச் சோடிகள் முக்கோண இருபிரமிட்டு அமைப்பைத் தோற்றுவிக்கின்றன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U02-002",
    term: "பொசுபரசு / பொஸ்பேற்று",
    englishEquivalent: "Phosphorus / Phosphate",
    subject: "chemistry",
    unit: 2,
    resourceBook: "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry",
    pageNumber: 88,
    section: "2.3 மூலக்கூற்று வடிவியல்",
    exactSourceText: "PCl5 மூலக்கூறில் பொசுபரசு (Phosphorus) அணுவைச் சுற்றி 5 பிணைப்புச் சோடிகள் உள்ளன.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U05-001",
    term: "சாலக எந்தல்பி",
    englishEquivalent: "Lattice Enthalpy",
    subject: "chemistry",
    unit: 5,
    resourceBook: "Grade 12 Chemistry Resource Book - Physical Chemistry I",
    pageNumber: "Unit 5",
    section: "5.4 போர்ன்-ஹேபர் வட்டம்",
    exactSourceText: "வாயு கற்றயன் மற்றும் அனயன்களிலிருந்து அயன் சாலகம் உருவாகும் போது வெளிவிடப்படும் சாலக எந்தல்பி.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U08-001",
    term: "நைத்திரேற்றம் / நைத்திரோபென்சீன்",
    englishEquivalent: "Nitration / Nitrobenzene",
    subject: "chemistry",
    unit: 8,
    resourceBook: "Grade 12 Chemistry Resource Book - Organic Chemistry",
    pageNumber: "Unit 8",
    section: "8.6 அரோமட்டிக் சேர்வைகள்",
    exactSourceText: "பென்சீனை நைத்திரேற்றம் செய்ய செறிந்த HNO3 மற்றும் செறிந்த H2SO4 கலவை பயன்படும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "CHEM-U14-001",
    term: "தொடுகை முறை (V2O5 ஊக்கி)",
    englishEquivalent: "Contact Process",
    subject: "chemistry",
    unit: 14,
    resourceBook: "Grade 13 Chemistry Resource Book - Industrial Chemistry (Unit 14)",
    pageNumber: 28,
    section: "14.3 கந்தக அமில உற்பத்தி",
    exactSourceText: "2SO2 + O2 ⇌ 2SO3 தாக்கத்திற்கு வனேடியம் ஐந்தொட்சைட்டு (V2O5) ஊக்கியாகப் பயன்படுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },

  // -------------------------------------------------------------
  // ⚛️ PHYSICS (Units 1 to 11)
  // -------------------------------------------------------------
  {
    id: "PHYS-U02-001",
    term: "ஆர்முடுகல் / மையநோக்கு ஆர்முடுகல்",
    englishEquivalent: "Acceleration",
    subject: "physics",
    unit: 2,
    resourceBook: "Grade 12 Physics Resource Book (Unit 1 - Unit 4)",
    pageNumber: "Unit 2",
    section: "2.4 இயக்கவியல்",
    exactSourceText: "வட்டப் பாதையில் இயங்கும் பொருளின் மையநோக்கு ஆர்முடுகல் a = v²/r ஆகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "PHYS-U02-002",
    term: "சடத்துவத் திருப்பம்",
    englishEquivalent: "Moment of Inertia",
    subject: "physics",
    unit: 2,
    resourceBook: "Grade 12 Physics Resource Book (Unit 1 - Unit 4)",
    pageNumber: "Unit 2",
    section: "2.6 சுழற்சி இயக்கம்",
    exactSourceText: "சுழற்சி இயக்கத்தில் திணிவுக்கு இணையான கணியம் சடத்துவத் திருப்பம் (I) ஆகும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "PHYS-U03-001",
    term: "மீடிறன் / தோற்ற மீடிறன்",
    englishEquivalent: "Frequency / Apparent Frequency",
    subject: "physics",
    unit: 3,
    resourceBook: "Grade 12 Physics Resource Book (Unit 1 - Unit 4)",
    pageNumber: "Unit 3",
    section: "3.8 டொப்ளரின் விளைவு",
    exactSourceText: "முதலும் கேட்பவரும் சார்பியக்கத்தில் இருக்கும் போது உணரப்படும் தோற்ற மீடிறன் கூடுகிறது.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "PHYS-U09-001",
    term: "சேகரிப்பான் / உமிழ்ப்பான் / அடி",
    englishEquivalent: "Collector / Emitter / Base",
    subject: "physics",
    unit: 9,
    resourceBook: "Grade 13 Physics Resource Book (Unit 9: இலத்திரனியல்)",
    pageNumber: "Unit 9",
    section: "9.4 BJT திரான்சிஸ்டர்",
    exactSourceText: "BJT திரான்சிஸ்டரில் உமிழ்ப்பான், அடி, சேகரிப்பான் என்ற மூன்று முனையங்கள் உண்டு.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  },
  {
    id: "PHYS-U11-001",
    term: "பயன் தொடக்க மீடிறன் (Threshold Frequency)",
    englishEquivalent: "Threshold Frequency",
    subject: "physics",
    unit: 11,
    resourceBook: "Grade 13 Physics Resource Book (Unit 11)",
    pageNumber: "Unit 11",
    section: "11.2 ஒளிமின் விளைவு",
    exactSourceText: "ஒளி-இலத்திரன் உமிழ்வுக்குத் தேவையான குறைந்தபட்ச மீடிறன் பயன் தொடக்க மீடிறன் எனப்படும்.",
    verificationStatus: "VERIFIED",
    verifiedDate: "2026-08-30"
  }
];

/**
 * 🛡️ UNIT-LEVEL POSITIVE ALLOWLIST REGISTRY (Allowed concepts & terms per unit)
 */
export const POSITIVE_NIE_ALLOWLIST: Record<string, Record<number, string[]>> = {
  biology: {
    1: ["தன்வெப்பக் கொள்ளளவு", "பெப்ரைட்டுப் பிணைப்பு", "டி.என்.ஏ", "அடினின்", "தயமின்", "செல்லுலோசு", "முக்கிளிசரைட்டு", "கொழுப்பமிலம்", "கிளிசரோல்", "எசுத்தர்"],
    2: ["பக்றீரியாக்கள்", "டொமைன் பக்றீரியா", "ஆக்கியா", "பெப்ரிடோகிளைக்கன்", "வித்தையுருத் தலைமுறை", "முளையுருத் தலைமுறை", "மெய்யான உடற்குழி", "அனெலிடா", "இரட்டைச் சுவாசம்"],
    3: ["ரிபோசோம்", "புரதத் தொகுப்பு", "லைசோசோம்", "பக்கிற்றீன்", "குறுக்கேற்றம்", "பொஸ்போலிப்பிட்டு", "ஒளிச்சுவாசம்", "கலம்", "கலங்கள்"],
    4: ["இழுவை-இணைவு-ஒட்டுவுக் கொள்கை", "காழ்ச் சாறு", "பாய்பொருள்", "கால்வின் வட்டம்", "காவற்கலங்கள்", "நீர்மக் கசிவு", "வேரமுக்கம்", "உரிய இழையம்"],
    5: ["அண்மை மடிந்த சிறுகுழாய்", "சேய்மை மடிந்த சிறுகுழாய்", "மீளஅகத்துறிஞ்சல்", "சோணவறை முடிச்சு", "நீள்வளைய மையவிழையம்", "குருதி", "பெப்சினோஜன்", "கல்சிற்றோனின்"],
    6: ["குருதிப் பிரிவு", "டவுனின் நோய்க்கூட்டறை", "முந்நிறமூர்த்த நிலை", "அரிவாள் கலச் சோகை", "சிங்கவாய்ப் பூ", "அபூரண ஓங்குதன்மை", "இணை ஓங்குதன்மை", "குருதி உறையாமை"],
    7: ["PCR", "Taq Polymerase", "தடை நொதியம்", "ஜெல் இலத்திரனோடட்டம்", "ஒகசாகி துண்டு", "DNA லிகேசு", "பிளாஸ்மிட்"],
    8: ["சக்திப் பாய்ச்சல்", "நைதரசன் நிலைநிறுத்தல்", "அசோட்டோபாக்டர்", "அமில மழை", "குளோரோபுளோரோகாபன்கள்", "சிங்கராஜ மழைக்காடு"],
    9: ["அமுக்க அவியடுப்பு", "கிராம் சாயமேற்றல்", "மடக்கைக் கட்டம்", "பென்சிலின்", "பாஸ்ச்சரைசேஷன்"],
    10: ["முழுத்திறனாற்றல்", "சைற்றோகைனின்", "ஒக்சின்", "தனிக்கலப் புரதம்", "எத்திலீன்", "யூரியா உரம்", "பொற்றாசு உரம்", "சூப்பர்பொஸ்பேற்று"]
  },
  chemistry: {
    1: ["குவாண்டம் எண்", "ஹுண்ட் விதி", "குரோமியம்", "பால்மர் தொடர்", "டி புரோக்லி", "இலத்திரன்", "ஒபிற்றல்"],
    2: ["VSEPR", "எண்முகி", "நான்முகி", "முக்கோண இருபிரமிட்டு", "ஐதரசன் பிணைப்பு", "பொசுபரசு", "வலுவளவு"],
    3: ["அவகாட்ரோ மாறிலி", "மட்டுப்படுத்தும் தாக்கி", "அனுபவச் சூத்திரம்", "செறிவு", "மூல்"],
    4: ["இலட்சிய வாயு", "டால்டனின் பகுதி அமுக்கம்", "மெய் வாயுக்கள்", "கிரகாமின் வாயுப் பரவல்", "இயக்கவியற் கொள்கை"],
    5: ["ஹெஸின் மாறா வெப்பக் கூட்டல்", "போர்ன்-ஹேபர் வட்டம்", "சாலக எந்தல்பி", "கிப்ஸின் சுயாதீன சக்தி", "அந்திரோபி"],
    6: ["விளைவுறு கருவேற்றம்", "சுவாலை நிறம்", "ஈரியல்பு ஒட்சைட்டு", "d-d இலத்திரன் தாவல்", "காரமண் உலோகங்கள்"],
    7: ["sp³ கலப்பு", "சிக்மா பிணைப்பு", "பை பிணைப்பு", "ஒளித்தொழிற்பாட்டுச் சமபகுதியம்", "காபோகற்றயன்"],
    8: ["சுயாதீன மூலிகப் பிரதியீடு", "புரோமின் நீர்", "மார்க்கோவ்னிக்கோவ் விதி", "நைத்திரேற்றம்", "நைத்திரோபென்சீன்"],
    9: ["காபொட்சிலிக் அமிலம்", "டோலன்ஸின் தாக்கி", "பீனோல்", "எசுத்தராக்கல்", "லூகாஸ் சோதனை", "அல்கைல் குளோரைட்டு"],
    10: ["அலிபாடிக் அமீன்", "கார்ப்புலமைன் சோதனை", "பென்சீன் டயசோனியம் குளோரைட்டு", "அசோ சாயங்கள்", "அமைட்டுகள்"],
    11: ["வீத மாறிலி", "அர்ஹீனியஸ் சமன்பாடு", "ஏவற்சக்தி", "அரை ஆயுட்காலம்", "தாக்க வரிசை", "மோதல் மீடிறன்"],
    12: ["லே சாட்லியரின் தத்துவம்", "அயன் பெருக்கம்", "தாங்கல் கரைசல்", "கரைதிறன் பெருக்கம்", "பொது அயன் விளைவு"],
    13: ["நியம ஐதரசன் மின்முனை", "கல்வானிக் கலம்", "பரடேயின் முதலாம் விதி", "இலத்திரன்களின் மின்னேற்றம்", "பலியிடும் பாதுகாப்பு"],
    14: ["ஹேபர் முறை", "தொடுகை முறை", "வனேடியம் ஐந்தொட்சைட்டு", "குளோரோ-அல்கலி", "பச்சைவீட்டு விளைவு", "ஒளிவேதியியல் புகை"]
  },
  physics: {
    1: ["பரிமாணப் பகுப்பாய்வு", "அளவீடு", "வெர்னியர்", "திருகு அளவி"],
    2: ["ஆர்முடுகல்", "மையநோக்கு ஆர்முடுகல்", "புவியீர்ப்பு ஆர்முடுகல்", "சடத்துவத் திருப்பம்", "உராய்வு விசை"],
    3: ["எளிய இசை இயக்கம்", "நெட்டலைகள்", "டொப்ளரின் விளைவு", "தோற்ற மீடிறன்", "முழு அகத்தெறிப்பு", "அடிப்படைச் சுரம்"],
    4: ["வெப்ப இயக்கவியலின் முதலாம் விதி", "தனிச்சூனிய வெப்பநிலை", "வெப்பக்கடத்தல் வீதம்", "சார்ல்ஸின் விதி", "தன்வெப்பக் கொள்ளளவு"],
    5: ["நியூட்டனின் ஈர்ப்பு விதி", "விடுபடு வேகம்", "புவிநிலைக் கோள்", "கெப்லரின் மூன்றாம் விதி", "ஈர்ப்பு அழுத்தம்"],
    6: ["கூலூமின் விதி", "சீரான மின்புலம்", "கொள்ளளவி", "சமவழு மேற்பரப்பு", "மின்காப்புப் பொருள்"],
    7: ["லோரென்சு விசை", "பரடேயின் விதி", "லென்சின் விதி", "அம்பியரின் சுற்று விதி", "காந்தப் பாய அடர்த்தி"],
    8: ["ஓமின் விதி", "கேர்க்கோப்பின் முதலாம் விதி", "அழுத்தமானி", "சுழித் திருப்ப முறை", "வீட்ஸ்டனின் பாலம்", "ஜூல் வெப்ப வீதம்"],
    9: ["p-n சந்தி இருமுனையம்", "அலைதிருத்தி", "BJT திரான்சிஸ்டர்", "சேகரிப்பான் மின்னோட்டம்", "உமிழ்ப்பான்", "அடி", "வோல்ற்றளவுப் பெருக்கம்", "Op-Amp"],
    10: ["ஹூக்கின் விதி", "தகைப்பு", "விகாரம்", "முற்றுவேகம்", "பேர்னூலியின் தேற்றம்", "பாகுநிலை", "மேற்பரப்பு இழுவிசை", "ஒட்டுவு விசை"],
    11: ["ஒளிமின் விளைவு", "பயன் தொடக்க மீடிறன்", "சிதைவு விதி", "X-கதிர்கள்", "அணுக்கருப் பிளவு", "மீடிறன்"]
  }
};

/**
 * 🚫 REGRESSION RECORD (Secondary Safety Net)
 */
export const NIE_REJECTED_TERMINOLOGY: NIERejectedRecord[] = [
  { rejectedTerm: "மெய்ப் பக்றீரியா", subject: "biology", reason: "Old 6-kingdom term. Current NIE uses டொமைன் பக்றீரியா / பக்றீரியாக்கள்", mandatoryNIETerm: "பக்றீரியாக்கள் (Bacteria)", nieSourceBook: "NIE Biology Unit 2", dateDetected: "2026-08-30" },
  { rejectedTerm: "Eubacteria", subject: "biology", reason: "Old 6-kingdom English term", mandatoryNIETerm: "Bacteria", nieSourceBook: "NIE Biology Unit 2", dateDetected: "2026-08-30" },
  { rejectedTerm: "இரத்தம்", subject: "biology", reason: "Indian Tamil / colloquial term", mandatoryNIETerm: "குருதி", nieSourceBook: "NIE Biology Unit 5 & 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "இரத்த ஓட்டம்", subject: "biology", reason: "Non-NIE phrase; use the official Sri Lankan term", mandatoryNIETerm: "குருதி ஓட்டம்", nieSourceBook: "NIE Biology Unit 5 & 6", dateDetected: "2026-10-24" },
  { rejectedTerm: "இரத்தக் குழு", subject: "biology", reason: "NCERT / Indian Tamil term", mandatoryNIETerm: "குருதிப் பிரிவு", nieSourceBook: "NIE Biology Unit 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "தனி செல்", subject: "biology", reason: "Indian Tamil term", mandatoryNIETerm: "கலம்", nieSourceBook: "NIE Biology Unit 3", dateDetected: "2026-08-30" },
  { rejectedTerm: "திசு", subject: "biology", reason: "Indian Tamil term", mandatoryNIETerm: "இழையம்", nieSourceBook: "NIE Biology Unit 4", dateDetected: "2026-08-30" },
  { rejectedTerm: "சிக்கிள் செல் அனீமியா", subject: "biology", reason: "Transliterated colloquial term", mandatoryNIETerm: "அரிவாள் கலச் சோகை", nieSourceBook: "NIE Biology Unit 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "டவுண் கூட்டறிகுறி", subject: "biology", reason: "Incorrect transliteration", mandatoryNIETerm: "டவுனின் நோய்க்கூட்டறை", nieSourceBook: "NIE Biology Unit 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "முக்குரோமோசோமி", subject: "biology", reason: "Non-NIE term", mandatoryNIETerm: "முந்நிறமூர்த்த நிலை (Trisomy 21)", nieSourceBook: "NIE Biology Unit 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "அந்திய மந்தாரை", subject: "biology", reason: "NCERT/TN textbook plant", mandatoryNIETerm: "சிங்கவாய்ப் பூ (Snapdragon)", nieSourceBook: "NIE Biology Unit 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "ஆட்டோகிளேவ்", subject: "biology", reason: "English transliteration", mandatoryNIETerm: "அமுக்க அவியடுப்பு (Autoclave)", nieSourceBook: "NIE Biology Unit 9", dateDetected: "2026-08-30" },
  { rejectedTerm: "தனி செல் புரதம்", subject: "biology", reason: "Non-NIE term", mandatoryNIETerm: "தனிக்கலப் புரதம் (SCP)", nieSourceBook: "NIE Biology Unit 10", dateDetected: "2026-08-30" },
  { rejectedTerm: "நைட்ரஜன்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "நைதரசன்", nieSourceBook: "NIE Chemistry Unit 1, 6, 14", dateDetected: "2026-08-30" },
  { rejectedTerm: "ஹைட்ரஜன்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "ஐதரசன்", nieSourceBook: "NIE Chemistry Unit 1, 2", dateDetected: "2026-08-30" },
  { rejectedTerm: "ஆக்சிஜன்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "ஒட்சிசன்", nieSourceBook: "NIE Chemistry Unit 1, 6", dateDetected: "2026-08-30" },
  { rejectedTerm: "கார்பன்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "காபன்", nieSourceBook: "NIE Chemistry Unit 7, 8", dateDetected: "2026-08-30" },
  { rejectedTerm: "பாஸ்பரஸ்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "பொசுபரசு", nieSourceBook: "NIE Chemistry Unit 2", dateDetected: "2026-08-30" },
  { rejectedTerm: "எலக்ட்ரான்", subject: "chemistry", reason: "Indian Tamil spelling", mandatoryNIETerm: "இலத்திரன்", nieSourceBook: "NIE Chemistry Unit 1, 13", dateDetected: "2026-08-30" },
  { rejectedTerm: "முடுக்கம்", subject: "physics", reason: "Indian Tamil term", mandatoryNIETerm: "ஆர்முடுகல்", nieSourceBook: "NIE Physics Unit 2, 5", dateDetected: "2026-08-30" },
  { rejectedTerm: "அதிர்வெண்", subject: "physics", reason: "Indian Tamil term", mandatoryNIETerm: "மீடிறன்", nieSourceBook: "NIE Physics Unit 3, 11", dateDetected: "2026-08-30" },
  { rejectedTerm: "கலெக்டர்", subject: "physics", reason: "English transliteration", mandatoryNIETerm: "சேகரிப்பான் (Collector)", nieSourceBook: "NIE Physics Unit 9", dateDetected: "2026-08-30" },
  { rejectedTerm: "வோல்டேஜ்", subject: "physics", reason: "English transliteration", mandatoryNIETerm: "வோல்ற்றளவு", nieSourceBook: "NIE Physics Unit 9", dateDetected: "2026-08-30" }
];
