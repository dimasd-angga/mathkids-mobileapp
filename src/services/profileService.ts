// src/services/authService.ts
import { AuthResponse, RegisterData, User } from '@/types/auth.types';
import { apiRequest } from './api';
import { BACKOFFICE_BASE_URL, BACKOFFICE_SECRET, ENDPOINTS } from '@/constants/apiEndpoints';
import { HistoryItem, HistoryResponse } from '@/types/profile.types';

export const profileService = {
  updateAvatar: async (id: string, payload: RegisterData): Promise<User> => {
    const formData = new FormData()
    console.log("payload.avatar", payload.avatar)
    // + payload.avatar.uri.split("/").pop().split(".")[0],
    
    formData.append('files', {
      type: payload.avatar.mimeType,
      uri: payload.avatar.uri,
      name: `avatar-${id}-${Date.now()}.jpg`,
      width: payload.avatar.width,
      height: payload.avatar.height,
    } as any)
    formData.append('ref', 'plugin::users-permissions.user')
    formData.append('refId', id)
    formData.append('field', 'avatar')

    const response = await apiRequest<User>({
      url: `${ENDPOINTS.PROFILE.UPDATE_AVATAR}`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    });
    
    return response;
  },
  updateProfile: async (id: string, payload: RegisterData): Promise<User> => {
    const response = await apiRequest<User>({
      url: `${ENDPOINTS.PROFILE.UPDATE}/${id}`,
      method: 'PUT',
      data: payload,
    });
    
    return response;
  },
  histories: async (): Promise<HistoryItem[]> => {
    const response = await apiRequest<HistoryResponse>({
      url: `${ENDPOINTS.PROFILE.HISTORY}`,
      baseURL: BACKOFFICE_BASE_URL,
      method: 'GET',
      headers: {
        'x-server-token': BACKOFFICE_SECRET,
      },
    });
    
    return response.data?.history || [];
  },
};
