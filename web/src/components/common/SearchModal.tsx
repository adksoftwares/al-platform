import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subjects = ['Biology', 'Chemistry', 'Physics', 'Combined Maths'];
  const categories = [
    { name: 'Past Papers', folder: 'past papers', isPremium: false },
    { name: 'Model Papers', folder: 'model papers', isPremium: false },
    { name: 'Elaborations', folder: 'elaborations', isPremium: true },
    { name: 'Daily Quiz', folder: 'quiz', isPremium: true },
  ];

  // Quick matching items
  const matchingSubjects = subjects.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleSelectSubject = (subject: string) => {
    onClose();
    navigate(`/folder/${encodeURIComponent(subject.toLowerCase())}`);
  };

  const handleSelectCategory = (subject: string, category: typeof categories[0]) => {
    onClose();
    if (category.folder === 'quiz') {
      if (category.isPremium && !isPremium) {
        navigate('/payment');
      } else {
        navigate(`/quiz/${encodeURIComponent(subject.toLowerCase())}`);
      }
    } else {
      if (category.isPremium && !isPremium) {
        navigate('/payment');
      } else {
        navigate(`/pdf-viewer/${encodeURIComponent(subject.toLowerCase())}/${encodeURIComponent(category.folder)}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden shadow-brand-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <Search className="w-5 h-5 text-brand-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, past papers, elaborations, quizzes... (e.g. Physics Past Papers)"
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results / Navigation */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Subjects matching */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Subjects
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchingSubjects.map((subject) => (
                <div
                  key={subject}
                  onClick={() => handleSelectSubject(subject)}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-brand-600/20 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition">
                      <Folder className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-white">{subject}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-300 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Category Jump */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Quick Category Shortcuts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map((sub) =>
                categories.map((cat) => {
                  if (sub === 'Combined Maths' && cat.folder === 'quiz') return null;
                  const itemLabel = `${sub} - ${cat.name}`;
                  if (query && !itemLabel.toLowerCase().includes(query.toLowerCase())) return null;

                  return (
                    <div
                      key={itemLabel}
                      onClick={() => handleSelectCategory(sub, cat)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 group-hover:text-white transition shrink-0">
                          {cat.folder === 'quiz' ? <Sparkles className="w-4 h-4 text-yellow-400" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-xs text-white block truncate">{itemLabel}</span>
                          <span className="text-[10px] text-slate-400">
                            {cat.isPremium ? '🔒 Premium' : '🔓 Free Access'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 ml-2" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
