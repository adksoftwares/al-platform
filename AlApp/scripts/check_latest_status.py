from dotenv import load_dotenv
load_dotenv()
import requests, json

FIREBASE_API_KEY = os.environ.get('FIREBASE_API_KEY', '')
EMAIL = os.environ.get('FIREBASE_EMAIL', '')
PASSWORD = os.environ.get('FIREBASE_PASSWORD', '')
DB_URL = 'https://al-students-default-rtdb.asia-southeast1.firebasedatabase.app'

auth_res = requests.post(f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}', json={'email': EMAIL, 'password': PASSWORD, 'returnSecureToken': True})
id_token = auth_res.json().get('idToken')

r = requests.get(f'{DB_URL}/daily_quizzes_v4.json?auth={id_token}')
data = r.json()

latest_daily = {}
for s in ['biology', 'chemistry', 'physics']:
    if 'tamil' in data and s in data['tamil']:
        dates = sorted(data['tamil'][s].keys())
        latest_date = dates[-1]
        latest_daily[s] = {'date': latest_date, 'questions': data['tamil'][s][latest_date]}

latest_unit = {}
if 'unit_quizzes' in data and 'tamil' in data['unit_quizzes']:
    for s in data['unit_quizzes']['tamil']:
        latest_unit[s] = {}
        for u in data['unit_quizzes']['tamil'][s]:
            dates = sorted(data['unit_quizzes']['tamil'][s][u].keys())
            latest_d = dates[-1]
            latest_unit[s][u] = {'date': latest_d, 'questions': data['unit_quizzes']['tamil'][s][u][latest_d]}

print('Latest daily:')
for s, val in latest_daily.items():
    print(f'  {s} ({val["date"]}): {len(val["questions"])} questions')

print('Latest unit quizzes:')
for s, units in latest_unit.items():
    print(f'  {s}: {len(units)} units')
    for u, val in units.items():
        q_count = len(val['questions']) if isinstance(val['questions'], list) else len(val['questions'].keys())
        print(f'    {u} ({val["date"]}): {q_count} questions')

with open('d:/AL/AlApp/scripts/latest_quizzes_extracted.json', 'w', encoding='utf-8') as f:
    json.dump({'daily': latest_daily, 'unit': latest_unit}, f, ensure_ascii=False, indent=2)
print('Saved to d:/AL/AlApp/scripts/latest_quizzes_extracted.json')
