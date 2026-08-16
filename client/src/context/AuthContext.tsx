import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type LoginInput, type SignupInput } from '@/services/authService';
import { tokenStore } from '@/services/tokenStore';
import { connectSocket, disconnectSocket } from '@/services/socket';
import type { AuthResult, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<{ message: string; email: string; devOtp?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try a silent refresh to restore the session from the cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { accessToken } = await authService.refresh();
        tokenStore.set(accessToken);
        const me = await authService.me();
        if (active) {
          setUser(me);
          connectSocket();
        }
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const applySession = (result: AuthResult) => {
    tokenStore.set(result.accessToken);
    setUser(result.user);
    connectSocket();
  };

  const login = async (input: LoginInput) => {
    applySession(await authService.login(input));
  };

  const signup = (input: SignupInput) => authService.signup(input);

  const verifyEmail = async (email: string, otp: string) => {
    applySession(await authService.verifyOtp(email, otp));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      tokenStore.clear();
      disconnectSocket();
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, signup, verifyEmail, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
