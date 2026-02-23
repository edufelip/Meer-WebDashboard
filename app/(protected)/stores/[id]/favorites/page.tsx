"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import type { DashboardFavoriteUser, PageResponse } from "@/types/index";

const PAGE_SIZE = 20;

export default function StoreFavoritesUsersPage() {
  const params = useParams<{ id: string }>();
  const storeId = params?.id ?? "";
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data, isLoading, error } = useQuery({
    queryKey: ["store-favorites-users", storeId, page, sort],
    enabled: Boolean(storeId),
    queryFn: () =>
      api.get<PageResponse<DashboardFavoriteUser>>(
        `/dashboard/favorites?storeId=${encodeURIComponent(storeId)}&page=${page}&pageSize=${PAGE_SIZE}&sort=${sort}`
      )
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <PageHeader
        title="Usuários que favoritaram"
        subtitle={`Brechó: ${storeId}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/stores/${storeId}`}
              className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors hover:bg-white"
            >
              Voltar ao brechó
            </Link>
            <select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value as "newest" | "oldest");
              }}
              name="favorites-users-sort"
              aria-label="Ordenar usuários por data de criação"
              className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-textDark shadow-sm focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            >
              <option className="text-black" value="newest">
                Mais recentes
              </option>
              <option className="text-black" value="oldest">
                Mais antigos
              </option>
            </select>
          </div>
        }
      />

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-white">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/60">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Papel</th>
                <th className="py-3 px-4">Avatar</th>
                <th className="py-3 px-4">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="py-3 px-4" colSpan={6}>
                    Carregando…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td className="py-3 px-4 text-red-300" colSpan={6}>
                    {getErrorMessage(error, "Erro ao carregar usuários que favoritaram este brechó.")}
                  </td>
                </tr>
              )}
              {!isLoading && !error && items.length === 0 && (
                <EmptyStateRow
                  colSpan={6}
                  title="Nenhum favorito encontrado"
                  description="Este brechó ainda não possui usuários que o favoritaram."
                />
              )}
              {items.map((user) => (
                <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-xs text-white/60">{user.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{user.name || "-"}</td>
                  <td className="py-3 px-4 text-white/90">{user.email || "-"}</td>
                  <td className="py-3 px-4 text-white/80">{user.role || "-"}</td>
                  <td className="py-3 px-4 text-white/80">
                    {user.avatarUrl ? (
                      <a href={user.avatarUrl} target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">
                        Ver avatar
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/70">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
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
