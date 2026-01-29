import { BellIcon } from "./icons";

type DashboardHeaderProps = {
  avatarUrl?: string;
  notifications?: number;
};

export function DashboardHeader({ avatarUrl, notifications = 0 }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-end gap-4 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
      <button
        type="button"
        className="relative flex size-11 items-center justify-center rounded-full bg-brand-card text-white shadow-sm transition-colors hover:bg-brand-primary hover:text-brand-forest"
        aria-label="Notificações"
      >
        {notifications > 0 && (
          <span className="absolute right-2 top-2 block size-2 rounded-full bg-[#ef4444] ring-2 ring-brand-card" />
        )}
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div
        className="size-11 overflow-hidden rounded-full border-2 border-brand-card bg-cover bg-center"
        style={{
          backgroundImage: avatarUrl
            ? `url(${avatarUrl})`
            : "radial-gradient(circle at 30% 30%, #e5aa00 0, #b14300 60%)"
        }}
        aria-label="Usuário logado"
      />
    </header>
  );
}
