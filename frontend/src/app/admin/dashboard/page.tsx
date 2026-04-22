"use client";
import { useEffect, useState, ReactNode } from "react"; // Importe ReactNode
import AuthGuard from "@/components/layout/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { usersApi, productsApi, categoriesApi, auditApi } from "@/lib/api";
import { Icon } from "@uigovpe/components";


interface Stats {
  users: { total: number; admins: number; users: number };
  products: { total: number; totalStock: number; avgPrice: number };
  categories: { total: number };
  audit: { total: number; byAction: any[]; recent: any[] };
}

// ATUALIZADO: icon agora é ReactNode para aceitar componentes e strings
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "20px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderLeft: `4px solid ${color}`,
        flex: "1 1 200px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "#6c757d" }}>{title}</p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 28,
              fontWeight: 700,
              color: "#212529",
            }}
          >
            {value}
          </p>
        </div>
        <span>{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.stats(),
      productsApi.stats(),
      categoriesApi.stats(),
      auditApi.stats(),
    ])
      .then(([u, p, c, a]) => {
        setStats({
          users: u.data,
          products: p.data,
          categories: c.data,
          audit: a.data,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard requiredRole="ADMIN">
      <AppLayout>
        <div style={{ padding: 32 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700 }}>
            Dashboard
          </h1>
          <p style={{ margin: "0 0 28px", color: "#6c757d" }}>
            Visão geral do sistema
          </p>

          {loading ? (
            <p>Carregando estatísticas...</p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 28,
                }}
              >
                <StatCard
                  title="Total de Usuários"
                  value={stats.users?.total ?? 0}
                  icon={
                    <Icon
                      icon="person"
                      outline
                      style={{ fontSize: 90, width: 90, height: 90 }}
                    />
                  }
                  color="#1351B4"
                />
                <StatCard
                  title="Administradores"
                  value={stats.users?.admins ?? 0}
                  icon=<Icon icon="lock_open" outline />
                  color="#fd7e14"
                />
                <StatCard
                  title="Total de Produtos"
                  value={stats.products?.total ?? 0}
                  icon=<Icon icon="box" outline />
                  color="#28a745"
                />
                <StatCard
                  title="Total de Categorias"
                  value={stats.categories?.total ?? 0}
                  icon=<Icon icon="label" outline />
                  color="#6f42c1"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 28,
                }}
              >
                <StatCard
                  title="Estoque Total"
                  value={stats.products?.totalStock ?? 0}
                  icon=<Icon icon="bar_chart_4_bars" outline />
                  color="#17a2b8"
                />
                <StatCard
                  title="Preço Médio dos Produtos"
                  value={`R$ ${(stats.products?.avgPrice ?? 0).toFixed(2)}`}
                  icon=<Icon icon="attach_money" outline />
                  color="#ffc107"
                />
                <StatCard
                  title="Total de Ações Auditadas"
                  value={stats.audit?.total ?? 0}
                  icon=<Icon icon="history" outline />
                  color="#dc3545"
                />
              </div>

              {/* Tabela de Auditoria (omitida para brevidade, permanece igual) */}
            </>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
