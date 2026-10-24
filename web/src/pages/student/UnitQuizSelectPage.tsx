import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, ArrowRight, Star, Dna, FlaskConical, Atom, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUnitsForSubject } from '../../services/quizPool';
import { Modal } from '../../components/common/Modal';

export const UnitQuizSelectPage: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const decodedSubject = decodeURIComponent(subjectName || 'Biology');
  const { isPremium, userProfile } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<string>('');

  const units = getUnitsForSubject(decodedSubject);
  const userLang = (userProfile?.language || 'tamil').toLowerCase();

  const getSubjectMeta = () => {
    const s = decodedSubject.toLowerCase();
    if (s.includes('bio')) {
      return {
        icon: Dna,
        title: 'Biology',
        badge: '10 Syllabus Units',
        gradient: 'from-emerald-950/50 via-slate-900 to-slate-900',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/10 text-emerald-400',
      };
    } else if (s.includes('chem')) {
      return {
        icon: FlaskConical,
        title: 'Chemistry',
        badge: '14 Syllabus Units',
        gradient: 'from-amber-950/50 via-slate-900 to-slate-900',
        border: 'border-amber-500/30',
        iconBg: 'bg-amber-500/10 text-amber-400',
      };
    } else {
      return {
        icon: Atom,
        title: 'Physics',
        badge: '11 Syllabus Units',
        gradient: 'from-cyan-950/50 via-slate-900 to-slate-900',
        border: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/10 text-cyan-400',
      };
    }
  };

  const meta = getSubjectMeta();
  const SubjectIcon = meta.icon;

  const filteredUnits = units.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      u.name.toLowerCase().includes(q) ||
      u.nameTamil.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q) ||
      `unit ${u.id}`.includes(q)
    );
  });

  const handleStartUnitQuiz = (unitId: number, unitName: string) => {
    if (!isPremium) {
      setSelectedUnitForModal(`Unit ${unitId}: ${unitName}`);
      setShowPremiumModal(true);
      return;
    }
    navigate(`/quiz/${encodeURIComponent(decodedSubject)}?unit=${unitId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/folder/${encodeURIComponent(decodedSubject)}`)}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition shadow-md"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-400 font-bold uppercase tracking-wider capitalize">
                {decodedSubject}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Unit-wise Quizzes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight mt-0.5">
              {decodedSubject} — Chapter Tests
            </h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <SubjectIcon className="w-4 h-4 text-brand-400" />
          <span>{meta.badge}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${units.length} units in ${decodedSubject}... (e.g. Unit 3 or Genetics)`}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition shadow-inner"
        />
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUnits.map((unit) => {
          const displayTitle = userLang === 'tamil' ? unit.nameTamil : unit.name;
          const secondaryTitle = userLang === 'tamil' ? unit.name : unit.nameTamil;

          return (
            <div
              key={unit.id}
              onClick={() => handleStartUnitQuiz(unit.id, unit.name)}
              className="group p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-850/80 transition-all duration-200 flex flex-col justify-between h-48 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-black">
                    UNIT {unit.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {!isPremium ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                        <Lock className="w-3 h-3" /> PREMIUM
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                        {unit.questionCount} Questions
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight group-hover:text-brand-300 transition-colors line-clamp-1">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {secondaryTitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
                  {unit.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                  Take Unit Test
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-brand-600 transition shadow-md">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
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
            Unlock {selectedUnitForModal}
          </h4>
          <p className="text-sm text-slate-300">
            Unit-wise practice tests are an exclusive premium feature providing targeted MCQs for every syllabus unit with detailed explanations.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full access to all 35 A/L units across Biology, Chemistry & Physics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Subject Elaborations + Daily Quizzes</span>
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
