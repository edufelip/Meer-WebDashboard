import type { ReactNode } from "react";
export function EmptyStateRow({
  colSpan,
  title,
  description,
  icon
}: {
  colSpan: number;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          {icon ? <div className="text-brand-primary">{icon}</div> : null}
          <p className="text-sm font-semibold text-white">{title}</p>
          {description ? <p className="text-sm text-white/60 max-w-md text-pretty">{description}</p> : null}
        </div>
      </td>
    </tr>
  );
}
