import { getTransporter } from '../config/mailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const FROM = env.SMTP_FROM ?? 'EduSwap <no-reply@eduswap.app>';

async function deliver(to: string, subject: string, html: string, text: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    // Dev fallback: no SMTP configured, so log the message instead of sending.
    logger.warn(`[email:dev] to=${to} · ${subject}\n${text}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html, text });
}

export const emailService = {
  async sendOtp(to: string, otp: string): Promise<void> {
    const subject = 'Your EduSwap verification code';
    const text = `Your EduSwap verification code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your EduSwap verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`;
    await deliver(to, subject, html, text);
  },

  async sendPasswordReset(to: string, link: string): Promise<void> {
    const subject = 'Reset your EduSwap password';
    const text = `Reset your password using this link (valid 30 minutes): ${link}`;
    const html = `<p><a href="${link}">Reset your EduSwap password</a></p><p>This link is valid for 30 minutes.</p>`;
    await deliver(to, subject, html, text);
  },
};
