"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ContentComment, ModerationStats, PageResponse } from "@/types/index";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { ModerationTabs } from "@/components/dashboard/ModerationTabs";
import { TableErrorRow, TableSkeletonRows } from "@/components/dashboard/TableSkeleton";

const PAGE_SIZE = 20;

export default function ModerationCommentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [contentId, setContentId] = useState("");
  const [contentIdInput, setContentIdInput] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["moderation-comments", page, search, contentId, sort],
    queryFn: () =>
      api.get<PageResponse<ContentComment>>(
        `/dashboard/comments?page=${page}&pageSize=${PAGE_SIZE}&sort=${sort}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }${contentId ? `&contentId=${encodeURIComponent(contentId)}` : ""}`
      )
  });

  const { data: moderationStats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => api.get<ModerationStats>("/dashboard/moderation/stats")
  });

  const moderationBadge =
    moderationStats && moderationStats.flaggedForReview > 0 ? String(moderationStats.flaggedForReview) : undefined;

  const deleteMutation = useMutation({
    mutationFn: ({ commentId, targetContentId }: { commentId: string; targetContentId?: string }) => {
      if (!targetContentId) throw new Error("Conteúdo não identificado.");
      return api.del(`/dashboard/contents/${targetContentId}/comments/${commentId}`);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["moderation-comments"] });
      if (variables?.targetContentId) {
        qc.invalidateQueries({ queryKey: ["content-comments", variables.targetContentId] });
        qc.invalidateQueries({ queryKey: ["content", variables.targetContentId] });
      }
      qc.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: () => alert("Não foi possível apagar o comentário.")
  });

  const submitSearch = () => {
    setPage(0);
    setSearch(searchInput.trim());
    setContentId(contentIdInput.trim());
  };

  const handleDelete = (comment: ContentComment) => {
    if (!comment.contentId) {
      alert("Conteúdo não identificado.");
      return;
    }
    const confirmed = window.confirm("Deseja apagar este comentário?");
    if (!confirmed) return;
    deleteMutation.mutate({ commentId: comment.id, targetContentId: comment.contentId });
  };

  const items = data?.items ?? [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader
        title="Moderação de comentários"
        subtitle="Audite comentários recentes e remova conteúdos inadequados."
        actions={
          <ModerationTabs active="comments" badge={moderationBadge} />
        }
      />

      <div className="flex flex-wrap items-center gap-3">
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
          name="comment-search"
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar comentários"
          className="w-full sm:w-64 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          placeholder="Buscar por comentário ou usuário…"
        />
        <input
          value={contentIdInput}
          onChange={(e) => setContentIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitSearch();
            }
          }}
          name="comment-content-id"
          autoComplete="off"
          spellCheck={false}
          aria-label="Filtrar por contentId"
          className="w-full sm:w-64 rounded-2xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
          placeholder="Filtrar por contentId…"
        />
        <select
          value={sort}
          onChange={(e) => {
            setPage(0);
            setSort(e.target.value as "newest" | "oldest");
          }}
          name="comment-sort"
          aria-label="Ordenar comentários"
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

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm text-white">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Conteúdo</th>
              <th className="py-3 px-4">Usuário</th>
              <th className="py-3 px-4">Comentário</th>
              <th className="py-3 px-4">Criado em</th>
              <th className="py-3 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeletonRows colSpan={6} columns={6} />}
            {error && <TableErrorRow colSpan={6} message="Erro ao carregar comentários" onRetry={() => refetch()} />}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow colSpan={6} title="Nenhum comentário encontrado" description="Ajuste os filtros para ver mais resultados." />
            )}
            {items.map((comment) => (
              <tr key={comment.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-xs text-white/60">{comment.id}</td>
                <td className="py-3 px-4 text-white">
                  {comment.contentId ? (
                    <Link href={`/contents/${comment.contentId}`} className="text-brand-primary font-medium hover:underline">
                      {comment.contentTitle ?? comment.contentId}
                    </Link>
                  ) : (
                    comment.contentTitle ?? "—"
                  )}
                  {comment.thriftStoreName ? (
                    <div className="text-xs text-white/50">{comment.thriftStoreName}</div>
                  ) : null}
                </td>
                <td className="py-3 px-4 text-white">{comment.userDisplayName ?? comment.userId ?? "—"}</td>
                <td className="py-3 px-4 text-white break-words">{comment.body}</td>
                <td className="py-3 px-4 text-white/70">
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
                </td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment)}
                    disabled={deleteMutation.isPending}
                    className="rounded-full bg-red-600/80 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
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
