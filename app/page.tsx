"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const token = getToken();
    if (!token) {
      router.replace("/login");
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        await api.get("/auth/me");
        if (!active) return;
        router.replace("/dashboard");
      } catch {
        clearToken();
        router.replace("/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  // Keep the layout background while we decide where to send the user
  return (
    <div className="min-h-screen bg-background" aria-busy="true">
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-textSubtle shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-primary motion-safe:animate-pulse" aria-hidden="true" />
          Carregando…
        </div>
      </div>
    </div>
  );
}
