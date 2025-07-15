import { create } from 'zustand';
import { examService } from '@/services/examService';
import {
  ExamItem,
  ExamState,
  QuestionSession,
  ExamSession,
  DailyExerciseSession,
  QuestionAnswer,
  SessionResult,
  CreateSessionParams,
  SubmitResultsParams,
  UserExamResult,
  UserDailyExerciseResult,
  ExamStats,
  SubmitExamApiResponse,
  SubmitDailyExerciseApiResponse,
  ExtendedExamState,
  ExamStore,
  SchoolStats,
} from '@/types/exams.types';
import { devtools } from 'zustand/middleware';

const calculateStreaks = (answers: QuestionAnswer[]): number => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return 0;
  }

  let maxStreak = 0;
  let currentStreak = 0;

  for (const answer of answers) {
    if (answer.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
};

const validateSubmitResultsParams = (params: SubmitResultsParams): void => {
  if (!params.sessionId || typeof params.sessionId !== 'string') {
    throw new Error('Invalid sessionId: must be a non-empty string');
  }

  if (!Array.isArray(params.answers)) {
    throw new Error('Invalid answers: must be an array');
  }

  if (typeof params.totalTime !== 'number' || params.totalTime < 0) {
    throw new Error('Invalid totalTime: must be a non-negative number');
  }
};

export const createExamStore = () => {
  const initialState: ExtendedExamState = {
    exams: [],
    currentSession: null,
    sessionResult: null,
    selectedExam: null,
    userExamResult: null,
    userDailyExerciseResult: null,
    examStats: null,
    userStats: null,
    schoolStats: null,
    userAverage: null,
    isLoadingExams: false,
    isLoadingSession: false,
    isSubmittingResults: false,
    error: null,
    examResult: null,
    isLoadingExamResult: false,
    dailyExerciseResult: null,
    isLoadingDailyExerciseResult: false,
  };

  const store = create<ExamStore>()(
    devtools(
      (set, get) => ({
        ...initialState,

        fetchExams: async (gradeId?: string) => {
          const { setLoadingState } = get();

          try {
            setLoadingState('isLoadingExams', true);
            set({ error: null });

            const exams = await examService.getExams(gradeId);

            set({
              exams,
              isLoadingExams: false,
            });

            return exams;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch exams';
            console.error('Exam store - fetchExams error:', error);

            set({
              isLoadingExams: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        setSelectedExam: exam => {
          set({ selectedExam: exam });
        },

        createSession: async params => {
          const { setLoadingState } = get();

          try {
            setLoadingState('isLoadingSession', true);
            set({ error: null });

            let session: QuestionSession;

            if (params.type === 'exam') {
              session = await examService.getExamSession(params.examId);
            } else {
              session = await examService.getDailyExerciseSession(params.questionCount);
            }

            set({
              currentSession: session,
              isLoadingSession: false,
            });

            return session;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to create session';
            console.error('Exam store - createSession error:', error);

            set({
              isLoadingSession: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        startExamSession: async examId => {
          const session = await get().createSession({ type: 'exam', examId });
          return session as ExamSession;
        },

        startDailyExerciseSession: async questionCount => {
          const session = await get().createSession({ type: 'daily-exercise', questionCount });
          return session as DailyExerciseSession;
        },

        setCurrentSession: session => {
          set({ currentSession: session });
        },

        clearSession: () => {
          set({
            currentSession: null,
            sessionResult: null,
            selectedExam: null,
            userExamResult: null,
            userDailyExerciseResult: null,
            examStats: null,
            userStats: null,
            schoolStats: null,
            error: null,
          });
        },

        submitResults: async params => {
          const { setLoadingState, currentSession } = get();

          try {
            validateSubmitResultsParams(params);

            setLoadingState('isSubmittingResults', true);
            set({ error: null });

            const totalTime = params.totalTime;
            const score = params.answers.filter(a => a.isCorrect).length;
            const streaks = calculateStreaks(params.answers);

            // Use the resilience count passed from ExamScreen, or calculate as fallback
            const resilience = params.resilience !== undefined ? params.resilience : 0;

            console.log('Submit results - resilience count:', resilience);

            const sessionResult: SessionResult = {
              sessionId: params.sessionId,
              sessionType: currentSession?.sessionType || 'exam',
              answers: params.answers,
              totalTime,
              score,
              streaks,
              resilience,
              completedAt: Date.now(),
            };

            const apiAnswers = params.answers.map((answer, index) => {
              if (!answer.questionId || !answer.question) {
                throw new Error(`Invalid answer at index ${index}: missing required fields`);
              }

              return {
                question_id: answer.questionId,
                question: answer.question,
                answer: answer.userAnswer || '',
                speed: Math.max(0, answer.timeSpent),
              };
            });

            const formData = new FormData();
            formData.append('examId', params.sessionId);
            formData.append('answers', JSON.stringify(apiAnswers));
            formData.append('streaks', String(streaks));
            formData.append('resilience', String(resilience));

            if (currentSession?.sessionType === 'daily-exercise') {
              const level = params.level || 1;
              formData.append('level', String(level));
              formData.append('total_time', String(totalTime));
              formData.append('daily', String(params.questionCount));

              console.log({ examId: params.sessionId });
              console.log({ answers: apiAnswers });
              console.log({ streaks: streaks });
              console.log({ resilience: resilience });
              console.log({ level: level });

              const response: SubmitDailyExerciseApiResponse =
                await examService.submitDailyExerciseResults(formData);

              console.log({ responsePostDaily: response });

              if (!response.data?.saveResult?.data) {
                throw new Error('Invalid response from server: missing result data');
              }

              const { saveResult, newUserStats, userAverage, school_stats } = response.data;

              set({
                sessionResult,
                userExamResult: saveResult.data,
                userStats: newUserStats,
                userAverage: userAverage,
                schoolStats: school_stats || [],
                isSubmittingResults: false,
              });

              return saveResult.data;
            } else {
              // Submit to exam API
              formData.append('total_time', String(totalTime));

              const response: SubmitExamApiResponse = await examService.submitExamResults(formData);

              if (!response.data?.saveResult?.data) {
                throw new Error('Invalid response from server: missing result data');
              }
              console.log('response submit exam', response.data);
              const { saveResult, newUserStats, examStats, userAverage, school_stats } =
                response.data;

              set({
                sessionResult,
                userExamResult: saveResult.data,
                userStats: newUserStats,
                userAverage: userAverage,
                examStats,
                schoolStats: school_stats || [],
                isSubmittingResults: false,
              });

              return saveResult.data;
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to submit results';
            console.error('Exam store - submitResults error:', error);

            set({
              isSubmittingResults: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        setSessionResult: result => {
          set({ sessionResult: result });
        },

        clearError: () => {
          set({ error: null });
        },

        setLoadingState: (key, value) => {
          set({ [key]: value });
        },

        resetStore: () => {
          set(initialState);
        },

        fetchExamResult: async (examId: string) => {
          try {
            set({ error: null, isLoadingExamResult: true });

            const response = await examService.getExamResult(examId);

            set({
              examResult: response,
              isLoadingExamResult: false,
            });

            return response;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to fetch exam result';
            console.error('Exam store - fetchExamResult error:', error);

            set({
              isLoadingExamResult: false,
              error: errorMessage,
            });

            throw error;
          }
        },

        fetchDailyExerciseResult: async (exerciseId: string) => {
          try {
            set({ error: null, isLoadingDailyExerciseResult: true });

            const response = await examService.getDailyExerciseResult(exerciseId);

            set({
              dailyExerciseResult: response,
              isLoadingDailyExerciseResult: false,
            });

            return response;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to fetch exam result';
            console.error('Exam store - fetchExamResult error:', error);

            set({
              isLoadingDailyExerciseResult: false,
              error: errorMessage,
            });

            throw error;
          }
        },
      }),
      {
        name: 'exam-store',
      },
    ),
  );

  return store;
};

let examStoreRef: ReturnType<typeof createExamStore> | null = null;

export const getExamStore = () => {
  if (!examStoreRef) {
    examStoreRef = createExamStore();
  }
  return examStoreRef;
};

const examStore = getExamStore();
