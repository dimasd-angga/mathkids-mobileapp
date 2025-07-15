import { useEffect } from 'react';
import { getAuthStore } from '@/stores/authStore';

export const useAuthInitializer = () => {
  const authStore = getAuthStore();

  useEffect(() => {
    authStore.getState().checkAuth();
  }, []);
};
