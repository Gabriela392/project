'use client';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import DataTable from '@/components/tables/DataTable';
import { Field, Input, Select, Btn } from '@/components/ui/FormElements';
import { auditApi } from '@/lib/api';
import { AuditLog } from '@/types';

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: '#d4edda', color: '#155724' },
  UPDATE: { bg: '#fff3cd', color: '#856404' },
  DELETE: { bg: '#f8d7da', color: '#721c24' },
  LOGIN:  { bg: '#cce5ff', color: '#004085' },
};

export default function ReportsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '', entity: '', actorEmail: '', startDate: '', endDate: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ page, limit: 20, ...filters });
      setData(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      key: 'action', label: 'Ação',
      render: (l: AuditLog) => {
        const c = ACTION_COLORS[l.action] || { bg: '#e2e3e5', color: '#383d41' };
        return (
          <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color }}>
            {l.action}
          </span>
        );
      },
    },
    { key: 'entity', label: 'Entidade' },
    { key: 'actorEmail', label: 'Usuário' },
    { key: 'ipAddress', label: 'IP', render: (l: AuditLog) => l.ipAddress || '-' },
    {
      key: 'createdAt', label: 'Data/Hora',
      render: (l: AuditLog) => new Date(l.createdAt).toLocaleString('pt-BR'),
    },
  ];

  return (
    <AuthGuard requiredRole="ADMIN">
      <AppLayout>
        <div style={{ padding: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>Relatórios de Auditoria</h1>
          <p style={{ margin: '0 0 24px', color: '#6c757d' }}>Rastreie todas as ações realizadas no sistema</p>

          {/* Filters */}
          <div style={{
            background: '#fff', borderRadius: 8, padding: 20, marginBottom: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Filtros</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}>
                <Field label="Ação">
                  <Select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })}>
                    <option value="">Todas</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="LOGIN">LOGIN</option>
                  </Select>
                </Field>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <Field label="Entidade">
                  <Select value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value })}>
                    <option value="">Todas</option>
                    <option value="User">User</option>
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                  </Select>
                </Field>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <Field label="E-mail do usuário">
                  <Input value={filters.actorEmail} onChange={(e) => setFilters({ ...filters, actorEmail: e.target.value })} placeholder="Filtrar por e-mail" />
                </Field>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <Field label="Data início">
                  <Input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                </Field>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <Field label="Data fim">
                  <Input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
                </Field>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={() => { setPage(1); fetchData(); }}>Filtrar</Btn>
              <Btn variant="secondary" onClick={() => {
                setFilters({ action: '', entity: '', actorEmail: '', startDate: '', endDate: '' });
                setPage(1);
              }}>Limpar</Btn>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data}
            total={total}
            page={page}
            limit={20}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
