import Link from "next/link";
import type { Route } from "next";
import type { ComponentType, CSSProperties } from "react";
import clsx from "classnames";
import { ArrowRightIcon } from "./icons";

type ShortcutCardProps = {
  title: string;
  description: string;
  href: Route;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  className?: string;
  style?: CSSProperties;
};

export function ShortcutCard({ title, description, href, icon: Icon, badge, className, style }: ShortcutCardProps) {
  return (
    <Link
      href={href}
      style={style}
      className={clsx(
        "group relative flex h-full flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-[linear-gradient(140deg,#833000_0%,#a73c00_45%,#b14300_100%)] p-6 text-left text-white shadow-[0_25px_70px_-45px_rgba(0,0,0,0.6)] transition-transform transition-shadow duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_-50px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {badge ? (
        <span className="absolute right-4 top-4 rounded-full bg-brand-primary px-2.5 py-1 text-xs font-bold text-brand-forest">
          {badge}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white/15 p-3 text-white shadow-sm">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-white opacity-60 transition-transform transition-opacity duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white transition-colors group-hover:text-white/90">{title}</h3>
        <p className="mt-1 text-sm text-white/80">{description}</p>
      </div>
    </Link>
  );
}
