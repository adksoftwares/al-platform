import os
import requests
from bs4 import BeautifulSoup
import base64
import json
import urllib.parse

# Configuration
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_OWNER = "adksoftwares"
REPO_NAME = "subjects-materials"
GITHUB_API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"

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

def upload_to_github(language, subject, filename, content_bytes):
    if not GITHUB_TOKEN:
        print("Skipping GitHub upload (No GitHub Token)")
        return False
        
    try:
        encoded_subject = urllib.parse.quote(subject)
        encoded_filename = urllib.parse.quote(filename)
        
        url = f"{GITHUB_API_BASE}/{language}/resource books/{encoded_subject}/{encoded_filename}"
        content_b64 = base64.b64encode(content_bytes).decode('utf-8')
            
        data = {
            "message": f"Add {filename} to {language} {subject} resource books",
            "content": content_b64
        }
        
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.put(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            print(f"  Successfully uploaded to {language}/resource books/{subject}/{filename}")
            return True
        elif response.status_code == 422:
            print(f"  File already exists on GitHub.")
            return True
        else:
            print(f"  GitHub Upload Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  GitHub Upload Exception: {e}")
        return False

def main():
    print("Starting NIE Resource Book scraper...")
    for language, url in LANGUAGES.items():
        print(f"\nProcessing {language} from {url}...")
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, verify=False) # nie.lk sometimes has SSL issues
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
                            
                            # Encode URL properly to handle spaces
                            encoded_full_url = urllib.parse.quote(full_url, safe=":/")
                            
                            print(f"  Downloading PDF from {encoded_full_url}...")
                            try:
                                headers = {'User-Agent': 'Mozilla/5.0'}
                                pdf_resp = requests.get(encoded_full_url, headers=headers, verify=False)
                                if pdf_resp.status_code == 200:
                                    upload_to_github(language, subject, filename, pdf_resp.content)
                                else:
                                    print(f"  Failed to download PDF, status: {pdf_resp.status_code}")
                            except Exception as e:
                                print(f"  Error downloading PDF: {e}")
                                
                        elif "fliphtml5.com" in full_url:
                            filename += '_link.txt'
                            print(f"  Handling fliphtml5 link: {full_url}")
                            content = f"Interactive Resource Book Link:\n{full_url}\n\nNote: This book is hosted on FlipHTML5 and cannot be downloaded directly as a PDF."
                            upload_to_github(language, subject, filename, content.encode('utf-8'))
                            
        except Exception as e:
            print(f"Error processing {language}: {e}")

if __name__ == '__main__':
    # Disable insecure request warnings for nie.lk
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    main()
