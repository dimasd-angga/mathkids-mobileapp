import { BACKOFFICE_BASE_URL, BACKOFFICE_SECRET, ENDPOINTS } from '@/constants/apiEndpoints';
import {
  GradeMilestoneApiResponse,
  GradeMilestoneExamsByIdResponse,
  GradeMilestoneItem,
  GradeMilestoneItemExamById,
  GradeMilestonesExamAssesment,
  GradeMilestonesExamAssesmentResponse
} from '@/types/report.types';
import { apiRequest } from './api';

export const reportService = {
  getGradeMilestoneExams: async (): Promise<GradeMilestoneItem[]> => {
    const response = await apiRequest<GradeMilestoneApiResponse>({
      url: ENDPOINTS.REPORT.GRADE_MILESTONE,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });

    console.log("response getGradeMilestoneExams", JSON.stringify(response))


    return response.data?.grades || [];
  },

  getGradeMilestoneExamsById: async (id: string): Promise<GradeMilestoneItemExamById> => {
    const response = await apiRequest<GradeMilestoneExamsByIdResponse>({
      url: `${ENDPOINTS.REPORT.GRADE_MILESTONE}/${id}`,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });

    return response.data;
  },

  getGradeMilestoneExamsAssesmentById: async (examId: string): Promise<GradeMilestonesExamAssesment> => {
    const response = await apiRequest<GradeMilestonesExamAssesmentResponse>({
      url: `${ENDPOINTS.REPORT.GRADE_MILESTONE_ASSESMENT}?id=${examId}`,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });

    console.log("response getGradeMilestoneExamsAssesment", JSON.stringify(response))

    return response.data;
  },
};
