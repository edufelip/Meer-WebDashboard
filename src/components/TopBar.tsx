"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export function TopBar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="w-full bg-background border-b border-brand-card/40 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-left text-xl font-bold text-textDark hover:opacity-80 transition-opacity"
      >
        {title}
      </button>
      <button
        className="text-sm text-highlight font-semibold"
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
