import os
import json
import firebase_admin
from firebase_admin import credentials, db
import google.generativeai as genai

cred_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
cred_dict = json.loads(cred_json)
cred = credentials.Certificate(cred_dict)
firebase_admin.initialize_app(cred, {'databaseURL': 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app'})
api_key = db.reference('admin_settings/gemini_api_key').get()
print("API KEY length:", len(api_key) if api_key else "None")
genai.configure(api_key=api_key)
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
