type MapboxContextItem = {
  id?: string;
  text?: string;
  text_pt?: string;
};

type MapboxFeatureLike = {
  context?: MapboxContextItem[];
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function contextLabel(item?: MapboxContextItem): string | undefined {
  return normalizeText(item?.text_pt) ?? normalizeText(item?.text);
}

function findContextByPrefix(context: MapboxContextItem[], prefixes: string[]): MapboxContextItem | undefined {
  return context.find((item) => {
    if (typeof item?.id !== "string") return false;
    return prefixes.some((prefix) => item.id!.startsWith(prefix));
  });
}

export function extractNeighborhoodFromMapboxFeature(feature?: MapboxFeatureLike | null): string | undefined {
  const context = feature?.context;
  if (!Array.isArray(context) || context.length === 0) return undefined;

  const neighborhood = findContextByPrefix(context, ["neighborhood"]);
  const locality = findContextByPrefix(context, ["locality"]);
  const district = findContextByPrefix(context, ["district"]);
  const place = findContextByPrefix(context, ["place"]);

  return contextLabel(neighborhood) ?? contextLabel(locality) ?? contextLabel(district) ?? contextLabel(place);
}
