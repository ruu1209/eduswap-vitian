import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { authService } from '../services/auth.service';
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from '../utils/cookies';

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: result.message,
      data: { email: result.email, ...(result.devOtp ? { devOtp: result.devOtp } : {}) },
    });
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.verifyOtp(
      req.body.email,
      req.body.otp,
    );
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { message: 'Email verified', data: { user, accessToken } });
  }),

  resendOtp: asyncHandler(async (req, res) => {
    const result = await authService.resendOtp(req.body.email);
    sendSuccess(res, {
      message: 'If the account exists and is unverified, a new code has been sent',
      data: result.devOtp ? { devOtp: result.devOtp } : undefined,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { message: 'Logged in', data: { user, accessToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const { accessToken, refreshToken } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, { message: 'Token refreshed', data: { accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(token);
    clearRefreshCookie(res);
    sendSuccess(res, { message: 'Logged out' });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, {
      message: 'If that email is registered, a reset link has been sent',
      data: result.devResetToken ? { devResetToken: result.devResetToken } : undefined,
    });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, { message: 'Password updated. You can now log in.' });
  }),

  me: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { data: user });
  }),
};
