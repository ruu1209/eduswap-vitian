export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  college?: string;
  rollNumber?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}
