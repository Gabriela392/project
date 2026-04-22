'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const savedToken = Cookies.get('token');
    if (savedToken && !user) {
      authApi.me()
        .then((res) => setAuth(res.data, savedToken))
        .catch(() => clearAuth());
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setAuth(res.data.user, res.data.access_token);
    if (res.data.user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/products');
    }
    return res.data;
  };

  const logout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return { user, token, login, logout, isAdmin: user?.role === 'ADMIN' };
}
