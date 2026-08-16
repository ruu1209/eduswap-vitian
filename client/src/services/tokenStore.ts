/**
 * In-memory access-token store. The token is deliberately NOT persisted to
 * localStorage — keeping it in memory limits the blast radius of an XSS leak.
 * The refresh token lives in an httpOnly cookie the JS can never read.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};
