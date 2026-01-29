"use client";
import Link from "next/link";

type ModerationTabsProps = {
  active: "images" | "contacts" | "comments";
  badge?: string;
};

export function ModerationTabs({ active, badge }: ModerationTabsProps) {
  const baseClass =
    "rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-textDark shadow-sm transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white";
  const activeClass =
    "rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest shadow-sm transition-colors transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white";

  return (
    <div className="flex items-center gap-3">
      <Link href="/moderation/images" className={active === "images" ? activeClass : baseClass}>
        <span className="inline-flex items-center gap-2">
          Imagens
          {badge ? (
            <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-brand-forest">
              {badge}
            </span>
          ) : null}
        </span>
      </Link>
      <Link href="/moderation" className={active === "contacts" ? activeClass : baseClass}>
        Contatos
      </Link>
      <Link href="/moderation/comments" className={active === "comments" ? activeClass : baseClass}>
        Comentários
      </Link>
    </div>
  );
}
