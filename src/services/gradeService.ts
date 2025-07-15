import { apiRequest } from './api';
import { ENDPOINTS } from '@/constants/apiEndpoints';
import { GradesApiResponse, GradeItem } from '@/types/grades.types';

export const gradeService = {
  getGrades: async (): Promise<GradeItem[]> => {
    const response = await apiRequest<GradesApiResponse>({
      url: ENDPOINTS.GRADE.GRADES,
      method: 'GET',
    });

    return response.data || [];
  },
};
