/** Centralized route paths — import these instead of hardcoding strings. */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  RESOURCES: '/resources',
  RESOURCE_UPLOAD: '/resources/upload',
  BOOKS: '/books',
  BOOK_SELL: '/books/sell',
  PROFILE: '/profile',
  SAVED: '/saved',
  CHAT: '/chat',
  ADMIN: '/admin',
} as const;

/** Build a resource detail path. */
export const resourcePath = (id: string) => `/resources/${id}`;

/** Build a book detail path. */
export const bookPath = (id: string) => `/books/${id}`;

/** Build a chat detail path. */
export const chatPath = (id: string) => `/chat/${id}`;

/** TanStack Query cache keys — keeps invalidation consistent across the app. */
export const QUERY_KEYS = {
  ME: ['me'] as const,
  RESOURCES: ['resources'] as const,
  BOOKS: ['books'] as const,
};

/** Personal/free providers rejected at signup — mirrors the server list. */
export const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'live.com',
  'mail.com',
];
