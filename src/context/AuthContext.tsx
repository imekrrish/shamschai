import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, UserProfile } from '../utils/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('shams_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shams_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          localStorage.setItem('shams_user', JSON.stringify(profile));
        } catch (err) {
          // If token expired, clear
          console.warn('Session check:', err);
          setUser(null); setToken(null);
          localStorage.removeItem('shams_user'); localStorage.removeItem('shams_token');
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('shams_user', JSON.stringify(data.user));
      localStorage.setItem('shams_token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const data = await api.register({ name, email, password, phone });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('shams_user', JSON.stringify(data.user));
      localStorage.setItem('shams_token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const data = await api.googleAuth({ credential });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('shams_user', JSON.stringify(data.user));
      localStorage.setItem('shams_token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shams_user');
    localStorage.removeItem('shams_token');
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('shams_user', JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    if (token) {
      const p = await api.getProfile();
      setUser(p);
      localStorage.setItem('shams_user', JSON.stringify(p));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
