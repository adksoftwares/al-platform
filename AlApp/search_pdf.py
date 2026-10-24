import fitz
import sys
import re

pdf_path = r'd:\AL\subjects-materials\tamil\resource books\biology\ilovepdf_merged.pdf'

terms_to_search = [
    "பற்றீரியா",
    "கலப்பிரிவு",
    "எட்டுக்கல்லாகக்",
    "சாசினை",
    "டிப்ளோகொக்கஸ்",
    "டெட்ராட்",
    "ரெட்ரட்",
    "ஸ்டஃபைலோ கொக்கஸ்"
]

print(f"Loading {pdf_path}...")
try:
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
except Exception as e:
    print(f"Error opening PDF: {e}")
    sys.exit(1)

found_counts = {term: 0 for term in terms_to_search}
term_pages = {term: [] for term in terms_to_search}

print("Searching pages...")
for page_num in range(len(doc)):
    try:
        page = doc.load_page(page_num)
        text = page.get_text()
        if text:
            for term in terms_to_search:
                count = text.count(term)
                if count > 0:
                    found_counts[term] += count
                    term_pages[term].append(page_num + 1)
    except Exception as e:
        print(f"Error on page {page_num}: {e}")

import json
results = {}
for term in terms_to_search:
    results[term] = {
        "count": found_counts[term],
        "pages": term_pages[term][:5]
    }
with open("d:\\AL\\AlApp\\search_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved to search_results.json")
