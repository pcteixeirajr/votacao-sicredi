import { beforeEach, describe, expect, it } from "vitest";
import {
  abrirSessao,
  criarPauta,
  obterResultadoSessao,
  registrarVoto,
  sessaoEstaAberta
} from "../../servicos/apiVotacao";
import { lerBancoDados, salvarBancoDados } from "../../servicos/armazenamento";

describe("apiVotacao - testes de integracao", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve executar fluxo completo de pauta, sessao e voto", async () => {
    const pauta = criarPauta("Aprovar cooperativa", "Descricao de teste");
    const sessao = abrirSessao(pauta.id, 1);

    expect(sessaoEstaAberta(sessao)).toBe(true);

    await registrarVoto({
      pautaId: pauta.id,
      cpf: "529.982.247-25",
      escolha: "SIM"
    });

    const resultado = obterResultadoSessao(pauta.id);
    expect(resultado.totalVotos).toBe(1);
    expect(resultado.votosSim).toBe(1);
    expect(resultado.votosNao).toBe(0);
  });

  it("deve impedir segundo voto do mesmo CPF na mesma pauta", async () => {
    const pauta = criarPauta("Nova pauta", "");
    abrirSessao(pauta.id, 1);

    await registrarVoto({
      pautaId: pauta.id,
      cpf: "52998224725",
      escolha: "NAO"
    });

    await expect(
      registrarVoto({
        pautaId: pauta.id,
        cpf: "52998224725",
        escolha: "SIM"
      })
    ).rejects.toThrow("Associado ja votou");
  });

  it("deve impedir voto com sessao encerrada", async () => {
    const pauta = criarPauta("Sessao curta", "");
    const sessao = abrirSessao(pauta.id, 1);

    const banco = lerBancoDados();
    banco.sessoes = banco.sessoes.map((item) =>
      item.id === sessao.id
        ? {
            ...item,
            encerraEm: new Date(Date.now() - 10_000).toISOString()
          }
        : item
    );
    salvarBancoDados(banco);

    await expect(
      registrarVoto({
        pautaId: pauta.id,
        cpf: "12345678909",
        escolha: "SIM"
      })
    ).rejects.toThrow("Sessao encerrada");
  });
});
