export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  district: string;
  isPremium: boolean;
  premiumExpiry?: number;
  isAdmin: boolean;
  language: 'tamil' | 'english' | 'sinhala' | string;
  freeDownloadsCount: number;
}

export interface AppFolder {
  id: string;
  name: string;
  isPremium: boolean;
}

export interface SubFolderItem {
  name: string;
  isPremiumRequired: boolean;
}

export interface FileMetadata {
  id: string; // sha from GitHub
  title: string;
  fileName: string;
  downloadUrl: string;
  timestamp?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  rationale: string;
}

export interface QuizHistoryItem {
  id?: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timestamp: number;
}

export interface DocumentHistoryItem {
  id?: string;
  documentName: string;
  topic: string;
  totalPages: number;
  pagesRead: number;
  timeSpentMinutes: number;
  highlightsCount: number;
  timestamp: number;
}

export interface AccessCode {
  code: string;
  isUsed: boolean;
  usedBy: string;
  usedAt: number;
}

export interface Suggestion {
  id: string;
  fileName: string;
  subject: string;
  folder: string;
  downloadUrl: string;
  userEmail: string;
  timestamp: number;
}

export interface PendingApproval {
  id: string;
  userId: string;
  userEmail: string;
  receiptUrl: string;
  timestamp: number;
}

export interface AnalyticsSummaryMetrics {
  total_quizzes_taken: number;
  overall_accuracy_percentage: number;
  total_study_time_minutes: number;
}

export interface AnalyticsStrength {
  subject: string;
  topic: string;
  reason: string;
}

export interface AnalyticsWeakness {
  subject: string;
  topic: string;
  issue: string;
  priority: string;
}

export interface AnalyticsHabit {
  insight_type: string;
  description: string;
}

export interface AnalyticsRecommendation {
  action_item: string;
  target_document_or_topic: string;
  estimated_benefit: string;
}

export interface AnalyticsData {
  summary_metrics?: AnalyticsSummaryMetrics;
  strengths?: AnalyticsStrength[];
  weaknesses_and_gaps?: AnalyticsWeakness[];
  study_habit_insights?: AnalyticsHabit[];
  actionable_recommendations?: AnalyticsRecommendation[];
}
