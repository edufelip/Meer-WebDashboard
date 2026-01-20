import type { ReactNode } from "react";
import clsx from "classnames";

const gridClassMap: Record<number, string> = {
  5: "grid grid-cols-5 gap-4",
  6: "grid grid-cols-6 gap-4"
};

function resolveGridClass(columns: number) {
  return gridClassMap[columns] ?? "grid grid-cols-6 gap-4";
}

export function TableSkeletonRows({
  colSpan,
  columns,
  rows = 4,
  columnSpans
}: {
  colSpan: number;
  columns: number;
  rows?: number;
  columnSpans?: number[];
}) {
  const spans = columnSpans?.length ? columnSpans : Array.from({ length: columns }).map(() => 1);
  return (
    <tr>
      <td className="py-4 px-4" colSpan={colSpan}>
        <div className="flex flex-col gap-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className={resolveGridClass(columns)}>
              {spans.map((span, colIndex) => (
                <div
                  key={colIndex}
                  className={clsx(
                    "h-8 animate-pulse rounded-lg bg-white/10",
                    span > 1 ? `col-span-${span}` : ""
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}

export function TableErrorRow({ colSpan, message, onRetry, actionLabel = "Tentar novamente" }: { colSpan: number; message: ReactNode; onRetry: () => void; actionLabel?: string }) {
  return (
    <tr>
      <td className="py-3 px-4 text-red-300" colSpan={colSpan}>
        <div className="flex items-center justify-between gap-4">
          <span>{message}</span>
          <button
            type="button"
            onClick={onRetry}
            className={clsx("rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20")}
          >
            {actionLabel}
          </button>
        </div>
      </td>
    </tr>
  );
}
