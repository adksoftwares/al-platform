import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2, Dna, Atom, Sigma, FlaskConical, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMessage({ text: 'Enter your registered email address.', type: 'error' });
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    const res = await resetPassword(resetEmail);
    setIsResetting(false);

    if (res.success) {
      setResetMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage(null);
      }, 2000);
    } else {
      setResetMessage({ text: res.message, type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#060913] text-white">
        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 shadow-2xl shadow-brand-500/30 animate-pulse mb-4 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white fill-white/20" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-1">EduHub</h2>
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand-400" /> Authenticating session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#060913] text-slate-100 relative overflow-hidden selection:bg-brand-500 selection:text-white font-sans">
      {/* Dynamic ambient backdrop glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] bg-brand-600/12 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-indigo-600/12 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
          
          {/* Left Column: Platform Showcase (Hero) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 backdrop-blur-md shadow-lg shadow-black/40">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Sri Lanka G.C.E Advanced Level
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Smart Learning for <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">A/L Success.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
                Past papers, model papers, teacher elaborations, and daily AI quizzes designed to help students achieve university entrance across Tamil, English & Sinhala mediums.
              </p>
            </div>

            {/* Subject Feature Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 shadow-md group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Dna className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Biology</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Past & Models</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 shadow-md group">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Chemistry</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Organic & Physical</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 shadow-md group">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Atom className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Physics</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Mechanics & Fields</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-200 shadow-md group">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Sigma className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Maths</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Pure & Applied</p>
              </div>
            </div>

            {/* Check points */}
            <div className="space-y-2.5 pt-2 max-w-lg">
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Free Past Papers & Marking Schemes for all students</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Daily interactive quizzes with step-by-step rationales</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Glass Login Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative rounded-[28px] bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-white/[0.08] p-7 sm:p-9 shadow-2xl backdrop-blur-2xl ring-1 ring-white/[0.05] overflow-hidden">
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-80" />

              {/* Card Header */}
              <div className="mb-7 text-left space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-600/30 mb-2.5 ring-1 ring-white/20">
                  <Sparkles className="w-5 h-5 fill-white/20" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Student Sign In
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your credentials to access your dashboard
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-inner">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="font-medium">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#080d1a] border border-slate-800 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowResetModal(true);
                      }}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-[#080d1a] border border-slate-800 rounded-2xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-brand-600/25 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to EduHub</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom footer link */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  New to EduHub?{' '}
                  <Link to="/register" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
                    Create Free Student Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-900/80 bg-[#060913]/90">
        EduHub Sri Lanka • Powered by <span className="text-brand-400 font-bold">ADK Software Solutions</span>
      </footer>

      {/* Secure email-based password reset modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Account Password"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your registered email address and we’ll send a secure password-reset link if the account exists.
          </p>

          {resetMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                resetMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {resetMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{resetMessage.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Send Reset Link</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
