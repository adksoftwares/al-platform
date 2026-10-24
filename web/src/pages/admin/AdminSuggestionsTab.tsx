import React, { useEffect, useState } from 'react';
import { ref, onValue, remove, get } from 'firebase/database';
import { X, UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { database } from '../../config/firebase';
import type { Suggestion } from '../../types';
import { uploadFileToGitHub } from '../../services/githubService';
import { urlToBase64 } from '../../services/uploadService';

export const AdminSuggestionsTab: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [githubToken, setGithubToken] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Local overrides per card
  const [editStates, setEditStates] = useState<Record<string, { subject: string; folder: string; language: string }>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const subjects = ['biology', 'chemistry', 'physics', 'combined maths'];
  const folders = ['elaborations', 'past papers', 'model papers'];
  const languages = ['tamil', 'english', 'sinhala'];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Read GitHub token
    get(ref(database, 'admin_settings/github_token')).then((snap) => {
      if (snap.exists()) setGithubToken(snap.val() || '');
    });

    const suggestionsRef = ref(database, 'suggestions');
    const unsubscribe = onValue(suggestionsRef, (snapshot) => {
      const list: Suggestion[] = [];
      const edits: Record<string, { subject: string; folder: string; language: string }> = {};

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          if (val) {
            const item: Suggestion = {
              id: child.key || '',
              fileName: val.fileName || 'Untitled.pdf',
              subject: val.subject || 'biology',
              folder: val.folder || 'elaborations',
              downloadUrl: val.downloadUrl || '',
              userEmail: val.userEmail || 'Unknown Student',
              timestamp: val.timestamp || 0,
            };
            list.push(item);
            edits[item.id] = {
              subject: item.subject,
              folder: item.folder,
              language: 'tamil',
            };
          }
        });
      }
      setSuggestions(list.sort((a, b) => b.timestamp - a.timestamp));
      setEditStates((prev) => ({ ...edits, ...prev }));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReject = async (id: string) => {
    try {
      await remove(ref(database, `suggestions/${id}`));
      showToast('Suggestion removed.');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject', 'error');
    }
  };

  const handlePublish = async (suggestion: Suggestion) => {
    if (!githubToken) {
      showToast('GitHub token missing in Config tab!', 'error');
      return;
    }

    setPublishingId(suggestion.id);
    const target = editStates[suggestion.id] || {
      subject: suggestion.subject,
      folder: suggestion.folder,
      language: 'tamil',
    };

    try {
      // 1. Download file content from URL as Base64
      const base64 = await urlToBase64(suggestion.downloadUrl);

      // 2. Commit to GitHub repo
      await uploadFileToGitHub(
        suggestion.fileName,
        base64,
        target.subject,
        target.folder,
        target.language,
        githubToken
      );

      // 3. Remove suggestion from database
      await remove(ref(database, `suggestions/${suggestion.id}`));

      showToast(`Successfully published ${suggestion.fileName} to GitHub!`);
    } catch (err: any) {
      showToast(`Publish failed: ${err.message}`, 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const updateCardState = (id: string, field: 'subject' | 'folder' | 'language', value: string) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading student suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Review Student Suggestions</h3>
        <p className="text-xs text-slate-400">
          Review uploaded notes from students, adjust destination parameters, and publish directly to GitHub.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
          No pending material suggestions to review.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((suggestion) => {
            const currentEdit = editStates[suggestion.id] || {
              subject: suggestion.subject,
              folder: suggestion.folder,
              language: 'tamil',
            };
            const isPublishing = publishingId === suggestion.id;

            return (
              <div
                key={suggestion.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                        {suggestion.fileName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Suggested by: <strong className="text-slate-300">{suggestion.userEmail}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={suggestion.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Download / Preview</span>
                  </a>
                </div>

                {/* Dropdowns for reclassification */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <select
                      value={currentEdit.subject}
                      onChange={(e) => updateCardState(suggestion.id, 'subject', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 capitalize">{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={currentEdit.folder}
                      onChange={(e) => updateCardState(suggestion.id, 'folder', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f} className="bg-slate-900 capitalize">{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Language
                    </label>
                    <select
                      value={currentEdit.language}
                      onChange={(e) => updateCardState(suggestion.id, 'language', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-brand-500"
                    >
                      {languages.map((l) => (
                        <option key={l} value={l} className="bg-slate-900 capitalize">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleReject(suggestion.id)}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition"
                    title="Reject & Delete"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handlePublish(suggestion)}
                    disabled={isPublishing}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing to GitHub...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Publish to Repository</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
