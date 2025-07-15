import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { STRAPI_BASE_URL } from '@/constants/apiEndpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appStore from '@/stores/appStore';

const apiClient: AxiosInstance = axios.create({
  baseURL: STRAPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutFunction: (() => Promise<void>) | null = null;

export const setLogoutHandler = (fn: () => Promise<void>) => {
  logoutFunction = fn;
};

apiClient.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('[API REQUEST]', {
      method: config.method,
      baseUrl: config.baseURL,
      url: config.url,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });

    // console.log({ data: config.data._parts });

    return config;
  },
  error => {
    // console.error('[API REQUEST ERROR]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    console.log('[API RESPONSE]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401 && logoutFunction) {
      await logoutFunction();
    }

    console.error('[API RESPONSE ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      data: JSON.stringify(error.response?.data),
    });

    return Promise.reject(error);
  },
);

export const apiRequest = async <T>(
  config: AxiosRequestConfig & { baseURL?: string },
): Promise<T> => {
  try {
    console.log('[API CALL START]', config);
    const response = await apiClient({
      ...config,
      baseURL: config.baseURL || apiClient.defaults.baseURL,
    });
    // console.log('[API CALL SUCCESS]', {
    //   url: config.url,
    //   data: response,
    // });
    return response.data;
  } catch (error) {
    console.log('[API CALL ERROR]', error);
    const message = handleApiError(error as AxiosError);
    throw new Error(message);
  }
};

export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    const errData = error.response.data as any;
    const message =
      errData?.error?.message || errData?.message || `Error: ${error.response.status}`;

    console.error('API Error:', error.response.status, message);
    return message;
  } else if (error.request) {

    appStore.getState().setFailedFetch({
      message: 'Network error, please check your connection',
      menu: 'Network Error',
    });
    console.error('Network Error:', JSON.stringify(error));
    return 'Network error, please check your connection';
  } else {
    console.error('Error:', error.message);
    return error.message;
  }
};
