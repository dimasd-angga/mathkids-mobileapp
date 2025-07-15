import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, User } from '@/types/auth.types';
import { authService } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { setLogoutHandler } from '@/services/api';
import { StrapiErrorResponse } from '@/types/api.types';
import { reportService } from '@/services/reportService';
import { getLastGradeWithLatestOpenedExam } from '@/hooks/useMilestone';

let authStoreRef: ReturnType<typeof createAuthStore> | null = null;

export const createAuthStore = () => {
  const store = create<
    AuthState & {
      login: (credentials: LoginCredentials) => Promise<void>;
      register: (userData: RegisterData) => Promise<void>;
      logout: () => Promise<void>;
      checkAuth: () => Promise<void>;
      clearError: () => void;
      setUser: (user: User) => void;
    }
  >((set, get) => {
    const logout = async () => {
      try {
        set({ isLoading: true });
        await authService.logout();
        await AsyncStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Logout failed',
        });
        await AsyncStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    };

    setLogoutHandler(logout);

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authService.login(credentials);

          if (response.jwt) {
            await AsyncStorage.setItem('auth_token', response.jwt);
          }

          const userProfile = await authService.getCurrentUser();

          const milestones = await reportService.getGradeMilestoneExams();
          const lastExam = getLastGradeWithLatestOpenedExam(milestones);

          set({
            user: {
              ...userProfile,
              grade: {
                ...userProfile.grade,
                lastExam: lastExam?.latestOpenedExam?.exam_index,
                totalExam: lastExam?.totalExam,
              },
            },
            token: response.jwt,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          let errorMessage = 'Login failed';

          if ((error as AxiosError).isAxiosError) {
            const axiosError = error as AxiosError;
            const data = axiosError.response?.data as StrapiErrorResponse;
            errorMessage = data?.error?.message || axiosError.message || errorMessage;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            isAuthenticated: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          await authService.register(userData);
        } catch (error) {
          let errorMessage = 'Registration failed';

          if ((error as AxiosError).isAxiosError) {
            const axiosError = error as AxiosError;
            const data = axiosError.response?.data as StrapiErrorResponse;
            errorMessage = data?.error?.message || axiosError.message || errorMessage;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            isLoading: false,
            isAuthenticated: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      logout,

      checkAuth: async () => {
        try {
          set({ isLoading: true });

          const token = await AsyncStorage.getItem('auth_token');

          if (!token) {
            set({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              token: null,
            });
            return;
          }

          const isAuthenticated = await authService.checkAuth();

          if (isAuthenticated) {
            const userProfile = await authService.getCurrentUser();
            const milestones = await reportService.getGradeMilestoneExams();
            const lastExam = getLastGradeWithLatestOpenedExam(milestones);

            console.log({ userProfilesss: userProfile });
            set({
              token,
              user: {
                ...userProfile,
                grade: {
                  ...userProfile.grade,
                  lastExam: lastExam?.latestOpenedExam?.exam_index,
                  totalExam: lastExam?.totalExam,
                },
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            await AsyncStorage.removeItem('auth_token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          await AsyncStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication check failed',
          });
        }
      },
      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },
    };
  });

  return store;
};

export const getAuthStore = () => {
  if (!authStoreRef) {
    authStoreRef = createAuthStore();
  }
  return authStoreRef;
};

const authStore = getAuthStore();
export default authStore;
