'use client';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import { Field, Input, Select, Btn } from '@/components/ui/FormElements';
import { usersApi } from '@/lib/api';
import { User } from '@/types';

const emptyForm = { name: '', email: '', password: '', role: 'USER' };

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: 10, search, role: roleFilter });
      setData(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setError(''); setModal('create'); };
  const openEdit = (u: User) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
    setModal('edit');
  };
  const openDelete = (u: User) => { setSelected(u); setModal('delete'); };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (modal === 'create') {
        await usersApi.create(form);
      } else {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await usersApi.update(selected!.id, payload);
      }
      setModal(null);
      fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await usersApi.remove(selected!.id);
      setModal(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'role', label: 'Perfil',
      render: (u: User) => (
        <span style={{
          padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
          background: u.role === 'ADMIN' ? '#cce5ff' : '#d4edda',
          color: u.role === 'ADMIN' ? '#004085' : '#155724',
        }}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Cadastrado em',
      render: (u: User) => new Date(u.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <AuthGuard requiredRole="ADMIN">
      <AppLayout>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Usuários</h1>
              <p style={{ margin: '4px 0 0', color: '#6c757d' }}>Gerencie os usuários do sistema</p>
            </div>
            <Btn onClick={openCreate}>+ Novo Usuário</Btn>
          </div>

          <DataTable
            columns={columns}
            data={data}
            total={total}
            page={page}
            limit={10}
            onPageChange={setPage}
            loading={loading}
            searchValue={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Buscar por nome ou e-mail..."
            filters={
              <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
                <option value="">Todos os perfis</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </Select>
            }
            actions={(u) => (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Btn variant="secondary" onClick={() => openEdit(u)} style={{ padding: '5px 12px', fontSize: 13 }}>Editar</Btn>
                <Btn variant="danger" onClick={() => openDelete(u)} style={{ padding: '5px 12px', fontSize: 13 }}>Excluir</Btn>
              </div>
            )}
          />
        </div>

        {/* Create / Edit Modal */}
        <Modal
          open={modal === 'create' || modal === 'edit'}
          onClose={() => setModal(null)}
          title={modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
        >
          <Field label="Nome" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          </Field>
          <Field label={modal === 'edit' ? 'Nova Senha (deixe em branco para manter)' : 'Senha'} required={modal === 'create'}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </Field>
          <Field label="Perfil">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </Field>
          {error && <p style={{ color: '#dc3545', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={handleSave} loading={saving}>Salvar</Btn>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Confirmar Exclusão" width={400}>
          <p>Tem certeza que deseja excluir o usuário <strong>{selected?.name}</strong>?</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={handleDelete} loading={saving}>Excluir</Btn>
          </div>
        </Modal>
      </AppLayout>
    </AuthGuard>
  );
}
