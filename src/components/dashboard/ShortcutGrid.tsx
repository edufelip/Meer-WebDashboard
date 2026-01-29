import type { Route } from "next";
import type { ComponentType } from "react";
import { ShortcutCard } from "./ShortcutCard";

export type ShortcutItem = {
  title: string;
  description: string;
  href: Route;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

export function ShortcutGrid({ items }: { items: ShortcutItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <ShortcutCard
          key={item.title}
          {...item}
          className="animate-rise"
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  );
}
