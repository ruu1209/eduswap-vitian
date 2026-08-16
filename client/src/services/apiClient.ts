import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

/** Shared Axios instance. `withCredentials` lets the refresh cookie flow. */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach the access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single in-flight refresh shared by all queued 401s, so we refresh once.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Bare axios (not apiClient) to avoid recursive interceptors.
  const { data } = await axios.post<{ data: { accessToken: string } }>(
    `${BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const token = data.data.accessToken;
  tokenStore.set(token);
  return token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthRoute = original?.url?.includes('/auth/');

    // Only try to recover a genuine 401 once, and never for auth routes themselves.
    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      } catch (refreshError) {
        tokenStore.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
