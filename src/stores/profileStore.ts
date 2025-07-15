import { profileService } from '@/services/profileService';
import { RegisterData, User } from '@/types/auth.types';
import {  HistoryItem, ProfileUpdateState } from '@/types/profile.types';
import { create } from 'zustand';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import authStore from './authStore';
import { authService } from '@/services/authService';
import { getLastGradeWithLatestOpenedExam } from '@/hooks/useMilestone';
import { reportService } from '@/services/reportService';

let profileStoreRef: ReturnType<typeof createProfileStore> | null = null;

export const createProfileStore = () => {
  const store = create<
  ProfileUpdateState & {
      updateProfile: (id: string, data: RegisterData) => Promise<User>;
      clearError: () => void;
      fetchHistories: () => Promise<HistoryItem[]>;
    }
  >(set => ({
    isLoadingHistories: false,
    histories: [],
    isLoadingUpdateProfile: false,
    errorUpdateProfile: null,
    errorHistories: null,

    updateProfile: async (id: string, data: RegisterData) => {
      try {
        set({ isLoadingUpdateProfile: true, errorUpdateProfile: null });

        if(data.avatar) {
          if(typeof data.avatar !== 'string') await profileService.updateAvatar(id, data);
          delete data.avatar
        }
        
        const user = await profileService.updateProfile(id, data);
        
        set({
          isLoadingUpdateProfile: false,
        });
        const currUser = await authService.getCurrentUser();
        
        const milestones = await reportService.getGradeMilestoneExams();
        const lastExam = getLastGradeWithLatestOpenedExam(milestones);

        authStore.getState().setUser({
          ...currUser,
          grade: {
            ...currUser.grade,
            lastExam: lastExam?.latestOpenedExam?.exam_index,
            totalExam: lastExam?.totalExam
          }
        });

        Toast.show({ type: ALERT_TYPE.SUCCESS, title: 'Success', textBody: 'Profile updated successfully!' });
        return user;
      } catch (error) {
        set({
          isLoadingUpdateProfile: false,
          errorUpdateProfile: error instanceof Error ? error.message : 'Failed to fetch schools',
        });
        Toast.show({ type: ALERT_TYPE.DANGER, title: 'Failed', textBody: error instanceof Error ? error.message : 'Failed to fetch schools' });

        throw error;
      }
    },

    clearError: () => {
      set({ errorUpdateProfile: null, errorHistories: null });
    },

    fetchHistories: async () => {
      try {
        set({ isLoadingHistories: true, errorHistories: null });
        const histories = await profileService.histories();
        set({
          isLoadingHistories: false,
          histories,
        });
        return histories
      } catch (error) {
        set({
          isLoadingHistories: false,
          errorHistories: error instanceof Error ? error.message : 'Failed to fetch histories',
        });
        throw error;
      }
    },
  }));

  return store;
};

export const getProfileStore = () => {
  if (!profileStoreRef) {
    profileStoreRef = createProfileStore();
  }
  return profileStoreRef;
};

const profileStore = getProfileStore();

export default profileStore;
