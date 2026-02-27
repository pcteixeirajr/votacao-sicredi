export type TipoVoto = "SIM" | "NAO";

export type StatusCpf = "ABLE_TO_VOTE" | "UNABLE_TO_VOTE";

export interface Pauta {
  id: string;
  titulo: string;
  descricao?: string;
  criadoEm: string;
}

export interface SessaoVotacao {
  id: string;
  pautaId: string;
  abertaEm: string;
  encerraEm: string;
}

export interface Voto {
  id: string;
  sessaoId: string;
  pautaId: string;
  cpf: string;
  escolha: TipoVoto;
  criadoEm: string;
}

export interface ResultadoSessao {
  sessaoId: string;
  pautaId: string;
  totalVotos: number;
  votosSim: number;
  votosNao: number;
  sessaoAberta: boolean;
}
