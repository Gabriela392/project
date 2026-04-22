"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@uigovpe/components";
import React from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <Icon icon="dashboard" outline />,
  },
  {
    label: "Usuários",
    href: "/admin/users",
    icon: <Icon icon="person" outline />,
  },
  {
    label: "Produtos",
    href: "/user/products",
    icon: <Icon icon="inventory" outline />,
  },
  {
    label: "Categorias",
    href: "/user/categories",
    icon: <Icon icon="category" outline />,
  },
  {
    label: "Relatórios",
    href: "/admin/reports",
    icon: <Icon icon="description" outline />,
  },
  {
    label: "Notificações",
    href: "/user/notifications",
    icon: <Icon icon="notifications" outline />,
  },
];

const userNav: NavItem[] = [
  {
    label: "Produtos",
    href: "/user/products",
    icon: <Icon icon="inventory" outline />,
  },
  {
    label: "Categorias",
    href: "/user/categories",
    icon: <Icon icon="category" outline />,
  },
  {
    label: "Favoritos",
    href: "/user/favorites",
    icon: <Icon icon="favorite" outline />,
  },
  {
    label: "Notificações",
    href: "/user/notifications",
    icon: <Icon icon="notifications" outline />,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const navItems = isAdmin ? adminNav : userNav;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#1351B4",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h2
            style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}
          >
            Sistema de Gestão
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {isAdmin ? "Administrador" : "Usuário"}
          </p>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "11px 20px",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  borderLeft: active
                    ? "3px solid #fff"
                    : "3px solid transparent",
                }}
              >
                {/* Container para alinhar o componente Icon corretamente */}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 20,
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "8px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 4,
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      <main
        style={{
          marginLeft: 240,
          flex: 1,
          background: "#f0f2f5",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
