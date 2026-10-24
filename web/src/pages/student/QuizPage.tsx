import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Award, ArrowRight, HelpCircle, Loader2, Sparkles, Clock, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ref, get, push, set, serverTimestamp } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import type { QuizQuestion } from '../../types';
import { getQuizForDay, getQuizForUnit, getUnitsForSubject } from '../../services/quizPool';

export const QuizPage: React.FC = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const decodedSubject = decodeURIComponent(subjectName || 'Subject');
  const [searchParams] = useSearchParams();
  const unitParam = searchParams.get('unit');
  const unitId = unitParam ? parseInt(unitParam, 10) : null;

  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Review mode state
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const units = getUnitsForSubject(decodedSubject);
  const currentUnitObj = unitId ? units.find((u) => u.id === unitId) : null;
  const quizTitle = unitId
    ? `${decodedSubject} — Unit ${unitId}: ${currentUnitObj ? currentUnitObj.nameTamil : 'Chapter Test'}`
    : `${decodedSubject} Daily Quiz`;

  // Live timer ticker
  useEffect(() => {
    if (isFinished || isLoading) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, isLoading, startTime]);

  const loadQuiz = async () => {
    setIsLoading(true);

    try {
      const userLang = (userProfile?.language || 'tamil').toLowerCase().trim();
      const normSubject = decodedSubject.toLowerCase().trim();

      if (unitId) {
        // ──────────────────────────────────────────────────────────────────
        // 🥇 PRIORITY 1: Firebase pre-generated unit quiz (from NIE PDFs)
        //    Path: daily_quizzes_v4/unit_quizzes/{lang}/{subject}/unit_{unitId}/{today}
        // ──────────────────────────────────────────────────────────────────
        try {
          const today = new Date().toISOString().split('T')[0];
          const unitDbRef = ref(database, `daily_quizzes_v4/unit_quizzes/${userLang}/${normSubject}/unit_${unitId}/${today}`);
          const unitSnapshot = await get(unitDbRef);
          if (unitSnapshot.exists()) {
            const { autoFixQuizQuestion } = await import('../../services/nieTerminologyMaster');
            const list: QuizQuestion[] = [];
            unitSnapshot.forEach((child) => {
              const val = child.val();
              if (val && val.question) {
                const fixed = autoFixQuizQuestion({
                  question: val.question,
                  options: val.options || [],
                  answerIndex: Number(val.answerIndex || 0),
                  rationale: val.rationale || '',
                });
                list.push(fixed);
              }
            });
            if (list.length >= 3) {
              setQuestions(list);
              setIsLoading(false);
              return;
            }
          }
        } catch (fbErr) {
          console.warn('Firebase unit quiz fetch failed, trying dynamic generation', fbErr);
        }

        // ──────────────────────────────────────────────────────────────────
        // 🥈 PRIORITY 2: Dynamic AI generation (live Gemini call)
        // ──────────────────────────────────────────────────────────────────
        try {
          const { generateDynamicUnitQuiz } = await import('../../services/geminiService');
          const { validateQuestionPositiveNIE } = await import('../../services/nieWriteGuard');
          const { autoFixQuizQuestion } = await import('../../services/nieTerminologyMaster');
          
          const rawQuestions = await generateDynamicUnitQuiz(normSubject, unitId, userLang);
          const validQuestions: QuizQuestion[] = [];
          
          for (let q of rawQuestions) {
            q = autoFixQuizQuestion(q);
            const result = validateQuestionPositiveNIE(q, normSubject, unitId);
            if (result.isValid) {
              validQuestions.push(q);
            } else {
              console.warn("Question blocked even after auto-fix:", result.violations);
            }
          }
          
          if (validQuestions.length >= 3) {
            setQuestions(validQuestions);
            setIsLoading(false);
            return;
          } else {
            console.warn("AI generated quiz failed NIE terminology guard. Falling back to offline pool.");
            setQuestions(getQuizForUnit(decodedSubject, unitId));
          }
        } catch (e) {
          console.warn("Dynamic quiz generation failed, falling back", e);
          setQuestions(getQuizForUnit(decodedSubject, unitId));
        }
        setIsLoading(false);
        return;
      }

      // Otherwise load daily quiz from Firebase with fallback
      const today = new Date().toISOString().split('T')[0];

      const dbRef = ref(database, `daily_quizzes_v4/${userLang}/${normSubject}/${today}`);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const list: QuizQuestion[] = [];
        snapshot.forEach((child) => {
          const val = child.val();
          if (val && val.question) {
            list.push({
              question: val.question,
              options: val.options || [],
              answerIndex: Number(val.answerIndex || 0),
              rationale: val.rationale || 'No explanation provided.',
            });
          }
        });
        if (list.length > 0) {
          setQuestions(list);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local offline pool
      const poolQuestions = getQuizForDay(normSubject, new Date().getDate());
      setQuestions(poolQuestions);
    } catch (err: any) {
      console.warn('Firebase quiz fetch failed, using offline pool', err);
      setQuestions(getQuizForDay(decodedSubject, new Date().getDate()));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [decodedSubject, unitId, userProfile?.language]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.answerIndex;
    const newAnswers = { ...userAnswers, [currentIndex]: selectedOption };
    setUserAnswers(newAnswers);

    let updatedScore = score;
    if (isCorrect) {
      updatedScore += 1;
      setScore(updatedScore);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      // Finish Quiz
      setIsFinished(true);

      // Trigger Confetti fireworks!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }

      if (currentUser) {
        const timeTakenSec = Math.round((Date.now() - startTime) / 1000);
        const historyRef = push(ref(database, `users/${currentUser.uid}/history/quizzes`));

        set(historyRef, {
          id: historyRef.key,
          subject: decodedSubject,
          topic: unitId ? `Unit ${unitId}: ${currentUnitObj?.name || 'Chapter'}` : 'Daily Quiz',
          score: updatedScore,
          totalQuestions: questions.length,
          timeTakenSeconds: timeTakenSec,
          correctAnswers: updatedScore,
          incorrectAnswers: questions.length - updatedScore,
          timestamp: serverTimestamp(),
        }).catch((e) => console.warn('Could not save quiz result', e));
      }
    }
  };

  const handleExit = () => {
    if (unitId) {
      navigate(`/quiz-units/${encodeURIComponent(decodedSubject)}`);
    } else {
      navigate(`/folder/${encodeURIComponent(decodedSubject)}`);
    }
  };

  const currentQ = isReviewMode ? questions[reviewIndex] : questions[currentIndex];
  const progressPercent = questions.length > 0
    ? Math.round(((currentIndex + (isFinished ? 1 : 0)) / questions.length) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="flex items-center space-x-2 p-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center space-x-3">
          {!isFinished && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-brand-300">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
            {unitId ? <Target className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="capitalize">{unitId ? `Unit ${unitId} Test` : `${decodedSubject} Daily Quiz`}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-slate-900/60 rounded-3xl border border-slate-800 text-center shadow-xl">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-white">Loading Questions...</h3>
          <p className="text-xs text-slate-400 mt-1">Preparing {quizTitle}</p>
        </div>
      ) : isFinished && !isReviewMode ? (
        /* Quiz Finished Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex p-5 rounded-3xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white shadow-2xl shadow-brand-600/40 mb-2 animate-bounce">
            <Award className="w-14 h-14" />
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Test Completed!</h2>
            <p className="text-sm text-slate-400 mt-1">{quizTitle}</p>
          </div>

          {/* Score Card */}
          <div className="max-w-sm mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Result</span>
            <div className="text-5xl font-black bg-gradient-to-r from-brand-400 via-purple-300 to-amber-400 bg-clip-text text-transparent">
              {score} / {questions.length}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                {Math.round((score / questions.length) * 100)}% Accuracy
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-bold">
                ⏱ {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => {
                setIsReviewMode(true);
                setReviewIndex(0);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Review Answers & Rationales</span>
            </button>

            <button
              onClick={handleExit}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition"
            >
              {unitId ? 'Back to Unit Selection' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      ) : (
        /* Question Card */
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-7">
          {/* Progress Bar & Counter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-400">
                {isReviewMode ? `Reviewing Question ${reviewIndex + 1} of ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}
              </span>
              <span className="text-slate-400 font-semibold">{progressPercent}% Completed</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-relaxed tracking-tight">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3.5">
            {currentQ.options.map((option, idx) => {
              let cardStyle = 'bg-slate-950/60 border-slate-800/90 text-slate-200 hover:border-slate-700 hover:bg-slate-950';

              if (isReviewMode) {
                const userPicked = userAnswers[reviewIndex] === idx;
                const isCorrect = idx === currentQ.answerIndex;

                if (isCorrect) {
                  cardStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-bold shadow-lg shadow-emerald-500/10';
                } else if (userPicked && !isCorrect) {
                  cardStyle = 'bg-red-500/15 border-red-500/60 text-red-200 font-bold shadow-lg shadow-red-500/10';
                }
              } else {
                if (selectedOption === idx) {
                  cardStyle = 'bg-brand-600/20 border-brand-500 text-brand-200 font-bold shadow-lg shadow-brand-500/20 scale-[1.01]';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => !isReviewMode && setSelectedOption(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                    !isReviewMode ? 'cursor-pointer active:scale-[0.99]' : ''
                  } ${cardStyle}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition ${
                      selectedOption === idx && !isReviewMode
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                  </div>

                  {isReviewMode && idx === currentQ.answerIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isReviewMode && userAnswers[reviewIndex] === idx && idx !== currentQ.answerIndex && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation in Review Mode */}
          {isReviewMode && currentQ.rationale && (
            <div className="p-5 rounded-2xl bg-brand-950/50 border border-brand-500/30 space-y-2 animate-fade-in shadow-lg">
              <h4 className="text-xs font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-yellow-400" /> Explanation & Rationale
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {currentQ.rationale}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
            {isReviewMode ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                  disabled={reviewIndex === 0}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition disabled:opacity-30"
                >
                  Previous
                </button>
                {reviewIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setReviewIndex(reviewIndex + 1)}
                    className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={() => setIsReviewMode(false)}
                    className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Close Review
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz & View Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
