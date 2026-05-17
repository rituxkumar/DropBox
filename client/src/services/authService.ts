import api from '@/lib/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  token: string;
  message?: string;
}

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  getMe: async (): Promise<{ success: boolean; data: User }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
