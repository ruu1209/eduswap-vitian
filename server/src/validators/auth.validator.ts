import { z } from 'zod';
import { isBlockedEmailDomain } from '../utils/email';

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
  .refine((e) => !isBlockedEmailDomain(e), 'Use your college email, not a personal one');

export const signupSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  email: collegeEmail,
  password,
  rollNumber: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password,
});
