import os
import sys
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

pdf_path = r'd:\AL\subjects-materials\tamil\resource books\biology\11111111111.pdf'

print(f"Uploading {pdf_path}...")
sample_file = genai.upload_file(path=pdf_path)

print("Checking words...")
response = model.generate_content([sample_file, "Please read the text. Does the Tamil word 'பல்குழைய' or 'பல்குழைய சங்கிலி' appear ANYWHERE in this book? Does 'பல்பெப்டைட்' appear? Answer yes or no for each, and explain briefly if found."])
print(response.text)

genai.delete_file(sample_file.name)
