import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Loader2, CheckCircle2, Dna, Atom, Sigma, FlaskConical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !district.trim()) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const res = await register(name, email, password, phone, district);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-1/4 -mt-32 -mr-32 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-32 -ml-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Column Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Platform Highlights */}
          <div className="lg:col-span-6 space-y-7 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-brand-300 text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Join Sri Lanka's Leading A/L Student Community</span>
            </div>

            <div className="space-y-4 max-w-lg">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Begin Your Journey to <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">Campus (3A's)</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Create a free student account today and immediately access verified past papers, model papers, teacher notes, and daily practice quizzes tailored for Sri Lankan GCE A/L syllabus.
              </p>
            </div>

            {/* Core Subject Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex items-center space-x-2.5 shadow-md">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Dna className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Biology</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center space-x-2.5 shadow-md">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Chemistry</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex items-center space-x-2.5 shadow-md">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Atom className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Physics</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center space-x-2.5 shadow-md">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Sigma className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Maths</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 max-w-lg">
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Instant access without subscription fees</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-300">
                <div className="p-1 rounded-lg bg-yellow-500/10 text-yellow-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Full support for Tamil, English & Sinhala mediums</span>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-400" />

              <div className="mb-6 text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Create Student Account
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Fill in your details to get started in seconds
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Kasun Perera / S. Kumar"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="0771234567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      District
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                        placeholder="Colombo, Jaffna..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-black text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-900 bg-slate-950/80">
        EduHub • Powered by <span className="text-brand-400 font-bold">ADK Software Solutions</span>
      </footer>
    </div>
  );
};
