import { Pauta, ResultadoSessao, SessaoVotacao, TipoVoto } from "../tipos";
import {
  cpfEhReal,
  extrairDigitos,
  registrarCpfVotanteEmJson,
  validarCpfEmSegundoPlano
} from "./servicoCpf";
import { lerBancoDados, salvarBancoDados } from "./armazenamento";

function criarId(prefixo: string): string {
  return `${prefixo}-${crypto.randomUUID()}`;
}

export function listarPautas(): Pauta[] {
  const bancoDados = lerBancoDados();
  return [...bancoDados.pautas].sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

export function obterSessaoPorPautaId(pautaId: string): SessaoVotacao | undefined {
  const bancoDados = lerBancoDados();
  return bancoDados.sessoes.find((sessao) => sessao.pautaId === pautaId);
}

export function criarPauta(titulo: string, descricao: string): Pauta {
  const tituloLimpo = titulo.trim();
  if (!tituloLimpo) {
    throw new Error("Titulo da pauta e obrigatorio.");
  }

  const bancoDados = lerBancoDados();
  const pauta: Pauta = {
    id: criarId("pauta"),
    titulo: tituloLimpo,
    descricao: descricao.trim() || undefined,
    criadoEm: new Date().toISOString()
  };

  bancoDados.pautas.push(pauta);
  salvarBancoDados(bancoDados);
  return pauta;
}

export function abrirSessao(pautaId: string, duracaoMinutos = 1): SessaoVotacao {
  const bancoDados = lerBancoDados();
  const pauta = bancoDados.pautas.find((item) => item.id === pautaId);
  if (!pauta) {
    throw new Error("Pauta nao encontrada.");
  }

  const sessaoExistente = bancoDados.sessoes.find((item) => item.pautaId === pautaId);
  if (sessaoExistente) {
    throw new Error("Essa pauta ja possui sessao aberta ou encerrada.");
  }

  const minutos = Number.isFinite(duracaoMinutos) && duracaoMinutos > 0 ? duracaoMinutos : 1;
  const abertaEm = new Date();
  const encerraEm = new Date(abertaEm.getTime() + minutos * 60_000);

  const sessao: SessaoVotacao = {
    id: criarId("sessao"),
    pautaId,
    abertaEm: abertaEm.toISOString(),
    encerraEm: encerraEm.toISOString()
  };

  bancoDados.sessoes.push(sessao);
  salvarBancoDados(bancoDados);
  return sessao;
}

export function sessaoEstaAberta(sessao: SessaoVotacao): boolean {
  return new Date(sessao.encerraEm).getTime() > Date.now();
}

export async function registrarVoto(parametros: {
  pautaId: string;
  cpf: string;
  escolha: TipoVoto;
}): Promise<void> {
  const bancoDados = lerBancoDados();
  const sessao = bancoDados.sessoes.find((item) => item.pautaId === parametros.pautaId);

  if (!sessao) {
    throw new Error("A pauta ainda nao possui sessao de votacao.");
  }

  if (!sessaoEstaAberta(sessao)) {
    throw new Error("Sessao encerrada. Nao e possivel votar.");
  }

  const cpf = extrairDigitos(parametros.cpf);
  const associadoJaVotou = bancoDados.votos.some(
    (voto) => voto.sessaoId === sessao.id && voto.cpf === cpf
  );
  if (associadoJaVotou) {
    throw new Error("Associado ja votou nesta pauta.");
  }

  if (!cpfEhReal(cpf)) {
    throw new Error("CPF invalido. Informe um CPF real.");
  }

  const votoId = criarId("voto");
  bancoDados.votos.push({
    id: votoId,
    sessaoId: sessao.id,
    pautaId: parametros.pautaId,
    cpf,
    escolha: parametros.escolha,
    criadoEm: new Date().toISOString()
  });
  salvarBancoDados(bancoDados);

  registrarCpfVotanteEmJson({
    cpf,
    pautaId: parametros.pautaId,
    sessaoId: sessao.id,
    votoId
  });

  validarCpfEmSegundoPlano(votoId, cpf);
}

export function obterResultadoSessao(pautaId: string): ResultadoSessao {
  const bancoDados = lerBancoDados();
  const sessao = bancoDados.sessoes.find((item) => item.pautaId === pautaId);
  if (!sessao) {
    throw new Error("Nao existe sessao para esta pauta.");
  }

  const votos = bancoDados.votos.filter((item) => item.sessaoId === sessao.id);
  const votosSim = votos.filter((item) => item.escolha === "SIM").length;
  const votosNao = votos.filter((item) => item.escolha === "NAO").length;

  return {
    sessaoId: sessao.id,
    pautaId,
    totalVotos: votos.length,
    votosSim,
    votosNao,
    sessaoAberta: sessaoEstaAberta(sessao)
  };
}
