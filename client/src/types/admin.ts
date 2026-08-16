export interface AdminStats {
  users: number;
  verifiedUsers: number;
  resources: number;
  books: number;
  booksSold: number;
  pendingReports: number;
  totalReports: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  isVerified: boolean;
  college?: string;
  rollNumber?: string;
  createdAt: string;
}
