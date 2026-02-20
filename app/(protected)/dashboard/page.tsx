"use client";
import { useQuery } from "@tanstack/react-query";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { ShortcutGrid, type ShortcutItem } from "@/components/dashboard/ShortcutGrid";
import { DashboardSidebar, type SidebarItem } from "@/components/dashboard/Sidebar";
import { dashboardIcons } from "@/components/dashboard/icons";
import { api } from "@/lib/api";
import type { ModerationStats } from "@/types/index";

export default function DashboardPage() {
  const { data: moderationStats } = useQuery({
    queryKey: ["moderation-stats"],
    queryFn: () => api.get<ModerationStats>("/dashboard/moderation/stats")
  });

  const moderationBadge =
    moderationStats && moderationStats.flaggedForReview > 0 ? String(moderationStats.flaggedForReview) : undefined;

  const sidebarItems: SidebarItem[] = [
    { label: "Visão Geral", href: "/dashboard", icon: "dashboard", active: true },
    { label: "Usuários", href: "/users", icon: "users" },
    { label: "Brechós", href: "/stores", icon: "stores" },
    { label: "Favoritos", href: "/favorites", icon: "favorites" },
    { label: "Moderação", href: "/moderation/images", icon: "approvals", badge: moderationBadge },
    { label: "Configurações", href: "/dashboard", icon: "settings" }
  ];

  const shortcuts: ShortcutItem[] = [
    { title: "Brechós", description: "Listar e moderar brechós", href: "/stores", icon: dashboardIcons.stores },
    { title: "Favoritos", description: "Listar favoritos por usuário", href: "/favorites", icon: dashboardIcons.favorites },
    { title: "Conteúdos", description: "Publicações dos brechós", href: "/contents", icon: dashboardIcons.contents },
    { title: "Usuários", description: "Gerenciar contas e privilégios", href: "/users", icon: dashboardIcons.users },
    {
      title: "Moderação",
      description: "Fila de denúncias e revisões",
      href: "/moderation/images",
      icon: dashboardIcons.moderation,
      badge: moderationBadge
    },
    { title: "Categorias", description: "Gerenciar categorias", href: "/categories", icon: dashboardIcons.categories },
    { title: "Notificações", description: "Enviar push para usuários", href: "/push", icon: dashboardIcons.notifications }
  ];

  return (
    <div className="min-h-screen w-full text-textDark">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[280px,1fr] lg:px-10">
        <DashboardSidebar items={sidebarItems} />
        <section className="flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col gap-8 lg:gap-12">
            <DashboardHero
              title="Resumo"
              description="Escolha uma seção para gerenciar brechós, conteúdos, usuários ou moderação."
            />
            <ShortcutGrid items={shortcuts} />
          </div>
        </section>
      </div>
    </div>
  );
}
