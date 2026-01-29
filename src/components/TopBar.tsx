"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-black/5 bg-white/70 px-6 py-4 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-left text-2xl font-bold text-textDark font-display transition-colors hover:text-textSubtle"
      >
        {title}
      </button>
      <button
        className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-highlight shadow-sm transition-colors hover:bg-white"
        onClick={() => {
          clearToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          } else {
            router.replace("/login");
          }
        }}
      >
        Sair
      </button>
    </div>
  );
}
