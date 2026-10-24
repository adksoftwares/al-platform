import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Sparkles, PlusCircle, Dna, FlaskConical, Atom, Sigma, ArrowRight, Star, ShieldCheck, Flame, BookCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppBanner } from '../../components/common/WhatsAppBanner';
import type { AppFolder } from '../../types';

export const DashboardPage: React.FC = () => {
  const { userProfile, isPremium } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  const folders: AppFolder[] = [
    { id: '1', name: 'biology', isPremium: false },
    { id: '2', name: 'chemistry', isPremium: false },
    { id: '3', name: 'physics', isPremium: false },
    { id: '4', name: 'combined maths', isPremium: false },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleResourceBooksClick = () => {
    const lang = (userProfile?.language || 'tamil').toLowerCase();
    let url = 'https://nie.lk/showom3';
    if (lang === 'english') {
      url = 'https://nie.lk/showom';
    } else if (lang === 'sinhala') {
      url = 'https://nie.lk/showom2';
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getSubjectMeta = (name: string) => {
    switch (name.toLowerCase()) {
      case 'biology':
        return {
          icon: Dna,
          gradient: 'from-emerald-900/50 via-slate-900 to-slate-950',
          border: 'border-emerald-500/30 hover:border-emerald-400/70',
          iconContainer: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          accent: 'emerald',
          tagline: 'Genetics, Plant Physiology, Animal Diversity & Ecology',
        };
      case 'chemistry':
        return {
          icon: FlaskConical,
          gradient: 'from-amber-900/50 via-slate-900 to-slate-950',
          border: 'border-amber-500/30 hover:border-amber-400/70',
          iconContainer: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-500/10',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          accent: 'amber',
          tagline: 'Organic, Inorganic, Physical & Industrial Chemistry',
        };
      case 'physics':
        return {
          icon: Atom,
          gradient: 'from-cyan-900/50 via-slate-900 to-slate-950',
          border: 'border-cyan-500/30 hover:border-cyan-400/70',
          iconContainer: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-cyan-500/10',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          accent: 'cyan',
          tagline: 'Mechanics, Waves & Optics, Fields, Electronics & Modern Physics',
        };
      case 'combined maths':
      default:
        return {
          icon: Sigma,
          gradient: 'from-purple-900/50 via-slate-900 to-slate-950',
          border: 'border-purple-500/30 hover:border-purple-400/70',
          iconContainer: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-purple-500/10',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          accent: 'purple',
          tagline: 'Pure Mathematics, Applied Vectors, Dynamics & Statics',
        };
    }
  };

  const filteredFolders = folders.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesFilter = selectedSubjectFilter === 'all' || f.name.toLowerCase() === selectedSubjectFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950/70 to-slate-900 border border-slate-800/90 p-6 sm:p-10 overflow-hidden shadow-2xl">
        {/* Glow background effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Greeting Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow" />
            <span>{getTimeGreeting()}, {userProfile?.name?.split(' ')[0] || 'Student'}!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Excel in Your <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">G.C.E A/L</span> Journey
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Free Past Papers, Model Papers, Teacher Elaborations, and Daily Quizzes customized for Biology, Chemistry, Physics, and Combined Mathematics.
          </p>

          {/* Quick Action Pills */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={handleResourceBooksClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition shadow-md group hover:border-brand-500/50"
            >
              <BookOpen className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span>NIE Official Resource Books</span>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition shadow-md group hover:border-yellow-500/50"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span>AI Learning Insights</span>
            </button>

            <button
              onClick={() => navigate('/suggest-material')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition shadow-md group hover:border-emerald-500/50"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Suggest Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
            <BookCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Curriculum</span>
            <span className="text-sm font-bold text-white">4 Core Subjects</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Daily Quizzes</span>
            <span className="text-sm font-bold text-white">AI-Powered</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Materials</span>
            <span className="text-sm font-bold text-white">100% Free Papers</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center space-x-3.5 shadow-md">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
            <Star className="w-5 h-5 fill-yellow-400" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Account Status</span>
            <span className="text-sm font-bold text-white">{isPremium ? 'Premium Plan' : 'Free Access'}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Community Banner */}
      <WhatsAppBanner />

      {/* Search & Subject Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Curriculum Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select your subject to explore past papers, model papers, elaborations, and quizzes.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter subjects..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>
        </div>

        {/* Subject Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {['all', 'biology', 'chemistry', 'physics', 'combined maths'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubjectFilter(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedSubjectFilter === sub
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sub === 'all' ? 'All Subjects' : sub}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredFolders.map((folder) => {
          const meta = getSubjectMeta(folder.name);
          const Icon = meta.icon;

          return (
            <div
              key={folder.id}
              onClick={() => navigate(`/folder/${encodeURIComponent(folder.name)}`)}
              className={`group relative rounded-3xl bg-gradient-to-b ${meta.gradient} border ${meta.border} p-6 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-64 overflow-hidden`}
            >
              <div className="relative z-10">
                {/* Header icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3.5 rounded-2xl ${meta.iconContainer} group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.badge}`}>
                    4 Categories
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="text-xl font-extrabold text-white capitalize group-hover:text-brand-300 transition-colors tracking-tight">
                  {folder.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {meta.tagline}
                </p>
              </div>

              {/* Bottom footer bar */}
              <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  View Materials
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-brand-600 group-hover:border-brand-500 transition-all shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFolders.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <p className="text-slate-400 text-sm">No subjects found matching your filter.</p>
        </div>
      )}
    </div>
  );
};
