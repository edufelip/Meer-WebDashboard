import { ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessages";

describe("getErrorMessage", () => {
  const fallback = "Falha ao salvar.";

  it("returns body.message when present", () => {
    const error = new ApiError(400, "/stores", { message: "Nome é obrigatório." });
    expect(getErrorMessage(error, fallback)).toBe("Nome é obrigatório.");
  });

  it("returns nested body.error.message when present", () => {
    const error = new ApiError(400, "/stores", { error: { message: "Dados inválidos." } });
    expect(getErrorMessage(error, fallback)).toBe("Dados inválidos.");
  });

  it("returns first message from array-shaped errors", () => {
    const error = new ApiError(422, "/stores", {
      errors: [{ field: "name", message: "Nome é obrigatório." }]
    });
    expect(getErrorMessage(error, fallback)).toBe("Nome é obrigatório.");
  });

  it("returns first message from object-shaped errors", () => {
    const error = new ApiError(422, "/stores", {
      errors: { name: ["Nome é obrigatório."] }
    });
    expect(getErrorMessage(error, fallback)).toBe("Nome é obrigatório.");
  });

  it("returns body string when body is plain text", () => {
    const error = new ApiError(500, "/stores", "Erro inesperado.");
    expect(getErrorMessage(error, fallback)).toBe("Erro inesperado.");
  });

  it("returns mapped fallback for known HTTP status with no parseable body", () => {
    const error = new ApiError(401, "/stores", { foo: "bar" });
    expect(getErrorMessage(error, fallback)).toBe("Sessão inválida. Faça login novamente.");
  });

  it("returns generic fallback with HTTP code for unknown status", () => {
    const error = new ApiError(418, "/stores", { foo: "bar" });
    expect(getErrorMessage(error, fallback)).toBe("Falha ao salvar. (HTTP 418)");
  });

  it("returns standard Error message when available", () => {
    const error = new Error("Falha de rede.");
    expect(getErrorMessage(error, fallback)).toBe("Falha de rede.");
  });

  it("returns fallback for unknown errors", () => {
    expect(getErrorMessage({ code: 123 }, fallback)).toBe("Falha ao salvar.");
  });
});
