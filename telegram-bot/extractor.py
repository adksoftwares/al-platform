import os
import sys
import re
import subprocess
import asyncio
from telethon.sync import TelegramClient
from telethon.tl.types import DocumentAttributeFilename
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

API_ID = os.getenv("TG_API_ID")
API_HASH = os.getenv("TG_API_HASH")
PHONE = os.getenv("TG_PHONE_NUMBER")

TARGET_BOT = '@SLPHYSICALandBIO_2BOT'
BASE_DIR = r"d:\AL\subjects-materials\subjects"

SUBJECT_MAP = {
    "உயிரியல்": "biology",
    "இரசாயனவியல்": "chemistry",
    "பெளதிகவியல்": "physics",
    "இணைந்த கணிதம்": "combined maths"
}

async def click_button_by_text(client, text):
    msgs = await client.get_messages(TARGET_BOT, limit=5)
    for msg in msgs:
        if msg.reply_markup and hasattr(msg.reply_markup, 'rows'):
            for r, row in enumerate(msg.reply_markup.rows):
                for c, btn in enumerate(row.buttons):
                    if btn.text == text:
                        print(f"    [CLICKED] {text}")
                        await msg.click(r, c)
                        return True
    print(f"    [FAILED] Could not find button with exact text: '{text}'")
    # Print available buttons to help debug
    for msg in msgs:
        if msg.reply_markup and hasattr(msg.reply_markup, 'rows'):
            for row in msg.reply_markup.rows:
                for btn in row.buttons:
                    print(f"      Available: '{btn.text}'")
    return False

async def click_button_by_substring(client, substring):
    msgs = await client.get_messages(TARGET_BOT, limit=5)
    for msg in msgs:
        if msg.reply_markup and hasattr(msg.reply_markup, 'rows'):
            for r, row in enumerate(msg.reply_markup.rows):
                for c, btn in enumerate(row.buttons):
                    if substring.lower() in btn.text.lower():
                        print(f"    [CLICKED] substring '{substring}' in '{btn.text}'")
                        await msg.click(r, c)
                        return True
    print(f"    [FAILED] Could not find button with substring: '{substring}'")
    return False

async def fetch_documents_and_paginate(client, save_path, last_id):
    # Wait for bot to send all documents
    await asyncio.sleep(5)
    
    # Fetch messages since the click
    msgs = await client.get_messages(TARGET_BOT, min_id=last_id, limit=100)
    print(f"    Found {len(msgs)} messages since last_id {last_id}")
    
    # Download documents
    for nmsg in msgs:
        print(f"    Message {nmsg.id} text: {nmsg.text[:30] if nmsg.text else None}, has_document: {bool(nmsg.document)}")
        if nmsg.document:
            filename = f"file_{nmsg.id}.pdf"
            for attr in nmsg.document.attributes:
                if hasattr(attr, 'file_name'):
                    filename = attr.file_name
                    break
            filepath = os.path.join(save_path, filename)
            if not os.path.exists(filepath):
                print(f"    Downloading {filename}...")
                await client.download_media(nmsg, filepath)
            else:
                print(f"    Skipping {filename}, exists.")
                
    # Search for pagination command
    next_cmd = None
    for nmsg in msgs:
        if nmsg.text:
            match = re.search(r'Next page:\s*(/[\w_]+)', nmsg.text, re.IGNORECASE)
            if match:
                next_cmd = match.group(1)
                break
                
    if next_cmd:
        print(f"    Following pagination: {next_cmd}")
        latest = await client.get_messages(TARGET_BOT, limit=1)
        new_last_id = latest[0].id if latest else 0
        
        await client.send_message(TARGET_BOT, next_cmd)
        await fetch_documents_and_paginate(client, save_path, new_last_id)

async def navigate_to_root_and_subject(client, subj_btn):
    # Always start from clean state
    await client.send_message(TARGET_BOT, '/start')
    await asyncio.sleep(4)
    
    print("  Navigating to root...")
    await click_button_by_substring(client, "உயர்தர கணித விஞ்ஞான பிரிவு")
    await asyncio.sleep(4)
    
    print(f"  Navigating to subject: {subj_btn}...")
    await click_button_by_substring(client, subj_btn)
    await asyncio.sleep(4)

async def main():
    if not API_ID or API_ID == "YOUR_API_ID_HERE":
        print("Please set TG_API_ID in .env")
        return

    client = TelegramClient('userbot_session', int(API_ID), API_HASH)
    await client.start(phone=PHONE)
    print("Successfully logged in!")
    
    for subj_btn, subj_folder in SUBJECT_MAP.items():
        print(f"\nProcessing Subject: {subj_folder}")
        
        # 1. Model Papers
        print("  Extracting: Model Papers")
        await navigate_to_root_and_subject(client, subj_btn)
        latest = await client.get_messages(TARGET_BOT, limit=1)
        last_id = latest[0].id if latest else 0
        
        if await click_button_by_substring(client, "முன்னோடி பரீட்சை வினாத்தாள்கள்"):
            save_path = os.path.join(BASE_DIR, subj_folder, "model papers")
            os.makedirs(save_path, exist_ok=True)
            await fetch_documents_and_paginate(client, save_path, last_id)
            
        # 2. Elaborations
        print("  Extracting: Elaborations")
        await navigate_to_root_and_subject(client, subj_btn)
        latest = await client.get_messages(TARGET_BOT, limit=1)
        last_id = latest[0].id if latest else 0
        
        if await click_button_by_substring(client, "விளக்கவுரை"):
            save_path = os.path.join(BASE_DIR, subj_folder, "elaborations")
            os.makedirs(save_path, exist_ok=True)
            await fetch_documents_and_paginate(client, save_path, last_id)
            
        # 3. Past Papers
        print("  Extracting: Past Papers")
        await navigate_to_root_and_subject(client, subj_btn)
        if await click_button_by_substring(client, "கடந்தகால பரீட்சை"):
            await asyncio.sleep(4)
            latest = await client.get_messages(TARGET_BOT, limit=1)
            last_id = latest[0].id if latest else 0
            
            if await click_button_by_substring(client, "PAPERS"):
                save_path = os.path.join(BASE_DIR, subj_folder, "past papers")
                os.makedirs(save_path, exist_ok=True)
                await fetch_documents_and_paginate(client, save_path, last_id)
                
    print("\nFinished extracting all materials!")

    # Git push
    try:
        repo_dir = r"d:\AL\subjects-materials"
        subprocess.run(["git", "add", "."], cwd=repo_dir, check=True)
        status = subprocess.run(["git", "status", "--porcelain"], cwd=repo_dir, capture_output=True, text=True)
        if status.stdout.strip():
            subprocess.run(["git", "commit", "-m", "Auto-extract files from Telegram"], cwd=repo_dir, check=True)
            subprocess.run(["git", "push", "origin", "master"], cwd=repo_dir, check=True)
            print("Successfully pushed to GitHub!")
        else:
            print("No new changes to commit.")
    except Exception as e:
        print(f"Error during git operations: {e}")

if __name__ == "__main__":
    asyncio.run(main())
