'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, User } from '@/services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cloudvault_token');
      if (storedToken) {
        try {
          setToken(storedToken);
          const res = await authService.getMe();
          setUser(res.data);
        } catch {
          localStorage.removeItem('cloudvault_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem('cloudvault_token', res.token);
    setToken(res.token);
    setUser(res.data);
    toast.success(`Welcome back, ${res.data.name}!`);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    localStorage.setItem('cloudvault_token', res.token);
    setToken(res.token);
    setUser(res.data);
    toast.success('Account created successfully!');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cloudvault_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
