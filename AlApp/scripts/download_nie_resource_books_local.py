import os
import requests
from bs4 import BeautifulSoup
import urllib.parse
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
REPO_DIR = r"d:\AL\subjects-materials"

LANGUAGES = {
    "english": "https://nie.lk/showom",
    "sinhala": "https://nie.lk/showom2",
    "tamil": "https://nie.lk/showom3"
}

SUBJECT_KEYWORDS = {
    "biology": ["biology", "bio", "உயிரியல்", "ජීව විද්‍යාව"],
    "chemistry": ["chemistry", "இரசாயனவியல்", "රසායන විද්‍යාව"],
    "physics": ["physics", "பௌதிகவியல்", "භෞතික විද්‍යාව"],
    "combined maths": ["math", "கணிதம்", "ගණිතය"]
}

RESOURCE_BOOK_KEYWORDS = ["resource book", "resourcebook", "சம்பத் பொத்த", "வளநூல்", "සම්පත් පොත"]

def get_subject(text):
    text_lower = text.lower()
    for subject, keywords in SUBJECT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return subject
    return None

def is_resource_book(text):
    text_lower = text.lower()
    return any(kw in text_lower for kw in RESOURCE_BOOK_KEYWORDS)

def save_to_disk(language, subject, filename, response_iter):
    try:
        dir_path = os.path.join(REPO_DIR, language, "resource books", subject)
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, filename)
        
        if os.path.exists(file_path):
            print(f"  File already exists on disk: {file_path}")
            return True
            
        with open(file_path, 'wb') as f:
            if isinstance(response_iter, bytes):
                f.write(response_iter)
            else:
                for chunk in response_iter.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
        print(f"  Successfully saved to {file_path}")
        return True
    except Exception as e:
        print(f"  Disk Save Exception: {e}")
        return False

def main():
    print("Starting NIE Resource Book scraper (Local Save Mode)...")
    for language, url in LANGUAGES.items():
        print(f"\nProcessing {language} from {url}...")
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, verify=False)
            soup = BeautifulSoup(response.content, 'html.parser')
            links = soup.find_all('a')
            
            for link in links:
                href = link.get('href')
                text = link.text.strip()
                
                if not href or not text:
                    continue
                    
                if is_resource_book(text):
                    subject = get_subject(text)
                    if subject:
                        print(f"Found {subject} resource book: {text}")
                        
                        if href.startswith('/'):
                            full_url = f"https://nie.lk{href}"
                        else:
                            full_url = href
                            
                        filename = text.replace('/', '_').replace(':', '').replace('"', '').replace('?', '').replace('\n', '').replace('\r', '')
                        
                        if full_url.endswith('.pdf'):
                            filename += '.pdf'
                            encoded_full_url = urllib.parse.quote(full_url, safe=":/")
                            print(f"  Downloading PDF from {encoded_full_url}...")
                            try:
                                headers = {'User-Agent': 'Mozilla/5.0'}
                                pdf_resp = requests.get(encoded_full_url, headers=headers, verify=False, stream=True, timeout=30)
                                if pdf_resp.status_code == 200:
                                    save_to_disk(language, subject, filename, pdf_resp)
                                else:
                                    print(f"  Failed to download PDF, status: {pdf_resp.status_code}")
                            except Exception as e:
                                print(f"  Error downloading PDF: {e}")
                                
                        elif "fliphtml5.com" in full_url:
                            filename += '_link.txt'
                            print(f"  Handling fliphtml5 link: {full_url}")
                            content = f"Interactive Resource Book Link:\n{full_url}\n\nNote: This book is hosted on FlipHTML5 and cannot be downloaded directly as a PDF."
                            save_to_disk(language, subject, filename, content.encode('utf-8'))
                            
        except Exception as e:
            print(f"Error processing {language}: {e}")

if __name__ == '__main__':
    main()
