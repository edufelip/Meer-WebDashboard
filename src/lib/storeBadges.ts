export const STORE_BADGES = {
  AMBASSADOR: "AMBASSADOR"
} as const;

export type StoreBadgeCode = (typeof STORE_BADGES)[keyof typeof STORE_BADGES];

const MANAGED_STORE_BADGES = Object.values(STORE_BADGES) as StoreBadgeCode[];
const MANAGED_STORE_BADGES_SET = new Set<string>(MANAGED_STORE_BADGES);

const STORE_BADGE_LABELS: Record<StoreBadgeCode, string> = {
  AMBASSADOR: "Embaixador"
};

export function normalizeStoreBadgeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function normalizeStoreBadges(badges?: readonly string[] | null): string[] {
  if (!badges || badges.length === 0) return [];
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const badge of badges) {
    const code = normalizeStoreBadgeCode(badge);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    normalized.push(code);
  }

  return normalized;
}

export function getManagedStoreBadges(): StoreBadgeCode[] {
  return [...MANAGED_STORE_BADGES];
}

export function isKnownStoreBadge(code: string): code is StoreBadgeCode {
  const normalized = normalizeStoreBadgeCode(code);
  return MANAGED_STORE_BADGES_SET.has(normalized);
}

export function getStoreBadgeLabel(code: string): string {
  const normalized = normalizeStoreBadgeCode(code);
  if (!normalized) return "Badge desconhecida";
  if (isKnownStoreBadge(normalized)) return STORE_BADGE_LABELS[normalized];
  return normalized.replace(/_/g, " ");
}
