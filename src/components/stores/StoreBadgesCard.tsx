"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { ApiError, api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import {
  getManagedStoreBadges,
  getStoreBadgeLabel,
  isKnownStoreBadge,
  normalizeStoreBadges,
  type StoreBadgeCode
} from "@/lib/storeBadges";
import type { DashboardStoreDetailsResponse } from "@/types/index";

type StoreBadgesCardProps = {
  storeId: string;
  badges?: string[] | null;
};

type BadgeMutationPayload = {
  badge: StoreBadgeCode;
  action: "grant" | "revoke";
};

export function StoreBadgesCard({ storeId, badges }: StoreBadgesCardProps) {
  const qc = useQueryClient();
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const [badgeStatus, setBadgeStatus] = useState<string | null>(null);
  const [pendingBadge, setPendingBadge] = useState<StoreBadgeCode | null>(null);
  const [pendingAction, setPendingAction] = useState<BadgeMutationPayload["action"] | null>(null);

  const managedBadges = useMemo(() => getManagedStoreBadges(), []);
  const normalizedBadges = useMemo(() => normalizeStoreBadges(badges), [badges]);
  const assignedBadges = useMemo(() => new Set(normalizedBadges), [normalizedBadges]);
  const unknownBadges = useMemo(
    () => normalizedBadges.filter((code) => !isKnownStoreBadge(code)),
    [normalizedBadges]
  );

  const { mutateAsync: mutateBadge, isPending } = useMutation({
    mutationFn: ({ badge, action }: BadgeMutationPayload) => {
      const path = `/dashboard/stores/${storeId}/badges/${badge}`;
      return action === "grant"
        ? api.put<DashboardStoreDetailsResponse>(path)
        : api.del<DashboardStoreDetailsResponse>(path);
    },
    onSuccess: async (updated) => {
      qc.setQueryData<DashboardStoreDetailsResponse>(["store", storeId], updated);
      await qc.invalidateQueries({ queryKey: ["store", storeId] });
      await qc.invalidateQueries({ queryKey: ["stores"] });
    }
  });

  const onUpdateBadge = async (badge: StoreBadgeCode, action: BadgeMutationPayload["action"]) => {
    setBadgeError(null);
    setBadgeStatus(null);
    setPendingBadge(badge);
    setPendingAction(action);
    try {
      await mutateBadge({ badge, action });
      setBadgeStatus(action === "grant" ? "Badge adicionada com sucesso." : "Badge removida com sucesso.");
    } catch (err) {
      setBadgeError(resolveBadgeMutationError(err));
    } finally {
      setPendingBadge(null);
      setPendingAction(null);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-white">Badges</p>
        <p className="text-sm text-white/80">Gerencie badges oficiais do brechó. O campo legado badgeLabel não é usado.</p>
      </div>

      {badgeError ? <p className="text-sm text-red-200">{badgeError}</p> : null}
      {badgeStatus ? <p className="text-sm text-white/80">{badgeStatus}</p> : null}

      <div className="space-y-3">
        {managedBadges.map((badge) => {
          const assigned = assignedBadges.has(badge);
          const disabled = isPending && pendingBadge !== null;
          const isCurrentPending = pendingBadge === badge;
          return (
            <div
              key={badge}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <BadgeChip badgeCode={badge} known />
                <span className="text-xs text-white/70">{assigned ? "Ativa" : "Inativa"}</span>
              </div>

              <button
                type="button"
                onClick={() => onUpdateBadge(badge, assigned ? "revoke" : "grant")}
                disabled={disabled}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                {isCurrentPending
                  ? pendingAction === "grant"
                    ? "Adicionando…"
                    : "Removendo…"
                  : assigned
                    ? "Remover badge"
                    : "Adicionar badge"}
              </button>
            </div>
          );
        })}
      </div>

      {unknownBadges.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold text-white">Badges desconhecidas (somente leitura)</p>
          <p className="text-xs text-white/70">Estas badges vieram da API e ainda não possuem suporte de gerenciamento no dashboard.</p>
          <div className="flex flex-wrap gap-2">
            {unknownBadges.map((badge) => (
              <BadgeChip key={badge} badgeCode={badge} />
            ))}
          </div>
        </div>
      ) : null}
    </GlassCard>
  );
}

function resolveBadgeMutationError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return "Badge inválida.";
    if (error.status === 403) return "Apenas administradores podem alterar badges.";
    if (error.status === 404) return "Brechó não encontrado.";
  }

  return getErrorMessage(error, "Não foi possível atualizar badges. Tente novamente.");
}

function BadgeChip({ badgeCode, known = false }: { badgeCode: string; known?: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide " +
        (known ? "bg-brand-primary/90 text-brand-forest" : "bg-white/10 text-white")
      }
    >
      {getStoreBadgeLabel(badgeCode)}
    </span>
  );
}
