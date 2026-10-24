import urllib.request
import re
import os

headers = {'User-Agent': 'Mozilla/5.0'}

# Physics
print("Fetching Physics...")
req = urllib.request.Request('https://e-kalvi.com/gce-al-physics-past-papers-tamil-medium-1975-2020/', headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')
pattern = r'<a[^>]*href=[\'"]([^\'"]*uc\?export=download[^\'"]*)[\'"][^>]*>(.*?)</a>'
matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)

for link, text in matches:
    text = re.sub(r'<[^>]+>', '', text).strip()
    link = link.replace("&amp;", "&")
    if text:
        filename = text.replace('/', '_').replace(':', '') + ".pdf"
        filepath = os.path.join(r"d:\AL\subjects-materials\subjects\physics\past papers", filename)
        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            try:
                urllib.request.urlretrieve(link, filepath)
            except Exception as e:
                print(f"Failed {filename}: {e}")

# Combined Maths
print("Fetching Combined Maths...")
req = urllib.request.Request('https://e-kalvi.com/al-combined-maths-past-papers-in-tamil-medium-2015-2020/', headers=headers)
html = urllib.request.urlopen(req).read().decode('utf-8')
matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)

for link, text in matches:
    text = re.sub(r'<[^>]+>', '', text).strip()
    link = link.replace("&amp;", "&")
    if text:
        filename = text.replace('/', '_').replace(':', '') + ".pdf"
        filepath = os.path.join(r"d:\AL\subjects-materials\subjects\combined maths\past papers", filename)
        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            try:
                urllib.request.urlretrieve(link, filepath)
            except Exception as e:
                print(f"Failed {filename}: {e}")

print("Done!")
