import type { InputHTMLAttributes } from "react";

type AuthFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({ label, id, className, name, type = "text", spellCheck, ...inputProps }: AuthFieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const inputName = name ?? inputId;
  const resolvedSpellCheck = spellCheck ?? (type === "email" || type === "password" ? false : undefined);

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-textDark" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        name={inputName}
        type={type}
        spellCheck={resolvedSpellCheck}
        className={`w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-textDark shadow-sm placeholder:text-textSubtle/70 transition-colors focus-visible:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${className ?? ""}`}
        {...inputProps}
      />
    </label>
  );
}
