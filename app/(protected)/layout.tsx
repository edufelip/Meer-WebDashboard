"use client";
import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
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
    return <div className="min-h-screen bg-[#F3F4F6]" />;
  }

  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-[#F3F4F6] text-[#374151]">
        <TopBar title="Admin" />
        <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
      </div>
    </ReactQueryProvider>
  );
}
