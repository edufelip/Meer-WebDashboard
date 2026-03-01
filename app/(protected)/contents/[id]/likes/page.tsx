"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import type { PageResponse, ContentLike, GuideContent } from "@/types/index";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";

const LIKES_PAGE_SIZE = 20;

export default function ContentLikesPage() {
  const params = useParams<{ id: string }>();
  const contentId = params?.id as string;
  const router = useRouter();
  
  const [page, setPage] = useState(0);

  const { data: contentData } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => api.get<GuideContent>(`/dashboard/contents/${contentId}`),
    enabled: Boolean(contentId),
  });

  const {
    data: likesData,
    isLoading: likesLoading,
    error: likesError
  } = useQuery({
    queryKey: ["content-likes", contentId, page],
    queryFn: () =>
      api.get<PageResponse<ContentLike>>(
        `/dashboard/contents/${contentId}/likes?page=${page}&pageSize=${LIKES_PAGE_SIZE}`
      ),
    enabled: Boolean(contentId)
  });

  useEffect(() => {
    if (!contentId) return;
    setPage(0);
  }, [contentId]);

  const likeItems = likesData?.items ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader
        title={`Curtidas do Conteúdo`}
        subtitle={contentData?.title ?? contentId}
        actions={
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10"
          >
            Voltar
          </button>
        }
      />

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Usuários que curtiram</p>
            <p className="text-sm text-white/70">Lista paginada de usuários.</p>
          </div>
          <div className="text-sm text-white/70">
            Página {page + 1} {likesData?.hasNext ? "" : "(última)"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm text-white">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-white/60">
                <th className="py-3 px-4">ID do Like</th>
                <th className="py-3 px-4">Usuário ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Data da Curtida</th>
              </tr>
            </thead>
            <tbody>
              {likesLoading && (
                <tr>
                  <td className="py-3 px-4" colSpan={4}>
                    Carregando…
                  </td>
                </tr>
              )}
              {likesError && (
                <tr>
                  <td className="py-3 px-4 text-red-300" colSpan={4}>
                    {getErrorMessage(likesError, "Erro ao carregar curtidas")}
                  </td>
                </tr>
              )}
              {!likesLoading && !likesError && likeItems.length === 0 && (
                <EmptyStateRow
                  colSpan={4}
                  title="Nenhuma curtida encontrada"
                  description="Este conteúdo ainda não recebeu curtidas."
                />
              )}
              {likeItems.map((like) => (
                <tr key={like.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4 text-xs text-white/80">{like.id}</td>
                  <td className="py-3 px-4 text-xs text-white/80">{like.userId}</td>
                  <td className="py-3 px-4 text-white">
                    {like.userDisplayName ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {like.createdAt ? new Date(like.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white shadow-sm transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={!likesData?.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white shadow-sm transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
