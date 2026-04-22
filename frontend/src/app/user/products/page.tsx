"use client";
import { useEffect, useState, useCallback } from "react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import {
  Field,
  Input,
  Select,
  TextArea,
  Btn,
} from "@/components/ui/FormElements";
import { productsApi, categoriesApi } from "@/lib/api";
import { Product, Category } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Icon } from "@uigovpe/components";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  categoryIds: [] as string[],
};

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<
    "create" | "edit" | "delete" | "image" | "viewImage" | null
  >(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({
        page,
        limit: 10,
        search,
        categoryId: catFilter,
      });
      setData(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter]);

  useEffect(() => {
    fetchData();
    categoriesApi.list({ limit: 100 }).then((r) => setCategories(r.data.data));
    productsApi
      .favorites()
      .then((r) => setFavorites(new Set(r.data.map((p: Product) => p.id))));
  }, [fetchData]);

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setSelected(null);
    setModal("create");
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      stock: String(p.stock),
      categoryIds: p.categories?.map((c) => c.id) || [],
    });
    setError("");
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryIds: form.categoryIds,
      };
      if (modal === "create") await productsApi.create(payload);
      else await productsApi.update(selected!.id, payload);
      setModal(null);
      fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await productsApi.remove(selected!.id);
      setModal(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !selected) return;
    setSaving(true);
    try {
      await productsApi.uploadImage(selected.id, imageFile);
      setModal(null);
      fetchData();
    } catch (e: any) {
      setError("Erro ao fazer upload da imagem");
    } finally {
      setSaving(false);
    }
  };

  const toggleFav = async (id: string) => {
    const res = await productsApi.toggleFavorite(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      res.data.favorited ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const toggleCat = (id: string) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (p: Product) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            onClick={() => {
              if (p.image) {
                setSelected(p);
                setModal("viewImage");
              }
            }}
            style={{
              width: 45,
              height: 45,
              borderRadius: 6,
              background: "#e9ecef",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #dee2e6",
              flexShrink: 0,
              cursor: p.image ? "pointer" : "default",
            }}
            title={p.image ? "Clique para ampliar" : ""}
          >
            {p.image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.split("/api")[0]}/uploads/${p.image}`}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 20 }}>📦</span>
            )}
          </div>
          <span style={{ fontWeight: 500 }}>{p.name}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Preço",
      render: (p: Product) => `R$ ${Number(p.price).toFixed(2)}`,
    },
    { key: "stock", label: "Estoque" },
    {
      key: "categories",
      label: "Categorias",
      render: (p: Product) =>
        p.categories?.map((c) => c.name).join(", ") || "-",
    },
    {
      key: "owner",
      label: "Dono",
      render: (p: Product) => p.owner?.name || "-",
    },
  ];

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
                Produtos
              </h1>
              <p style={{ margin: "4px 0 0", color: "#6c757d" }}>
                Gerencie os produtos do sistema
              </p>
            </div>
            <Btn onClick={openCreate}>+ Novo Produto</Btn>
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
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Buscar produto..."
            filters={
              <Select
                value={catFilter}
                onChange={(e) => {
                  setCatFilter(e.target.value);
                  setPage(1);
                }}
                style={{ width: 180 }}
              >
                <option value="">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            }
            actions={(p) => (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => toggleFav(p.id)}
                  title={favorites.has(p.id) ? "Desfavoritar" : "Favoritar"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {favorites.has(p.id) ? (
                    <Icon icon="favorite" color="#dc3545" />
                  ) : (
                    <Icon icon="favorite" outline color="#6c757d" />
                  )}
                </button>

                <Btn
                  variant="secondary"
                  onClick={() => {
                    setSelected(p);
                    setImageFile(null);
                    setModal("image");
                  }}
                  style={{
                    padding: "5px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Upload de Imagem"
                >
                  <Icon icon="photo_camera" outline size="small" />
                </Btn>

                <Btn
                  variant="secondary"
                  onClick={() => openEdit(p)}
                  style={{ padding: "5px 12px", fontSize: 13 }}
                >
                  Editar
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    setSelected(p);
                    setModal("delete");
                  }}
                  style={{ padding: "5px 12px", fontSize: 13 }}
                >
                  Excluir
                </Btn>
              </div>
            )}
          />
        </div>

        <Modal
          open={modal === "viewImage"}
          onClose={() => setModal(null)}
          title={selected?.name || "Visualizar Imagem"}
          width={700}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              background: "#f8f9fa",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {selected?.image && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.split("/api")[0]}/uploads/${selected.image}`}
                alt={selected.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}
          </div>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Fechar
            </Btn>
          </div>
        </Modal>

        <Modal
          open={modal === "create" || modal === "edit"}
          onClose={() => setModal(null)}
          title={modal === "create" ? "Novo Produto" : "Editar Produto"}
        >
          <Field label="Nome" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Descrição">
            <TextArea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Preço (R$)" required>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Estoque">
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Categorias">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((c) => (
                <label
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(c.id)}
                    onChange={() => toggleCat(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
          {error && <p style={{ color: "#dc3545", fontSize: 13 }}>{error}</p>}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Btn>
            <Btn onClick={handleSave} loading={saving}>
              Salvar
            </Btn>
          </div>
        </Modal>

        <Modal
          open={modal === "image"}
          onClose={() => setModal(null)}
          title="Upload de Imagem"
          width={400}
        >
          <p style={{ color: "#6c757d", fontSize: 14 }}>
            Produto: <strong>{selected?.name}</strong>
          </p>
          <Field label="Selecione uma imagem">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </Field>
          {error && <p style={{ color: "#dc3545", fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Btn>
            <Btn
              onClick={handleImageUpload}
              loading={saving}
              disabled={!imageFile}
            >
              Enviar
            </Btn>
          </div>
        </Modal>

        <Modal
          open={modal === "delete"}
          onClose={() => setModal(null)}
          title="Confirmar Exclusão"
          width={400}
        >
          <p>
            Deseja excluir o produto <strong>{selected?.name}</strong>?
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>
              Cancelar
            </Btn>
            <Btn variant="danger" onClick={handleDelete} loading={saving}>
              Excluir
            </Btn>
          </div>
        </Modal>
      </AppLayout>
    </AuthGuard>
  );
}
