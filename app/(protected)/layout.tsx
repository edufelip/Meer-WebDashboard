"use client";
import React, { useEffect, useState } from "react";
import "../globals.css";
import { ReactQueryProvider } from "../providers";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await api.get("/auth/me");
        if (!active) return;
        setReady(true);
      } catch {
        clearToken();
        router.replace("/login");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
          <span className="text-sm text-textSubtle">Carregando…</span>
        </div>
      </div>
    );
  }

  return (
    <ReactQueryProvider>
      <main className="relative min-h-screen w-full overflow-hidden bg-background text-textDark">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-primary/15 blur-3xl animate-float" />
          <div className="absolute right-6 top-10 h-64 w-64 rounded-full bg-brand-card/20 blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-black/5 blur-3xl" />
        </div>
        <div className="relative z-10 min-h-screen animate-rise">{children}</div>
      </main>
    </ReactQueryProvider>
  );
}
