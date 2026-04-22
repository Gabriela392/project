'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await productsApi.favorites();
      setFavorites(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const removeFavorite = async (id: string) => {
    await productsApi.toggleFavorite(id);
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>Meus Favoritos</h1>
          <p style={{ margin: '0 0 28px', color: '#6c757d' }}>Produtos que você marcou como favorito</p>

          {loading ? (
            <p>Carregando...</p>
          ) : favorites.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 8, padding: 48, textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🤍</p>
              <p style={{ color: '#6c757d', fontSize: 16 }}>Você ainda não favoritou nenhum produto.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {favorites.map((p) => (
                <div key={p.id} style={{
                  background: '#fff', borderRadius: 8, overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    height: 160, background: '#f0f2f5', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.image ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${p.image}`}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 48 }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>{p.name}</h3>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6c757d' }}>
                      {p.categories?.map((c) => c.name).join(', ') || 'Sem categoria'}
                    </p>
                    <p style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1351B4' }}>
                      R$ {Number(p.price).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFavorite(p.id)}
                      style={{
                        width: '100%', padding: '8px', background: '#fff0f0',
                        border: '1px solid #f5c6cb', borderRadius: 4,
                        color: '#721c24', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      }}
                    >
                      ❤️ Remover dos favoritos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
