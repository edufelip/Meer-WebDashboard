"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  titleActions?: ReactNode;
  showBack?: boolean;
};

export function PageHeader({ title, subtitle, actions, titleActions, showBack = true }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const hideBack = !showBack || pathname === "/" || pathname === "/login" || pathname === "/dashboard";

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!hideBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors hover:bg-white"
          >
            Voltar
          </button>
        ) : (
          <div />
        )}
        {actions ? <div className="flex-shrink-0">{actions}</div> : <div />}
      </div>
      <div className="space-y-2">
        <span className="inline-flex w-fit items-center rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-textSubtle">
          Painel
        </span>
        {titleActions ? (
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="flex-1 font-display text-3xl font-bold text-textDark sm:text-4xl text-balance">{title}</h1>
            <div className="flex-shrink-0">{titleActions}</div>
          </div>
        ) : (
          <h1 className="font-display text-3xl font-bold text-textDark sm:text-4xl text-balance">{title}</h1>
        )}
        {subtitle ? <p className="text-base text-textSubtle max-w-2xl text-pretty">{subtitle}</p> : null}
      </div>
    </header>
  );
}
