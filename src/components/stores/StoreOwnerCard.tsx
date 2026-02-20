"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { api, ApiError } from "@/lib/api";
import { GlassCard } from "@/components/dashboard/GlassCard";
import type { DashboardStoreDetailsResponse, StoreOwner } from "@/types/index";

type StoreOwnerCardProps = {
  storeId: string;
  owner: StoreOwner | null;
};

export function StoreOwnerCard({ storeId, owner }: StoreOwnerCardProps) {
  const qc = useQueryClient();
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [ownerTransferError, setOwnerTransferError] = useState<string | null>(null);
  const [ownerTransferMessage, setOwnerTransferMessage] = useState<string | null>(null);

  const { mutateAsync: transferOwner, isPending: isTransferringOwner } = useMutation({
    mutationFn: (payload: { email: string }) =>
      api.patch<DashboardStoreDetailsResponse>(`/dashboard/stores/${storeId}/owner`, payload),
    onSuccess: async (updated) => {
      setOwnerTransferError(null);
      setOwnerTransferMessage("Proprietário atualizado com sucesso.");
      setNewOwnerEmail("");
      qc.setQueryData<DashboardStoreDetailsResponse>(["store", storeId], updated);
      await qc.invalidateQueries({ queryKey: ["stores"] });
      await qc.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const onTransferOwner = async () => {
    const email = newOwnerEmail.trim().toLowerCase();
    setOwnerTransferError(null);
    setOwnerTransferMessage(null);

    if (!email) {
      setOwnerTransferError("Informe o email do novo proprietário.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setOwnerTransferError("Informe um email válido.");
      return;
    }
    if (owner?.email?.trim().toLowerCase() === email) {
      setOwnerTransferError("Este email já é do proprietário atual.");
      return;
    }

    try {
      await transferOwner({ email });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setOwnerTransferError("Email é obrigatório.");
          return;
        }
        if (err.status === 404) {
          setOwnerTransferError("Brechó ou usuário não encontrado.");
          return;
        }
        if (err.status === 409) {
          setOwnerTransferError("Este usuário já possui outro brechó.");
          return;
        }
      }
      setOwnerTransferError("Não foi possível transferir propriedade. Tente novamente.");
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-white">Proprietário</p>
        <p className="text-sm text-white/80">Informações recebidas do cadastro do dono do brechó.</p>
      </div>

      {owner ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center gap-3">
            {owner.photoUrl ? (
              <Image
                src={owner.photoUrl}
                alt={`Foto de ${owner.displayName}`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                {(owner.displayName?.trim().charAt(0) || "?").toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">{owner.displayName || "Sem nome"}</p>
              <p className="text-xs text-white/70">{owner.email || "—"}</p>
            </div>
          </div>

          <ReadOnlyInfo label="ID do proprietário" value={owner.id || "—"} />
          <ReadOnlyInfo label="Criado em" value={formatDateLocalized(owner.createdAt)} />
        </div>
      ) : (
        <p className="text-sm text-white/80">Sem proprietário vinculado.</p>
      )}

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-sm font-semibold text-white">Trocar proprietário</p>
        <p className="text-xs text-white/70">Informe o email do usuário que assumirá este brechó.</p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <label className="w-full md:flex-1 flex flex-col gap-1 text-sm">
            <span className="text-white/70">Email do novo proprietário</span>
            <input
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              placeholder="novo-proprietario@email.com"
              maxLength={320}
              autoComplete="off"
              spellCheck={false}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
            />
          </label>
          <button
            type="button"
            onClick={onTransferOwner}
            disabled={isTransferringOwner}
            className="h-11 rounded-2xl bg-brand-primary px-4 text-sm font-semibold text-brand-forest shadow-sm transition-colors hover:bg-white disabled:opacity-60"
          >
            {isTransferringOwner ? "Transferindo…" : "Transferir proprietário"}
          </button>
        </div>
        {ownerTransferError ? <p className="text-sm text-red-200">{ownerTransferError}</p> : null}
        {ownerTransferMessage ? <p className="text-sm text-white/80">{ownerTransferMessage}</p> : null}
      </div>
    </GlassCard>
  );
}

function formatDateLocalized(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function ReadOnlyInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
