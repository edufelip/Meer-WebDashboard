"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";

type Category = { id: string; nameStringId: string; imageResId: string; createdAt?: string };
type PageResponse<T> = { items: T[]; page: number; hasNext: boolean };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [idInput, setIdInput] = useState("");
  const [nameStringIdInput, setNameStringIdInput] = useState("");
  const [imageResIdInput, setImageResIdInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", page],
    queryFn: () => api.get<PageResponse<Category>>(`/dashboard/categories?page=${page}&pageSize=50`),
    placeholderData: (prev) => prev
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const body = {
        id: idInput,
        nameStringId: nameStringIdInput,
        imageResId: imageResIdInput
      };
      if (editId) {
        await api.put(`/dashboard/categories/${editId}`, body);
      } else {
        await api.post("/dashboard/categories", body);
      }
    },
    onSuccess: () => {
      setIdInput("");
      setNameStringIdInput("");
      setImageResIdInput("");
      setEditId(null);
      qc.invalidateQueries({ queryKey: ["categories"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/dashboard/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] })
  });

  const items = data?.items ?? [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput.trim() || !nameStringIdInput.trim() || !imageResIdInput.trim()) return;
    upsertMutation.mutate();
  };

  const onDelete = (id: string) => {
    const confirmed = window.confirm("Deseja apagar esta categoria?");
    if (!confirmed) return;
    deleteMutation.mutate(id, {
      onError: () => alert("Não foi possível apagar a categoria.")
    });
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setIdInput(cat.id);
    setNameStringIdInput(cat.nameStringId);
    setImageResIdInput(cat.imageResId);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader title="Categorias" subtitle="Crie e edite categorias utilizadas pelos apps." />

      <GlassCard>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr,1fr,1fr,auto]">
          <input
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            maxLength={120}
            name="category-id"
            autoComplete="off"
            spellCheck={false}
            aria-label="ID da categoria"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            placeholder="ID (ex: casa)…"
            required
          />
          <input
            value={nameStringIdInput}
            onChange={(e) => setNameStringIdInput(e.target.value)}
            maxLength={120}
            name="category-name-string-id"
            autoComplete="off"
            spellCheck={false}
            aria-label="nameStringId"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            placeholder="nameStringId (ex: brecho_de_casa)…"
            required
          />
          <input
            value={imageResIdInput}
            onChange={(e) => setImageResIdInput(e.target.value)}
            maxLength={240}
            name="category-image-res-id"
            autoComplete="off"
            spellCheck={false}
            aria-label="imageResId"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            placeholder="imageResId (ex: brecho-categories-house)…"
            required
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={upsertMutation.isPending}
              className="rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
            >
              {upsertMutation.isPending ? "Salvando…" : editId ? "Atualizar" : "Adicionar"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setIdInput("");
                  setNameStringIdInput("");
                  setImageResIdInput("");
                }}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm text-white">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">nameStringId</th>
              <th className="py-3 px-4">imageResId</th>
              <th className="py-3 px-4">Criado em</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 px-4" colSpan={4}>
                  Carregando…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-300" colSpan={4}>
                  Erro ao carregar categorias
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow
                colSpan={5}
                title="Nenhuma categoria encontrada"
                description="Inclua a primeira categoria usando o formulário acima."
              />
            )}
            {items.map((cat) => (
              <tr key={cat.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-xs text-white/60">{cat.id}</td>
                <td className="py-3 px-4 text-white font-semibold">{cat.nameStringId}</td>
                <td className="py-3 px-4 text-white/70">{cat.imageResId}</td>
                <td className="py-3 px-4 text-white/70">
                  {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="rounded-full bg-red-600/80 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-textDark">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="font-medium text-textSubtle">
          Página {data ? data.page : page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
