"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ModerationStats } from "@/types/index";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { ModerationTabs } from "@/components/dashboard/ModerationTabs";
import { TableErrorRow, TableSkeletonRows } from "@/components/dashboard/TableSkeleton";

type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
};

type PageResponse<T> = {
  items: T[];
  page: number;
  hasNext: boolean;
};

export default function ModerationPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["supportContacts", page],
    queryFn: () => api.get<PageResponse<Contact>>(`/dashboard/support/contacts?page=${page}&pageSize=20`),
    placeholderData: (prev) => prev
  });

  const { data: moderationStats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => api.get<ModerationStats>("/dashboard/moderation/stats")
  });

  const moderationBadge =
    moderationStats && moderationStats.flaggedForReview > 0 ? String(moderationStats.flaggedForReview) : undefined;

  const items = data?.items ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader
        title="Moderação"
        subtitle="Fila de contatos e solicitações do público."
        titleActions={<ModerationTabs active="contacts" badge={moderationBadge} />}
      />

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm text-white">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nome</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Mensagem</th>
              <th className="py-3 px-4">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows colSpan={5} columns={5} />}
            {error && <TableErrorRow colSpan={5} message="Erro ao carregar contatos" onRetry={() => refetch()} />}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow colSpan={5} title="Nenhum contato encontrado" description="Ainda não há mensagens para revisar." />
            )}
            {items.map((c) => (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-xs text-white/60">
                  <Link href={`/moderation/${c.id}`} className="text-brand-primary hover:underline">
                    {c.id}
                  </Link>
                </td>
                <td className="py-3 px-4 font-semibold">
                  <Link href={`/moderation/${c.id}`} className="text-highlight hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-white/90">{c.email}</td>
                <td className="py-3 px-4 text-white/80 line-clamp-1">{c.message}</td>
                <td className="py-3 px-4 text-white/70">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
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
