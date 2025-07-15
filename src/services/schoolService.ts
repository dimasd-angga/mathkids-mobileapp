import { apiRequest } from './api';
import { ENDPOINTS } from '@/constants/apiEndpoints';
import { SchoolsApiResponse, SchoolItem } from '@/types/school.types';

export const schoolService = {
  getSchools: async (): Promise<SchoolItem[]> => {
    const response = await apiRequest<SchoolsApiResponse>({
      url: ENDPOINTS.SCHOOL.SCHOOLS,
      method: 'GET',
    });

    return response.data || [];
  },
};
