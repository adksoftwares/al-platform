import os
import sys
import re
import subprocess
import asyncio
from telethon.sync import TelegramClient
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

API_ID = os.getenv("TG_API_ID")
API_HASH = os.getenv("TG_API_HASH")
PHONE = os.getenv("TG_PHONE_NUMBER")

BASE_DIR = r"d:\AL\subjects-materials\subjects"

# Keywords for subjects
SUBJECTS = {
    "biology": [r"\bbio\b", r"biology", r"உயிரியல்"],
    "chemistry": [r"\bchem\b", r"chemistry", r"இரசாயனவியல்"],
    "physics": [r"\bphy\b", r"physics", r"\bp6\b", r"பெளதிகவியல்"],
    "combined maths": [r"\bmaths\b", r"combined", r"கணிதம்", r"இணைந்த கணிதம்", r"combined maths"]
}

# Keywords for categories
CATEGORIES = {
    "past papers": [r"past\s*paper", r"past\s*exam", r"கடந்தகால", r"\bpast\b"],
    "model papers": [r"model\s*paper", r"முன்னோடி", r"\bmodel\b"],
    "elaborations": [r"elaboration", r"explanation", r"விளக்கவுரை", r"விளக்கம்"]
}

def classify_document(filename, caption):
    filename = filename.lower() if filename else ""
    caption = caption.lower() if caption else ""
    
    matched_subject = None
    matched_category = None
    
    # Priority 1: Check filename for subject
    for subj, keywords in SUBJECTS.items():
        if any(re.search(kw, filename) for kw in keywords):
            matched_subject = subj
            break
            
    # Priority 2: Check caption for subject if not in filename
    if not matched_subject:
        for subj, keywords in SUBJECTS.items():
            if any(re.search(kw, caption) for kw in keywords):
                matched_subject = subj
                break

    # Same for category
    for cat, keywords in CATEGORIES.items():
        if any(re.search(kw, filename) for kw in keywords):
            matched_category = cat
            break
            
    if not matched_category:
        for cat, keywords in CATEGORIES.items():
            if any(re.search(kw, caption) for kw in keywords):
                matched_category = cat
                break
                
    return matched_subject, matched_category

async def main():
    if not API_ID or API_ID == "YOUR_API_ID_HERE":
        print("Please set TG_API_ID in .env")
        return

    client = TelegramClient('userbot_session', int(API_ID), API_HASH)
    await client.start(phone=PHONE)
    print("Successfully logged in!")
    
    dialogs = await client.get_dialogs()
    print(f"Found {len(dialogs)} dialogs (groups/channels/chats).")
    
    total_downloaded = 0
    
    for dialog in dialogs:
        print(f"\nScanning: {dialog.name}")
        try:
            # We fetch up to 10000 messages per dialog
            async for msg in client.iter_messages(dialog.id, limit=10000):
                if msg.document:
                    filename = "unknown.pdf"
                    is_pdf = False
                    for attr in msg.document.attributes:
                        if hasattr(attr, 'file_name'):
                            filename = attr.file_name
                            if filename.lower().endswith('.pdf'):
                                is_pdf = True
                            break
                    
                    if not is_pdf:
                        continue
                        
                    # We have a PDF. Let's analyze caption + filename
                    content_to_analyze = f"{filename} {msg.text if msg.text else ''}"
                    
                    subj, cat = classify_document(content_to_analyze)
                    if subj and cat:
                        print(f"  [MATCH] Found '{subj} - {cat}' -> File: {filename}")
                        save_path = os.path.join(BASE_DIR, subj, cat)
                        os.makedirs(save_path, exist_ok=True)
                        filepath = os.path.join(save_path, filename)
                        
                        if not os.path.exists(filepath):
                            print(f"    Downloading {filename} to {subj}/{cat}...")
                            await client.download_media(msg, filepath)
                            total_downloaded += 1
                        else:
                            print(f"    Skipping {filename}, already exists.")
                            
        except Exception as e:
            print(f"  [ERROR] Could not scan {dialog.name}: {e}")

    print(f"\nFinished global extraction! Total new files downloaded: {total_downloaded}")

    # Git push
    if total_downloaded > 0:
        try:
            repo_dir = r"d:\AL\subjects-materials"
            subprocess.run(["git", "add", "."], cwd=repo_dir, check=True)
            status = subprocess.run(["git", "status", "--porcelain"], cwd=repo_dir, capture_output=True, text=True)
            if status.stdout.strip():
                subprocess.run(["git", "commit", "-m", "Auto-extract files globally from all Telegram groups"], cwd=repo_dir, check=True)
                print("Successfully committed to local Git! You can manually push to GitHub if required.")
            else:
                print("No new changes to commit.")
        except Exception as e:
            print(f"Error during git operations: {e}")

if __name__ == "__main__":
    asyncio.run(main())
