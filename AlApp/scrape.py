import urllib.request
import re

req = urllib.request.Request('https://e-kalvi.com/al-combined-maths-past-papers-in-tamil-medium-2015-2020/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Find all <a> tags with href containing 'uc?export=download'
pattern = r'<a[^>]*href=[\'"]([^\'"]*uc\?export=download[^\'"]*)[\'"][^>]*>(.*?)</a>'
matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)

for link, text in matches:
    # Clean up text (remove inner HTML tags)
    text = re.sub(r'<[^>]+>', '', text).strip()
    if text:
        print(f"File: {text} - Link: {link}")


