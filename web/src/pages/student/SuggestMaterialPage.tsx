import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { uploadSuggestionPdf } from '../../services/uploadService';

export const SuggestMaterialPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [subject, setSubject] = useState('biology');
  const [folder, setFolder] = useState('elaborations');
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const subjects = ['biology', 'chemistry', 'physics', 'combined maths'];
  const folders = ['elaborations', 'past papers', 'model papers'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileName.trim()) {
      setStatusMessage({ text: 'Please select a PDF file and enter a name.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      // 1. Upload PDF
      const uploadedLink = await uploadSuggestionPdf(selectedFile);

      // 2. Save suggestion record to Firebase Realtime DB
      const suggestionId = 'sug_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const finalFileName = fileName.trim().toLowerCase().endsWith('.pdf') ? fileName.trim() : `${fileName.trim()}.pdf`;

      const suggestionData = {
        id: suggestionId,
        fileName: finalFileName,
        subject,
        folder,
        downloadUrl: uploadedLink,
        userEmail: currentUser?.email || userProfile?.email || 'Student',
        timestamp: Date.now(),
      };

      await set(ref(database, `suggestions/${suggestionId}`), suggestionData);

      setStatusMessage({ text: 'Suggestion submitted successfully! An admin will review and publish it.', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setStatusMessage({ text: `Upload failed: ${err.message || 'Network error'}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Suggest Material
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Help expand our study library by submitting your past papers or notes.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Picker Drag & Drop Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select PDF Document
            </label>
            <label className="relative flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-3xl cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all text-center group">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-white">
                {selectedFile ? selectedFile.name : 'Click to select or drop a PDF note'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF` : 'PDF files up to 50MB supported'}
              </p>
            </label>
          </div>

          {/* Material Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Material Name / Title
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              placeholder="e.g. 2023 Chemistry Marking Scheme Tamil"
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Subject and Category Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white text-sm capitalize focus:outline-none focus:border-brand-500"
              >
                {subjects.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white text-sm capitalize focus:outline-none focus:border-brand-500"
              >
                {folders.map((f) => (
                  <option key={f} value={f} className="bg-slate-900 capitalize">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Suggestion...</span>
              </>
            ) : (
              <span>Submit Suggestion</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
