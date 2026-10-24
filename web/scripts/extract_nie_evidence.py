import fitz
import os
import glob
import re
import json

def bamini_to_unicode(text):
    # Complete Bamini mapping
    trans = [
        ('Nfh', 'கோ'), ('nfh', 'கொ'), ('Njh', 'தோ'), ('njh', 'தொ'),
        ('Ngh', 'போ'), ('ngh', 'பொ'), ('Nkh', 'மோ'), ('nkh', 'மொ'),
        ('Nrh', 'சோ'), ('nrh', 'சொ'), ('Nth', 'வோ'), ('nth', 'வொ'),
        ('Nyh', 'லோ'), ('nyh', 'லொ'), ('Nsh', 'ளோ'), ('nsh', 'ளொ'),
        ('Nwh', 'றோ'), ('nwh', 'றொ'), ('Nzh', 'ணோ'), ('nzh', 'ணொ'),
        ('Ndh', 'னோ'), ('ndh', 'னொ'), ('Njh', 'தோ'), ('njh', 'தொ'),
        ('Nfh', 'கோ'), ('nfh', 'கொ'), ('Ngh', 'போ'), ('ngh', 'பொ'),
        ('Nf', 'கே'), ('nf', 'கெ'), ('Nj', 'தே'), ('nj', 'தெ'),
        ('Ng', 'பே'), ('ng', 'பெ'), ('Nk', 'மே'), ('nk', 'மெ'),
        ('Nr', 'சே'), ('nr', 'செ'), ('Nt', 'வே'), ('nt', 'வெ'),
        ('Ny', 'லே'), ('ny', 'லெ'), ('Ns', 'ளே'), ('ns', 'ளெ'),
        ('Nw', 'றே'), ('nw', 'றெ'), ('Nz', 'ணே'), ('nz', 'ணெ'),
        ('Nd', 'னே'), ('nd', 'னெ'), ('Nl', 'டே'), ('nl', 'டெ'),
        ('Nu', 'ரே'), ('nu', 'ரெ'), ('Na', 'யே'), ('na', 'யெ'),
        ('if', 'கை'), ('ij', 'தை'), ('ig', 'பை'), ('ik', 'மை'),
        ('ir', 'சை'), ('it', 'வை'), ('iy', 'லை'), ('is', 'ளை'),
        ('iw', 'றை'), ('iz', 'ணை'), ('id', 'னை'), ('il', 'டை'),
        ('iu', 'ரை'), ('ia', 'யை'), ('iQ', 'ஞை'),
        ('q;', 'ங்'), ('r;', 'ச்'), ('Q;', 'ஞ்'), ('l;', 'ட்'), ('z;', 'ண்'),
        ('j;', 'த்'), ('e;', 'ந்'), ('g;', 'ப்'), ('k;', 'ம்'), ('a;', 'ய்'),
        ('u;', 'ர்'), ('y;', 'ல்'), ('t;', 'வ்'), ('s;', 'ள்'), ('w;', 'ற்'),
        ('d;', 'ன்'), ('f;', 'க்'),
        ('fh', 'கா'), ('jh', 'தா'), ('gh', 'பா'), ('kh', 'மா'), ('rh', 'சா'),
        ('th', 'வா'), ('yh', 'லா'), ('sh', 'ளா'), ('wh', 'றா'), ('zh', 'ணா'),
        ('dh', 'னா'), ('lh', 'டா'), ('ra', 'யா'), ('uh', 'ரா'),
        ('fp', 'கி'), ('jp', 'தி'), ('gp', 'பி'), ('kp', 'மி'), ('rp', 'சி'),
        ('tp', 'வி'), ('yp', 'லி'), ('sp', 'ளி'), ('wp', 'றி'), ('zp', 'ணி'),
        ('dp', 'னி'), ('lp', 'டி'), ('ap', 'யி'), ('up', 'ரி'),
        ('fP', 'கீ'), ('jP', 'தீ'), ('gP', 'பீ'), ('kP', 'மீ'), ('rP', 'சீ'),
        ('tP', 'வீ'), ('yP', 'லீ'), ('sP', 'ளீ'), ('wP', 'றீ'), ('zP', 'ணீ'),
        ('dP', 'னீ'), ('lP', 'டீ'), ('aP', 'யீ'), ('uP', 'ரீ'),
        ('fG', 'கு'), ('jG', 'து'), ('gG', 'பு'), ('kG', 'மு'), ('rG', 'சு'),
        ('tG', 'வு'), ('yG', 'லு'), ('sG', 'ளு'), ('wG', 'று'), ('zG', 'ணு'),
        ('dG', 'னு'), ('lG', 'டு'), ('aG', 'யு'), ('uG', 'ரு'),
        ('m', 'அ'), ('M', 'ஆ'), (',', 'இ'), ('c', 'இ'), ('C', 'ஈ'),
        ('u', 'உ'), ('U', 'ஊ'), ('v', 'எ'), ('V', 'ஏ'), ('I', 'ஐ'),
        ('x', 'ஒ'), ('X', 'ஓ'),
        ('f', 'க'), ('q', 'ங'), ('r', 'ச'), ('Q', 'ஞ'), ('l', 'ட'),
        ('z', 'ண'), ('j', 'த'), ('e', 'ந'), ('g', 'ப'), ('k', 'ம'),
        ('a', 'ய'), ('u', 'ர'), ('y', 'ல'), ('t', 'வ'), ('s', 'ள'),
        ('w', 'ற'), ('d', 'ன'), (';', '்')
    ]
    res = text
    for b, u in trans:
        res = res.replace(b, u)
    return res

evidence_list = []

# Scan Chemistry Unit 1, 2, 3, 6
chem_1_2_3_6 = r"d:\AL\subject materials\Tamil\Chemistry\Grade12- Chemistry Resource Book- General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil.pdf"
if os.path.exists(chem_1_2_3_6):
    doc = fitz.open(chem_1_2_3_6)
    for p_idx in range(len(doc)):
        raw = doc[p_idx].get_text("text")
        if not raw: continue
        dec = bamini_to_unicode(raw)
        
        # Check Unit 1 terms
        if "அணுக்கட்டமைப்பு" in dec or "mZf;fl;likg;G" in raw:
            evidence_list.append({
                "subject": "Chemistry",
                "unit": 1,
                "book": "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil",
                "page": p_idx + 1,
                "term": "அணுக்கட்டமைப்பு (Atomic Structure)",
                "source_text": dec[:120].replace('\n', ' ')
            })
        if "இலத்திரன" in dec or "இலத்திரன்" in dec:
            evidence_list.append({
                "subject": "Chemistry",
                "unit": 1,
                "book": "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil",
                "page": p_idx + 1,
                "term": "இலத்திரன் (Electron)",
                "source_text": dec[:120].replace('\n', ' ')
            })
        if "நைதரசன" in dec or "நைதரசன்" in dec or "ehjurd" in raw:
            evidence_list.append({
                "subject": "Chemistry",
                "unit": 2,
                "book": "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil",
                "page": p_idx + 1,
                "term": "நைதரசன் (Nitrogen)",
                "source_text": dec[:120].replace('\n', ' ')
            })
        if "முக்கோண" in dec or "vzy;Kf" in raw:
            evidence_list.append({
                "subject": "Chemistry",
                "unit": 2,
                "book": "Grade 12 Chemistry Resource Book - General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil",
                "page": p_idx + 1,
                "term": "முக்கோண இருபிரமிட்டு / எண்முகி (VSEPR)",
                "source_text": dec[:120].replace('\n', ' ')
            })

# Save evidence list
with open(r"d:\AL\web\scripts\extracted_evidence.json", "w", encoding="utf-8") as f:
    json.dump(evidence_list[:50], f, ensure_ascii=False, indent=2)

print(f"Extracted {len(evidence_list)} direct evidence citations!")
