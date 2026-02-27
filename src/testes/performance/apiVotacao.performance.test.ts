import { beforeEach, describe, expect, it } from "vitest";
import { obterResultadoSessao } from "../../servicos/apiVotacao";
import { salvarBancoDados } from "../../servicos/armazenamento";

describe("apiVotacao - teste de performance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve calcular resultado de 10 mil votos em tempo aceitavel", () => {
    const pautaId = "pauta-perf-1";
    const sessaoId = "sessao-perf-1";

    const votos = Array.from({ length: 10_000 }, (_, indice) => ({
      id: `voto-${indice}`,
      sessaoId,
      pautaId,
      cpf: `${10000000000 + indice}`,
      escolha: indice % 2 === 0 ? ("SIM" as const) : ("NAO" as const),
      criadoEm: new Date().toISOString()
    }));

    salvarBancoDados({
      pautas: [
        {
          id: pautaId,
          titulo: "Pauta de performance",
          criadoEm: new Date().toISOString()
        }
      ],
      sessoes: [
        {
          id: sessaoId,
          pautaId,
          abertaEm: new Date(Date.now() - 60_000).toISOString(),
          encerraEm: new Date(Date.now() + 60_000).toISOString()
        }
      ],
      votos
    });

    const inicio = performance.now();
    const resultado = obterResultadoSessao(pautaId);
    const duracaoMs = performance.now() - inicio;

    expect(resultado.totalVotos).toBe(10_000);
    expect(resultado.votosSim).toBe(5_000);
    expect(resultado.votosNao).toBe(5_000);
    expect(duracaoMs).toBeLessThan(2000);
  });
});
