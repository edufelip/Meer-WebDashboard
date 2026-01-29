import type { ReactNode } from "react";
import clsx from "classnames";

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-textDark shadow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
