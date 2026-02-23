"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";

type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
};

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const contactId = params?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["supportContact", contactId],
    queryFn: () => api.get<Contact>(`/dashboard/support/contacts/${contactId}`),
    enabled: Boolean(contactId)
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/dashboard/support/contacts/${contactId}`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["supportContacts"] });
      router.replace("/moderation");
      router.refresh();
    }
  });

  const onDelete = () => {
    const confirmed = window.confirm("Deseja apagar este contato?");
    if (confirmed) {
      deleteMutation.mutate(undefined, {
        onError: (error) => alert(getErrorMessage(error, "Não foi possível apagar o contato."))
      });
    }
  };

  if (isLoading) return <div className="p-4">Carregando…</div>;
  if (error || !data) return <div className="p-4 text-red-600">{getErrorMessage(error, "Erro ao carregar contato.")}</div>;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader
        title={`Contato #${data.id}`}
        subtitle={data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
        actions={
          <button
            onClick={onDelete}
            disabled={deleteMutation.isPending}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Apagando…" : "Apagar"}
          </button>
        }
      />

      <GlassCard className="space-y-4">
        <Field label="Nome" value={data.name} />
        <Field label="Email" value={data.email} />
        <Field label="Mensagem" value={data.message} multiline />
      </GlassCard>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className={`mt-1 text-sm text-white ${multiline ? "whitespace-pre-wrap" : ""}`}>{value || "-"}</p>
    </div>
  );
}
