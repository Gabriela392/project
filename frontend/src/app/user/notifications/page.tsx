'use client';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { Btn } from '@/components/ui/FormElements';
import { Icon } from "@uigovpe/components";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({
        page,
        limit: 20,
        unread: unreadOnly ? 'true' : undefined,
      });
      setNotifications(res.data.data);
      setTotal(res.data.meta.total);
      setUnreadCount(res.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const lastPage = Math.ceil(total / 20);

  return (
    <AuthGuard>
      <AppLayout>
        <div style={{ padding: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                Notificações
                {unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 10,
                      background: "#dc3545",
                      color: "#fff",
                      borderRadius: 12,
                      padding: "2px 9px",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#6c757d" }}>
                Suas notificações do sistema
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => {
                    setUnreadOnly(e.target.checked);
                    setPage(1);
                  }}
                />
                Somente não lidas
              </label>
              {unreadCount > 0 && (
                <Btn
                  variant="secondary"
                  onClick={markAllRead}
                  style={{ fontSize: 13 }}
                >
                  Marcar todas como lidas
                </Btn>
              )}
            </div>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : notifications.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 48,
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ marginBottom: 12, color: "#1351B4" }}>
                {" "}
                {/* Cor azul para destacar */}
                <Icon icon="notifications" outline size="large" />
              </div>
              <p style={{ color: "#6c757d", fontSize: 16, margin: 0 }}>
                Nenhuma notificação encontrada.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: n.read ? "#fff" : "#eef4ff",
                    border: `1px solid ${n.read ? "#dee2e6" : "#b8d0f8"}`,
                    borderRadius: 8,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      {!n.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#1351B4",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <strong style={{ fontSize: 15 }}>{n.title}</strong>
                    </div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 14,
                        color: "#495057",
                      }}
                    >
                      {n.message}
                    </p>
                    <span style={{ fontSize: 12, color: "#adb5bd" }}>
                      {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      style={{
                        background: "none",
                        border: "1px solid #1351B4",
                        color: "#1351B4",
                        borderRadius: 4,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Marcar lida
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <Btn
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: "6px 14px" }}
              >
                ‹
              </Btn>
              <span style={{ padding: "8px 12px", fontSize: 14 }}>
                {page} / {lastPage}
              </span>
              <Btn
                variant="secondary"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                style={{ padding: "6px 14px" }}
              >
                ›
              </Btn>
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
