import os
import asyncio
import re
import shutil
import sys
import fitz  # PyMuPDF
from telethon import TelegramClient

# Force UTF-8 encoding for standard output to prevent crash when printing emojis
sys.stdout.reconfigure(encoding='utf-8')

# Setup API credentials via user input
print('=== Telegram Channel Scraper & Language Detector ===')
API_ID = '37049993'
API_HASH = '9ec67daf4d93619636a20307592fb265'
PHONE_NUMBER = '+94777153933'
CHANNEL_USERNAME = 'SL_EDUCATION_A_L'
MESSAGE_LIMIT = 10000

# Base directory for the repository
BASE_REPO_DIR = r'd:\AL\subjects-materials'
TEMP_DIR = os.path.join(BASE_REPO_DIR, 'temp_downloads')

def categorize_message(text):
    text_lower = text.lower() if text else ''
    
    subject = 'uncategorized'
    if any(x in text_lower for x in ['biology', '#biology', 'bio']):
        subject = 'biology'
    elif any(x in text_lower for x in ['chemistry', '#chemistry', 'chem']):
        subject = 'chemistry'
    elif any(x in text_lower for x in ['physics', '#physics', 'phy']):
        subject = 'physics'
    elif any(x in text_lower for x in ['maths', '#combined_maths', 'combined maths', 'combined mathematics']):
        subject = 'combined maths'
    
    doc_type = 'model papers' # Default to model papers if unsure
    if any(x in text_lower for x in ['past paper', 'past', '#past_paper']):
        doc_type = 'past papers'
    elif any(x in text_lower for x in ['model paper', 'model', '#model_paper']):
        doc_type = 'model papers'
    elif any(x in text_lower for x in ['resource', 'book']):
        doc_type = 'resource books'
    
    return subject, doc_type

def detect_language_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ''
        for page_num in range(min(3, len(doc))):
            page = doc.load_page(page_num)
            text += page.get_text('text')
        doc.close()
        
        sinhala_count = len(re.findall(r'[\u0D80-\u0DFF]', text))
        tamil_count = len(re.findall(r'[\u0B80-\u0BFF]', text))
        
        if sinhala_count > 20 and sinhala_count > tamil_count:
            return 'sinhala'
        elif tamil_count > 20 and tamil_count > sinhala_count:
            return 'tamil'
        else:
            return 'english'
            
    except Exception as e:
        print(f'Error reading PDF {pdf_path}: {e}')
        return 'english'

async def main():
    if not API_ID or not API_HASH:
        print('API ID and API HASH are required. Exiting...')
        return
    
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    print(f'\nLogging into Telegram...')
    client = TelegramClient('session_scraper', int(API_ID), API_HASH)
    await client.start(phone=PHONE_NUMBER)
    
    from telethon.tl.types import InputMessagesFilterDocument
    print(f'Fetching messages from @{CHANNEL_USERNAME} via streaming to save time...')
    
    doc_count = 0
    download_count = 0
    async for message in client.iter_messages(CHANNEL_USERNAME, limit=MESSAGE_LIMIT, filter=InputMessagesFilterDocument):
        doc_count += 1
        
        with open('progress.txt', 'w') as f:
            f.write(f'Processed {doc_count} docs...')
            
        if message.document and message.file and message.file.ext == '.pdf':
            subject, doc_type = categorize_message(message.text)
            
            file_name = message.file.name or f'document_{message.id}.pdf'
            file_name = re.sub(r'[\\/*?:"<>|]', '', file_name)
            
            temp_path = os.path.join(TEMP_DIR, file_name)
            
            size_mb = message.document.size / (1024*1024)
            print(f'Found: {file_name} (Size: {size_mb:.2f} MB)')
            
            if size_mb > 15.0:
                print(f'Skipped {file_name}: File is too large (>15MB).')
                continue
            try:
                await asyncio.wait_for(
                    client.download_media(message.document, file=temp_path),
                    timeout=30.0
                )
                
                medium = detect_language_from_pdf(temp_path)
                
                target_dir = os.path.join(BASE_REPO_DIR, medium, subject, doc_type)
                os.makedirs(target_dir, exist_ok=True)
                target_path = os.path.join(target_dir, file_name)
                
                if not os.path.exists(target_path):
                    shutil.move(temp_path, target_path)
                    print(f' -> Moved to: {medium}/{subject}/{doc_type}/')
                    download_count += 1
                else:
                    print(f' -> File already exists in {medium}/{subject}/{doc_type}/. Skipping.')
                    os.remove(temp_path)
                    
            except asyncio.TimeoutError:
                print(f'Skipped {file_name}: Download timed out after 30 seconds.')
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception as e:
                print(f'Failed to process {file_name}: {e}')
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                
    print(f'\nDone! Successfully downloaded and categorized {download_count} new PDF files.')
    with open('progress.txt', 'w') as f:
        f.write('100.00%')
    
    if os.path.exists(TEMP_DIR) and not os.listdir(TEMP_DIR):
        os.rmdir(TEMP_DIR)

if __name__ == '__main__':
    asyncio.run(main())
