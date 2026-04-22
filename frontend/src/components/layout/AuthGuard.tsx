'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (!user) {
      authApi.me()
        .then((res) => setAuth(res.data, token))
        .catch(() => {
          clearAuth();
          router.replace('/auth/login');
        });
    }
  }, []);

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole) {
      router.replace(user.role === 'ADMIN' ? '/admin/dashboard' : '/user/products');
    }
  }, [user, requiredRole]);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
