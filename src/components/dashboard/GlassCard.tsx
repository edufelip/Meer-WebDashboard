import type { ReactNode } from "react";
import clsx from "classnames";

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        "group relative isolate rounded-3xl border border-brand-card/40 bg-[linear-gradient(135deg,#833000_0%,#a73c00_45%,#b14300_100%)] p-5 text-white shadow-[0_20px_60px_-35px_rgba(67,26,0,0.75)]",
        className
      )}
    >
      {children}
    </div>
  );
}
