# Desafio Sicredi em React

Implementacao do desafio tecnico (originalmente focado em backend) usando React + TypeScript, com uma camada de servico local que simula uma API REST e persiste os dados no navegador.

## O que foi implementado

Requisitos obrigatorios do PDF:

- Cadastro de pauta.
- Abertura de sessao de votacao em uma pauta com tempo configuravel (padrao: 1 minuto).
- Recebimento de votos `Sim`/`Nao`.
- Restricao de apenas 1 voto por associado (CPF) por pauta.
- Contabilizacao de votos e exibicao de resultado da pauta.
- Persistencia dos dados para nao perder informacoes ao recarregar a aplicacao.

Bonus atendido:

- Integracao com servico externo de CPF (`https://user-info.herokuapp.com/users/{cpf}`) para verificar se o associado pode votar.
- Se o servico externo estiver indisponivel, ha contingencia deterministica para manter a aplicacao funcional em ambiente de teste.

## Tecnologias usadas

- React 18
- TypeScript
- Vite
- `localStorage` para persistencia

## Como executar

## 1) Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## 2) Instalar dependencias

```bash
npm install
```

## 3) Rodar em desenvolvimento

```bash
npm run dev
```

Abra a URL mostrada no terminal (normalmente `http://localhost:5173`).

## 4) Gerar pacote de producao

```bash
npm run build
```

## 5) Testar pacote localmente

```bash
npm run preview
```

## Testes

Comandos disponiveis:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Tipos de testes implementados:

- Unitarios: `src/testes/unitarios`
- Integracao: `src/testes/integracao`
- Automatizado (fluxo da interface): `src/testes/automatizados`
- Performance: `src/testes/performance`

## Fluxo funcional da aplicacao

## 1) Criar pauta

- Informe titulo da pauta.
- Descricao e opcional.
- A pauta fica disponivel para selecao.

## 2) Abrir sessao de votacao

- Selecione uma pauta.
- Informe a duracao em minutos.
- Caso informado valor invalido, o sistema usa 1 minuto.
- Uma pauta aceita apenas uma sessao (aberta ou encerrada), seguindo regra comum desse desafio.

## 3) Registrar voto

- Selecione a pauta (com sessao aberta).
- Informe CPF do associado (11 digitos).
- Escolha voto `Sim` ou `Nao`.
- O sistema valida:
  - se a sessao existe;
  - se a sessao ainda esta aberta;
  - se o CPF ainda nao votou nessa pauta;
  - se o CPF esta apto a votar (servico externo).

## 4) Consultar resultado

- Resultado exibido em tempo real na tela:
  - status da sessao (aberta/encerrada);
  - total de votos;
  - total de votos `Sim`;
  - total de votos `Nao`.

## Arquitetura e organizacao

Estrutura principal:

```txt
src/
  Aplicacao.tsx            # Interface + orquestracao do fluxo
  main.tsx                 # Bootstrap React
  styles.css               # Estilos da pagina
  tipos.ts                 # Tipos e contratos
  servicos/
    armazenamento.ts       # Persistencia local (leitura/escrita do banco)
    servicoCpf.ts          # Integracao com endpoint externo de CPF
    apiVotacao.ts          # Regras de negocio da votacao
```

### Regras de negocio centralizadas em `apiVotacao.ts`

- `criarPauta(...)`: cria pauta.
- `abrirSessao(...)`: abre sessao com horario de fechamento.
- `registrarVoto(...)`: aplica validacoes e registra voto.
- `obterResultadoSessao(...)`: calcula contagem final.
- `sessaoEstaAberta(...)`: identifica status temporal da sessao.

Isso evita que as regras fiquem espalhadas pela interface.

## Persistencia de dados

Todos os dados ficam no `localStorage` com a chave:

```txt
sicredi-votacao-db-v1
```

Entidades persistidas:

- `pautas`
- `sessoes`
- `votos`

## Integracao de CPF (bonus)

Servico consultado pelo frontend:

```txt
GET {VITE_CPF_API_URL}/user/{cpf}
```

Comportamento:

- `200` com `valido: true` => voto permitido.
- `400`/`404` => voto bloqueado.
- Falha de rede/indisponibilidade => fallback para regra local (CPF matematicamente valido).

## API Node para Render (Free)

Foi adicionada a pasta `cpf-api/` com uma API Express pronta para deploy no Render.

Arquivos:

```txt
cpf-api/
  package.json
  index.js
```

### Rodar localmente a API

```bash
cd cpf-api
npm install
npm start
```

API local: `http://localhost:3000/user/52998224725`

### Configurar frontend para usar a API

Crie um arquivo `.env` na raiz do frontend:

```txt
VITE_CPF_API_URL=http://localhost:3000
```

Depois rode:

```bash
npm run dev
```

### Deploy da `cpf-api` no Render

1. Suba a pasta/projeto `cpf-api` para um repositório no GitHub.
2. No Render: `New +` -> `Web Service`.
3. Configure:
   - `Runtime`: Node
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
   - `Instance Type`: Free
4. Ao final, copie a URL gerada (exemplo: `https://cpf-api-xxxx.onrender.com`).
5. No frontend, ajuste `VITE_CPF_API_URL` com essa URL e publique/reinicie.

## Decisoes tecnicas

- Projeto focado em clareza e legibilidade para avaliacao tecnica.
- Sem complexidade desnecessaria: uma camada de servicos simples simulando API.
- Tipagem forte com TypeScript.
- Mensagens de erro explicitas para facilitar debug.

## Limites desta versao

- Como esta em React puro (frontend), nao existe banco de dados real nem API backend externa da aplicacao.
- O armazenamento e local ao navegador/dispositivo.
- Nao ha autenticacao/autorizacao.

## Autor

Projeto criado para atender ao desafio tecnico solicitado.
# votacao-sicredi
