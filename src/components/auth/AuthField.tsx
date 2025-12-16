import type { InputHTMLAttributes } from "react";

type AuthFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({ label, id, className, ...inputProps }: AuthFieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-textDark" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-textDark placeholder:text-textSubtle/70 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition ${className ?? ""}`}
        {...inputProps}
      />
    </label>
  );
}
