"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ApiError, api } from "@/lib/api";
import type { DashboardStoreSummary, PageResponse } from "@/types/index";

type FavoritesFilters = {
  userId?: string;
  userEmail?: string;
};

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Erro ao carregar favoritos.";
  const body = error.body as { message?: string } | undefined;
  if (body?.message) return body.message;
  if (error.status === 403) return "Acesso negado. Esta rota exige perfil admin.";
  if (error.status === 401) return "Sessão inválida. Faça login novamente.";
  return "Erro ao carregar favoritos.";
}

export default function FavoritesPage() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [userIdInput, setUserIdInput] = useState("");
  const [userEmailInput, setUserEmailInput] = useState("");
  const [filters, setFilters] = useState<FavoritesFilters | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const activeFilterSummary = useMemo(() => {
    if (!filters?.userId && !filters?.userEmail) return "Informe um filtro para buscar.";
    if (filters.userId) return `Filtrando por userId: ${filters.userId}`;
    return `Filtrando por userEmail: ${filters.userEmail}`;
  }, [filters]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["favorites", page, sort, filters?.userId ?? "", filters?.userEmail ?? ""],
    enabled: Boolean(filters?.userId || filters?.userEmail),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.userId) {
        params.set("userId", filters.userId);
      } else if (filters?.userEmail) {
        params.set("userEmail", filters.userEmail);
      }
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
      params.set("sort", sort);
      return api.get<PageResponse<DashboardStoreSummary>>(`/dashboard/favorites?${params.toString()}`);
    }
  });

  const items = data?.items ?? [];

  const submitSearch = () => {
    const normalizedUserId = userIdInput.trim();
    const normalizedUserEmail = userEmailInput.trim().toLowerCase();

    if (!normalizedUserId && !normalizedUserEmail) {
      setValidationMessage("Informe userId ou userEmail para consultar favoritos.");
      setFilters(null);
      setPage(0);
      return;
    }

    setValidationMessage("");
    setPage(0);
    setFilters({
      ...(normalizedUserId ? { userId: normalizedUserId } : {}),
      ...(!normalizedUserId && normalizedUserEmail ? { userEmail: normalizedUserEmail } : {})
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <PageHeader
        title="Favoritos"
        subtitle="Lista de brechós favoritados por usuário."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitSearch();
                }
              }}
              name="favorites-user-id"
              autoComplete="off"
              spellCheck={false}
              aria-label="Filtrar favoritos por userId"
              className="w-full sm:w-72 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              placeholder="userId (UUID)"
            />
            <input
              type="email"
              value={userEmailInput}
              onChange={(e) => setUserEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitSearch();
                }
              }}
              name="favorites-user-email"
              autoComplete="off"
              spellCheck={false}
              aria-label="Filtrar favoritos por userEmail"
              className="w-full sm:w-72 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              placeholder="userEmail"
            />
            <select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value as "newest" | "oldest");
              }}
              name="favorites-sort"
              aria-label="Ordenar favoritos"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="newest">
                Mais recentes
              </option>
              <option className="text-black" value="oldest">
                Mais antigos
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

      <p className="text-sm text-textSubtle">
        {activeFilterSummary} Se `userId` e `userEmail` forem enviados, `userId` tem prioridade.
      </p>

      {validationMessage ? <p className="text-sm text-red-300">{validationMessage}</p> : null}

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm text-white">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/60">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Endereço</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="py-3 px-4" colSpan={5}>
                    Carregando…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td className="py-3 px-4 text-red-300" colSpan={5}>
                    {getErrorMessage(error)}
                  </td>
                </tr>
              )}
              {!isLoading && !error && !filters && (
                <EmptyStateRow
                  colSpan={5}
                  title="Informe um filtro"
                  description="Use userId ou userEmail para consultar os favoritos do usuário."
                />
              )}
              {!isLoading && !error && filters && items.length === 0 && (
                <EmptyStateRow colSpan={5} title="Nenhum favorito encontrado" description="Verifique os filtros e tente novamente." />
              )}
              {items.map((store) => (
                <tr key={store.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-xs text-white/60">{store.id}</td>
                  <td className="py-3 px-4 font-semibold">
                    <Link href={`/stores/${store.id}`} className="text-brand-primary hover:underline">
                      {store.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-white/90">{store.addressLine || "-"}</td>
                  <td className="py-3 px-4 text-white/80">{store.isOnlineStore ? "Online" : "Físico"}</td>
                  <td className="py-3 px-4 text-white/70">
                    {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-textDark">
        <button
          disabled={page === 0 || !filters}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Anterior
        </button>
        <div className="font-medium text-textSubtle">
          Página {page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext || !filters}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-textDark shadow-sm transition-colors hover:bg-white disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
