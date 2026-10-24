import re
import json

nie_replacements = [
    (r"மீத்தேன்", "மெதேன்"),
    (r"ஈத்தேன்", "எதேன்"),
    (r"மீத்தைல்", "மெதில்"),
    (r"ஈத்தைல்", "எதில்"),
    (r"மீத்தனால்", "மெதனோல்"),
    (r"எத்தனால்", "எதனோல்"),
    (r"புளோரைடு", "புளோரைட்டு"),
    (r"குளோரைடு", "குளோரைட்டு"),
    (r"புரோமைடு", "புரோமைட்டு"),
    (r"அயோடைடு", "அயடைட்டு"),
    (r"ஹைட்ரைடு", "ஐதரைட்டு"),
    (r"ஆக்சைடு", "ஒட்சைட்டு"),
    (r"அசிட்டிக்", "அசிற்றிக்"),
    (r"அசிட்டோன்", "அசிற்றோன்"),
    (r"பார்மிக்", "போமிக்"),
    (r"ஈத்தர்", "ஈதர்"),
]

quizpool_path = r"d:\AL\web\src\services\quizPool.ts"
with open(quizpool_path, "r", encoding="utf-8") as f:
    content = f.read()

changes = []
for pattern, replacement in nie_replacements:
    matches = re.findall(pattern, content)
    if matches:
        changes.append((pattern, replacement, len(matches)))
        content = re.sub(pattern, replacement, content)

with open(quizpool_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Applied replacements across quizPool.ts: {changes}")
