import urllib.request
import urllib.parse
import json
import base64
import os

# Configuration
# Read token from environment variable
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_OWNER = "adksoftwares"
REPO_NAME = "subjects-materials"
API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"

SUBJECTS = ["biology", "chemistry", "physics", "combined maths"]
FOLDERS = ["elaborations", "past papers", "model papers"]

def make_github_request(url, method="GET", data=None):
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN environment variable is not set!")
        return None

    req = urllib.request.Request(url, method=method)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    
    if data:
        req.add_header("Content-Type", "application/json")
        json_data = json.dumps(data).encode('utf-8')
        req.data = json_data
        
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None # Not found is fine for some operations
        print(f"HTTP Error {e.code}: {e.reason} for {url}")
        if e.code != 404:
            print(e.read().decode())
        return None
    except Exception as e:
        print(f"Error: {e} for {url}")
        return None

def move_file(source_path, target_path, sha):
    print(f"Moving: {source_path} -> {target_path}")
    
    # 1. Get the source file content
    source_url = f"{API_BASE}/{urllib.parse.quote(source_path)}"
    file_info = make_github_request(source_url)
    
    if not file_info or 'content' not in file_info:
        print(f"  Failed to get content for {source_path}")
        return False
        
    file_content = file_info['content']
    
    # 2. Create the file in the new location
    target_url = f"{API_BASE}/{urllib.parse.quote(target_path)}"
    create_data = {
        "message": f"Migrate {source_path} to tamil folder",
        "content": file_content.replace("\n", "") # Content is already base64 encoded by GitHub API
    }
    
    create_res = make_github_request(target_url, method="PUT", data=create_data)
    if not create_res:
        print(f"  Failed to create {target_path}")
        return False
        
    print(f"  Created {target_path} successfully.")
    
    # 3. Delete the original file
    delete_data = {
        "message": f"Delete original {source_path} after migration",
        "sha": sha
    }
    delete_res = make_github_request(source_url, method="DELETE", data=delete_data)
    
    if delete_res:
        print(f"  Deleted {source_path} successfully.")
        return True
    else:
        print(f"  Failed to delete {source_path}")
        return False

def migrate():
    if not GITHUB_TOKEN:
        print("Please set the GITHUB_TOKEN environment variable before running.")
        print("Example (Windows): $env:GITHUB_TOKEN='your_token'; python migrate_to_tamil.py")
        return

    print("Starting migration to 'tamil' folder...")
    total_moved = 0
    
    for subject in SUBJECTS:
        for folder in FOLDERS:
            # Check old path: subjects/subject/folder
            encoded_subject = urllib.parse.quote(subject)
            encoded_folder = urllib.parse.quote(folder)
            
            list_url = f"{API_BASE}/subjects/{encoded_subject}/{encoded_folder}"
            files = make_github_request(list_url)
            
            if files and isinstance(files, list):
                print(f"\nFound {len(files)} files in subjects/{subject}/{folder}")
                for file in files:
                    if file['type'] == 'file':
                        source_path = file['path']
                        # Target path: tamil/subjects/subject/folder/filename
                        target_path = f"tamil/{source_path}"
                        
                        success = move_file(source_path, target_path, file['sha'])
                        if success:
                            total_moved += 1
            else:
                print(f"No files found in subjects/{subject}/{folder} (or folder doesn't exist)")
                
    print(f"\nMigration complete! Successfully moved {total_moved} files.")

if __name__ == "__main__":
    migrate()
