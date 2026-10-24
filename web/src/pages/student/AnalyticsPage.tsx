import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle, TrendingUp, Clock, AlertTriangle, Lightbulb, Star, RotateCcw, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AnalyticsData } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const lang = (userProfile?.language || 'tamil').toLowerCase();

  const getLabel = (key: string) => {
    const dict: Record<string, Record<string, string>> = {
      title: { english: 'AI Learning Insights', sinhala: 'AI ඉගෙනුම් තීක්ෂ්ණ බුද්ධිය', tamil: 'AI கற்றல் நுண்ணறிவு' },
      analyzing: { english: 'AI is analyzing your learning and quiz history...', sinhala: 'AI ඔබගේ ඉගෙනුම් ඉතිහාසය විශ්ලේෂණය කරයි...', tamil: 'AI உங்கள் கற்றல் வரலாற்றை பகுப்பாய்வு செய்கிறது...' },
      quizzes: { english: 'Quizzes Taken', sinhala: 'ලබාගත් ප්‍රශ්නාවලිය', tamil: 'விடை கொடுத்தவை' },
      accuracy: { english: 'Accuracy', sinhala: 'නිරවද්‍යතාවය', tamil: 'துல்லியம்' },
      studyTime: { english: 'Study Time', sinhala: 'අධ්‍යයන කාලය', tamil: 'படிப்பு நேரம்' },
      strengths: { english: 'Your Strengths', sinhala: 'ඔබේ ශක්තීන්', tamil: 'உங்கள் பலங்கள்' },
      improvements: { english: 'Areas for Improvement', sinhala: 'වැඩිදියුණු කළ යුතු ක්ෂේත්‍ර', tamil: 'மேம்படுத்த வேண்டிய பகுதிகள்' },
      habits: { english: 'Study Habits', sinhala: 'අධ්‍යයන පුරුදු', tamil: 'படிப்பு பழக்கவழக்கங்கள்' },
      recommendations: { english: 'Actionable Recommendations', sinhala: 'ක්‍රියාකාරී නිර්දේශ', tamil: 'செயல்பாட்டு பரிந்துரைகள்' },
      target: { english: 'Target:', sinhala: 'ඉලක්කය:', tamil: 'இலக்கு:' },
      benefit: { english: 'Benefit:', sinhala: 'ප්‍රතිලාභ:', tamil: 'நன்மை:' },
      mins: { english: 'mins', sinhala: 'මිනි', tamil: 'நிமி' },
    };
    return dict[key]?.[lang] || dict[key]?.['tamil'] || key;
  };

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);

    try {
      const { generateStudentAnalytics } = await import('../../services/geminiService');
      const data = await generateStudentAnalytics(currentUser.uid, lang);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser, lang]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-yellow-400" /> Powered by Gemini AI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getLabel('title')}
            </h1>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh Analysis"
        >
          <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-900/60 rounded-3xl border border-slate-800 text-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-4" />
          <h3 className="text-base font-bold text-white mb-1">
            {getLabel('analyzing')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Correlating past quiz scores, study duration, and subject performance with Gemini.
          </p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Analysis Could Not Be Loaded</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition"
          >
            Retry Analysis
          </button>
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* Summary Metrics */}
          {analytics.summary_metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">{getLabel('quizzes')}</span>
                  <span className="text-2xl font-black text-white">
                    {analytics.summary_metrics.total_quizzes_taken || 0}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">{getLabel('accuracy')}</span>
                  <span className="text-2xl font-black text-white">
                    {analytics.summary_metrics.overall_accuracy_percentage || 0}%
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center space-x-4 shadow-lg">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">{getLabel('studyTime')}</span>
                  <span className="text-2xl font-black text-white">
                    {analytics.summary_metrics.total_study_time_minutes || 0} {getLabel('mins')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Strengths */}
          {analytics.strengths && analytics.strengths.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{getLabel('strengths')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-md"
                  >
                    <h4 className="font-bold text-sm sm:text-base text-white capitalize">
                      {item.subject} • {item.topic}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses / Improvement Areas */}
          {analytics.weaknesses_and_gaps && analytics.weaknesses_and_gaps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>{getLabel('improvements')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.weaknesses_and_gaps.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-red-500/20 space-y-1.5 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-white capitalize">
                        {item.subject} • {item.topic}
                      </h4>
                      {item.priority && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                          {item.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.issue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Habits */}
          {analytics.study_habit_insights && analytics.study_habit_insights.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span>{getLabel('habits')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.study_habit_insights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-md"
                  >
                    <h4 className="font-bold text-sm sm:text-base text-white capitalize">
                      {item.insight_type}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {analytics.actionable_recommendations && analytics.actionable_recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-400" />
                <span>{getLabel('recommendations')}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.actionable_recommendations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/30 space-y-2 shadow-md"
                  >
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      {item.action_item}
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong className="text-slate-400">{getLabel('target')}</strong> {item.target_document_or_topic}
                      </p>
                      <p>
                        <strong className="text-slate-400">{getLabel('benefit')}</strong> {item.estimated_benefit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
