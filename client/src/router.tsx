import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleRoute } from '@/components/RoleRoute';
import { SuspenseRoute } from '@/components/SuspenseRoute';

// Route-level code splitting: each page ships as its own chunk, loaded on demand.
const named = <T extends string>(loader: () => Promise<Record<T, React.ComponentType>>, key: T) =>
  lazy(() => loader().then((m) => ({ default: m[key] })));

const HomePage = named(() => import('@/pages/HomePage'), 'HomePage');
const LoginPage = named(() => import('@/pages/LoginPage'), 'LoginPage');
const SignupPage = named(() => import('@/pages/SignupPage'), 'SignupPage');
const VerifyEmailPage = named(() => import('@/pages/VerifyEmailPage'), 'VerifyEmailPage');
const ForgotPasswordPage = named(() => import('@/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = named(() => import('@/pages/ResetPasswordPage'), 'ResetPasswordPage');
const ResourcesPage = named(() => import('@/pages/ResourcesPage'), 'ResourcesPage');
const ResourceDetailPage = named(() => import('@/pages/ResourceDetailPage'), 'ResourceDetailPage');
const UploadResourcePage = named(() => import('@/pages/UploadResourcePage'), 'UploadResourcePage');
const BooksPage = named(() => import('@/pages/BooksPage'), 'BooksPage');
const SellBookPage = named(() => import('@/pages/SellBookPage'), 'SellBookPage');
const BookDetailPage = named(() => import('@/pages/BookDetailPage'), 'BookDetailPage');
const SavedPage = named(() => import('@/pages/SavedPage'), 'SavedPage');
const ChatPage = named(() => import('@/pages/ChatPage'), 'ChatPage');
const ProfilePage = named(() => import('@/pages/ProfilePage'), 'ProfilePage');
const NotFoundPage = named(() => import('@/pages/NotFoundPage'), 'NotFoundPage');
const AdminDashboardPage = named(() => import('@/pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminUsersPage = named(() => import('@/pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminResourcesPage = named(() => import('@/pages/admin/AdminResourcesPage'), 'AdminResourcesPage');
const AdminReportsPage = named(() => import('@/pages/admin/AdminReportsPage'), 'AdminReportsPage');

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/resources', element: <ResourcesPage /> },
          { path: '/resources/upload', element: <UploadResourcePage /> },
          { path: '/resources/:id', element: <ResourceDetailPage /> },
          { path: '/books', element: <BooksPage /> },
          { path: '/books/sell', element: <SellBookPage /> },
          { path: '/books/:id', element: <BookDetailPage /> },
          { path: '/saved', element: <SavedPage /> },
          { path: '/chat', element: <ChatPage /> },
          { path: '/chat/:id', element: <ChatPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <RoleRoute allow="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/resources', element: <AdminResourcesPage /> },
          { path: '/admin/reports', element: <AdminReportsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <SuspenseRoute><NotFoundPage /></SuspenseRoute> },
]);
