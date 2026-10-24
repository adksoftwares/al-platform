from dotenv import load_dotenv
load_dotenv()
"""
Generates sample unit quizzes for all 3 subjects using Gemini and saves as JSON for NIE word checking.
"""
import os, sys, json, time, requests

sys.path.insert(0, os.path.dirname(__file__))

# --- Auth to get Gemini API key from Firebase ---
FIREBASE_API_KEY = os.environ.get('FIREBASE_API_KEY', '')
EMAIL = os.environ.get('FIREBASE_EMAIL', '')
PASSWORD = os.environ.get('FIREBASE_PASSWORD', '')
DB_URL = 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app'

auth_res = requests.post(
    f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}',
    json={'email': EMAIL, 'password': PASSWORD, 'returnSecureToken': True}
)
id_token = auth_res.json()['idToken']
key_res = requests.get(f"{DB_URL}/admin_settings/gemini_api_key.json?auth={id_token}")
GEMINI_API_KEY = key_res.json()

from google import genai

client = genai.Client(api_key=GEMINI_API_KEY)

TODAY = '2026-09-13'

UNITS = [
    {'subject': 'biology',   'unitId': 1,  'unitName': 'உயிர்வேதியியல் (Biochemistry)'},
    {'subject': 'biology',   'unitId': 6,  'unitName': 'மரபியல் (Genetics)'},
    {'subject': 'chemistry', 'unitId': 2,  'unitName': 'அணு அமைப்பு (Atomic Structure)'},
    {'subject': 'chemistry', 'unitId': 7,  'unitName': 'கரிம வேதியியல் (Organic Chemistry)'},
    {'subject': 'physics',   'unitId': 2,  'unitName': 'இயக்கவியல் (Mechanics)'},
    {'subject': 'physics',   'unitId': 9,  'unitName': 'மின்னணுவியல் (Electronics)'},
]

def generate_unit_quiz(subject, unitId, unitName):
    prompt = f"""You are a Sri Lankan A/L Tamil medium science teacher.
Generate exactly 5 MCQ questions in Tamil about "{unitName}" for Sri Lankan A/L students.
Use ONLY Sri Lankan NIE Resource Book terminology. Do NOT use Indian Tamil (NCERT) terms.
For example: use "ஆர்முடுகல்" not "முடுக்கம்", use "மீடிறன்" not "அதிர்வெண்", use "மெதேன்" not "மீத்தேன்", use "பரம்பரையலகு" not "மரபணு".
Return ONLY a raw JSON array with no markdown formatting.
Each object must have: "question" (string), "options" (array of 4 strings), "answerIndex" (0-3), "rationale" (string)."""

    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=prompt,
    )
    text = response.text.strip()
    # Strip markdown if any
    if text.startswith('```'):
        text = text.split('\n', 1)[1]
        text = text.rsplit('```', 1)[0]
    return json.loads(text)

saved_files = []
for unit in UNITS:
    subject = unit['subject']
    unitId = unit['unitId']
    unitName = unit['unitName']
    
    print(f"\nGenerating {subject} Unit {unitId} ({unitName})...")
    try:
        questions = generate_unit_quiz(subject, unitId, unitName)
        filename = os.path.join(os.path.dirname(__file__), f"quiz_unit_{subject}_unit{unitId}_{TODAY}.json")
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        print(f"  Saved: {filename} ({len(questions)} questions)")
        saved_files.append(filename)
    except Exception as e:
        print(f"  Failed: {e}")
    
    time.sleep(3)  # Rate limit pause

print("\n\nAll saved files:")
for f in saved_files:
    print(f"  {f}")
print("\nDone. Run check-quiz-words.js on these files next.")
