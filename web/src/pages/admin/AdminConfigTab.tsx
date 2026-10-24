import React, { useEffect, useState } from 'react';
import { ref, get, set, update } from 'firebase/database';
import { Phone, Sparkles, Key, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { database } from '../../config/firebase';

export const AdminConfigTab: React.FC = () => {
  const [telegramNumber, setTelegramNumber] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [isSavingGithub, setIsSavingGithub] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [telSnap, geminiSnap, ghSnap] = await Promise.all([
          get(ref(database, 'admin_settings/payment_config/telegramNumber')),
          get(ref(database, 'admin_settings/gemini_api_key')),
          get(ref(database, 'admin_settings/github_token')),
        ]);

        if (telSnap.exists()) setTelegramNumber(telSnap.val() || '');
        if (geminiSnap.exists()) setGeminiApiKey(geminiSnap.val() || '');
        if (ghSnap.exists()) setGithubToken(ghSnap.val() || '');
      } catch (err) {
        console.warn('Error loading platform config', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTelegram(true);
    try {
      await update(ref(database, 'admin_settings/payment_config'), {
        telegramNumber: telegramNumber.trim(),
      });
      showToast('Telegram / WhatsApp contact number updated!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGemini(true);
    try {
      await set(ref(database, 'admin_settings/gemini_api_key'), geminiApiKey.trim());
      showToast('Gemini AI API Key saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setIsSavingGemini(false);
    }
  };

  const handleSaveGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGithub(true);
    try {
      await set(ref(database, 'admin_settings/github_token'), githubToken.trim());
      showToast('GitHub Personal Access Token saved!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setIsSavingGithub(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
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

      {/* Payment Gateway Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Payment & WhatsApp Contact</h3>
            <p className="text-xs text-slate-400">The phone number students contact on WhatsApp/Telegram to send bank slips.</p>
          </div>
        </div>

        <form onSubmit={handleSaveTelegram} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Admin Telegram / WhatsApp Number
            </label>
            <input
              type="text"
              value={telegramNumber}
              onChange={(e) => setTelegramNumber(e.target.value)}
              placeholder="e.g. 0723440137 or 94723440137"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingTelegram}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSavingTelegram ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Contact Config</span>
          </button>
        </form>
      </div>

      {/* Gemini AI Integration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Gemini AI Integration</h3>
            <p className="text-xs text-slate-400">Used for generating AI learning insights, quizzes, and recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSaveGemini} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingGemini}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSavingGemini ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Gemini API Key</span>
          </button>
        </form>
      </div>

      {/* GitHub Integration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">GitHub Repository Token</h3>
            <p className="text-xs text-slate-400">Personal access token (PAT) for deleting and committing materials to <code>adksoftwares/subjects-materials</code>.</p>
          </div>
        </div>

        <form onSubmit={handleSaveGithub} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingGithub}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSavingGithub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save GitHub Token</span>
          </button>
        </form>
      </div>
    </div>
  );
};
