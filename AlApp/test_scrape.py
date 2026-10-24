import re

with open('telegram.html', 'r', encoding='utf-8') as f:
    html = f.read()

# find document links
matches = re.finditer(r'<a[^>]+href="([^"]+)"[^>]*class="tgme_widget_message_document_wrap[^"]*"', html)
for m in matches:
    print("Found download link or wrap:", m.group(1))
    
# find raw URLs for files if they exist
docs = re.findall(r'href="([^"]+)"', html)
for d in docs:
    if "pdf" in d.lower():
        print("Raw link with pdf:", d)
