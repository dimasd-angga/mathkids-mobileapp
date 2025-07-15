import { getAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const store = getAuthStore();
  return {
    ...store(state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      logout: state.logout,
      checkAuth: state.checkAuth,
      clearError: state.clearError,
    })),
  };
};
