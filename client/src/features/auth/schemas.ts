import { z } from 'zod';
import { BLOCKED_EMAIL_DOMAINS } from '@/utils/constants';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

const collegeEmail = z
  .string()
  .email('Enter a valid email')
  .refine(
    (e) => !BLOCKED_EMAIL_DOMAINS.includes(e.split('@')[1]?.toLowerCase() ?? ''),
    'Use your college email, not a personal one',
  );

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  email: collegeEmail,
  password,
  rollNumber: z.string().max(30).optional().or(z.literal('')),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
