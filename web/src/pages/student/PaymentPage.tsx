import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Copy, MessageSquare, Key, CheckCircle2, AlertCircle, Loader2, Star } from 'lucide-react';
import { ref, get, update } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export const PaymentPage: React.FC = () => {
  const { currentUser, unlockPremium, isPremium } = useAuth();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8204509');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();

    if (cleanCode.length < 5) {
      setErrorMessage('Please enter a valid access code.');
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be logged in to redeem a code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const codeRef = ref(database, `admin_settings/premium_codes/${cleanCode}`);
      const snapshot = await get(codeRef);

      if (snapshot.exists()) {
        const codeData = snapshot.val();
        if (codeData.isUsed) {
          setErrorMessage('This code has already been redeemed.');
        } else {
          // Mark code as used
          await update(codeRef, {
            isUsed: true,
            usedBy: currentUser.uid,
            usedAt: Date.now(),
          });

          // Upgrade user to premium
          await unlockPremium();

          setSuccessMessage('Code verified successfully! Premium features unlocked forever.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        setErrorMessage('Invalid access code. Please check with admin and try again.');
      }
    } catch (err: any) {
      setErrorMessage(`Error verifying code: ${err.message || 'Network error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-md"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-yellow-400" /> Unlock Full Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
            EduHub Premium Membership
          </h1>
        </div>
      </div>

      {isPremium ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-yellow-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-5 rounded-3xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-slate-950 shadow-2xl shadow-yellow-500/30 mb-2">
            <Crown className="w-12 h-12 fill-slate-950" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">You Have Lifetime Premium!</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Your student account has unrestricted access to all Subject Elaborations, Daily AI Quizzes, unlimited PDF downloads, and advanced learning analytics.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition"
          >
            Go to My Subjects
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Plan Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-700 via-indigo-900 to-purple-900 p-6 sm:p-10 text-white shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>One-Time Lifetime Plan</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Lifetime Student Pass</h2>
                <p className="text-xs sm:text-sm text-brand-100 mt-1.5 max-w-md leading-relaxed">
                  Gain instant access to all Subject Elaborations, Daily Quizzes with instant AI rationale, and unlimited downloads across all 4 subjects.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">Rs. 500</span>
                <span className="block text-[11px] text-brand-200 mt-1">One-time payment • No subscriptions</span>
              </div>
            </div>
          </div>

          {/* Feature Comparison Checklist */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">What's Included in Your Upgrade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-slate-200 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Full Subject Elaborations</strong>
                  <span className="text-xs text-slate-400">Step-by-step teacher guides & explanations for all 4 subjects.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Daily AI Practice Quizzes</strong>
                  <span className="text-xs text-slate-400">Daily testing with instant score & comprehensive rationale.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Unlimited High-Speed Downloads</strong>
                  <span className="text-xs text-slate-400">Zero download limits across all past papers and notes.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">AI Learning Insights</strong>
                  <span className="text-xs text-slate-400">Gemini-powered weakness detection and personalized recommendations.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Bank Transfer Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-xs shadow-inner">
                1
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Step 1: Transfer Rs. 500 to Bank Account
                </h3>
                <p className="text-xs text-slate-400">Transfer via CDM, online banking, or bank counter.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Bank Name</span>
                <span className="font-bold text-white">Bank of Ceylon (BOC)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Account Name</span>
                <span className="font-semibold text-white">S.Arikarran</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Branch</span>
                <span className="font-semibold text-white">Batticaloa City</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Account Number</span>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-lg text-yellow-400 tracking-wider">
                    8204509
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shadow-md"
                    title="Copy Account Number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/94723440137"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition flex items-center justify-center space-x-2.5 active:scale-[0.99]"
            >
              <MessageSquare className="w-5 h-5 fill-white/20" />
              <span>Send Deposit Slip on WhatsApp (+94 72 344 0137)</span>
            </a>
          </div>

          {/* Step 2: Redeem Access Code */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-xs shadow-inner">
                2
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Step 2: Enter Your Unlock Code
                </h3>
                <p className="text-xs text-slate-400">Once your receipt is sent on WhatsApp, enter the license key provided.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  12-Character Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. 7A8B9C1D2E3F"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-white font-mono uppercase tracking-widest text-base focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !accessCode.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 active:scale-[0.99]"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify & Unlock Lifetime Access</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition"
            >
              ← Back to My Subjects
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
