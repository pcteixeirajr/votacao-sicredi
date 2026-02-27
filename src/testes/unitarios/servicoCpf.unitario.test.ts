import { describe, expect, it } from "vitest";
import { cpfEhReal, extrairDigitos, formatoCpfValido } from "../../servicos/servicoCpf";

describe("servicoCpf - testes unitarios", () => {
  it("deve extrair apenas digitos", () => {
    expect(extrairDigitos("529.982.247-25")).toBe("52998224725");
  });

  it("deve validar formato com 11 digitos", () => {
    expect(formatoCpfValido("529.982.247-25")).toBe(true);
    expect(formatoCpfValido("5299822472")).toBe(false);
  });

  it("deve aceitar CPF matematicamente valido", () => {
    expect(cpfEhReal("52998224725")).toBe(true);
  });

  it("deve rejeitar CPF matematicamente invalido", () => {
    expect(cpfEhReal("52998224724")).toBe(false);
  });

  it("deve rejeitar sequencias repetidas", () => {
    expect(cpfEhReal("11111111111")).toBe(false);
  });
});
