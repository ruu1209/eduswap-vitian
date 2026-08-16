import { BLOCKED_EMAIL_DOMAINS } from './constants';

export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

/** True when the address uses a personal/free provider we reject at signup. */
export function isBlockedEmailDomain(email: string): boolean {
  return (BLOCKED_EMAIL_DOMAINS as readonly string[]).includes(getEmailDomain(email));
}
