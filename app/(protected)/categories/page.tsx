"use client";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Category = { id: string; nameStringId: string; imageResId: string; createdAt?: string };
type PageResponse<T> = { items: T[]; page: number; hasNext: boolean };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [idInput, setIdInput] = useState("");
  const [nameStringIdInput, setNameStringIdInput] = useState("");
  const [imageResIdInput, setImageResIdInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
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

  useEffect(() => {
    if (!isFetching) {
      refetch();
    }
  }, [page, refetch, isFetching]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#374151]">Categorias</h1>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="ID (ex: casa)"
            required
          />
          <input
            value={nameStringIdInput}
            onChange={(e) => setNameStringIdInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="nameStringId (ex: brecho_de_casa)"
            required
          />
          <input
            value={imageResIdInput}
            onChange={(e) => setImageResIdInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="imageResId (ex: brecho-categories-house)"
            required
          />
          <button
            type="submit"
            disabled={upsertMutation.isPending}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
          >
            {upsertMutation.isPending ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
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
              className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-[#6B7280] border-b border-gray-200">
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
                  Carregando...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-600" colSpan={4}>
                  Erro ao carregar categorias
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <tr>
                <td className="py-3 px-4 text-[#6B7280]" colSpan={4}>
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            )}
            {items.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-xs text-[#6B7280]">{cat.id}</td>
                <td className="py-3 px-4 text-[#374151] font-semibold">{cat.nameStringId}</td>
                <td className="py-3 px-4 text-[#6B7280]">{cat.imageResId}</td>
                <td className="py-3 px-4 text-[#6B7280]">
                  {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="px-2 py-1 rounded border border-gray-300 text-sm bg-white"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="px-2 py-1 rounded border border-red-200 text-sm bg-red-50 text-red-600"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-[#374151]">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
        >
          Anterior
        </button>
        <div>
          Página {data ? data.page : page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
