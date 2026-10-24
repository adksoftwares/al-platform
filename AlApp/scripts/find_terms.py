import os
import sys
from google import genai
from google.genai import types

sys.stdout.reconfigure(encoding='utf-8')

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Biology resource book 2 or 3 usually has Genetics/Molecular Biology
pdf_path = r'd:\AL\subjects-materials\tamil\resource books\biology\22222222222.pdf'

print(f"Uploading {pdf_path}...")
sample_file = client.files.upload(file=pdf_path)

print("Analyzing with Gemini...")
prompt = "Find the section about gene expression, transcription, or the lac operon. Look for the English terms 'Promoter' and 'Inducer' (or their Tamil equivalents). What exact Tamil terms are used in this book for 'Promoter' and 'Inducer'? Please quote a short sentence from the book showing the term in context, and state the term clearly."

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[sample_file, prompt]
)
print(response.text)

client.files.delete(name=sample_file.name)
