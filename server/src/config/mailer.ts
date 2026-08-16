import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';

let transporter: Transporter | null = null;
let resolved = false;

/**
 * Returns a configured SMTP transporter, or null when SMTP env is absent.
 * A null transporter signals the email service to fall back to dev logging.
 */
export function getTransporter(): Transporter | null {
  if (resolved) return transporter;
  resolved = true;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    transporter = null;
    return null;
  }

  const port = env.SMTP_PORT ?? 587;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}
