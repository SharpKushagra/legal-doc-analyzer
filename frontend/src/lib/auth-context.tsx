'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TOKEN_KEY = 'legaldoc_token';
const USER_KEY = 'legaldoc_user';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isReady: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (stored) setToken(stored);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: UserInfo) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isReady,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
