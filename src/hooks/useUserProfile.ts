import { getProfileStore } from '@/stores/profileStore';

export const useUserProfile = () => {
  const store = getProfileStore();

  return {
    userProfile: store(state => state.userProfile),
    isLoading: store(state => state.isLoading),
    error: store(state => state.error),
    getUserProfile: store(state => state.getUserProfile),
    clearUserProfile: store(state => state.clearUserProfile),
    clearError: store(state => state.clearError),
  };
};
