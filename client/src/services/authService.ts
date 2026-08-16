import { apiClient } from './apiClient';
import type { ApiSuccess, AuthResult, User } from '@/types';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  rollNumber?: string;
}
export interface LoginInput {
  email: string;
  password: string;
}

/** Thin wrappers over the auth API — one method per endpoint. */
export const authService = {
  async signup(input: SignupInput): Promise<{ message: string; email: string; devOtp?: string }> {
    const { data } = await apiClient.post<ApiSuccess<{ email: string; devOtp?: string }>>(
      '/auth/signup',
      input,
    );
    return { message: data.message, email: data.data.email, devOtp: data.data.devOtp };
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/verify-otp', { email, otp });
    return data.data;
  },

  async resendOtp(email: string): Promise<{ message: string; devOtp?: string }> {
    const { data } = await apiClient.post<ApiSuccess<{ devOtp?: string } | undefined>>(
      '/auth/resend-otp',
      { email },
    );
    return { message: data.message, devOtp: data.data?.devOtp };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/login', input);
    return data.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post<ApiSuccess<{ accessToken: string }>>('/auth/refresh');
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiSuccess<User>>('/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string; devResetToken?: string }> {
    const { data } = await apiClient.post<ApiSuccess<{ devResetToken?: string } | undefined>>(
      '/auth/forgot-password',
      { email },
    );
    return { message: data.message, devResetToken: data.data?.devResetToken };
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<ApiSuccess<null>>('/auth/reset-password', { token, password });
    return { message: data.message };
  },
};
