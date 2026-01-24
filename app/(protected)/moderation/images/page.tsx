"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ImageModeration, ImageModerationStatus, ModerationPageResponse, ModerationStats } from "@/types/index";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { Pill } from "@/components/dashboard/Pill";
import { ModerationTabs } from "@/components/dashboard/ModerationTabs";
import { TableErrorRow, TableSkeletonRows } from "@/components/dashboard/TableSkeleton";

const PAGE_SIZE = 20;

const statusLabels: Record<ImageModerationStatus, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  APPROVED: "Aprovado",
  FLAGGED_FOR_REVIEW: "Em revisão",
  BLOCKED: "Bloqueado",
  MANUALLY_APPROVED: "Aprovado (manual)",
  MANUALLY_REJECTED: "Rejeitado (manual)",
  FAILED: "Falhou"
};

const statusTone: Record<ImageModerationStatus, string> = {
  PENDING: "bg-white/10 text-white",
  PROCESSING: "bg-sky-500/30 text-sky-100",
  APPROVED: "bg-emerald-600/30 text-emerald-100",
  FLAGGED_FOR_REVIEW: "bg-amber-600/30 text-amber-100",
  BLOCKED: "bg-red-600/30 text-red-100",
  MANUALLY_APPROVED: "bg-emerald-600/30 text-emerald-100",
  MANUALLY_REJECTED: "bg-red-600/30 text-red-100",
  FAILED: "bg-red-600/30 text-red-100"
};

const entityLabels = {
  STORE_PHOTO: "Foto do brechó",
  USER_AVATAR: "Avatar do usuário",
  GUIDE_CONTENT_IMAGE: "Imagem de conteúdo"
} as const;

export default function ModerationImagesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"flagged" | "history">("flagged");
  const [flaggedPage, setFlaggedPage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ImageModerationStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<ImageModeration | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    setReviewNotes(selected?.reviewNotes ?? "");
  }, [selected]);

  const statsQuery = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => api.get<ModerationStats>("/dashboard/moderation/stats")
  });

  const flaggedQuery = useQuery({
    queryKey: ["image-moderation-flagged", flaggedPage],
    queryFn: () =>
      api.get<ModerationPageResponse<ImageModeration>>(
        `/dashboard/moderation/flagged?page=${flaggedPage}&pageSize=${PAGE_SIZE}`
      ),
    placeholderData: (prev) => prev,
    enabled: activeTab === "flagged"
  });

  const historyQuery = useQuery({
    queryKey: ["image-moderation-history", historyPage, statusFilter],
    queryFn: () => {
      const statusParam = statusFilter === "ALL" ? "" : `&status=${statusFilter}`;
      return api.get<ModerationPageResponse<ImageModeration>>(
        `/dashboard/moderation?page=${historyPage}&pageSize=${PAGE_SIZE}${statusParam}`
      );
    },
    placeholderData: (prev) => prev,
    enabled: activeTab === "history"
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision, notes }: { id: number; decision: "MANUALLY_APPROVED" | "MANUALLY_REJECTED"; notes?: string }) =>
      api.patch<ImageModeration>(`/dashboard/moderation/${id}/review`, { decision, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation-stats"] });
      qc.invalidateQueries({ queryKey: ["image-moderation-flagged"] });
      qc.invalidateQueries({ queryKey: ["image-moderation-history"] });
      setSelected(null);
      setReviewNotes("");
    },
    onError: () => alert("Não foi possível salvar a revisão.")
  });

  const stats = statsQuery.data;
  const moderationBadge =
    stats && stats.flaggedForReview > 0 ? String(stats.flaggedForReview) : undefined;
  const flaggedItems = flaggedQuery.data?.content ?? [];
  const historyItems = historyQuery.data?.content ?? [];
  const activeQuery = activeTab === "flagged" ? flaggedQuery : historyQuery;

  const statsCards = useMemo(
    () => [
      { label: "Pendentes", value: stats?.pending ?? 0 },
      { label: "Processando", value: stats?.processing ?? 0 },
      { label: "Revisão", value: stats?.flaggedForReview ?? 0 },
      { label: "Aprovadas", value: stats?.approved ?? 0 },
      { label: "Bloqueadas", value: stats?.blocked ?? 0 },
      { label: "Falhas", value: stats?.failed ?? 0 }
    ],
    [stats]
  );

  const handleReview = (decision: "MANUALLY_APPROVED" | "MANUALLY_REJECTED") => {
    if (!selected) return;
    if (decision === "MANUALLY_REJECTED") {
      const confirmed = window.confirm("Deseja rejeitar esta imagem?");
      if (!confirmed) return;
    }
    const notes = reviewNotes.trim();
    reviewMutation.mutate({ id: selected.id, decision, notes: notes.length ? notes : undefined });
  };

  const closeModal = () => {
    setSelected(null);
    setReviewNotes("");
  };

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 p-4 sm:p-6 lg:p-10 text-textDark">
      <PageHeader
        title="Moderação de imagens"
        subtitle="Revise fotos sinalizadas pelo sistema de IA."
        actions={
          <ModerationTabs active="images" badge={moderationBadge} />
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {statsQuery.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="flex flex-col gap-3">
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/20" />
                <div className="h-7 w-12 animate-pulse rounded-full bg-white/20" />
              </GlassCard>
            ))
          : null}
        {statsQuery.isError ? (
          <GlassCard className="flex flex-col gap-2 sm:col-span-2 lg:col-span-6">
            <span className="text-sm text-white/80">Não foi possível carregar os indicadores.</span>
            <button
              type="button"
              onClick={() => statsQuery.refetch()}
              className="w-fit rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              Tentar novamente
            </button>
          </GlassCard>
        ) : null}
        {!statsQuery.isLoading && !statsQuery.isError
          ? statsCards.map((card) => (
              <GlassCard key={card.label} className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-white/60">{card.label}</span>
                <span className="text-2xl font-semibold text-white">{card.value}</span>
              </GlassCard>
            ))
          : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("flagged")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "flagged"
              ? "bg-brand-primary text-brand-forest"
              : "border border-black/10 bg-white text-textDark hover:bg-black/5"
          }`}
        >
          Caixa de entrada
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "history"
              ? "bg-brand-primary text-brand-forest"
              : "border border-black/10 bg-white text-textDark hover:bg-black/5"
          }`}
        >
          Histórico
        </button>
        {activeTab === "history" ? (
          <select
            value={statusFilter}
            onChange={(e) => {
              setHistoryPage(0);
              setStatusFilter(e.target.value as ImageModerationStatus | "ALL");
            }}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-textDark focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          >
            <option className="text-black" value="ALL">
              Todos os status
            </option>
            {Object.keys(statusLabels).map((status) => (
              <option key={status} className="text-black" value={status}>
                {statusLabels[status as ImageModerationStatus]}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-left text-sm text-textDark">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-white/60">
              <th className="py-3 px-4">Imagem</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Criado em</th>
              <th className="py-3 px-4">Ação</th>
            </tr>
          </thead>
          <tbody>
            {activeQuery.isLoading && <TableSkeletonRows colSpan={6} columns={6} columnSpans={[2, 1, 1, 1, 1]} />}
            {activeQuery.error && (
              <TableErrorRow colSpan={6} message="Erro ao carregar imagens" onRetry={() => activeQuery.refetch()} />
            )}
            {activeTab === "flagged" && !flaggedQuery.isLoading && !flaggedQuery.error && flaggedItems.length === 0 && (
              <EmptyStateRow colSpan={6} title="Nenhuma imagem sinalizada" description="Tudo certo por aqui." />
            )}
            {activeTab === "history" && !historyQuery.isLoading && !historyQuery.error && historyItems.length === 0 && (
              <EmptyStateRow colSpan={6} title="Nenhum item no histórico" description="Tente ajustar os filtros." />
            )}
            {(activeTab === "flagged" ? flaggedItems : historyItems).map((item) => (
              <tr key={item.id} className="border-t border-black/5 hover:bg-black/5">
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="flex items-center gap-3 text-left"
                  >
                    <img src={item.imageUrl} alt="Imagem moderada" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <div className="text-xs text-white/70">#{item.id}</div>
                      <div className="text-sm text-white">{item.entityId}</div>
                    </div>
                  </button>
                </td>
                <td className="py-3 px-4 text-white">{entityLabels[item.entityType] ?? item.entityType}</td>
                <td className="py-3 px-4 text-white">{Math.round(item.nsfwScore * 100)}%</td>
                <td className="py-3 px-4">
                  <Pill className={`${statusTone[item.status]} border border-white/10`}>{statusLabels[item.status]}</Pill>
                </td>
                <td className="py-3 px-4 text-white">{formatDate(item.createdAt)}</td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-textDark hover:bg-black/5"
                  >
                    {activeTab === "flagged" ? "Revisar" : "Detalhes"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {activeTab === "flagged" ? (
        <div className="flex items-center justify-between text-sm text-textDark">
          <button
            disabled={flaggedPage === 0}
            onClick={() => setFlaggedPage((p) => Math.max(0, p - 1))}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
          >
            Anterior
          </button>
          <div>
            Página {flaggedPage + 1} {flaggedQuery.data?.hasNext ? "" : "(última)"}
          </div>
          <button
            disabled={!flaggedQuery.data?.hasNext}
            onClick={() => setFlaggedPage((p) => p + 1)}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm text-textDark">
          <button
            disabled={historyPage === 0}
            onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
          >
            Anterior
          </button>
          <div>
            Página {historyPage + 1} {historyQuery.data?.hasNext ? "" : "(última)"}
          </div>
          <button
            disabled={!historyQuery.data?.hasNext}
            onClick={() => setHistoryPage((p) => p + 1)}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-4xl">
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Imagem #{selected.id}</h2>
                  <p className="text-xs text-white/60">{entityLabels[selected.entityType] ?? selected.entityType}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  Fechar
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-3">
                  <img src={selected.imageUrl} alt="Imagem para revisão" className="w-full rounded-2xl object-cover" />
                  {selected.failureReason ? (
                    <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      Falha: {selected.failureReason}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-3 text-sm text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill className={`${statusTone[selected.status]} border border-white/10`}>{statusLabels[selected.status]}</Pill>
                    <Pill className="border border-white/10 bg-white/10 text-white">Score: {Math.round(selected.nsfwScore * 100)}%</Pill>
                  </div>
                  <InfoRow label="Entidade" value={selected.entityId} />
                  <InfoRow label="Criado em" value={formatDate(selected.createdAt)} />
                  <InfoRow label="Processado em" value={formatDate(selected.processedAt)} />
                  <InfoRow label="Revisado em" value={formatDate(selected.reviewedAt)} />
                  <InfoRow label="Revisado por" value={selected.reviewedBy ?? "-"} />
                  <InfoRow label="Tentativas" value={selected.retryCount.toString()} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">Notas</p>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      placeholder="Opcional"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleReview("MANUALLY_APPROVED")}
                      disabled={reviewMutation.isPending || selected.status !== "FLAGGED_FOR_REVIEW"}
                      className="rounded-xl bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-300 disabled:opacity-40"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview("MANUALLY_REJECTED")}
                      disabled={reviewMutation.isPending || selected.status !== "FLAGGED_FOR_REVIEW"}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                    >
                      Rejeitar
                    </button>
                  </div>
                  {selected.status !== "FLAGGED_FOR_REVIEW" ? (
                    <p className="text-xs text-white/50">Este item já foi decidido.</p>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}
