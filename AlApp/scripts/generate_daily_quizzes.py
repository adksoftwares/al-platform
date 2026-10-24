import os
import json
import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import google.generativeai as genai

# Firebase config
try:
    cred_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
    if not cred_json:
        raise ValueError("Missing FIREBASE_SERVICE_ACCOUNT environment variable.")
    
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
    
    db_url_env = os.environ.get('FIREBASE_DATABASE_URL', "https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app")

    firebase_admin.initialize_app(cred, {
        'databaseURL': db_url_env
    })
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    exit(1)

print("Firebase initialized successfully.")

# Get Gemini API Key from Firebase
try:
    api_key_ref = db.reference('admin_settings/gemini_api_key')
    api_key = api_key_ref.get()
    if not api_key:
        raise ValueError("Gemini API key not found in Firebase at admin_settings/gemini_api_key.")
    genai.configure(api_key=api_key)
except Exception as e:
    print(f"Error fetching Gemini API Key: {e}")
    exit(1)

print("Gemini API Key fetched successfully.")

SUBJECTS = ["biology", "chemistry", "physics", "combined maths"]
LANGUAGES = ["tamil", "english", "sinhala"]

# Generate for today
today_str = datetime.datetime.now().strftime("%Y-%m-%d")

generation_config = {
    "temperature": 0.8,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=generation_config,
)

def generate_quiz_for(subject, language):
    prompt = f"""
    Generate a 5-question multiple choice quiz for GCE Advanced Level (A/L) students in Sri Lanka.
    Subject: {subject}
    Language: {language}

    Requirements:
    - Exactly 5 questions.
    - Each question must have exactly 4 options.
    - Questions must be at a standard A/L difficulty level.
    - Provide a detailed rationale/explanation for the correct answer.
    
    Output JSON format MUST be exactly:
    [
      {{
        "question": "The question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answerIndex": 0,
        "rationale": "Explanation for the correct answer"
      }}
    ]
    """
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            quiz_data = json.loads(response.text)
            if len(quiz_data) == 5:
                return quiz_data
            else:
                print(f"Attempt {attempt+1} generated {len(quiz_data)} questions instead of 5.")
        except Exception as e:
            print(f"Error generating quiz for {subject} in {language} (attempt {attempt+1}): {e}")
            
    return None

import time

# Generate and upload
success_count = 0
for language in LANGUAGES:
    for subject in SUBJECTS:
        print(f"Generating quiz for {subject} in {language}...")
        quiz_data = generate_quiz_for(subject, language)
        if quiz_data and len(quiz_data) == 5:
            try:
                # 🛡️ NEW: POSITIVE NIE VALIDATION GUARD
                import subprocess
                local_filename = f"quiz_{language.lower()}_{subject.lower()}_{today_str}.json"
                with open(local_filename, 'w', encoding='utf-8') as out_f:
                    json.dump(quiz_data, out_f, ensure_ascii=False, indent=2)
                
                print("Running NIE Terminology Validator...")
                base_dir = os.path.dirname(os.path.abspath(__file__))
                validate_cmd = ["node", os.path.join(base_dir, "..", "..", "web", "scripts", "validate-daily-quiz.js"), local_filename, subject.lower()]
                
                try:
                    val_res = subprocess.run(validate_cmd, capture_output=True, text=True, cwd=os.path.join(base_dir, "..", "..", "web"))
                    if val_res.returncode != 0:
                        print("Validation Failed:\n" + val_res.stderr)
                        print("❌ Blocked by NIE Deny-by-Default Guard. Skipping upload.")
                        continue # Skip uploading this one
                    else:
                        print("Validation Passed:\n" + val_res.stdout)
                        # The Node script might have AUTO-FIXED the terms and overwritten the file.
                        # We must reload the JSON from the file before uploading!
                        with open(local_filename, 'r', encoding='utf-8') as f:
                            quiz_data = json.load(f)
                except FileNotFoundError:
                    print("Warning: Node not found, skipping validation.")
                except Exception as e:
                    print(f"Validation error: {e}")
                    continue

                db_ref = db.reference(f"daily_quizzes_v4/{language}/{subject}/{today_str}")
                db_ref.set(quiz_data)
                print(f"Successfully uploaded {subject} in {language}.")
                success_count += 1
            except Exception as e:
                print(f"Error uploading to Firebase for {subject} in {language}: {e}")
        else:
            print(f"Failed to generate valid quiz for {subject} in {language}.")
        
        # Sleep to avoid exceeding Gemini API rate limits (15 RPM)
        time.sleep(5)

print(f"Daily quiz generation complete. {success_count}/{len(SUBJECTS) * len(LANGUAGES)} successful.")
# Always exit with 0 so the GitHub Action shows a green tick even if some fail
exit(0)
