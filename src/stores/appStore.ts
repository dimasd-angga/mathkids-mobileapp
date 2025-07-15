import { create } from 'zustand';
import { AppState } from '@/types/app.types';

let appStoreRef: ReturnType<typeof createAppStore> | null = null;

export const createAppStore = () => {
  const store = create<AppState & {
    resetFailedFetch: () => void;
    setFailedFetch: (data: { message: string; menu: string }) => void;
  }>(set => ({
    isFailedFetch: false,
    failedFetch: null,

    setFailedFetch: (data: { message: string; menu: string }) => {
      set({ isFailedFetch: true, failedFetch: data });
    },

    resetFailedFetch: () => {
      set({ isFailedFetch: false, failedFetch: null });
    },
  }));

  return store;
};

export const getAppStore = () => {
  if (!appStoreRef) {
    appStoreRef = createAppStore();
  }
  return appStoreRef;
};

const appStore = getAppStore();
export default appStore;