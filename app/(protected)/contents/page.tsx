"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import type { GuideContent, PageResponse } from "@/types/index";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";

export default function ContentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contents", page, search, sort],
    queryFn: () =>
      api.get<PageResponse<GuideContent>>(
        `/dashboard/contents?page=${page}&pageSize=20&sort=${sort}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      )
  });

  const items = data?.items ?? [];

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.del(`/dashboard/contents/${id}`)));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["contents"] });
      setSelectedIds(new Set());
    },
    onError: (error) => alert(getErrorMessage(error, "Ocorreu um erro ao excluir alguns conteúdos."))
  });

  const submitSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const confirmed = window.confirm(`Deseja excluir os ${count} conteúdos selecionados?`);
    if (!confirmed) return;
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <PageHeader
        title="Conteúdos"
        subtitle="Publicações enviadas pelos brechós."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {selectedIds.size > 0 ? (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleteMutation.isPending ? "Excluindo…" : `Excluir (${selectedIds.size})`}
              </button>
            ) : (
              <Link
                href="/contents/new"
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors hover:bg-white"
              >
                Novo conteúdo
              </Link>
            )}
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitSearch();
                }
              }}
              name="content-search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Buscar conteúdos"
              className="w-full sm:w-64 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              placeholder="Buscar por título ou loja…"
            />
            <select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value as "newest" | "oldest");
              }}
              name="content-sort"
              aria-label="Ordenar conteúdos"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="newest">
                Mais recentes
              </option>
              <option className="text-black" value="oldest">
                Mais antigas
              </option>
            </select>
            <button
              onClick={submitSearch}
              className="rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              Buscar
            </button>
          </div>
        }
      />

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-white">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-brand-primary focus:ring-brand-primary"
                  name="select-all-contents"
                  aria-label="Selecionar todos os conteúdos"
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Título</th>
              <th className="py-3 px-4">Brechó</th>
              <th className="py-3 px-4">Curtidas</th>
              <th className="py-3 px-4">Comentários</th>
              <th className="py-3 px-4">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="py-3 px-4" colSpan={7}>
                  Carregando…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-300" colSpan={7}>
                  {getErrorMessage(error, "Erro ao carregar conteúdos")}
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow colSpan={7} title="Nenhum conteúdo encontrado" description="Altere o filtro ou verifique se há posts novos." />
            )}
            {items.map((c) => (
              <tr 
                key={c.id} 
                className={`border-t border-white/5 transition-colors hover:bg-white/5 ${selectedIds.has(c.id) ? "bg-white/10" : ""}`}
              >
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-brand-primary focus:ring-brand-primary"
                    name={`select-content-${c.id}`}
                    aria-label={`Selecionar conteúdo ${c.title ?? c.id}`}
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleSelectOne(c.id)}
                  />
                </td>
                <td className="py-3 px-4 text-xs text-white/60">{c.id}</td>
                <td className="py-3 px-4 font-semibold">
                  <Link href={`/contents/${c.id}`} className="text-brand-primary hover:underline">
                    {c.title}
                  </Link>
                </td>
                <td className="py-3 px-4 text-white/90">{c.thriftStoreName ?? c.thriftStoreId}</td>
                <td className="py-3 px-4 text-white/80">{c.likeCount ?? 0}</td>
                <td className="py-3 px-4 text-white/80">{c.commentCount ?? 0}</td>
                <td className="py-3 px-4 text-white/70">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
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
          Página {page + 1} {data?.hasNext ? "" : "(última)"}
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
