import google.genai as genai
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
pdf_dir = r'd:\AL\subjects-materials\tamil\resource books\biology'
pdfs = [os.path.join(pdf_dir, f) for f in os.listdir(pdf_dir) if f.endswith('.pdf')]

for pdf_path in pdfs:
    print(f'Uploading {os.path.basename(pdf_path)}...')
    sample_file = client.files.upload(file=pdf_path)

    print('Analyzing...')
    prompt = 'Read the Tamil text carefully. Does the exact Tamil word "புரமோட்டர்" (a transliteration of Promoter) exist anywhere in this document? Answer YES or NO. If YES, tell me what page it is on and what context it is used in.'
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[sample_file, prompt]
    )
    print(f'Response for {os.path.basename(pdf_path)}:')
    print(response.text)
    print('-'*40)

    client.files.delete(name=sample_file.name)
