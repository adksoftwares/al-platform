import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Crown, LogOut, ShieldAlert, User as UserIcon, Search, Globe, ChevronDown } from 'lucide-react';
import { SearchModal } from '../common/SearchModal';

export const Navbar: React.FC = () => {
  const { userProfile, isPremium, isAdmin, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = async (lang: string) => {
    setIsLangMenuOpen(false);
    if (userProfile) {
      await updateProfile(userProfile.district || '', userProfile.phone || '', lang);
    }
  };

  const currentLang = (userProfile?.language || 'tamil').toLowerCase();
  const langDisplay: Record<string, { label: string; code: string }> = {
    tamil: { label: 'தமிழ்', code: 'TA' },
    english: { label: 'English', code: 'EN' },
    sinhala: { label: 'සිංහල', code: 'SI' },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Logo */}
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/30 group-hover:scale-105 group-hover:shadow-brand-500/50 transition-all duration-300">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                    EduHub
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="block text-[10px] text-brand-400 font-bold tracking-widest uppercase">
                  A/L Learning Portal
                </span>
              </div>
            </Link>

            {/* Center: Quick Search Trigger */}
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition text-xs shadow-inner w-72 justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-brand-400" />
                  <span>Search subjects & papers...</span>
                </div>
                <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Language Selector Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition"
                  title="Change Language"
                >
                  <Globe className="w-3.5 h-3.5 text-brand-400" />
                  <span>{langDisplay[currentLang]?.label || 'தமிழ்'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {isLangMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1 z-50 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleLanguageChange('tamil')}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition ${
                        currentLang === 'tamil' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>தமிழ் (Tamil)</span>
                      {currentLang === 'tamil' && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('english')}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition ${
                        currentLang === 'english' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>English</span>
                      {currentLang === 'english' && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('sinhala')}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition ${
                        currentLang === 'sinhala' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>සිංහල (Sinhala)</span>
                      {currentLang === 'sinhala' && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </button>
                  </div>
                )}
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {!isPremium && !isAdmin ? (
                <Link
                  to="/payment"
                  className="relative group overflow-hidden flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-size-200 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all"
                >
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Go Premium</span>
                </Link>
              ) : isPremium ? (
                <div className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-black shadow-inner">
                  <Crown className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>PREMIUM</span>
                </div>
              ) : null}

              {/* Profile Avatar */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                title="My Profile"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-brand-600/30">
                  {userProfile?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                </div>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-900 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Universal Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
