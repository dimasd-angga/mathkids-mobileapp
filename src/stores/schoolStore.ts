import { create } from 'zustand';
import { SchoolItem, SchoolState } from '@/types/school.types';
import { schoolService } from '@/services/schoolService';

let schoolStoreRef: ReturnType<typeof createSchoolStore> | null = null;

export const createSchoolStore = () => {
  const store = create<
    SchoolState & {
      fetchSchools: () => Promise<SchoolItem[]>;
      clearError: () => void;
    }
  >(set => ({
    schools: [],
    isLoading: false,
    error: null,

    fetchSchools: async () => {
      try {
        set({ isLoading: true, error: null });

        const schools = await schoolService.getSchools();

        set({
          schools,
          isLoading: false,
        });

        return schools;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch schools',
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

export const getSchoolStore = () => {
  if (!schoolStoreRef) {
    schoolStoreRef = createSchoolStore();
  }
  return schoolStoreRef;
};
