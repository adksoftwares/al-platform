import fitz # PyMuPDF
import os
import glob
import re
import json

base_dir = r"d:\AL\subject materials\Tamil"

subjects = {
    "biology": os.path.join(base_dir, "Biology"),
    "chemistry": os.path.join(base_dir, "Chemistry"),
    "physics": os.path.join(base_dir, "Physics")
}

def search_in_pdf(pdf_path, search_terms):
    results = []
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if not text:
                continue
            for term in search_terms:
                if term in text:
                    # extract context snippet
                    idx = text.find(term)
                    start = max(0, idx - 80)
                    end = min(len(text), idx + len(term) + 80)
                    snippet = text[start:end].replace('\n', ' ').strip()
                    results.append({
                        "pdf": os.path.basename(pdf_path),
                        "page": page_num + 1,
                        "term": term,
                        "snippet": snippet
                    })
        doc.close()
    except Exception as e:
        pass
    return results

def search_subject(subject_name, terms):
    subj_folder = subjects[subject_name]
    pdf_files = glob.glob(os.path.join(subj_folder, "*.pdf")) + glob.glob(os.path.join(subj_folder, "*.PDF"))
    all_matches = {}
    for term in terms:
        all_matches[term] = []
    
    for pdf in pdf_files:
        if ".backup" in pdf:
            continue
        try:
            doc = fitz.open(pdf)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if not text:
                    continue
                for term in terms:
                    if term in text:
                        idx = text.find(term)
                        start = max(0, idx - 100)
                        end = min(len(text), idx + len(term) + 100)
                        snippet = text[start:end].replace('\n', ' ').strip()
                        all_matches[term].append({
                            "pdf": os.path.basename(pdf),
                            "page": page_num + 1,
                            "snippet": snippet
                        })
            doc.close()
        except Exception as e:
            pass
    return all_matches

# Terms to verify across subjects
key_terms = {
    "biology": [
        "அரிவாள் கலச் சோகை",
        "டவுனின் நோய்க்கூட்டறை",
        "சிங்கவாய்ப் பூ",
        "அந்திரினம்",
        "அமுக்க அவியடுப்பு",
        "தனிக்கலப் புரதம்",
        "அண்மை மடிந்த சிறுகுழாய்",
        "சேய்மை மடிந்த சிறுகுழாய்",
        "சோணவறை முடிச்சு",
        "நீள்வளைய மையவிழையம்",
        "பெப்ரிடோகிளைக்கன்",
        "முளையுரு",
        "வித்தையுரு",
        "இழுவை-இணைவு-ஒட்டுவுக் கொள்கை",
        "பாய்பொருள்",
        "நீர்மக் கசிவு",
        "கால்வின் வட்டம்",
        "பக்கிற்றீன்",
        "முந்நிறமூர்த்த",
        "ஒகசாகி துண்டு",
        "முழுத்திறனாற்றல்"
    ],
    "chemistry": [
        "சாலக எந்தல்பி",
        "போர்ன்-ஹேபர்",
        "நைத்திரேற்றம்",
        "நைத்திரோபென்சீன்",
        "நைத்திரோனியம்",
        "வனேடியம் ஐந்தொட்சைட்டு",
        "ஹேபர் முறை",
        "தொடுகை முறை",
        "மென்சவ்வு கலம்",
        "லே சாட்லியர்",
        "அந்திரோபி",
        "மட்டுப்படுத்தும் தாக்கி",
        "ஈரியல்பு",
        "அசோ சாயங்கள்",
        "டயசோவாக்க",
        "லூகாஸ்",
        "டோலன்ஸ்",
        "பீனோட்சைட்டு"
    ],
    "physics": [
        "ஆர்முடுகல்",
        "மையநோக்கு ஆர்முடுகல்",
        "சடத்துவத் திருப்பம்",
        "மீடிறன்",
        "தோற்ற மீடிறன்",
        "டொப்ளர்",
        "சேகரிப்பான்",
        "உமிழ்ப்பான்",
        "வோல்ற்றளவு",
        "விடுபடு வேகம்",
        "சமவழு மேற்பரப்பு",
        "லோரென்சு விசை",
        "லென்சின் விதி",
        "சுழித் திருப்ப",
        "வீட்ஸ்டன்",
        "முற்றுவேகம்",
        "பயன் தொடக்க மீடிறன்"
    ]
}

report = {}
for subj, terms in key_terms.items():
    print(f"Scanning {subj}...")
    report[subj] = search_subject(subj, terms)

with open(r"d:\AL\web\scripts\nie_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print("Forensic scan complete. Results saved to nie_audit_results.json")
