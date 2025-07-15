import { reportService } from '@/services/reportService';
import { GradeMilestoneItem, GradeMilestoneItemExam, GradeMilestoneItemExamById, GradeMilestonesExamAssesment, ReportState } from '@/types/report.types';
import { create } from 'zustand';

let reportStoreRef: ReturnType<typeof createReportStore> | null = null;

export const createReportStore = () => {
  const store = create<
    ReportState & {
      clearError: () => void;
      fetchGradeMilestoneExams: () => Promise<GradeMilestoneItem[]>;
      setSelectedExamGradeMilestone: (exam: GradeMilestoneItemExam) => void;
      fetchGradeMilestoneExamsById: (id: string) => Promise<GradeMilestoneItemExamById>;
      fetchGradeMilestoneExamsAssesmentById: (id: string) => Promise<GradeMilestonesExamAssesment>;
      clearSelectedExamGradeMilestone: () => void;
    }
  >(set => ({
    examGradeMilestonesAssesment: null,
    selectedExamGradeMilestoneAssesment: null, 
    examGradeMilestoneExamsById: null, 
    examGradeMilestones: [], 
    selectedExamGradeMilestone: null, 
    isLoadingExamGradeMilestonesAssesment: false,
    isLoadingExamGradeMilestonesById: false,
    isLoadingExamGradeMilestones: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchGradeMilestoneExams: async () => {
      try {
        set({ 
          isLoadingExamGradeMilestones: true, 
          error: null, 
          selectedExamGradeMilestone: null
        });
        const examGradeMilestones = await reportService.getGradeMilestoneExams();
        
        set({ examGradeMilestones, isLoadingExamGradeMilestones: false });
        return examGradeMilestones;
      } catch (error) {
        set({
          isLoadingExamGradeMilestones: false,
          error: error instanceof Error ? error.message : 'Failed to fetch exams',
        });
        throw error;
      }
    },

    setSelectedExamGradeMilestone: exam => set({ selectedExamGradeMilestone: exam }),
    clearSelectedExamGradeMilestone: () => set({ selectedExamGradeMilestone: null }),

    fetchGradeMilestoneExamsById: async id => {
      try {
        set({ isLoadingExamGradeMilestonesById: true, error: null });
        const examGradeMilestoneExamsById = await reportService.getGradeMilestoneExamsById(id);
        set({ examGradeMilestoneExamsById, isLoadingExamGradeMilestonesById: false });
        return examGradeMilestoneExamsById;
      } catch (error) {
        set({
          isLoadingExamGradeMilestonesById: false,
          error: error instanceof Error ? error.message : 'Failed to fetch exams',
        });
        throw error;
      }
    },

    fetchGradeMilestoneExamsAssesmentById: async id => {
      try {
        set({ isLoadingExamGradeMilestonesAssesment: true, error: null });
        const examGradeMilestonesAssesment = await reportService.getGradeMilestoneExamsAssesmentById(id);
        set({ examGradeMilestonesAssesment, isLoadingExamGradeMilestonesAssesment: false });
        return examGradeMilestonesAssesment;
      } catch (error) {
        set({
          isLoadingExamGradeMilestonesAssesment: false,
          error: error instanceof Error ? error.message : 'Failed to fetch exams',
        });
        throw error;
      }
    },
  }));

  return store;
};

export const getReportStore = () => {
  if (!reportStoreRef) {
    reportStoreRef = createReportStore();
  }
  return reportStoreRef;
};

const reportStore = getReportStore();

export default reportStore;
