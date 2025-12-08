"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supportContacts"] });
      router.replace("/moderation");
    }
  });

  const onDelete = () => {
    const confirmed = window.confirm("Deseja apagar este contato?");
    if (confirmed) {
      deleteMutation.mutate(undefined, {
        onError: () => alert("Não foi possível apagar o contato.")
      });
    }
  };

  if (isLoading) return <div className="p-4">Carregando...</div>;
  if (error || !data) return <div className="p-4 text-red-600">Erro ao carregar contato.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#374151]">Contato #{data.id}</h1>
          <p className="text-sm text-[#6B7280]">{data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}</p>
        </div>
        <button
          onClick={onDelete}
          disabled={deleteMutation.isPending}
          className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm"
        >
          {deleteMutation.isPending ? "Apagando..." : "Apagar"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <Field label="Nome" value={data.name} />
        <Field label="Email" value={data.email} />
        <Field label="Mensagem" value={data.message} multiline />
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value?: string; multiline?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase text-[#9CA3AF] font-semibold">{label}</p>
      <p className={`text-sm text-[#374151] mt-1 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value || "-"}</p>
    </div>
  );
}
