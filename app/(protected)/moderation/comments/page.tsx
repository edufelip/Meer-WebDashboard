"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ContentComment, PageResponse } from "@/types/index";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";

const PAGE_SIZE = 20;

export default function ModerationCommentsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [contentId, setContentId] = useState("");
  const [contentIdInput, setContentIdInput] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["moderation-comments", page, search, contentId, sort],
    queryFn: () =>
      api.get<PageResponse<ContentComment>>(
        `/dashboard/comments?page=${page}&pageSize=${PAGE_SIZE}&sort=${sort}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }${contentId ? `&contentId=${encodeURIComponent(contentId)}` : ""}`
      )
  });

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
    <div className="flex min-h-screen w-full flex-col gap-6 p-4 sm:p-6 lg:p-10 text-textDark">
      <PageHeader
        title="Moderação de comentários"
        subtitle="Audite comentários recentes e remova conteúdos inadequados."
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/moderation"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-textDark transition hover:scale-[1.01] hover:bg-black/5"
            >
              Contatos
            </Link>
            <Link
              href="/moderation/comments"
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest transition hover:scale-[1.01] hover:bg-white"
            >
              Comentários
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitSearch();
            }
          }}
          className="w-64 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-textDark placeholder:text-textSubtle/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          placeholder="Buscar por comentário ou usuário"
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
          className="w-64 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-textDark placeholder:text-textSubtle/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          placeholder="Filtrar por contentId"
        />
        <select
          value={sort}
          onChange={(e) => {
            setPage(0);
            setSort(e.target.value as "newest" | "oldest");
          }}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-textDark focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
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
          className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest transition hover:scale-[1.01] hover:bg-white"
        >
          Buscar
        </button>
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-left text-sm text-textDark">
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
            {isLoading && (
              <tr>
                <td className="py-3 px-4" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="py-3 px-4 text-red-300" colSpan={6}>
                  Erro ao carregar comentários
                </td>
              </tr>
            )}
            {!isLoading && !error && items.length === 0 && (
              <EmptyStateRow colSpan={6} title="Nenhum comentário encontrado" description="Ajuste os filtros para ver mais resultados." />
            )}
            {items.map((comment) => (
              <tr key={comment.id} className="border-t border-black/5 hover:bg-black/5">
                <td className="py-3 px-4 text-xs text-white">{comment.id}</td>
                <td className="py-3 px-4 text-white">
                  {comment.contentId ? (
                    <Link href={`/contents/${comment.contentId}`} className="text-brand-primary hover:underline">
                      {comment.contentTitle ?? comment.contentId}
                    </Link>
                  ) : (
                    comment.contentTitle ?? "—"
                  )}
                  {comment.thriftStoreName ? (
                    <div className="text-xs text-white/60">{comment.thriftStoreName}</div>
                  ) : null}
                </td>
                <td className="py-3 px-4 text-white">{comment.userDisplayName ?? comment.userId ?? "—"}</td>
                <td className="py-3 px-4 text-white">{comment.body}</td>
                <td className="py-3 px-4 text-white">
                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
                </td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment)}
                    disabled={deleteMutation.isPending}
                    className="rounded-xl border border-red-400/50 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <div className="flex items-center justify-between text-sm text-textDark">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
        >
          Anterior
        </button>
        <div>
          Página {page + 1} {data?.hasNext ? "" : "(última)"}
        </div>
        <button
          disabled={!data?.hasNext}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
