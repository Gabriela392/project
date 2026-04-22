'use client';
import { useEffect, useState, useCallback } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import { Field, Input, TextArea, Btn } from '@/components/ui/FormElements';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types';

const emptyForm = { name: '', description: '' };

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list({ page, limit: 10, search });
      setData(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setError(''); setSelected(null); setModal('create'); };
  const openEdit = (c: Category) => {
    setSelected(c);
    setForm({ name: c.name, description: c.description || '' });
    setError('');
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal === 'create') await categoriesApi.create(form);
      else await categoriesApi.update(selected!.id, form);
      setModal(null); fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await categoriesApi.remove(selected!.id); setModal(null); fetchData(); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descrição', render: (c: Category) => c.description || '-' },
    { key: 'owner', label: 'Criado por', render: (c: Category) => c.owner?.name || '-' },
    {
      key: 'createdAt', label: 'Criado em',
      render: (c: Category) => new Date(c.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <AuthGuard>
      <AppLayout>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Categorias</h1>
              <p style={{ margin: '4px 0 0', color: '#6c757d' }}>Gerencie as categorias do sistema</p>
            </div>
            <Btn onClick={openCreate}>+ Nova Categoria</Btn>
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
            searchPlaceholder="Buscar categoria..."
            actions={(c) => (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <Btn variant="secondary" onClick={() => openEdit(c)} style={{ padding: '5px 12px', fontSize: 13 }}>Editar</Btn>
                <Btn variant="danger" onClick={() => { setSelected(c); setModal('delete'); }} style={{ padding: '5px 12px', fontSize: 13 }}>Excluir</Btn>
              </div>
            )}
          />
        </div>

        <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'create' ? 'Nova Categoria' : 'Editar Categoria'} width={460}>
          <Field label="Nome" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da categoria" />
          </Field>
          <Field label="Descrição">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição opcional" />
          </Field>
          {error && <p style={{ color: '#dc3545', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={handleSave} loading={saving}>Salvar</Btn>
          </div>
        </Modal>

        <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Confirmar Exclusão" width={400}>
          <p>Deseja excluir a categoria <strong>{selected?.name}</strong>?</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={handleDelete} loading={saving}>Excluir</Btn>
          </div>
        </Modal>
      </AppLayout>
    </AuthGuard>
  );
}
