from dotenv import load_dotenv
load_dotenv()
"""
generate_unit_quizzes.py — Daily Unit Quiz Generator from NIE Resource Book PDFs
==============================================================================
Generates unit-specific quizzes for all units of Biology (10), Chemistry (14), Physics (11)
from the official NIE A/L Resource Book PDFs and uploads to Firebase:
  unit_quizzes_v1/{language}/{subject}/unit_{unitId}/{date}

Run daily at 12 AM alongside generate_and_upload_quizzes.py (run_all_quizzes.bat)
"""
import os, sys, json, time, datetime, random, hashlib, subprocess, requests

# ── Auth ─────────────────────────────────────────────────────────────────────
FIREBASE_API_KEY = os.environ.get('FIREBASE_API_KEY', '')
EMAIL             = 'arikarran14@gmail.com'
PASSWORD = os.environ.get('FIREBASE_PASSWORD', '')
DB_URL            = 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app'

auth_res = requests.post(
    f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}',
    json={'email': EMAIL, 'password': PASSWORD, 'returnSecureToken': True}
)
if auth_res.status_code != 200:
    print("Firebase auth failed:", auth_res.text); sys.exit(1)
id_token = auth_res.json()['idToken']

# Fetch Gemini API key from DB
key_res = requests.get(f"{DB_URL}/admin_settings/gemini_api_key.json?auth={id_token}")
GEMINI_API_KEY = key_res.json()
if not GEMINI_API_KEY:
    print("Could not fetch Gemini API key"); sys.exit(1)

from google import genai
client = genai.Client(api_key=GEMINI_API_KEY)

# ── Constants ─────────────────────────────────────────────────────────────────
TODAY        = datetime.datetime.now().strftime("%Y-%m-%d")
BASE_DIR     = os.path.join(os.path.dirname(__file__), '..', '..', 'subject materials')
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
WEB_DIR      = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', 'web'))
VALIDATE_JS  = os.path.join(WEB_DIR, 'scripts', 'validate-daily-quiz.js')
MODEL        = 'gemini-2.5-flash'

# ── Unit → PDF mapping ────────────────────────────────────────────────────────
# Maps each subject unit to a keyword that identifies which PDF file(s) cover it.
# The script picks ONE PDF chapter per unit per day (rotated by date hash).
UNIT_PDF_KEYWORDS = {
    'biology': {
        1:  ['ilovepdf_merged_chapter_1', 'ilovepdf_merged_chapter_2'],
        2:  ['ilovepdf_merged_chapter_3', 'ilovepdf_merged_chapter_4'],
        3:  ['ilovepdf_merged_chapter_5', 'ilovepdf_merged_chapter_6'],
        4:  ['ilovepdf_merged_chapter_7', 'ilovepdf_merged_chapter_8'],
        5:  ['ilovepdf_merged_chapter_9', 'ilovepdf_merged_chapter_10'],
        6:  ['Unit 5 Unit 6'],   # Grade 13 Bio Unit 5 Unit 6
        7:  ['Unit 7 Unit 8'],   # Grade 13 Bio Unit 7 Unit 8
        8:  ['Unit 7 Unit 8'],
        9:  ['Unit 9 Unit 10'],  # Grade 13 Bio Unit 9 Unit 10
        10: ['Unit 9 Unit 10'],
    },
    'chemistry': {
        1:  ['General'],          # Unit 1,2,3,6 Tamil
        2:  ['General'],
        3:  ['General'],
        4:  ['Physical Chemistry - I', 'Unit 4'],
        5:  ['Physical Chemistry - I', 'Unit 5'],
        6:  ['General'],
        7:  ['Organic Chemistry'],
        8:  ['Organic Chemistry'],
        9:  ['Organic Chemistry'],
        10: ['Organic Chemistry'],
        11: ['Physical Chemistry- II'],
        12: ['Physical Chemistry- II'],
        13: ['Physical Chemistry- II'],
        14: ['Industrial'],
    },
    'physics': {
        1:  ['Unit 1 - Unit 4'],
        2:  ['Unit 1 - Unit 4'],
        3:  ['Unit 1 - Unit 4'],
        4:  ['Unit 1 - Unit 4'],
        5:  ['Unit 5-8'],
        6:  ['Unit 5-8'],
        7:  ['Unit 5-8'],
        8:  ['Unit 5-8'],
        9:  ['Unit 9'],
        10: ['Unit 10'],
        11: ['Unit 11'],
    },
}

UNIT_NAMES = {
    'biology': {
        1:'உயிரியல் அறிமுகமும் வாழ்வின் இரசாயன அடிப்படையும்',
        2:'உயிரினங்களின் கூர்ப்பும் பல்வகைமையும்',
        3:'வாழ்வின் கல அடிப்படை',
        4:'தாவர அமைப்பும் தொழிற்பாடும்',
        5:'விலங்கு அமைப்பும் தொழிற்பாடும்',
        6:'மரபியல்',
        7:'மூலக்கூற்று உயிரியலும் மீளிணைவு DNA தொழினுட்பமும்',
        8:'சூழல் உயிரியல்',
        9:'நுண்ணுயிரியல்',
        10:'பிரயோக உயிரியல்',
    },
    'chemistry': {
        1:'அணுக்கட்டமைப்பு', 2:'கட்டமைப்பும் பிணைப்பும்',
        3:'இரசாயனக் கணிப்புகள்', 4:'சடப்பொருளின் வாயு நிலை',
        5:'சக்திவியல்', 6:'s,p,d தொகுதி மூலகங்கள்',
        7:'சேதன இரசாயனம் - அடிப்படைகள்', 8:'ஐதரோகாபன்களும் ஹலோஐதரோகாபன்களும்',
        9:'ஒட்சிசன் கொண்ட சேதனச் சேர்வைகள்', 10:'நைதரசன் கொண்ட சேதனச் சேர்வைகள்',
        11:'இரசாயன இயக்கவியல்', 12:'இரசாயன சமநிலை',
        13:'மின்னிரசாயனம்', 14:'கைத்தொழில் இரசாயனமும் சூழல் மாசடைதலும்',
    },
    'physics': {
        1:'அளவீடும் அலகுகளும்', 2:'இயக்கவியல்',
        3:'அலைகளும் அலைவுகளும்', 4:'வெப்பப் பௌதிகவியல்',
        5:'ஈர்ப்புப் புலம்', 6:'நிலைமின் புலம்',
        7:'காந்தப் புலம்', 8:'மின்னோட்டம்',
        9:'இலத்திரனியல்', 10:'சடப்பொருளின் பொறிமுறை இயல்புகள்',
        11:'சடப்பொருளும் கதிர்வீச்சும்',
    },
}

SUBJECT_UNIT_COUNTS = {'biology': 10, 'chemistry': 14, 'physics': 11}

def find_pdfs_for_unit(base_dir, language, subject, unit_id):
    """Find PDF files matching the unit's keywords."""
    subject_dir = os.path.join(base_dir, language.capitalize(), subject.capitalize())
    if not os.path.exists(subject_dir):
        subject_dir = os.path.join(base_dir, language, subject)
    keywords = UNIT_PDF_KEYWORDS.get(subject.lower(), {}).get(unit_id, [])
    all_pdfs = [
        os.path.join(subject_dir, f) for f in os.listdir(subject_dir)
        if f.lower().endswith('.pdf') and not f.endswith('.backup')
    ]
    matched = []
    for pdf in all_pdfs:
        for kw in keywords:
            if kw.lower() in os.path.basename(pdf).lower():
                matched.append(pdf)
                break
    if not matched:
        matched = all_pdfs  # fallback: any PDF
    return matched

def wait_for_file(client, file_id, timeout=120):
    start = time.time()
    while True:
        info = client.files.get(name=file_id)
        if info.state == 'ACTIVE': break
        if info.state == 'FAILED': raise Exception(f"File failed: {file_id}")
        if time.time() - start > timeout: raise Exception(f"Timeout: {file_id}")
        time.sleep(8)

SYSTEM_PROMPT_TAMIL = """You are a senior Sri Lankan A/L examiner and elite member of the NIE (National Institute of Education) Sri Lanka paper-setting panel.
Your ONLY job is to read the provided NIE Resource Book PDF pages and create 5 MCQ questions EXCLUSIVELY from the content in those pages.

STRICT RULES:
1. Read the PDF natively in Tamil. Extract EXACT Tamil terminology as printed in the book.
2. DO NOT use Indian/NCERT terms. Use only Sri Lankan NIE terms:
   - "ஒட்சிசன்" NOT "ஆக்ஸிஜன்"
   - "காபன்" NOT "கார்பன்"
   - "மீடிறன்" NOT "அதிர்வெண்"
   - "குருதி" NOT "இரத்தம்" or "இரத்த"
   - "ஐதரசன்" NOT "ஹைட்ரஜன்"
   - "எதனோல்" NOT "எத்தனால்"
   - "குளோரைட்டு" NOT "குளோரைடுகளை"
   - "DNA" NOT "டி.என்.ஏ." (Use English letters)
   - "RNA" NOT "ஆர்.என்.ஏ." (Use English letters)
   - "படிமச்சு" NOT "தாங்குருப்பி"
3. Every word in questions/options/rationale MUST appear in the PDF.
4. NO visual reference questions (no diagrams/tables/figures/page numbers).
5. Return ONLY a raw JSON array of exactly 5 objects. No markdown, no code blocks.
   Each object: {"question":"...","options":["A","B","C","D"],"answerIndex":0,"rationale":"..."}"""

def generate_unit_quiz(pdf_path, subject, unit_id, unit_name):
    """Upload a PDF chapter and generate 5 unit-specific NIE questions from it."""
    print(f"  Uploading {os.path.basename(pdf_path)}...")
    uploaded = client.files.upload(file=pdf_path)
    wait_for_file(client, uploaded.name)
    print(f"  File ready. Generating questions for Unit {unit_id}: {unit_name}...")

    prompt = f"""Unit: {unit_id} — {unit_name}
Subject: {subject}

{SYSTEM_PROMPT_TAMIL}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            {'file_data': {'file_uri': uploaded.uri, 'mime_type': 'application/pdf'}},
            {'text': prompt}
        ]
    )

    # Clean up file
    try: client.files.delete(name=uploaded.name)
    except: pass

    text = response.text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
    
    quiz_data = json.loads(text)
    
    print("  Running AI Auditor pass to enforce NIE Terminology...")
    auditor_prompt = f"""You are a strict Sri Lankan NIE terminology auditor.
Here is a generated MCQ JSON array:
{json.dumps(quiz_data, ensure_ascii=False)}

Your STRICT task:
1. Read the attached PDF pages carefully.
2. Verify EVERY scientific term in the JSON against the PDF.
3. If the JSON uses an Indian Tamil term, a transliteration, or an invented translation (e.g. 'டி.என்.ஏ.', 'தாங்குருப்பி', 'கார்பன்', 'ஆக்ஸிஜன்') that is NOT printed in the PDF, you MUST replace it with the EXACT term printed in the PDF (e.g., 'DNA', 'படிமச்சு', 'காபன்', 'ஒட்சிசன்').
4. If a word is written in English in the PDF (e.g. 'DNA', 'RNA'), you MUST use the English letters, NOT Tamil phonetic spelling.
5. Return ONLY the fully corrected raw JSON array of the 5 objects. No markdown formatting, no code blocks, no explanations."""
    
    try:
        auditor_response = client.models.generate_content(
            model=MODEL,
            contents=files + [auditor_prompt],
            config=types.GenerateContentConfig(temperature=0.0)
        )
        
        aud_text = auditor_response.text.strip()
        if aud_text.startswith('```'):
            aud_text = aud_text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
            
        quiz_data = json.loads(aud_text)
    except Exception as e:
        print(f"  AI Auditor pass failed, falling back to original JSON: {e}")
        
    return quiz_data

def validate_and_fix(quiz_data, filename, subject):
    """Run Node.js NIE validator + auto-fixer. Returns fixed quiz_data."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, ensure_ascii=False, indent=2)

    val_res = subprocess.run(
        ['node', VALIDATE_JS, filename, subject.lower()],
        capture_output=True, text=True, cwd=WEB_DIR, encoding='utf-8'
    )
    safe_out = (val_res.stdout or '').encode('ascii', errors='replace').decode('ascii')
    safe_err = (val_res.stderr or '').encode('ascii', errors='replace').decode('ascii')

    if val_res.returncode != 0:
        print(f"  NIE Validation FAILED:\n{safe_err}")
        raise Exception("NIE Validation Failed")
    else:
        print(f"  NIE Validation PASSED: {safe_out.strip()}")
        # Reload — auto-fixer may have rewritten the file
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)

def upload_to_firebase(quiz_data, subject, unit_id, language='tamil'):
    """Upload to Firebase: daily_quizzes_v4/unit_quizzes/{language}/{subject}/unit_{unitId}/{date}"""
    path = f"{DB_URL}/daily_quizzes_v4/unit_quizzes/{language}/{subject}/unit_{unit_id}/{TODAY}.json?auth={id_token}"
    res = requests.put(path, json=quiz_data)
    if res.status_code == 200:
        print(f"  Uploaded to Firebase: daily_quizzes_v4/unit_quizzes/{language}/{subject}/unit_{unit_id}/{TODAY}")
        return True
    else:
        print(f"  Firebase upload failed: {res.status_code} {res.text[:100]}")
        return False

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    language = 'tamil'
    subjects = ['biology', 'chemistry', 'physics']

    for subject in subjects:
        total_units = SUBJECT_UNIT_COUNTS[subject]
        print(f"\n{'='*60}")
        print(f"Subject: {subject.upper()} ({total_units} units)")
        print(f"{'='*60}")

        for unit_id in range(1, total_units + 1):
            unit_name = UNIT_NAMES[subject].get(unit_id, f'Unit {unit_id}')
            print(f"\n[Unit {unit_id}/{total_units}] {unit_name}")

            # Check if already generated for today
            check_url = f"{DB_URL}/daily_quizzes_v4/unit_quizzes/{language}/{subject}/unit_{unit_id}/{TODAY}.json?auth={id_token}"
            try:
                exist_check = requests.get(check_url).json()
                if exist_check is not None:
                    print(f"  Already exists for {TODAY}. Skipping.")
                    continue
            except:
                pass

            pdfs = find_pdfs_for_unit(BASE_DIR, language, subject, unit_id)
            if not pdfs:
                print(f"  No PDFs found for {subject} Unit {unit_id}. Skipping.")
                continue

            # Pick PDF for today (rotate daily)
            date_hash = int(hashlib.md5(f"{TODAY}{subject}{unit_id}".encode()).hexdigest(), 16)
            pdf_path = pdfs[date_hash % len(pdfs)]

            local_filename = os.path.join(SCRIPT_DIR, f"unit_quiz_{language}_{subject}_unit{unit_id}_{TODAY}.json")

            max_retries = 2
            success = False
            for attempt in range(max_retries):
                try:
                    quiz_data = generate_unit_quiz(pdf_path, subject, unit_id, unit_name)
                    quiz_data = validate_and_fix(quiz_data, local_filename, subject)
                    if upload_to_firebase(quiz_data, subject, unit_id, language):
                        success = True
                        break
                except Exception as e:
                    print(f"  Attempt {attempt+1} failed: {e}")
                    if attempt < max_retries - 1:
                        # Try a different PDF
                        pdf_path = pdfs[(date_hash + attempt + 1) % len(pdfs)]
                        print(f"  Retrying with: {os.path.basename(pdf_path)}")
                        time.sleep(5)

            if not success:
                print(f"  FAILED to generate Unit {unit_id} after {max_retries} attempts.")

            # Rate limit pause between units
            time.sleep(15)

        print(f"\n{subject.upper()} complete!")
        time.sleep(20)  # pause between subjects

    print(f"\n{'='*60}")
    print(f"All unit quizzes generated for {TODAY}!")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
