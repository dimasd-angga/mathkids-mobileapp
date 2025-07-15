// src/services/authService.ts
import { LoginCredentials, AuthResponse, User, RegisterData } from '@/types/auth.types';
import { apiRequest } from './api';
import { BACKOFFICE_BASE_URL, ENDPOINTS } from '@/constants/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const payload = {
      identifier: credentials.identifier,
      password: credentials.password,
    };

    const response = await apiRequest<AuthResponse>({
      url: ENDPOINTS.AUTH.LOGIN,
      method: 'POST',
      data: payload,
      params: {
        populate: {
          exam_statuses: '*',
        },
      },
    });

    await AsyncStorage.setItem('auth_token', response.jwt);

    return response;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData();

    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('grade', userData.grade);
    formData.append('birth', userData.birth!);
    formData.append('school', userData.school!);
    formData.append('name', userData.firstName!);

    const response = await apiRequest<AuthResponse>({
      url: ENDPOINTS.AUTH.REGISTER,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Server-Token': 'super_secret',
      },
    });

    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest<User>({
      url: ENDPOINTS.AUTH.ME,
      method: 'GET',
      params: {
        populate: {
          avatar: '*',
          grade: '*',
          school: '*',
        },
      },
    });

    return response;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
  },

  checkAuth: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
};
