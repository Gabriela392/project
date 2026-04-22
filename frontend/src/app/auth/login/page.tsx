'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1351B4', margin: 0 }}>
            Sistema de Gestão
          </h1>
          <p style={{ color: '#555', marginTop: 8 }}>Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #ccc',
                borderRadius: 4, fontSize: 15, boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #ccc',
                borderRadius: 4, fontSize: 15, boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff3f3', border: '1px solid #f5c6cb',
              color: '#721c24', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#1351B4', color: '#fff',
              border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '12px', background: '#f8f9fa', borderRadius: 4, fontSize: 13 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Contas de teste:</p>
          <p style={{ margin: '4px 0 0' }}>Admin: admin@example.com / Admin@123</p>
          <p style={{ margin: '4px 0 0' }}>User: user@example.com / User@123</p>
        </div>
      </div>
    </div>
  );
}
