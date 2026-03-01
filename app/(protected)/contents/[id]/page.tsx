"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";
import { toStorageObjectUrl } from "@/lib/storage";
import type { ContentComment, GuideContent, PageResponse } from "@/types/index";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyStateRow } from "@/components/dashboard/EmptyStateRow";
import { Pill } from "@/components/dashboard/Pill";

type ContentForm = {
  title: string;
  description: string;
  storeId: string;
  imageUrl: string;
  categoryLabel: string;
  type: string;
};

type ImageSlot = { uploadUrl: string; fileKey: string; contentType: string };

const emptyForm: ContentForm = {
  title: "",
  description: "",
  storeId: "",
  imageUrl: "",
  categoryLabel: "",
  type: ""
};

const MAX_IMAGE = 5 * 1024 * 1024;
const ALLOWED_IMG = ["image/jpeg", "image/png", "image/webp"];
const COMMENT_PAGE_SIZE = 20;

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const contentId = params?.id as string;
  const isCreate = contentId === "new";
  const router = useRouter();
  const qc = useQueryClient();

  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [commentsPage, setCommentsPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => api.get<GuideContent>(`/dashboard/contents/${contentId}`),
    enabled: Boolean(contentId) && !isCreate
  });

  const {
    data: commentsData,
    isLoading: commentsLoading,
    error: commentsError
  } = useQuery({
    queryKey: ["content-comments", contentId, commentsPage],
    queryFn: () =>
      api.get<PageResponse<ContentComment>>(
        `/dashboard/contents/${contentId}/comments?page=${commentsPage}&pageSize=${COMMENT_PAGE_SIZE}`
      ),
    enabled: Boolean(contentId) && !isCreate
  });

  useEffect(() => {
    if (!data || isCreate) return;
    setForm({
      title: data.title ?? "",
      description: data.description ?? "",
      storeId: data.thriftStoreId ?? "",
      imageUrl: data.imageUrl ?? "",
      categoryLabel: (data as any).categoryLabel ?? "",
      type: (data as any).type ?? ""
    });
  }, [data, isCreate]);

  useEffect(() => {
    if (!contentId || isCreate) return;
    setCommentsPage(0);
  }, [contentId, isCreate]);

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/dashboard/contents/${contentId}`),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["contents"] });
      router.replace("/contents");
      router.refresh();
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.del(`/dashboard/contents/${contentId}/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-comments", contentId] });
      qc.invalidateQueries({ queryKey: ["content", contentId] });
      qc.invalidateQueries({ queryKey: ["contents"] });
    }
  });

  const { mutateAsync: createContent, isPending: creating } = useMutation({
    mutationFn: (payload: any) => api.post<GuideContent>(`/contents`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contents"] }),
    onError: (error) => setErrorMsg(getErrorMessage(error, "Não foi possível criar o conteúdo."))
  });

  const { mutateAsync: updateContent, isPending: saving } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.put<GuideContent>(`/contents/${id}`, payload),
    onSuccess: async (_data, variables) => {
      const target = variables?.id ?? contentId;
      await qc.invalidateQueries({ queryKey: ["content", target] });
      await qc.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error) => setErrorMsg(getErrorMessage(error, "Não foi possível salvar o conteúdo."))
  });

  const handleDelete = () => {
    if (!data) return;
    const confirmed = window.confirm("Deseja excluir este conteúdo?");
    if (!confirmed) return;
    deleteMutation.mutate(undefined, {
      onError: (error) => alert(getErrorMessage(error, "Não foi possível excluir o conteúdo."))
    });
  };

  const handleDeleteComment = (commentId: string) => {
    const confirmed = window.confirm("Deseja apagar este comentário?");
    if (!confirmed) return;
    deleteCommentMutation.mutate(commentId, {
      onError: (error) => alert(getErrorMessage(error, "Não foi possível apagar o comentário."))
    });
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setStatus(null);

    const title = form.title.trim();
    const description = form.description.trim();
    const storeId = form.storeId.trim();

    if (!title) return setErrorMsg("Título é obrigatório.");
    if (!description) return setErrorMsg("Descrição é obrigatória.");
    // storeId is optional for admins (global posts)

    try {
      let targetId = contentId;

      if (isCreate) {
        const payload: any = { title, description };
        if (storeId) payload.storeId = storeId;

        const created = await createContent(payload);
        targetId = created.id;
        setStatus("Conteúdo criado.");
      }

      let imageUrl = form.imageUrl.trim();
      if (file) {
        setStatus("Solicitando slot de upload…");
        const slot = await api.post<ImageSlot>(`/contents/${targetId}/image/upload`, {
          contentType: file.type || "image/jpeg"
        });
        setStatus("Enviando imagem…");
        const putRes = await fetch(slot.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": slot.contentType },
          body: file
        });
        if (!putRes.ok) throw new Error("Falha ao enviar imagem.");
        imageUrl = toStorageObjectUrl(slot.uploadUrl);
        setStatus("Imagem enviada.");
      }

      const payload: Record<string, any> = {};
      const current = data;
      const pushField = (key: keyof ContentForm, val: string, currentVal?: string) => {
        if (val !== undefined && val !== (currentVal ?? "")) payload[key] = val;
      };

      pushField("title", title, current?.title ?? "");
      pushField("description", description, current?.description ?? "");
      pushField("storeId", storeId, current?.thriftStoreId ?? "");
      if (imageUrl && imageUrl !== current?.imageUrl) payload.imageUrl = imageUrl;
      if (form.categoryLabel.trim()) payload.categoryLabel = form.categoryLabel.trim();
      if (form.type.trim()) payload.type = form.type.trim();

      if (Object.keys(payload).length > 0) {
        await updateContent({ id: targetId, payload });
        setStatus("Conteúdo atualizado.");
      } else if (!isCreate) {
        setStatus("Nada para salvar.");
      }

      if (isCreate && targetId !== contentId) {
        router.replace(`/contents/${targetId}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(getErrorMessage(err, "Não foi possível salvar. Verifique os campos ou o upload."));
    }
  };

  const imagePreview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (form.imageUrl) return form.imageUrl;
    return null;
  }, [file, form.imageUrl]);

  if (!isCreate && isLoading) return <div className="p-4">Carregando…</div>;
  if (!isCreate && (error || !data)) return <div className="p-4 text-red-600">{getErrorMessage(error, "Erro ao carregar conteúdo.")}</div>;

  const commentItems = commentsData?.items ?? [];
  const likeCount = data?.likeCount ?? 0;
  const commentCount = data?.commentCount ?? commentItems.length ?? 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-6 lg:px-10 text-textDark">
      <PageHeader
        title={isCreate ? "Novo conteúdo" : data?.title ?? "Conteúdo"}
        subtitle={isCreate ? "Crie um novo conteúdo" : data?.thriftStoreName ?? data?.thriftStoreId}
        actions={
          !isCreate ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/contents/${contentId}/likes`}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-colors hover:bg-white/90"
              >
                Ver curtidas
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          ) : null
        }
      />

      {!isCreate ? (
        <div className="flex flex-wrap gap-3">
          <Pill>{likeCount} curtidas</Pill>
          <Pill>{commentCount} comentários</Pill>
        </div>
      ) : null}

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">{isCreate ? "Criar conteúdo" : "Editar conteúdo"}</p>
            <p className="text-sm text-white/70">Título e descrição são obrigatórios.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={creating || saving}
            className="rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
          >
            {creating || saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>

        {errorMsg ? <p className="text-sm text-red-300">{errorMsg}</p> : null}
        {status ? <p className="text-sm text-brand-muted">{status}</p> : null}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledInput label="Título *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} maxLength={160} />
            <LabeledInput
              label="Loja (storeId) - Opcional para Admin"
              value={form.storeId}
              onChange={(v) => setForm({ ...form, storeId: v })}
              placeholder="UUID da loja (deixe vazio para post global)…"
              maxLength={64}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledInput
              label="Categoria (opcional)"
              value={form.categoryLabel}
              onChange={(v) => setForm({ ...form, categoryLabel: v })}
              placeholder="general…"
              maxLength={160}
            />
            <LabeledInput
              label="Tipo (opcional)"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              placeholder="article…"
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <span className="text-white/70 text-sm">Imagem (opcional)</span>
            <div className="flex flex-col gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Enviar arquivo
                <input
                  type="file"
                  accept={ALLOWED_IMG.join(",")}
                  name="content-image"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (!ALLOWED_IMG.includes(f.type)) {
                      setErrorMsg("Formatos permitidos: JPEG, PNG ou WEBP.");
                      return;
                    }
                    if (f.size > MAX_IMAGE) {
                      setErrorMsg("Imagem deve ter no máximo 5MB.");
                      return;
                    }
                    setFile(f);
                    setErrorMsg(null);
                  }}
                />
              </label>
              {imagePreview ? (
                <div className="relative h-36 w-48 overflow-hidden rounded-lg border border-white/10 bg-white">
                  <Image src={imagePreview} alt="Prévia" fill className="object-cover" />
                </div>
              ) : null}
            </div>
          </div>

          <LabeledTextArea
            label="Descrição *"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            rows={5}
            maxLength={2000}
          />
        </div>
      </GlassCard>

      {!isCreate ? (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">Comentários</p>
              <p className="text-sm text-white/70">Revise e remova comentários inadequados.</p>
            </div>
            <div className="text-sm text-white/70">
              Página {commentsPage + 1} {commentsData?.hasNext ? "" : "(última)"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-white">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-white/60">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Comentário</th>
                  <th className="py-3 px-4">Criado em</th>
                  <th className="py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {commentsLoading && (
                  <tr>
                    <td className="py-3 px-4" colSpan={5}>
                      Carregando…
                    </td>
                  </tr>
                )}
                {commentsError && (
                  <tr>
                    <td className="py-3 px-4 text-red-300" colSpan={5}>
                      {getErrorMessage(commentsError, "Erro ao carregar comentários")}
                    </td>
                  </tr>
                )}
                {!commentsLoading && !commentsError && commentItems.length === 0 && (
                  <EmptyStateRow
                    colSpan={5}
                    title="Nenhum comentário encontrado"
                    description="Este conteúdo ainda não recebeu comentários."
                  />
                )}
                {commentItems.map((comment) => (
                  <tr key={comment.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 text-xs text-white/80">{comment.id}</td>
                    <td className="py-3 px-4 text-white">
                      {comment.userDisplayName ?? comment.userId ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-white break-words">{comment.body}</td>
                    <td className="py-3 px-4 text-white">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
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

          <div className="flex items-center justify-between text-sm">
            <button
              disabled={commentsPage === 0}
              onClick={() => setCommentsPage((p) => Math.max(0, p - 1))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white shadow-sm transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={!commentsData?.hasNext}
              onClick={() => setCommentsPage((p) => p + 1)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white shadow-sm transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </GlassCard>

      ) : null}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  const inputName = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "field";
  const resolvedSpellCheck = type === "email" || type === "password" ? false : undefined;
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label ? <span className="text-white/70">{label}</span> : null}
      <input
        value={value}
        type={type}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        name={inputName}
        autoComplete="off"
        spellCheck={resolvedSpellCheck}
        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      />
    </label>
  );
}

function LabeledTextArea({
  label,
  value,
  onChange,
  rows = 3,
  maxLength
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  const inputName = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "field";
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-white/70">{label}</span>
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        name={inputName}
        autoComplete="off"
        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/40 focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
      />
    </label>
  );
}
