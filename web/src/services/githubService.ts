import type { FileMetadata } from '../types';

const REPO_OWNER = 'adksoftwares';
const REPO_NAME = 'subjects-materials';

export async function fetchLiveFiles(
  subject: string,
  folder: string,
  language: string = 'tamil'
): Promise<FileMetadata[]> {
  const encodedSubject = encodeURIComponent(subject.trim().toLowerCase());
  const encodedFolder = encodeURIComponent(folder.trim().toLowerCase());
  const encodedLang = encodeURIComponent(language.trim().toLowerCase());

  const timestamp = Date.now();
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodedLang}/${encodedSubject}/${encodedFolder}?t=${timestamp}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    const files: FileMetadata[] = [];
    for (const item of data) {
      if (item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')) {
        const title = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        files.push({
          id: item.sha,
          title: title.replace(/_/g, ' '),
          fileName: item.name,
          downloadUrl: item.download_url || `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/${encodedLang}/${encodedSubject}/${encodedFolder}/${encodeURIComponent(item.name)}`,
          timestamp: Date.now(),
        });
      }
    }

    return files.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error: any) {
    console.error('Error fetching files from GitHub:', error);
    throw error;
  }
}

export async function deleteGitHubFile(
  file: FileMetadata,
  subject: string,
  folder: string,
  language: string,
  token: string
): Promise<void> {
  const encodedSubject = encodeURIComponent(subject.trim().toLowerCase());
  const encodedFolder = encodeURIComponent(folder.trim().toLowerCase());
  const encodedLang = encodeURIComponent(language.trim().toLowerCase());
  const encodedFileName = encodeURIComponent(file.fileName);

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodedLang}/${encodedSubject}/${encodedFolder}/${encodedFileName}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Delete ${file.fileName} via Admin Portal`,
      sha: file.id,
    }),
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete file: HTTP ${response.status}`);
  }
}

export async function uploadFileToGitHub(
  fileName: string,
  base64Content: string,
  subject: string,
  folder: string,
  language: string,
  token: string
): Promise<void> {
  const encodedSubject = encodeURIComponent(subject.trim().toLowerCase());
  const encodedFolder = encodeURIComponent(folder.trim().toLowerCase());
  const encodedLang = encodeURIComponent(language.trim().toLowerCase());
  const encodedFileName = encodeURIComponent(fileName.trim());

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodedLang}/${encodedSubject}/${encodedFolder}/${encodedFileName}`;

  // Check if file already exists to get its sha for updating
  let existingSha: string | undefined = undefined;
  try {
    const checkRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      existingSha = data.sha;
    }
  } catch (e) {
    // Ignore check errors
  }

  const payload: any = {
    message: `Add ${fileName} to ${subject}/${folder} (${language}) via EduHub Admin`,
    content: base64Content,
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status !== 201 && response.status !== 200) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to publish to GitHub: HTTP ${response.status}`);
  }
}
