import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * The current backend contract uses bearer tokens, not cookies. Keep the
 * Authorization header restricted to the configured API origin even if a
 * caller accidentally passes an absolute URL to this axios instance.
 */
function isConfiguredApiRequest(config: InternalAxiosRequestConfig) {
  try {
    const fallbackOrigin = window.location.origin;
    const apiOrigin = new URL(api.defaults.baseURL ?? fallbackOrigin, fallbackOrigin).origin;
    const requestUrl = new URL(
      config.url ?? '',
      config.baseURL ?? api.defaults.baseURL ?? fallbackOrigin
    );

    return requestUrl.origin === apiOrigin;
  } catch {
    return false;
  }
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  const isApiRequest = isConfiguredApiRequest(config);

  if (token && isApiRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isApiRequest) {
    config.headers.delete('Authorization');
  }

  return config;
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function onRefreshDone(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

function redirectToLogin() {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const isAuthRoute =
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/login');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRoute ||
      !isConfiguredApiRequest(originalRequest)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post<RefreshResponse>(
        `${api.defaults.baseURL}/api/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: novoRefreshToken } = response.data;
      useAuthStore.getState().setTokens(accessToken, novoRefreshToken);

      onRefreshDone(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      onRefreshDone(null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
