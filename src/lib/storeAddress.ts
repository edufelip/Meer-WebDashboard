type StoreAddressLike = {
  addressLine?: string | null;
  complement?: string | null;
};

const normalize = (value?: string | null) => (value ?? "").trim();

export function formatStoreAddress(store?: StoreAddressLike | null): string | null {
  const addressLine = normalize(store?.addressLine);
  if (!addressLine) return null;

  const complement = normalize(store?.complement);
  if (!complement) return addressLine;

  return `${addressLine}, ${complement}`;
}

export function resolveComplementPayload({
  isCreate,
  formComplement,
  currentComplement
}: {
  isCreate: boolean;
  formComplement: string;
  currentComplement?: string | null;
}): { include: true; value: string } | { include: false } {
  const next = normalize(formComplement);

  if (isCreate) {
    return next ? { include: true, value: next } : { include: false };
  }

  const current = normalize(currentComplement);
  if (next === current) {
    return { include: false };
  }

  return { include: true, value: next };
}
