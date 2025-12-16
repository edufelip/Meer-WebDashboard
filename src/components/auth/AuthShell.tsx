import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-textDark">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-12 h-56 w-56 rounded-full bg-brand-primary/12 blur-3xl" />
        <div className="absolute right-6 top-28 h-64 w-64 rounded-full bg-brand-card/15 blur-3xl" />
        <div className="absolute bottom-12 right-1/3 h-40 w-40 rounded-full bg-black/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        {children}
      </div>
    </div>
  );
}
