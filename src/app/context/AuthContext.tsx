
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { AuthUser } from '../types';
import { AuthData } from '../api/auth';
import { setAuthToken, clearAuthToken } from '../api/axios';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  authUser: AuthUser | null;
  setUserData: ({ token, user }: AuthData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!stored) return null;
    try {
      const data = JSON.parse(stored);
      if (data.token && data.user) {
        return {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          token: data.token,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const setUserData = useCallback(async ({ token, user }: AuthData) => {
    try {
      setAuthToken(token);

      const authUserData: AuthUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };

      setAuthUser(authUserData);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ token, user }));

    } catch (error) {
      console.log(error);

    }
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    clearAuthToken();
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }, []);

  const contextValue = useMemo(
    () => ({ authUser, logout, setUserData, isAuthenticated: !!authUser }),
    [authUser, setUserData, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

