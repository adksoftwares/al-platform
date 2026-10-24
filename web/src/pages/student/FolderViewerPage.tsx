import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Lock, CheckCircle, Star, Sparkles, ChevronRight, FileText, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { SubFolderItem } from '../../types';
import { Modal } from '../../components/common/Modal';

export const FolderViewerPage: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const decodedSubject = decodeURIComponent(subjectName || 'Subject');
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState('');

  const isScienceSubject = ['biology', 'chemistry', 'physics'].includes(decodedSubject.toLowerCase());

  // Category subfolders: Past Papers & Model Papers are Free, Elaborations & Quizzes are Premium
  const subFolders: SubFolderItem[] = [
    { name: 'past papers', isPremiumRequired: false },
    { name: 'model papers', isPremiumRequired: false },
    { name: 'elaborations', isPremiumRequired: true },
    ...(decodedSubject.toLowerCase() !== 'combined maths'
      ? [
          { name: 'Daily Quiz', isPremiumRequired: true },
          ...(isScienceSubject ? [{ name: 'Unit-wise Quizzes', isPremiumRequired: true }] : [])
        ]
      : []),
  ];

  const handleCardClick = (folder: SubFolderItem) => {
    const isLocked = folder.isPremiumRequired && !isPremium;
    if (isLocked) {
      setSelectedLockedFeature(folder.name);
      setShowPremiumModal(true);
      return;
    }

    if (folder.name === 'Daily Quiz') {
      navigate(`/quiz/${encodeURIComponent(decodedSubject)}`);
    } else if (folder.name === 'Unit-wise Quizzes') {
      navigate(`/quiz-units/${encodeURIComponent(decodedSubject)}`);
    } else {
      navigate(`/pdf-viewer/${encodeURIComponent(decodedSubject)}/${encodeURIComponent(folder.name)}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-md"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">Subject Materials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight mt-0.5">
            {decodedSubject}
          </h1>
        </div>
      </div>

      {/* Subfolder list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subFolders.map((folder) => {
          const isLocked = folder.isPremiumRequired && !isPremium;
          const isDailyQuiz = folder.name === 'Daily Quiz';
          const isUnitQuiz = folder.name === 'Unit-wise Quizzes';
          const isElaboration = folder.name === 'elaborations';

          return (
            <div
              key={folder.name}
              onClick={() => handleCardClick(folder)}
              className={`group relative p-5 sm:p-6 rounded-3xl border cursor-pointer transition-all duration-200 flex items-center justify-between shadow-lg ${
                isLocked
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  : isUnitQuiz
                  ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-500/60'
                  : isDailyQuiz || isElaboration
                  ? 'bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border-brand-500/30 hover:border-brand-500/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3.5 rounded-2xl ${
                    isLocked
                      ? 'bg-amber-500/10 text-amber-400'
                      : isUnitQuiz
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isDailyQuiz
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : isElaboration
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-brand-500/10 text-brand-400'
                  } shadow-inner`}
                >
                  {isLocked ? (
                    <Lock className="w-6 h-6" />
                  ) : isUnitQuiz ? (
                    <Target className="w-6 h-6" />
                  ) : isDailyQuiz ? (
                    <Sparkles className="w-6 h-6" />
                  ) : isElaboration ? (
                    <FileText className="w-6 h-6" />
                  ) : (
                    <FolderOpen className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white capitalize group-hover:text-brand-300 transition-colors">
                      {folder.name}
                    </h3>
                    {folder.isPremiumRequired && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPremium
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {folder.name === 'Unit-wise Quizzes'
                      ? 'Targeted practice for all syllabus units (Unit 1 to 14)'
                      : folder.isPremiumRequired
                      ? 'Exclusive for Premium members'
                      : 'Available for all students (Free)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Upgrade Modal */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Premium Access Required"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 mb-2">
            <Star className="w-8 h-8 fill-yellow-400" />
          </div>

          <h4 className="text-xl font-bold text-white capitalize">
            Unlock {selectedLockedFeature}
          </h4>
          <p className="text-sm text-slate-300">
            "{selectedLockedFeature}" is a premium feature containing in-depth teacher elaborations, chapter-wise syllabus tests, daily AI practice quizzes, and comprehensive study analytics.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Targeted Unit-wise Quizzes for Biology, Chemistry & Physics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Full access to all Subject Elaborations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Daily AI Quizzes with detailed answer rationales</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Maybe Later
            </button>
            <Link
              to="/payment"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-yellow-500/20 hover:brightness-110 transition"
            >
              Upgrade for Rs. 500
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};
