import { Pauta, SessaoVotacao, Voto } from "../tipos";

const CHAVE_BANCO_DADOS = "sicredi-votacao-db-v1";

interface BancoDados {
  pautas: Pauta[];
  sessoes: SessaoVotacao[];
  votos: Voto[];
}

const BANCO_DADOS_VAZIO: BancoDados = {
  pautas: [],
  sessoes: [],
  votos: []
};

export function lerBancoDados(): BancoDados {
  const bancoEmTexto = localStorage.getItem(CHAVE_BANCO_DADOS);
  if (!bancoEmTexto) {
    return BANCO_DADOS_VAZIO;
  }

  try {
    const bancoDados = JSON.parse(bancoEmTexto) as BancoDados;
    return {
      pautas: bancoDados.pautas ?? [],
      sessoes: bancoDados.sessoes ?? [],
      votos: bancoDados.votos ?? []
    };
  } catch {
    return BANCO_DADOS_VAZIO;
  }
}

export function salvarBancoDados(bancoDados: BancoDados): void {
  localStorage.setItem(CHAVE_BANCO_DADOS, JSON.stringify(bancoDados));
}
