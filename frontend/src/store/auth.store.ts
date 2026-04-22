'use client';
import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 7 });
    set({ user, token });
  },
  clearAuth: () => {
    Cookies.remove('token');
    set({ user: null, token: null });
  },
  setUser: (user) => set({ user }),
}));
