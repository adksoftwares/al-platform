import os
import json
import re

search_terms = {
    "மீத்தேன்": "மெதேன் (Methane)",
    "ஈத்தேன்": "எதேன் (Ethane)",
    "மீத்தைல்": "மெதில் (Methyl)",
    "ஈத்தைல்": "எதில் (Ethyl)",
    "மீத்தனால்": "மெதனோல் (Methanol)",
    "எத்தனால்": "எதனோல் (Ethanol)",
    "அசிட்டிக்": "எதனோயிக்க அமிலம் / அசிற்றிக்",
    "பார்மிக்": "மெதனோயிக்க அமிலம் / போமிக்",
    "அசிட்டோன்": "புரப்பனோன் / அசிற்றோன்",
    "ஈத்தர்": "ஈதர் (Ether)",
    "ஹைட்ராக்சைடு": "ஐதரொட்சைட்டு",
    "ஹைட்ராக்சில்": "ஐதரொட்சில்",
    "குளோரைடு": "குளோரைட்டு",
    "புரோமைடு": "புரோமைட்டு",
    "அயோடைடு": "அயடைட்டு",
    "சல்பேட்டு": "சல்பேற்று",
    "நைட்ரேட்டு": "நைத்திரேற்று",
    "கார்பனேட்டு": "காபனேற்று",
    "ஹைட்ரைடு": "ஐதரைட்டு",
    "ஆக்சைடு": "ஒட்சைட்டு",
    "டைஆக்சைடு": "இருவொட்சைட்டு / ஈரொட்சைட்டு"
}

matches = []
quizpool = r"d:\AL\web\src\services\quizPool.ts"
with open(quizpool, "r", encoding="utf-8") as f:
    lines = f.readlines()

for line_idx, line in enumerate(lines):
    for bad_term, correct_nie in search_terms.items():
        if bad_term in line:
            matches.append({
                "line": line_idx + 1,
                "found": bad_term,
                "replacement": correct_nie,
                "content": line.strip()
            })

with open(r"d:\AL\web\scripts\organic_scan_results.json", "w", encoding="utf-8") as f:
    json.dump(matches, f, ensure_ascii=False, indent=2)

print(f"Deep scan complete. Found {len(matches)} organic spelling matches.")
