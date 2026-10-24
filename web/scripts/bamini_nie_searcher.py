import fitz
import os
import glob
import re
import json

def convert_bamini_to_unicode(text):
    # Mapping table for Bamini to Unicode
    charmap = [
        ('Nfh', 'கோ'), ('nfh', 'கொ'), ('Njh', 'தோ'), ('njh', 'தொ'),
        ('Ngh', 'போ'), ('ngh', 'பொ'), ('Nkh', 'மோ'), ('nkh', 'மொ'),
        ('Nrh', 'சோ'), ('nrh', 'சொ'), ('Nth', 'வோ'), ('nth', 'வொ'),
        ('Nyh', 'லோ'), ('nyh', 'லொ'), ('Nsh', 'ளோ'), ('nsh', 'ளொ'),
        ('Nwh', 'றோ'), ('nwh', 'றொ'), ('Nzh', 'ணோ'), ('nzh', 'ணொ'),
        ('Ndh', 'னோ'), ('ndh', 'னொ'),
        ('Nf', 'கே'), ('nf', 'கெ'), ('Nj', 'தே'), ('nj', 'தெ'),
        ('Ng', 'பே'), ('ng', 'பெ'), ('Nk', 'மே'), ('nk', 'மெ'),
        ('Nr', 'சே'), ('nr', 'செ'), ('Nt', 'வே'), ('nt', 'வெ'),
        ('Ny', 'லே'), ('ny', 'லெ'), ('Ns', 'ளே'), ('ns', 'ளெ'),
        ('Nw', 'றே'), ('nw', 'றெ'), ('Nz', 'ணே'), ('nz', 'ணெ'),
        ('Nd', 'னே'), ('nd', 'னெ'), ('Nq', 'ஙே'), ('nq', 'ஙெ'),
        ('NQ', 'ஞே'), ('nQ', 'ஞெ'), ('Nl', 'டே'), ('nl', 'டெ'),
        ('Nu', 'ரே'), ('nu', 'ரெ'), ('Na', 'யே'), ('na', 'யெ'),
        ('if', 'கை'), ('ij', 'தை'), ('ig', 'பை'), ('ik', 'மை'),
        ('ir', 'சை'), ('it', 'வை'), ('iy', 'லை'), ('is', 'ளை'),
        ('iw', 'றை'), ('iz', 'ணை'), ('id', 'னை'), ('il', 'டை'),
        ('iu', 'ரை'), ('ia', 'யை'), ('iQ', 'ஞை'),
        ('q;', 'ங்'), ('r;', 'ச்'), ('Q;', 'ஞ்'), ('l;', 'ட்'), ('z;', 'ண்'),
        ('j;', 'த்'), ('e;', 'ந்'), ('g;', 'ப்'), ('k;', 'ம்'), ('a;', 'ய்'),
        ('u;', 'ர்'), ('y;', 'ல்'), ('t;', 'வ்'), ('s;', 'ள்'), ('w;', 'ற்'),
        ('d;', 'ன்'), ('f;', 'க்'),
        ('m', 'அ'), ('M', 'ஆ'), (',', 'இ'), ('c', 'இ'), ('C', 'ஈ'),
        ('u', 'உ'), ('U', 'ஊ'), ('v', 'எ'), ('V', 'ஏ'), ('I', 'ஐ'),
        ('x', 'ஒ'), ('X', 'ஓ'), ('xs', 'ஔ'),
        ('f', 'க'), ('q', 'ங'), ('r', 'ச'), ('Q', 'ஞ'), ('l', 'ட'),
        ('z', 'ண'), ('j', 'த'), ('e', 'ந'), ('g', 'ப'), ('k', 'ம'),
        ('a', 'ய'), ('u', 'ர'), ('y', 'ல'), ('t', 'வ'), ('s', 'ள'),
        ('w', 'ற'), ('d', 'ன'),
        ('h', 'ா'), ('p', 'ி'), ('P', 'ீ'), ('G', 'ு'), ('T', 'ூ'),
        ('N', 'ே'), ('n', 'ெ'), ('i', 'ை'), (';', '்')
    ]
    
    out = text
    for k, v in charmap:
        out = out.replace(k, v)
    return out

chem_pdf = r"d:\AL\subject materials\Tamil\Chemistry\Grade12- Chemistry Resource Book- General & Inorganic Chemistry (Unit 1, 2, 3 & 6) Tamil.pdf"
doc = fitz.open(chem_pdf)

queries = ["அணுக்கட்டமைப்பு", "இலத்திரன்", "ஒபிற்றல்", "ஹுண்ட்", "குரோமியம்", "பால்மர்", "டி புரோக்லி", "முக்கோண இருபிரமிட்டு", "எண்முகி", "அவகாட்ரோ", "மட்டுப்படுத்தும் தாக்கி", "ஈரியல்பு", "சுவாலை"]

results = []
for p in range(len(doc)):
    raw = doc[p].get_text("text")
    if not raw: continue
    decoded = convert_bamini_to_unicode(raw)
    for q in queries:
        if q in decoded:
            idx = decoded.find(q)
            snippet = decoded[max(0, idx-60):min(len(decoded), idx+len(q)+60)].replace('\n', ' ')
            results.append({
                "page": p + 1,
                "term": q,
                "snippet": snippet
            })

with open(r"d:\AL\web\scripts\bamini_decoded_chem.json", "w", encoding="utf-8") as f:
    json.dump(results[:30], f, ensure_ascii=False, indent=2)

print(f"Decoded {len(results)} matches in General & Inorganic Chemistry!")
