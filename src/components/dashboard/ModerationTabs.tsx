"use client";
import Link from "next/link";

type ModerationTabsProps = {
  active: "images" | "contacts" | "comments";
  badge?: string;
};

export function ModerationTabs({ active, badge }: ModerationTabsProps) {
  const baseClass =
    "rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-textDark transition hover:scale-[1.01] hover:bg-black/5";
  const activeClass = "rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-forest transition hover:scale-[1.01] hover:bg-white";

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
