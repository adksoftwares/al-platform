import os
import json
import base64
import urllib.request
import urllib.parse
from telethon import TelegramClient, events
import PyPDF2
import google.generativeai as genai

# ==============================================================================
# CONFIGURATION - Set these environment variables before running!
# ==============================================================================
# Telegram API Credentials (get from https://my.telegram.org)
TG_API_ID = os.environ.get("TG_API_ID") 
TG_API_HASH = os.environ.get("TG_API_HASH")

# Other API Keys
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")

CHANNEL_USERNAME = 'SL_EDUCATION_A_L'
MESSAGES_TO_SCAN = 10000  # How many recent messages to check

REPO_OWNER = "adksoftwares"
REPO_NAME = "subjects-materials"
GITHUB_API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"

# Valid categories
SUBJECTS = ["biology", "chemistry", "physics", "combined maths"]
FOLDERS = ["elaborations", "past papers", "model papers"]

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not set.")

def analyze_pdf_content(file_path):
    """Extracts text from PDF and asks Gemini to classify it."""
    if not GEMINI_API_KEY:
        print("  Skipping AI analysis (No Gemini API Key)")
        return None, None
        
    try:
        text = ""
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            # Read first 3 pages to get enough context
            num_pages = min(3, len(reader.pages))
            for i in range(num_pages):
                text += reader.pages[i].extract_text() + "\n"
        
        if not text.strip():
            print("  PDF contains no extractable text (might be images).")
            # Try to guess from filename if text extraction fails
            filename = os.path.basename(file_path).lower()
            subject = next((s for s in SUBJECTS if s in filename), "biology")
            folder = next((f for f in FOLDERS if f.split()[0] in filename), "past papers")
            return subject, folder
            
        prompt = f"""
        Analyze the following text from an Advanced Level educational paper in Sri Lanka (likely in Sinhala).
        Determine the most appropriate 'subject' and 'folder' for it.
        
        Available Subjects: {", ".join(SUBJECTS)}
        Available Folders: {", ".join(FOLDERS)}
        
        Respond ONLY with a JSON object in this exact format:
        {{"subject": "matched_subject", "folder": "matched_folder"}}
        
        Text excerpt:
        {text[:2000]}
        """
        
        models_to_try = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"]
        last_error = None
        result = None
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                result = response.text.strip()
                break # Success!
            except Exception as e:
                last_error = e
                continue
                
        if result:
            # Strip markdown json blocks if present
            if result.startswith("```json"):
                result = result[7:-3].strip()
            elif result.startswith("```"):
                result = result[3:-3].strip()
                
            data = json.loads(result)
            
            # Validate against allowed lists
            sub = data.get("subject", "biology").lower()
            fol = data.get("folder", "past papers").lower()
            
            if sub not in SUBJECTS: sub = "biology"
            if fol not in FOLDERS: fol = "past papers"
            
            return sub, fol
        else:
            raise Exception(f"All models failed. Last error: {last_error}")
        
    except Exception as e:
        print(f"  AI Analysis failed: {e}")
        # Default fallback
        return "biology", "past papers"


def upload_to_github(local_file_path, subject, folder):
    """Uploads the local PDF to GitHub."""
    if not GITHUB_TOKEN:
        print("  Skipping GitHub upload (No GitHub Token)")
        return False
        
    try:
        filename = os.path.basename(local_file_path)
        # We enforce Sinhala language because this script scrapes a Sinhala Telegram channel
        language = "sinhala"
        
        encoded_subject = urllib.parse.quote(subject)
        encoded_folder = urllib.parse.quote(folder)
        encoded_filename = urllib.parse.quote(filename)
        
        url = f"{GITHUB_API_BASE}/{language}/subjects/{encoded_subject}/{encoded_folder}/{encoded_filename}"
        
        with open(local_file_path, "rb") as f:
            content_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        data = {
            "message": f"Add {filename} from Telegram",
            "content": content_b64
        }
        
        req = urllib.request.Request(url, method="PUT")
        req.add_header("Accept", "application/vnd.github.v3+json")
        req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode('utf-8')
        
        with urllib.request.urlopen(req) as response:
            print(f"  Successfully uploaded {filename} to {language}/subjects/{subject}/{folder}")
            return True
            
    except urllib.error.HTTPError as e:
        if e.code == 422: # Unprocessable Entity (usually means file already exists)
            print(f"  File already exists on GitHub (or invalid data).")
        else:
            print(f"  GitHub Upload HTTP Error: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"  GitHub Upload Error: {e}")
        return False

async def main():
    if not TG_API_ID or not TG_API_HASH:
        print("ERROR: Please set TG_API_ID and TG_API_HASH environment variables.")
        print("You can get these from https://my.telegram.org")
        return
        
    print(f"Connecting to Telegram...")
    # The session file will be saved as 'telethon_session.session' in the current directory
    client = TelegramClient('telethon_session', int(TG_API_ID), TG_API_HASH)
    await client.start()
    
    print(f"Connected! Scanning last {MESSAGES_TO_SCAN} messages from {CHANNEL_USERNAME}...")
    
    # Create temp directory
    os.makedirs("temp_pdfs", exist_ok=True)
    
    count = 0
    async for message in client.iter_messages(CHANNEL_USERNAME, limit=MESSAGES_TO_SCAN):
        if message.document and message.file.name and message.file.name.lower().endswith('.pdf'):
            filename = message.file.name
            print(f"\n[{count+1}] Found PDF: {filename}")
            
            local_path = os.path.join("temp_pdfs", filename)
            
            # Download file
            print(f"  Downloading...")
            await client.download_media(message.document, file=local_path)
            
            # Analyze file
            print(f"  Analyzing with Gemini AI...")
            subject, folder = analyze_pdf_content(local_path)
            
            if subject and folder:
                print(f"  AI Classified as: Subject={subject}, Folder={folder}")
                
                # Upload to GitHub
                print(f"  Uploading to GitHub...")
                upload_to_github(local_path, subject, folder)
            
            # Clean up local file
            if os.path.exists(local_path):
                os.remove(local_path)
                
            count += 1
            
    print(f"\nFinished! Processed {count} PDFs.")
    
if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
