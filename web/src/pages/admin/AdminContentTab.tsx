import React, { useEffect, useState } from 'react';
import { ref, get, push, set } from 'firebase/database';
import { FolderPlus, Trash2, ExternalLink, CheckSquare, Square, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { database } from '../../config/firebase';
import { fetchLiveFiles, deleteGitHubFile } from '../../services/githubService';
import type { FileMetadata } from '../../types';

export const AdminContentTab: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('tamil');
  const [selectedSubject, setSelectedSubject] = useState('biology');
  const [selectedFolder, setSelectedFolder] = useState('elaborations');

  // Add Link form
  const [fileTitle, setFileTitle] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Live GitHub Files
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedShaList, setSelectedShaList] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [githubToken, setGithubToken] = useState('');

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const languages = ['tamil', 'english', 'sinhala'];
  const subjects = ['biology', 'chemistry', 'physics', 'combined maths'];
  const folders = ['elaborations', 'past papers', 'model papers'];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Read GitHub token
    get(ref(database, 'admin_settings/github_token')).then((snap) => {
      if (snap.exists()) setGithubToken(snap.val() || '');
    });
  }, []);

  const loadGitHubFiles = async () => {
    setIsLoadingFiles(true);
    setSelectedShaList([]);
    try {
      const fetched = await fetchLiveFiles(selectedSubject, selectedFolder, selectedLanguage);
      setFiles(fetched);
    } catch (err: any) {
      showToast('Error loading GitHub files: ' + err.message, 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadGitHubFiles();
  }, [selectedLanguage, selectedSubject, selectedFolder]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle.trim() || !downloadUrl.trim()) return;

    setIsAdding(true);
    try {
      const cleanLang = selectedLanguage.toLowerCase().trim();
      const cleanSub = selectedSubject.toLowerCase().trim();
      const cleanFol = selectedFolder.toLowerCase().trim();

      const newRef = push(ref(database, `files/${cleanLang}/${cleanSub}/${cleanFol}`));
      await set(newRef, {
        id: newRef.key,
        title: fileTitle.trim(),
        downloadUrl: downloadUrl.trim(),
        timestamp: Date.now(),
      });

      setFileTitle('');
      setDownloadUrl('');
      showToast('File link added to database successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to add file link', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSelect = (sha: string) => {
    if (selectedShaList.includes(sha)) {
      setSelectedShaList(selectedShaList.filter((s) => s !== sha));
    } else {
      setSelectedShaList([...selectedShaList, sha]);
    }
  };

  const handleSelectAll = () => {
    if (selectedShaList.length === files.length) {
      setSelectedShaList([]);
    } else {
      setSelectedShaList(files.map((f) => f.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedShaList.length === 0) return;
    if (!githubToken) {
      showToast('GitHub token missing. Please configure it in the Config tab.', 'error');
      return;
    }

    const confirm = window.confirm(`Permanently delete ${selectedShaList.length} selected files from GitHub repository?`);
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const filesToDelete = files.filter((f) => selectedShaList.includes(f.id));
      for (const file of filesToDelete) {
        await deleteGitHubFile(file, selectedSubject, selectedFolder, selectedLanguage, githubToken);
      }
      showToast(`Successfully deleted ${filesToDelete.length} files from GitHub!`);
      await loadGitHubFiles();
    } catch (err: any) {
      showToast('Error deleting files: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Destination Selectors */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Select Target Destination</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
            >
              {languages.map((l) => (
                <option key={l} value={l} className="bg-slate-900 capitalize">{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
            >
              {subjects.map((s) => (
                <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Folder / Category
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
            >
              {folders.map((f) => (
                <option key={f} value={f} className="bg-slate-900 capitalize">{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Direct Link Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Add Direct Content Link</h3>
            <p className="text-xs text-slate-400">Add external Google Drive or hosted PDF URLs directly into the database.</p>
          </div>
        </div>

        <form onSubmit={handleAddLink} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                File Title
              </label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                required
                placeholder="e.g. 2024 Unit 01 Notes"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Download / PDF URL
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                required
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
            <span>Add Link to Folder</span>
          </button>
        </form>
      </div>

      {/* Live GitHub Files Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Live GitHub Repository Files
            </h3>
            <p className="text-xs text-slate-400 capitalize">
              {selectedLanguage} • {selectedSubject} • {selectedFolder} ({files.length} files)
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={loadGitHubFiles}
              disabled={isLoadingFiles}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
              title="Refresh Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {files.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {selectedShaList.length === files.length ? 'Deselect All' : 'Select All'}
              </button>
            )}

            {selectedShaList.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Selected ({selectedShaList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Files list */}
        {isLoadingFiles ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading GitHub files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No live files found in this path on GitHub.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {files.map((file) => {
              const isSelected = selectedShaList.includes(file.id);
              return (
                <div
                  key={file.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-red-500/10 border-red-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <button
                      onClick={() => handleToggleSelect(file.id)}
                      className="text-slate-400 hover:text-white transition shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-red-400" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="truncate">
                      <h5 className="font-bold text-white text-xs sm:text-sm truncate">
                        {file.title || file.fileName}
                      </h5>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {file.fileName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
