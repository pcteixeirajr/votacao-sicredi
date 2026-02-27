import { StatusCpf } from "../tipos";

const CHAVE_JSON_CPFS_VOTANTES = "sicredi-cpfs-votantes-json-v1";

type StatusValidacaoRemota = "PENDENTE" | "ABLE_TO_VOTE" | "UNABLE_TO_VOTE" | "ERRO";

interface RegistroCpfVotante {
  cpf: string;
  pautaId: string;
  sessaoId: string;
  votoId: string;
  criadoEm: string;
  atualizadoEm: string;
  statusValidacaoRemota: StatusValidacaoRemota;
}

function obterUrlApiCpf(): string {
  return import.meta.env.VITE_CPF_API_URL?.trim() || "";
}

export function extrairDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function formatoCpfValido(valor: string): boolean {
  return /^\d{11}$/.test(extrairDigitos(valor));
}

export function cpfEhReal(valor: string): boolean {
  const cpf = extrairDigitos(valor);
  if (!formatoCpfValido(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i += 1) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);
  return primeiroDigito === Number(cpf[9]) && segundoDigito === Number(cpf[10]);
}

export async function verificarStatusCpf(cpf: string): Promise<StatusCpf> {
  const cpfNumerico = extrairDigitos(cpf);
  const urlApiCpf = obterUrlApiCpf();

  if (!cpfEhReal(cpfNumerico)) {
    throw new Error("CPF invalido. Informe um CPF real.");
  }

  if (!urlApiCpf) {
    return "ABLE_TO_VOTE";
  }

  try {
    const resposta = await fetch(`${urlApiCpf}/user/${cpfNumerico}`);
    if (resposta.ok) {
      const corpo = (await resposta.json()) as { valido?: boolean };
      return corpo.valido ? "ABLE_TO_VOTE" : "UNABLE_TO_VOTE";
    }

    if (resposta.status === 400 || resposta.status === 404) {
      return "UNABLE_TO_VOTE";
    }

    return "ABLE_TO_VOTE";
  } catch {
    return "ABLE_TO_VOTE";
  }
}

function lerJsonCpfsVotantes(): RegistroCpfVotante[] {
  const bruto = localStorage.getItem(CHAVE_JSON_CPFS_VOTANTES);
  if (!bruto) {
    return [];
  }

  try {
    const dados = JSON.parse(bruto) as RegistroCpfVotante[];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarJsonCpfsVotantes(registros: RegistroCpfVotante[]): void {
  localStorage.setItem(CHAVE_JSON_CPFS_VOTANTES, JSON.stringify(registros));
}

function atualizarStatusValidacao(votoId: string, status: StatusValidacaoRemota): void {
  const registros = lerJsonCpfsVotantes();
  const atualizados = registros.map((item) =>
    item.votoId === votoId
      ? {
          ...item,
          statusValidacaoRemota: status,
          atualizadoEm: new Date().toISOString()
        }
      : item
  );
  salvarJsonCpfsVotantes(atualizados);
}

async function consultarStatusCpfComTimeout(cpf: string, timeoutMs = 1200): Promise<StatusCpf> {
  const urlApiCpf = obterUrlApiCpf();
  if (!urlApiCpf) {
    return "ABLE_TO_VOTE";
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const resposta = await fetch(`${urlApiCpf}/user/${cpf}`, { signal: abortController.signal });
    if (resposta.ok) {
      const corpo = (await resposta.json()) as { valido?: boolean };
      return corpo.valido ? "ABLE_TO_VOTE" : "UNABLE_TO_VOTE";
    }
    return "UNABLE_TO_VOTE";
  } finally {
    clearTimeout(timeout);
  }
}

export function registrarCpfVotanteEmJson(parametros: {
  cpf: string;
  pautaId: string;
  sessaoId: string;
  votoId: string;
}): void {
  const agora = new Date().toISOString();
  const registros = lerJsonCpfsVotantes();
  registros.push({
    cpf: extrairDigitos(parametros.cpf),
    pautaId: parametros.pautaId,
    sessaoId: parametros.sessaoId,
    votoId: parametros.votoId,
    criadoEm: agora,
    atualizadoEm: agora,
    statusValidacaoRemota: "PENDENTE"
  });
  salvarJsonCpfsVotantes(registros);
}

export function validarCpfEmSegundoPlano(votoId: string, cpf: string): void {
  void (async () => {
    try {
      const status = await consultarStatusCpfComTimeout(extrairDigitos(cpf));
      atualizarStatusValidacao(votoId, status);
    } catch {
      atualizarStatusValidacao(votoId, "ERRO");
    }
  })();
}
