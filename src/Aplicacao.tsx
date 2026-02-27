import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pauta, TipoVoto } from "./tipos";
import {
  abrirSessao,
  criarPauta,
  listarPautas,
  obterResultadoSessao,
  obterSessaoPorPautaId,
  registrarVoto
} from "./servicos/apiVotacao";

function formatarData(valor: string): string {
  return new Date(valor).toLocaleString("pt-BR");
}

export default function Aplicacao() {
  const [pautas, definirPautas] = useState<Pauta[]>([]);
  const [pautaSelecionadaId, definirPautaSelecionadaId] = useState<string>("");
  const [titulo, definirTitulo] = useState("");
  const [descricao, definirDescricao] = useState("");
  const [duracao, definirDuracao] = useState("1");
  const [cpf, setCpf] = useState("");
  const [escolha, definirEscolha] = useState<TipoVoto>("SIM");
  const [mensagem, definirMensagem] = useState("");
  const [erro, definirErro] = useState("");
  const [agora, definirAgora] = useState(Date.now());

  function limitarCpf(valor: string): string {
    return valor.replace(/\D/g, "").slice(0, 11);
  }

  useEffect(() => {
    atualizarPautas();
  }, []);

  useEffect(() => {
    const temporizador = setInterval(() => definirAgora(Date.now()), 1000);
    return () => clearInterval(temporizador);
  }, []);

  const pautaSelecionada = useMemo(
    () => pautas.find((pauta) => pauta.id === pautaSelecionadaId),
    [pautas, pautaSelecionadaId]
  );

  const sessaoSelecionada = useMemo(
    () => (pautaSelecionada ? obterSessaoPorPautaId(pautaSelecionada.id) : undefined),
    [pautaSelecionada, agora]
  );

  const resultadoSelecionado = useMemo(() => {
    if (!pautaSelecionada || !sessaoSelecionada) {
      return undefined;
    }
    return obterResultadoSessao(pautaSelecionada.id);
  }, [pautaSelecionada, sessaoSelecionada, agora]);

  function atualizarPautas() {
    const pautasCarregadas = listarPautas();
    definirPautas(pautasCarregadas);
    if (!pautaSelecionadaId && pautasCarregadas[0]) {
      definirPautaSelecionadaId(pautasCarregadas[0].id);
    }
  }

  function limparRetorno() {
    definirErro("");
    definirMensagem("");
  }

  function aoEnviarPauta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limparRetorno();

    try {
      const pautaCriada = criarPauta(titulo, descricao);
      definirTitulo("");
      definirDescricao("");
      atualizarPautas();
      definirPautaSelecionadaId(pautaCriada.id);
      definirMensagem("Pauta criada com sucesso.");
    } catch (erroAtual) {
      definirErro(erroAtual instanceof Error ? erroAtual.message : "Falha ao criar pauta.");
    }
  }

  function aoAbrirSessao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limparRetorno();

    if (!pautaSelecionadaId) {
      definirErro("Selecione uma pauta.");
      return;
    }

    try {
      abrirSessao(pautaSelecionadaId, Number(duracao));
      atualizarPautas();
      definirMensagem("Sessao aberta com sucesso.");
    } catch (erroAtual) {
      definirErro(erroAtual instanceof Error ? erroAtual.message : "Falha ao abrir sessao.");
    }
  }

  async function aoRegistrarVoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    limparRetorno();

    if (!pautaSelecionadaId) {
      definirErro("Selecione uma pauta.");
      return;
    }

    try {
      await registrarVoto({
        pautaId: pautaSelecionadaId,
        cpf,
        escolha
      });
      setCpf("");
      atualizarPautas();
      definirMensagem("Voto registrado com sucesso.");
    } catch (erroAtual) {
      definirErro(erroAtual instanceof Error ? erroAtual.message : "Falha ao registrar voto.");
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>Desafio Sicredi - Sessao de Votacao</h1>
        <p>
          Fluxo completo: cadastrar pauta, abrir sessao com tempo definido, votar (Sim/Nao) e
          contabilizar resultado.
        </p>
      </header>

      <section className="card">
        <h2>1) Cadastrar pauta</h2>
        <form onSubmit={aoEnviarPauta} className="form-grid">
          <label>
            Titulo
            <input
              value={titulo}
              onChange={(event) => definirTitulo(event.target.value)}
              placeholder="Ex: Aprovacao de novo estatuto"
              required
            />
          </label>
          <label>
            Descricao
            <textarea
              value={descricao}
              onChange={(event) => definirDescricao(event.target.value)}
              placeholder="Detalhes opcionais da pauta"
              rows={3}
            />
          </label>
          <button type="submit">Criar pauta</button>
        </form>
      </section>

      <section className="card">
        <h2>2) Selecionar pauta e abrir sessao</h2>
        <div className="form-grid">
          <label>
            Pauta
            <select
              value={pautaSelecionadaId}
              onChange={(event) => definirPautaSelecionadaId(event.target.value)}
            >
              <option value="">Selecione...</option>
              {pautas.map((pauta) => (
                <option key={pauta.id} value={pauta.id}>
                  {pauta.titulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form onSubmit={aoAbrirSessao} className="inline-form">
          <label>
            Duracao (minutos)
            <input
              type="number"
              value={duracao}
              onChange={(event) => definirDuracao(event.target.value)}
              min={1}
              step={1}
            />
          </label>
          <button type="submit">Abrir sessao</button>
        </form>

        {pautaSelecionada && (
          <div className="details">
            <h3>Pauta selecionada</h3>
            <p>
              <strong>{pautaSelecionada.titulo}</strong>
            </p>
            {pautaSelecionada.descricao && <p>{pautaSelecionada.descricao}</p>}
            <p>Criada em: {formatarData(pautaSelecionada.criadoEm)}</p>
            {sessaoSelecionada ? (
              <>
                <p>Abertura: {formatarData(sessaoSelecionada.abertaEm)}</p>
                <p>Fechamento: {formatarData(sessaoSelecionada.encerraEm)}</p>
                <p>
                  Status:{" "}
                  {new Date(sessaoSelecionada.encerraEm).getTime() > agora ? "ABERTA" : "ENCERRADA"}
                </p>
              </>
            ) : (
              <p>Sem sessao aberta.</p>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>3) Registrar voto</h2>
        <form onSubmit={aoRegistrarVoto} className="inline-form">
          <label>
            CPF do associado
            <input
              value={cpf}
              onChange={(event) => setCpf(limitarCpf(event.target.value))}
              placeholder="Somente numeros (11 digitos)"
              inputMode="numeric"
              maxLength={11}
              required
            />
          </label>

          <label>
            Voto
            <select value={escolha} onChange={(event) => definirEscolha(event.target.value as TipoVoto)}>
              <option value="SIM">Sim</option>
              <option value="NAO">Nao</option>
            </select>
          </label>

          <button type="submit">Enviar voto</button>
        </form>
      </section>

      <section className="card">
        <h2>4) Resultado da votacao</h2>
        {resultadoSelecionado ? (
          <div className="result-grid">
            <p>Status da sessao: {resultadoSelecionado.sessaoAberta ? "ABERTA" : "ENCERRADA"}</p>
            <p>Total de votos: {resultadoSelecionado.totalVotos}</p>
            <p>Sim: {resultadoSelecionado.votosSim}</p>
            <p>Nao: {resultadoSelecionado.votosNao}</p>
          </div>
        ) : (
          <p>Selecione uma pauta com sessao para ver o resultado.</p>
        )}
      </section>

      {(mensagem || erro) && (
        <section className={`feedback ${erro ? "feedback-erro" : "feedback-sucesso"}`}>
          {erro || mensagem}
        </section>
      )}
    </main>
  );
}
