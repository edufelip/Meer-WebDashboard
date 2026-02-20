"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { GlassCard } from "@/components/dashboard/GlassCard";

type StorePhotoDraft = {
  localId: string;
  id?: string | number;
  url?: string;
  previewUrl?: string;
};

type StorePhotosCardProps = {
  photoDrafts: StorePhotoDraft[];
  photoError: string | null;
  photoStatus: string | null;
  allowedTypes: string[];
  onAddPhotos: (files: FileList | null) => void;
  onSetAsCover: (localId: string) => void;
  onMovePhoto: (localId: string, direction: -1 | 1) => void;
  onRemovePhoto: (localId: string) => void;
};

export function StorePhotosCard({
  photoDrafts,
  photoError,
  photoStatus,
  allowedTypes,
  onAddPhotos,
  onSetAsCover,
  onMovePhoto,
  onRemovePhoto
}: StorePhotosCardProps) {
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">Fotos</p>
          <p className="text-sm text-white/80">Máximo 10 fotos. JPEG ou WEBP até 2MB.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors hover:bg-white">
          Adicionar fotos
          <input
            type="file"
            accept={allowedTypes.join(",")}
            multiple
            name="store-photos"
            className="hidden"
            onChange={(e) => {
              onAddPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {photoError ? <p className="text-sm text-red-300">{photoError}</p> : null}
      {photoStatus ? <p className="text-sm text-brand-muted">{photoStatus}</p> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {photoDrafts.map((photo, index) => (
          <div key={photo.localId} className="group relative overflow-hidden rounded-xl border border-black/10">
            {photo.url ? (
              <Image src={photo.url} alt={`Foto ${index + 1}`} width={400} height={300} className="h-32 w-full object-cover" />
            ) : (
              <img
                src={photo.previewUrl}
                alt={`Pre-visualizacao ${index + 1}`}
                width={400}
                height={300}
                loading="lazy"
                className="h-32 w-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex flex-col justify-between bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-1 px-2 pt-2">
                <Chip active={index === 0}>Capa</Chip>
                <button
                  type="button"
                  onClick={() => onSetAsCover(photo.localId)}
                  className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
                  disabled={index === 0}
                >
                  Definir capa
                </button>
              </div>
              <div className="flex justify-between gap-1 px-2 pb-2">
                <button
                  type="button"
                  onClick={() => onMovePhoto(photo.localId, -1)}
                  disabled={index === 0}
                  aria-label="Mover foto para cima"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMovePhoto(photo.localId, 1)}
                  disabled={index === photoDrafts.length - 1}
                  aria-label="Mover foto para baixo"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.localId)}
                  className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-100 transition-colors hover:bg-red-500/30"
                >
                  Remover
                </button>
              </div>
            </div>
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Capa
              </span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function Chip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={
        "rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide " +
        (active ? "bg-brand-primary text-brand-forest" : "bg-white/10 text-white")
      }
    >
      {children}
    </span>
  );
}
