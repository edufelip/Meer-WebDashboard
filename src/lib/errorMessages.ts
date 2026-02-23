const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: "Requisição inválida. Revise os dados informados.",
  401: "Sessão inválida. Faça login novamente.",
  403: "Acesso negado para esta operação.",
  404: "Recurso não encontrado.",
  409: "Conflito de dados. Revise as informações e tente novamente.",
  422: "Dados inválidos. Revise os campos e tente novamente.",
  429: "Muitas tentativas em sequência. Aguarde e tente novamente.",
  500: "Erro interno do servidor. Tente novamente em instantes.",
  502: "Servidor temporariamente indisponível. Tente novamente.",
  503: "Serviço temporariamente indisponível. Tente novamente.",
  504: "Tempo de resposta do servidor excedido. Tente novamente."
};

const PRIORITY_KEYS = [
  "message",
  "error",
  "detail",
  "description",
  "reason",
  "title",
  "error_description",
  "errorMessage"
];

const COLLECTION_KEYS = ["errors", "issues", "violations", "details"];

function normalizeText(value: string): string | null {
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function extractMessageFromCollection(value: unknown, depth: number): string | null {
  if (depth > 5 || value == null) return null;
  if (typeof value === "string") return normalizeText(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractMessageFromCollection(item, depth + 1);
      if (message) return message;
    }
    return null;
  }
  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  for (const key of PRIORITY_KEYS) {
    const message = extractMessageFromCollection(record[key], depth + 1);
    if (message) return message;
  }

  for (const nested of Object.values(record)) {
    if (!Array.isArray(nested)) continue;
    const message = extractMessageFromCollection(nested, depth + 1);
    if (message) return message;
  }

  return null;
}

export function extractApiErrorBodyMessage(body: unknown): string | null {
  if (body == null) return null;
  if (typeof body === "string") return normalizeText(body);
  if (Array.isArray(body)) return extractMessageFromCollection(body, 0);
  if (typeof body !== "object") return null;

  const record = body as Record<string, unknown>;

  for (const key of PRIORITY_KEYS) {
    const message = extractMessageFromCollection(record[key], 0);
    if (message) return message;
  }

  for (const key of COLLECTION_KEYS) {
    const message = extractMessageFromCollection(record[key], 0);
    if (message) return message;
  }

  return null;
}

export function getStatusFallbackMessage(status: number): string | null {
  return STATUS_FALLBACK_MESSAGES[status] ?? null;
}

function isApiLikeError(error: unknown): error is { status: number; body?: unknown } {
  if (!error || typeof error !== "object") return false;
  const value = error as { status?: unknown };
  return typeof value.status === "number";
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiLikeError(error)) {
    const bodyMessage = extractApiErrorBodyMessage(error.body);
    if (bodyMessage) return bodyMessage;
    const statusFallback = getStatusFallbackMessage(error.status);
    if (statusFallback) return statusFallback;
    return `${fallback} (HTTP ${error.status})`;
  }

  if (error instanceof Error) {
    const message = normalizeText(error.message);
    if (message) return message;
  }

  if (typeof error === "string") {
    const message = normalizeText(error);
    if (message) return message;
  }

  return fallback;
}
