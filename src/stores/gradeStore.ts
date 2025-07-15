import { create } from 'zustand';
import { apiRequest } from '@/services/api';
import { ENDPOINTS } from '@/constants/apiEndpoints';
import { GradesApiResponse, GradeItem, GradeState } from '@/types/grades.types';
import { gradeService } from '@/services/gradeService';

let gradeStoreRef: ReturnType<typeof createGradeStore> | null = null;

export const createGradeStore = () => {
  const store = create<
    GradeState & {
      fetchGrades: () => Promise<GradeItem[]>;
      clearError: () => void;
    }
  >(set => ({
    grades: [],
    isLoading: false,
    error: null,

    fetchGrades: async () => {
      try {
        set({ isLoading: true, error: null });

        const grades = await gradeService.getGrades();

        set({
          grades,
          isLoading: false,
        });

        return grades;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch grades',
        });
        throw error;
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }));

  return store;
};

export const getGradeStore = () => {
  if (!gradeStoreRef) {
    gradeStoreRef = createGradeStore();
  }
  return gradeStoreRef;
};

const gradeStore = getGradeStore();
export default gradeStore;