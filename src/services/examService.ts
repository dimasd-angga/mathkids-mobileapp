import { BACKOFFICE_BASE_URL, BACKOFFICE_SECRET, ENDPOINTS } from '@/constants/apiEndpoints';
import { ApiResponse } from '@/types/api.types';
import {
  DailyExerciseApiResponse,
  DailyExerciseSession,
  ExamItem,
  ExamQuestionsApiResponse,
  ExamsApiResponse,
  ExamSession,
  QuestionSession,
  SubmitExamApiResponse,
  SubmitDailyExerciseApiResponse,
  Question,
  ExamResult,
  ExamResultResponse,
} from '@/types/exams.types';
import { apiRequest } from './api';

const normalizeQuestions = (questions: any[]): Question[] => {
  if (!Array.isArray(questions)) {
    throw new Error('Invalid questions data: expected array');
  }

  return questions.map((q, index) => {
    if (!q || typeof q !== 'object') {
      throw new Error(`Invalid question at index ${index}: expected object`);
    }

    if (!q.id || !q.documentId || !q.question) {
      throw new Error(`Missing required fields in question at index ${index}`);
    }

    return {
      id: q.id,
      documentId: q.documentId,
      question: q.question,
      answer: q.answer || q.correct_answer || '',
      renderType: q.renderType || { id: 0, documentId: '', name: 'default' },
      operator: q.operator || '',
    };
  });
};

const getCommonHeaders = () => ({
  'x-server-token': BACKOFFICE_SECRET,
});

const createApiConfig = (overrides: any = {}) => ({
  baseURL: BACKOFFICE_BASE_URL,
  headers: getCommonHeaders(),
  ...overrides,
});

export const examService = {
  getExams: async (gradeId?: string): Promise<ExamItem[]> => {
    try {
      const params: Record<string, string> = {
        sort: 'exam_index',
      };

      if (gradeId) {
        params.grade = gradeId;
      }

      const response = await apiRequest<ExamsApiResponse>(
        createApiConfig({
          url: ENDPOINTS.EXAM.USER,
          method: 'GET',
          params,
        }),
      );

      if (!response.data?.exams) {
        console.warn('No exams data received from API');
        return [];
      }

      return response.data.exams;
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to fetch exams: ${error.message}`
          : 'Failed to fetch exams: Unknown error',
      );
    }
  },

  getExamSession: async (examId: string): Promise<ExamSession> => {
    if (!examId || typeof examId !== 'string') {
      throw new Error('Invalid examId: must be a non-empty string');
    }

    try {
      const response = await apiRequest<ExamQuestionsApiResponse>(
        createApiConfig({
          url: ENDPOINTS.EXAM.QUESTIONS,
          method: 'GET',
          params: { id: examId },
        }),
      );

      const data = response.data;
      if (!data) {
        throw new Error('No exam data received from API');
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid exam data: missing or invalid questions');
      }

      return {
        sessionId: data.examId || examId,
        questions: normalizeQuestions(data.questions),
        sessionType: 'exam',
        examId: examId,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get exam session:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to get exam session: ${error.message}`
          : 'Failed to get exam session: Unknown error',
      );
    }
  },

  getDailyExerciseSession: async (questionCount: number): Promise<DailyExerciseSession> => {
    if (!Number.isInteger(questionCount) || questionCount <= 0) {
      throw new Error('Invalid questionCount: must be a positive integer');
    }

    try {
      const response = await apiRequest<DailyExerciseApiResponse>(
        createApiConfig({
          url: '/daily-exercise',
          method: 'GET',
          params: {
            daily: questionCount.toString(),
          },
        }),
      );

      if (!response.questions || !Array.isArray(response.questions)) {
        throw new Error('Invalid daily exercise data: missing or invalid questions');
      }

      return {
        sessionId: response.exam.documentId,
        questions: normalizeQuestions(response.questions),
        sessionType: 'daily-exercise',
        questionCount: questionCount,
        level: response.level || 1,
        sourceExam: response.exam || undefined,
        createdAt: Date.now(),
        userStats: response.user_stats,
      };
    } catch (error) {
      console.error('Failed to get daily exercise session:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to get daily exercise session: ${error.message}`
          : 'Failed to get daily exercise session: Unknown error',
      );
    }
  },

  submitExamResults: async (formData: FormData): Promise<SubmitExamApiResponse> => {
    if (!formData || !(formData instanceof FormData)) {
      throw new Error('Invalid formData: must be a FormData instance');
    }

    const requiredFields = ['examId', 'answers', 'streaks', 'resilience', 'total_time'];
    const missingFields = requiredFields.filter(field => !formData.has(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required form fields: ${missingFields.join(', ')}`);
    }

    try {
      const response = await apiRequest<SubmitExamApiResponse>(
        createApiConfig({
          url: ENDPOINTS.EXAM.QUESTIONS,
          method: 'POST',
          data: formData,
          headers: {
            ...getCommonHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }),
      );

      if (!response.data?.saveResult?.data) {
        throw new Error('Invalid API response: missing saveResult data');
      }

      return response;
    } catch (error) {
      console.error('Failed to submit exam results:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to submit exam results: ${error.message}`
          : 'Failed to submit exam results: Unknown error',
      );
    }
  },

  submitDailyExerciseResults: async (
    formData: FormData,
  ): Promise<SubmitDailyExerciseApiResponse> => {
    if (!formData || !(formData instanceof FormData)) {
      throw new Error('Invalid formData: must be a FormData instance');
    }

    const requiredFields = [
      'examId',
      'answers',
      'streaks',
      'resilience',
      'level',
      'daily',
      'total_time',
    ];
    const missingFields = requiredFields.filter(field => !formData.has(field));

    if (missingFields.length > 0) {
      throw new Error(`Missing required form fields: ${missingFields.join(', ')}`);
    }

    try {
      const response = await apiRequest<SubmitDailyExerciseApiResponse>(
        createApiConfig({
          url: '/daily-exercise',
          method: 'POST',
          data: formData,
          headers: {
            ...getCommonHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }),
      );

      if (!response.data?.saveResult?.data) {
        throw new Error('Invalid API response: missing saveResult data');
      }

      return response;
    } catch (error) {
      console.error('Failed to submit daily exercise results:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to submit daily exercise results: ${error.message}`
          : 'Failed to submit daily exercise results: Unknown error',
      );
    }
  },

  getExamResult: async (examId: string): Promise<ExamResult> => {
    const response = await apiRequest<ExamResultResponse>({
      url: `${ENDPOINTS.EXAM.RESULT}?id=${examId}`,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });

    console.log('response getExamResult', JSON.stringify(response));

    return response.data;
  },

  getDailyExerciseResult: async (exerciseId: string): Promise<ExamResult> => {
    const response = await apiRequest<ExamResultResponse>({
      url: `${ENDPOINTS.DAILY.RESULT}?id=${exerciseId}`,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });

    console.log('response getExerciseResult', JSON.stringify(response));

    return response.data;
  },
};
