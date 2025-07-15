// Base Types
export interface ExamItem {
  id: string;
  title: string;
  description?: string;
  gradeId?: string;
  questionCount: number;
  timeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  createdAt: string;
  updatedAt: string;
  latestScore: string;
  status: string;
  exam_index: string;
  documentId: string;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  userAnswer: string | null;
  correctAnswer?: string;
  isCorrect: boolean;
  isSkipped: boolean;
  timeSpent: number;
  options?: string[];
  explanation?: string;
}

export interface BaseSession {
  sessionId: string;
  sessionType: 'exam' | 'daily-exercise';
  questions: Question[];
  startTime: number;
  timeLimit?: number;
}

export interface ExamSession extends BaseSession {
  sessionType: 'exam';
  examId: string;
  examTitle: string;
}

export interface DailyExerciseSession extends BaseSession {
  sessionType: 'daily-exercise';
  questionCount: number;
}

export type QuestionSession = ExamSession | DailyExerciseSession;

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  timeAllowed?: number;
}

export interface SessionResult {
  sessionId: string;
  sessionType: 'exam' | 'daily-exercise';
  answers: QuestionAnswer[];
  totalTime: number;
  score: number;
  streaks: number;
  resilience: number;
  completedAt: number;
}

export interface UserExamResult {
  id: string;
  documentId: string;
  userId: string;
  examId?: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  totalTime: number;
  streaks: number;
  resilience: number;
  pace: number;
  percentage: number;
  completedAt: string;
  answers: QuestionAnswer[];
}

export interface UserDailyExerciseResult {
  id: string;
  userId: string;
  sessionId: string;
  score: number;
  totalQuestions: number;
  streaks: number;
  resilience: number;
  level: number;
  pace: number;
  percentage: number;
  completedAt: string;
  answers: QuestionAnswer[];
}

export interface StatMetrics {
  average: number;
  median: number;
}

export interface ExamStats {
  examId?: string;
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  pace: StatMetrics;
  streaks: StatMetrics;
  resilience: StatMetrics;
  lastUpdated: string;
}

export interface UserStats {
  pace: number;
  streaks: number;
  resilience: number;
  score: number;
}

export interface UserAverageState {
  averageScore: number;
  averagePercentage: number;
  averageTime: number;
  averagePace: number;
  totalAttempts: number;
  totalTimeSpent: number;
  bestScore: number;
  bestPercentage: number;
  improvementRate: number;
  pace: StatMetrics;
  streaks: StatMetrics;
  resilience: StatMetrics;
  lastUpdated: string;
}

export interface SchoolStats {
  id: number;
  documentId: string;
  name: string;
  totalUsers: number;
}

export interface CreateSessionParams {
  type: 'exam' | 'daily-exercise';
  examId?: string;
  questionCount?: number;
}

export interface SubmitResultsParams {
  sessionId: string;
  answers: QuestionAnswer[];
  totalTime: number;
  level?: number;
  questionCount?: number;
}

export interface ApiQuestionAnswer {
  question_id: string;
  question: string;
  answer: string;
  speed: number;
  is_correct: boolean;
}

export interface SubmitExamApiResponse {
  success: boolean;
  message: string;
  data: {
    saveResult: {
      success: boolean;
      message: string;
      data: UserExamResult;
    };
    newUserStats: UserStats;
    examStats: ExamStats;
    userAverage: UserAverageState;
    school_stats: SchoolStats[];
  };
}

export interface SubmitDailyExerciseApiResponse {
  success: boolean;
  message: string;
  data: {
    saveResult: {
      success: boolean;
      message: string;
      data: UserDailyExerciseResult;
    };
    newUserStats: UserStats;
    userAverage: UserAverageState;
  };
}

export interface ExamState {
  exams: ExamItem[];
  currentSession: QuestionSession | null;
  sessionResult: SessionResult | null;
  selectedExam: ExamItem | null;
  userAverage: UserAverageState | null;
  isLoadingExams: boolean;
  isLoadingSession: boolean;
  isSubmittingResults: boolean;
  error: string | null;
}

export interface ExtendedExamState extends ExamState {
  userExamResult: UserExamResult | null;
  userDailyExerciseResult: UserDailyExerciseResult | null;
  examStats: ExamStats | null;
  userStats: UserStats | null;
  schoolStats: SchoolStats[] | null;
  examResult: ExamResult | null;
  dailyExerciseResult: ExamResult | null;
  isLoadingExamResult: boolean;
  isLoadingDailyExerciseResult: boolean;
}

// Action Types
export interface ExamActions {
  fetchExams: (gradeId?: string) => Promise<ExamItem[]>;
  setSelectedExam: (exam: ExamItem | null) => void;
  createSession: (params: CreateSessionParams) => Promise<QuestionSession>;
  startExamSession: (examId: string) => Promise<ExamSession>;
  startDailyExerciseSession: (questionCount: number) => Promise<DailyExerciseSession>;
  setCurrentSession: (session: QuestionSession | null) => void;
  clearSession: () => void;
  submitResults: (params: SubmitResultsParams) => Promise<UserExamResult | UserDailyExerciseResult>;
  setSessionResult: (result: SessionResult | null) => void;
  clearError: () => void;
  setLoadingState: (
    key: keyof Pick<
      ExtendedExamState,
      'isLoadingExams' | 'isLoadingSession' | 'isSubmittingResults'
    >,
    value: boolean,
  ) => void;
  resetStore: () => void;
  fetchExamResult: (examId: string) => Promise<ExamResult>;
  fetchDailyExerciseResult: (examId: string) => Promise<ExamResult>;
}

export type ExamStore = ExtendedExamState & ExamActions;

export type SessionType = 'exam' | 'daily-exercise';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type LoadingStateKey = 'isLoadingExams' | 'isLoadingSession' | 'isSubmittingResults';

export interface ExamResultResponse {
  data: ExamResult;
}

export interface ExamResult {
  id: number;
  documentId: string;
  pace: number;
  streaks: number;
  resilience: number;
  score: number;
  total_time: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  question_collections: {
    question: string;
    is_correct: boolean;
    question_id: string;
    user_speed: number;
    user_answer: string;
    avgSpeed: number;
    medianSpeed: number;
    correct_answer: number
  }[];
  grade: {
    id: number;
    documentId: string;
    title: string;
    desc: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    index: number;
  };
  exam_index: number;
  attempt: number;
  total_attempts: number;
}