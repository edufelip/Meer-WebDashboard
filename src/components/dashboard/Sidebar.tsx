"use client";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { clearToken } from "@/lib/auth";
import { ArrowRightIcon, CheckIcon, DashboardIcon, SettingsIcon, StoreIcon, UsersIcon } from "./icons";

type IconComponent = ComponentType<{ className?: string }>;
type SidebarIconKey = "dashboard" | "users" | "stores" | "approvals" | "settings";

const iconMap: Record<SidebarIconKey, IconComponent> = {
  dashboard: DashboardIcon,
  users: UsersIcon,
  stores: StoreIcon,
  approvals: CheckIcon,
  settings: SettingsIcon
};

export type SidebarItem = {
  label: string;
  href: Route;
  icon: SidebarIconKey;
  badge?: string;
  active?: boolean;
};

export function DashboardSidebar({ items }: { items: SidebarItem[] }) {
  const router = useRouter();

  const handleSignOut = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <aside className="relative flex h-full flex-col rounded-[2rem] border border-brand-card/40 bg-[linear-gradient(160deg,#833000_0%,#a73c00_45%,#b14300_100%)] p-4 text-white shadow-[0_25px_70px_-45px_rgba(67,26,0,0.8)]">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="size-10 rounded-full bg-gradient-to-br from-brand-primary to-[#f0cdb5] ring-2 ring-brand-primary/25 shadow-sm" />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide">Guia Brechó</p>
          <p className="text-xs text-brand-muted">Painel Admin</p>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-2" aria-label="Navegação do painel">
        {items.map(({ label, href, icon, badge, active }) => {
          const Icon = iconMap[icon];
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors transition-shadow ${
                active
                  ? "bg-white/10 text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.6)]"
                  : "text-brand-muted/90 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={active ? "text-brand-primary" : "text-brand-muted/80 group-hover:text-brand-primary"} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-brand-forest">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-sm font-semibold text-brand-forest shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-white"
        >
          <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
