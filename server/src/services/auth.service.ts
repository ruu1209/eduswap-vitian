import { userRepository } from '../repositories/user.repository';
import type { UserDocument } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateToken, generateOtp, sha256 } from '../utils/crypto';
import { emailService } from './email.service';
import { logger } from '../config/logger';
import { env } from '../config/env';

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
interface Session {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}

const RESET_TTL_MS = 30 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const isDev = env.NODE_ENV !== 'production';

/** Derives a college identifier from the email domain. */
function deriveCollege(email: string): string {
  return email.split('@')[1] ?? '';
}

async function issueSession(user: UserDocument): Promise<Session> {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    isVerified: user.isVerified,
  });
  const refreshToken = signRefreshToken({ sub: user.id });
  await userRepository.setRefreshTokenHash(user.id, sha256(refreshToken));
  return { user, accessToken, refreshToken };
}

/** Generates, stores (hashed) and emails a fresh OTP. Returns the raw code. */
async function issueOtp(userId: string, email: string): Promise<string> {
  const otp = generateOtp(6);
  await userRepository.setOtp(userId, sha256(otp), new Date(Date.now() + OTP_TTL_MS));
  await emailService.sendOtp(email, otp);
  return otp;
}

export const authService = {
  async signup(input: SignupInput): Promise<{ message: string; email: string; devOtp?: string }> {
    const existing = await userRepository.findByEmail(input.email);

    if (existing) {
      // A stalled, unverified signup can recover by getting a fresh code.
      if (!existing.isVerified) {
        const otp = await issueOtp(existing.id, existing.email);
        return {
          message: 'This email is already registered but unverified. We sent a new code.',
          email: existing.email,
          devOtp: isDev ? otp : undefined,
        };
      }
      throw AppError.conflict('An account with this email already exists');
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      rollNumber: input.rollNumber,
      college: deriveCollege(input.email),
    });

    const otp = await issueOtp(user.id, user.email);
    return {
      message: 'Account created. Check your email for a verification code.',
      email: user.email,
      devOtp: isDev ? otp : undefined,
    };
  },

  async verifyOtp(email: string, otp: string): Promise<Session> {
    const user = await userRepository.findByEmailWithOtp(email);
    if (!user) throw AppError.badRequest('Invalid verification request');
    if (user.isVerified) throw AppError.badRequest('This email is already verified');
    if (!user.otpHash || !user.otpExpires) {
      throw AppError.badRequest('No active code. Request a new one.');
    }
    if (user.otpExpires.getTime() < Date.now()) {
      throw AppError.badRequest('Your code expired. Request a new one.');
    }
    if (user.otpHash !== sha256(otp)) throw AppError.badRequest('Incorrect code');

    const verified = await userRepository.markVerified(user.id);
    if (!verified) throw AppError.notFound('User not found');
    return issueSession(verified); // auto-login on successful verification
  },

  async resendOtp(email: string): Promise<{ devOtp?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isVerified) return {}; // Silent: no enumeration.
    const otp = await issueOtp(user.id, user.email);
    return isDev ? { devOtp: otp } : {};
  },

  async login({ email, password }: LoginInput): Promise<Session> {
    const user = await userRepository.findByEmail(email, true);
    if (!user) throw AppError.unauthorized('Invalid email or password');

    const ok = await user.comparePassword(password);
    if (!ok) throw AppError.unauthorized('Invalid email or password');

    // Only verified college accounts may hold a session.
    if (!user.isVerified) throw AppError.emailNotVerified();

    return issueSession(user);
  },

  async refresh(refreshToken?: string): Promise<Session> {
    if (!refreshToken) throw AppError.unauthorized('Missing refresh token');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const user = await userRepository.findByIdWithRefresh(payload.sub);
    if (!user || !user.refreshTokenHash) throw AppError.unauthorized('Session expired');

    if (user.refreshTokenHash !== sha256(refreshToken)) {
      await userRepository.setRefreshTokenHash(user.id, null);
      throw AppError.unauthorized('Session expired');
    }

    return issueSession(user);
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await userRepository.setRefreshTokenHash(payload.sub, null);
    } catch {
      // Already invalid — nothing to revoke.
    }
  },

  async forgotPassword(email: string): Promise<{ devResetToken?: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) return {}; // Silent: never reveal whether an email is registered.

    const rawToken = generateToken();
    await userRepository.setPasswordReset(user.id, sha256(rawToken), new Date(Date.now() + RESET_TTL_MS));

    const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordReset(user.email, link);
    logger.info(`Password reset requested for ${email}`);

    return isDev ? { devResetToken: rawToken } : {};
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByResetTokenHash(sha256(token));
    if (!user) throw AppError.badRequest('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null;
    await user.save();
  },

  async getMe(id: string): Promise<UserDocument> {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
  },
};
