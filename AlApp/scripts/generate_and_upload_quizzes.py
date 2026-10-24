from dotenv import load_dotenv
load_dotenv()
import os
import argparse
import sys
import time
import json
from datetime import datetime

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Please install google-genai: pip install google-genai")
    sys.exit(1)

try:
    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import db
    FIREBASE_AVAILABLE = True
except ImportError:
    print("WARNING: firebase-admin not installed. Will output to local JSON file instead.")
    FIREBASE_AVAILABLE = False

def get_system_prompt(language):
    base_prompt = """You are a Senior Professor and an elite member of the Sri Lankan Department of Examinations (DoE) National Paper Setting Panel for the Advanced Level (A/L) Examination. Your reputation depends on creating questions that are indistinguishable from official A/L national exam papers.

Your core mission is to analyze the provided Resource Book Source Texts (spanning all units of the subject) to create a brand-new, highly standardized Daily Quiz MCQ.

[MANDATORY EVALUATION STEPS & LOGIC]
STEP 1: NATIVE LANGUAGE PROCESSING, OCR SELF-CORRECTION & VERBATIM TERMINOLOGY LOCK
- You are provided with official Resource Books for the given subject IN THE TARGET LANGUAGE. Note that the PDF may be image-based.
"""

    tamil_rules = """- OCR CORRECTION MANDATE: When your vision model performs OCR on Tamil text, it often misreads similar letters (e.g., misreading 'டெட்ராட்' as 'ரெட்ரட்', or 'கலங்களாக' as 'கல்லாக', or 'கூழ்மம்' [gel] as 'சூழ்ம'). You MUST apply your contextual intelligence as a Senior Professor to automatically detect and correct these Tamil OCR typos. DO NOT output nonsensical OCR mistakes like "எட்டுக்கல்லாகக்" or "அகரோசு சூழ்ம"; output the correct scientific term like "எட்டுக்கலங்களாக" and "அகரோசு கூழ்மம்".
- CRITICAL RULE: DO NOT TRANSLATE CONCEPTS FROM ENGLISH. You MUST read the PDFs natively in their language. For example, if the resource book uses the spelling 'ஜிபெரலின்' (Gibberellin), DO NOT output a generic dictionary translation like 'கிப்ரெலின்களை'. You MUST use the exact spelling printed in the book.
- ANTI-HALLUCINATION WARNING: DO NOT invent literal translations or mix Tamil/English for scientific terms. For example, 'Polypeptide' MUST be written as 'பல்பெப்டைட்' (never 'பல்குழைய'). 'Fibrous protein' must be the official term 'நார்ப்புரதம்' (never 'இழைபுரோட்டீன்').
- GENETICS TERMINOLOGY: Do not literally translate mutations. For example, 'Missense mutation' must be 'தவறான பிறழ்வு' (never 'தவறான அர்த்த விகாரம்'). 'Nonsense mutation' must be 'மண்டையற்ற பிறழ்வு' (never 'அர்த்தமற்ற விகாரம்'). 'Silent mutation' must be 'நிராகரிக்கப்படும் பிறழ்வு' (never 'மௌன விகாரம்'). Use 'பிறழ்வு' instead of 'விகாரம்' where appropriate as per the text.
- NO COLLOQUIAL SPELLINGS: Use strictly formal textbook spelling. For example, use 'சர்க்கரை' instead of the colloquial 'சக்கரை'.
- ABSOLUTELY NO ENGLISH TRANSLITERATIONS: Never lazily transliterate an English word into Tamil letters (e.g., writing 'புரமோட்டர்' for Promoter) if the Resource Book has a specific pure Tamil technical term for it (e.g., the book uses 'தூண்டி' for Promoter). You MUST use the EXACT Tamil term printed in the PDF.
- ABSOLUTE NO TRANSLATION MANDATE: Do not translate ANY word from English. All details and terms are already in the resource books. You MUST extract all words directly from the resource book text. If you cannot find the exact technical word in the text for a concept, you MUST OMIT the question entirely. Do not guess, invent, or synthesize translations under any circumstances."""

    sinhala_rules = """- OCR CORRECTION MANDATE: When your vision model performs OCR on Sinhala text, it often misreads similar letters. You MUST apply your contextual intelligence as a Senior Professor to automatically detect and correct these Sinhala OCR typos to the official scientific terms.
- CRITICAL RULE: DO NOT TRANSLATE CONCEPTS FROM ENGLISH. You MUST read the PDFs natively in their Sinhala language.
- ANTI-HALLUCINATION WARNING: DO NOT invent literal translations or mix Sinhala/English for scientific terms. You MUST extract the exact term printed in the book.
- NO COLLOQUIAL SPELLINGS: Use strictly formal textbook spelling.
- ABSOLUTELY NO ENGLISH TRANSLITERATIONS: Never lazily transliterate an English word into Sinhala letters if the Resource Book has a specific pure Sinhala technical term for it. You MUST use the EXACT Sinhala term printed in the PDF.
- ABSOLUTE NO TRANSLATION MANDATE: Do not translate ANY word from English. All details and terms are already in the resource books. You MUST extract all words directly from the Sinhala resource book text. If you cannot find the exact technical word in the text for a concept, you MUST OMIT the question entirely. Do not guess, invent, or synthesize translations under any circumstances."""

    english_rules = """- EXTRACTION MANDATE: Do not invent terminology. You MUST extract all words and concepts directly from the English resource book text. Use the exact technical terminology printed in the book."""

    common_end = """
- STRICT NO TRANSLATION RULE: DO NOT translate ANY word. Every single word in the question and options MUST be extracted directly from the Resource Book exactly as it is printed. If you cannot find the word in the resource book text, DO NOT use it.
- NO INTRODUCTIONS: DO NOT create any questions from the "Introduction" parts or chapters of the books. Focus exclusively on the core subject matter.
- NO TABLE QUESTIONS: DO NOT create any questions based on data inside tables. Because these are standalone single questions, picking facts from a table removes the necessary context for the student to understand what table it refers to. Omit questions based on tables entirely.
- EXACT TERMINOLOGY: You MUST extract the exact technical terminology exactly as printed in the official Resource Book texts (after fixing any OCR visual artifacts).
- WARNING: You are strictly forbidden from paraphrasing or simplifying the language.
- USER MANDATE: Check the terms properly and change the words if they are not the term word then give the quiz.

STEP 2: COMPOSING THE NEW "A/L STANDARD" QUESTION
Draft 10 brand-new, unseen MCQs that perfectly mirror the structural complexity of the national exam.
- Plausibility: Every incorrect answer must look 100% correct to a weak student, but be definitively proven wrong by exactly one or two words according to the Resource Book text.
- NO VISUAL REFERENCES: You MUST NOT include questions that reference tables, figures, diagrams, or specific page numbers. The quiz is text-only, so questions must be fully self-contained.

Return ONLY a JSON array of exactly 10 objects. Each object must have:
- "question": string (The MCQ question in the native language)
- "options": array of exactly 4 strings (The choices in the native language, exactly matching resource book terms)
- "answerIndex": integer (0 to 3) (Index of the correct choice)
- "rationale": string (Brief explanation proving why the answer is correct using exact resource book facts)

Do NOT wrap the JSON in markdown formatting or ```json blocks. Just return the raw JSON array.
"""
    lang_lower = language.lower()
    if lang_lower == 'tamil':
        return base_prompt + tamil_rules + common_end
    elif lang_lower == 'sinhala':
        return base_prompt + sinhala_rules + common_end
    else:
        return base_prompt + english_rules + common_end

def wait_for_file_processing(client, file_id, timeout_sec=120):
    print(f"Waiting for {file_id} to be processed...")
    start_time = time.time()
    while True:
        file_info = client.files.get(name=file_id)
        if file_info.state == 'ACTIVE':
            print(f"File {file_id} is ready.")
            break
        elif file_info.state == 'FAILED':
            raise Exception(f"File processing failed for {file_id}")
            
        if time.time() - start_time > timeout_sec:
            raise Exception(f"File processing timed out after {timeout_sec} seconds for {file_id}")
            
        time.sleep(10)

def find_resource_books(base_dir, language, subject):
    """Finds all resource book PDFs for a given language and subject."""
    search_dir_1 = os.path.join(base_dir, language.lower(), subject.lower(), "resource books")
    search_dir_2 = os.path.join(base_dir, language.lower(), "resource books", subject.lower())
    search_dir_3 = os.path.join(base_dir, language.lower(), subject.lower())
    
    pdfs = []
    for search_dir in [search_dir_1, search_dir_2, search_dir_3]:
        if os.path.exists(search_dir):
            for root, _, files in os.walk(search_dir):
                for f in files:
                    if f.lower().endswith('.pdf') and "99999999999" not in f and "3333333333" not in f and "4444444" not in f and "8888888" not in f:
                        pdfs.append(os.path.join(root, f))
                        
    if not pdfs:
        print(f"Warning: No PDFs found in {search_dir_1} or {search_dir_2}")
        
    return pdfs

def generate_and_upload(base_dir, language, subject, date_str, service_account_key=None, database_url=None):
    api_key = os.environ.get("GEMINI_API_KEY")
    
    import requests
    import json
    
    API_KEY = os.environ.get('FIREBASE_API_KEY', '')
    EMAIL = os.environ.get('FIREBASE_EMAIL', '')
    PASSWORD = os.environ.get('FIREBASE_PASSWORD', '')
    id_token = None
    
    if database_url:
        auth_url = f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}'
        auth_payload = {'email': EMAIL, 'password': PASSWORD, 'returnSecureToken': True}
        auth_res = requests.post(auth_url, json=auth_payload)
        if auth_res.status_code == 200:
            id_token = auth_res.json()['idToken']
            
            if not api_key:
                get_url = f"{database_url}/admin_settings/gemini_api_key.json?auth={id_token}"
                key_res = requests.get(get_url)
                if key_res.status_code == 200 and key_res.text != "null":
                    api_key = key_res.json()
    
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set and could not be fetched from DB.")
        return
        
    pdfs = find_resource_books(base_dir, language, subject)
    if not pdfs:
        print(f"No PDFs found for {subject} in {language}. Aborting.")
        return
        
    print(f"Found {len(pdfs)} PDF units for {subject} ({language}).")
    
    # Wrap PDF selection and generation in a retry loop to handle API errors (e.g. INVALID_ARGUMENT due to token limits)
    import hashlib
    import random
    
    max_retries = min(3, len(pdfs))
    success = False
    client = genai.Client(api_key=api_key)
    
    for attempt in range(max_retries):
        # Change the seed slightly for each attempt to pick a different PDF
        date_hash = int(hashlib.md5((date_str + str(attempt)).encode()).hexdigest(), 16)
        selected_pdf = pdfs[date_hash % len(pdfs)]
        safe_filename = os.path.basename(selected_pdf).encode('ascii', 'replace').decode('ascii')
        print(f"Attempt {attempt + 1}: Daily rotation selected: {safe_filename}")
        
        uploaded_files = []
        genai_files = []
        
        random.seed(date_str + subject + language + str(attempt))
        skip_percent = random.randint(10, 85)

        try:
            # Copy to a temporary ascii filename to prevent Gemini SDK ascii encoding crash on Tamil filenames
            import shutil
            temp_filename = f"temp_upload_{subject.lower()}_{attempt}.pdf"
            shutil.copy2(selected_pdf, temp_filename)
            
            # Upload ONLY the selected PDF
            print(f"Uploading {safe_filename}...")
            f = client.files.upload(file=temp_filename)
            uploaded_files.append(f.name)
            genai_files.append(f)
            wait_for_file_processing(client, f.name)
            
            if os.path.exists(temp_filename):
                try:
                    os.remove(temp_filename)
                except Exception as cleanup_err:
                    print(f"Warning: Could not remove {temp_filename}: {cleanup_err}")

            input_prompt = f"""[INPUT DATA]
- TARGET LANGUAGE: {language}
- TARGET SUBJECT/STREAM: {subject}
- QUIZ DATE: {date_str}
- INSTRUCTIONS: 
Act as a Senior {subject.capitalize()} Professor and create the quiz.
I have uploaded an official Resource Book PDF document covering specific units for {subject} in {language}.
Please read it fully. Check the terms properly and use ONLY the exact term words from this book.

- CRITICAL RULE: DO NOT TRANSLATE CONCEPTS FROM ENGLISH. You MUST read the PDFs natively in their language.
- ANTI-HALLUCINATION WARNING: DO NOT invent literal translations or mix Tamil/English for scientific terms.
- ABSOLUTELY NO INDIAN TAMIL TERMS. Sri Lankan NIE terminology is strictly enforced!
  * INCORRECT (Indian): 'ஆக்ஸிஜன்' -> CORRECT (Sri Lankan NIE): 'ஒட்சிசன்'
  * INCORRECT (Indian): 'கார்பன்' -> CORRECT (Sri Lankan NIE): 'காபன்'
  * INCORRECT (Indian): 'அதிர்வெண்' -> CORRECT (Sri Lankan NIE): 'மீடிறன்'
  * INCORRECT (Indian): 'இரத்தம்', 'இரத்த' -> CORRECT (Sri Lankan NIE): 'குருதி'
  * INCORRECT (Indian): 'ஹைட்ரஜன்' -> CORRECT (Sri Lankan NIE): 'ஐதரசன்'
  * INCORRECT (Indian): 'எத்தனால்' -> CORRECT (Sri Lankan NIE): 'எதனோல்'
  * INCORRECT (Transliteration): 'டி.என்.ஏ.' -> CORRECT (Sri Lankan NIE): 'DNA' (Write explicitly in English)
  * INCORRECT (Transliteration): 'ஆர்.என்.ஏ.' -> CORRECT (Sri Lankan NIE): 'RNA' (Write explicitly in English)
  * INCORRECT (Indian/Google): 'தாங்குருப்பி' -> CORRECT (Sri Lankan NIE): 'படிமச்சு' (Template)
- NEVER transliterate. Use the exact Tamil term printed in the PDF.

CRITICAL REQUIREMENT FOR DAILY VARIETY:
To ensure the Daily Quiz is completely different every single day, you MUST use the following random variation parameters:
1. STARTING OFFSET: Ignore the first {skip_percent}% of the document! You MUST start your fact extraction AFTER skipping the first {skip_percent}% of the pages. 
2. If you reach the end of the document, wrap around to the middle, but never use the beginning.
3. SELECTION METHOD: From your starting offset onwards, randomly jump across different sections to select 10 highly specific, obscure, and distinct facts.
4. DO NOT create questions from the introduction, syllabus, preface, or table of contents. Avoid the most obvious facts, as they were likely used in yesterday's quiz.
Ensure maximum unpredictability and variety so that today's ({date_str}) quiz is 100% unique.

Generate the 10-question Daily Quiz JSON array.
"""
            print(f"Generating MCQ for {subject} ({language}) reading 1 unit...")
            
            contents = genai_files + [input_prompt]
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=get_system_prompt(language),
                    temperature=0.7,
                    response_mime_type="application/json"
                ),
            )
            
            json_text = response.text.replace("```json", "").replace("```", "").strip()
            quiz_data = json.loads(json_text)
            
            # --- AI AUDITOR PASS ---
            print("Running AI Auditor pass to enforce NIE Terminology...")
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
                    model='gemini-2.5-flash',
                    contents=genai_files + [auditor_prompt],
                    config=types.GenerateContentConfig(temperature=0.0)
                )
                
                aud_text = auditor_response.text.strip()
                if aud_text.startswith('```'):
                    aud_text = aud_text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
                    
                quiz_data = json.loads(aud_text)
                print("AI Auditor completed successfully.")
            except Exception as e:
                print(f"AI Auditor pass failed, falling back to original JSON: {e}")
            # -----------------------
            
            if database_url and id_token:
                # 🛡️ NEW: POSITIVE NIE VALIDATION GUARD
                import subprocess
                local_filename = os.path.abspath(f"quiz_{language.lower()}_{subject.lower()}_{date_str}.json")
                with open(local_filename, 'w', encoding='utf-8') as out_f:
                    json.dump(quiz_data, out_f, ensure_ascii=False, indent=2)
                
                print("Running NIE Terminology Validator...")
                web_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web"))
                validate_cmd = ["npx.cmd", "ts-node", "scripts/fix_json_nie.ts", local_filename]
                try:
                    val_res = subprocess.run(validate_cmd, capture_output=True, text=True, cwd=web_dir, encoding='utf-8')
                    safe_stdout = (val_res.stdout or '').encode('ascii', errors='replace').decode('ascii')
                    safe_stderr = (val_res.stderr or '').encode('ascii', errors='replace').decode('ascii')
                    if val_res.returncode != 0:
                        print("Validation Failed:\n" + safe_stderr)
                        raise Exception("NIE Terminology Validation Failed. Blocked by Deny-by-Default Guard.")
                    else:
                        print("Validation Passed:\n" + safe_stdout)
                        # The Node script might have AUTO-FIXED the terms and overwritten the file.
                        with open(local_filename, 'r', encoding='utf-8') as f:
                            quiz_data = json.load(f)
                except FileNotFoundError:
                    print("Warning: Node not found, skipping validation.")
                except Exception as e:
                    raise e # Trigger the retry loop!

                print("Uploading to Firebase using REST API...")
                put_url = f"{database_url}/daily_quizzes_v4/{language.lower()}/{subject.lower()}/{date_str}.json?auth={id_token}"
                put_res = requests.put(put_url, json=quiz_data)
                if put_res.status_code == 200:
                    print(f"Successfully uploaded to Firebase at daily_quizzes_v4/{language.lower()}/{subject.lower()}/{date_str}")
                    success = True
                else:
                    print("Failed to upload to Firebase:", put_res.text)
            elif database_url and not id_token:
                print("Failed to upload to Firebase: Authentication failed previously.")
            else:
                local_filename = f"quiz_{language.lower()}_{subject.lower()}_{date_str}.json"
                with open(local_filename, 'w', encoding='utf-8') as out_f:
                    json.dump(quiz_data, out_f, ensure_ascii=False, indent=2)
                print(f"Generated JSON saved locally to {local_filename}")
                success = True

        except Exception as e:
            print(f"An error occurred during attempt {attempt + 1}: {e}")
            
        finally:
            print("Cleaning up uploaded PDFs from Gemini API...")
            for file_name in uploaded_files:
                try:
                    client.files.delete(name=file_name)
                    print(f"Deleted {file_name}")
                except Exception as e:
                    print(f"Could not delete {file_name}: {e}")
                    
        if success:
            break
            
    if not success:
        print(f"Failed to generate quiz for {subject} ({language}) after {max_retries} attempts.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate and upload Daily Quiz by reading ALL resource book units.")
    parser.add_argument("--base", type=str, default="d:\\AL\\subjects-materials", help="Base directory of subjects-materials")
    parser.add_argument("--lang", type=str, required=True, help="Target Language (e.g. Tamil)")
    parser.add_argument("--sub", type=str, required=True, help="Target Subject (e.g. Biology, Chemistry)")
    parser.add_argument("--date", type=str, default=datetime.now().strftime("%Y-%m-%d"), help="Date string (YYYY-MM-DD)")
    parser.add_argument("--key", type=str, help="Path to Firebase Service Account JSON key")
    parser.add_argument("--db", type=str, help="Firebase Database URL")
    
    args = parser.parse_args()
    generate_and_upload(args.base, args.lang, args.sub, args.date, args.key, args.db)
