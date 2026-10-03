# Plano de Ação — Inscrição de ficha do Torneio (demo victory-3det)

Diagnóstico feito em 2026-09-26. Nenhuma onda de implementação foi executada. Status de implementação permanece "Não iniciado". O item de baseline fica "Em análise" porque esta execução só leu o repositório e rodou a suíte existente.

## 1. Objetivo

Levar o repositório do pacote puro `@victory/rules` até a demo descrita em `docs/01-mapa-arquitetura.md` e `.skills/incremento-do-plano.md`: lista pública em Server Component, inscrição autenticada, validação assíncrona e trilha com correlation id. A matemática de `validarFicha` permanece em `packages/rules` e não é reimplementada no Next nem no Nest.

## 2. Contexto

O código de produção hoje é só a regra da ficha. O desenho Next.js, NestJS, Postgres, Redis, BullMQ e Keycloak está nos documentos e ainda não tem arquivo correspondente.

Evidência do que existe:

| Path | O que é |
|------|---------|
| `package.json` | Workspace `packages/*`. Scripts `lint`, `typecheck`, `test`. `engines.node` `>=22`. |
| `packages/rules/package.json` | Nome `@victory/rules`. Scripts `typecheck` (`tsc --noEmit`) e `test` (Jest). |
| `packages/rules/src/ficha.ts` | Tipos `Ficha`, `ResultadoFicha`, perícias, vantagens e desvantagens. |
| `packages/rules/src/validar-ficha.ts` | Função `validarFicha`. |
| `packages/rules/src/validar-ficha.spec.ts` | Sete casos Jest. |
| `packages/rules/jest.config.mjs` | `ts-jest`, `testEnvironment: node`, `roots: src`. |
| `packages/rules/tsconfig.json` | `strict: true`, `rootDir: src`, `include: ["src"]`. |
| `.github/workflows/ci.yml` | Jobs Lint, Typecheck e Test. Node 22. `npm ci` e o script da raiz. Sem build Docker. |
| `eslint.config.mjs` | ESLint recommended + typescript-eslint. Bloco com `projectService` só em `**/*.ts`. |
| `.npmrc` | `registry=https://registry.npmjs.org/`. |
| `.gitignore` | Ignora `.env` e `.env.*`, com exceção `!.env.example`. |
| `README.md` | Descreve os três checks. Não descreve o fluxo browser → Next → Nest. |
| `docs/01-mapa-arquitetura.md` | Separa o que está no repo do alvo da demo. |
| `docs/02-estrategia-testes.md` | Teste da regra é P0. Caso de uso da API é P1, quando `apps/api` existir. Sem teste de browser. |
| `docs/03-definition-of-done.md` | Critérios de sessão, JWT, `sub` e correlation id para quando web e API existirem. |

Busca no repositório por `next`, `nestjs`, `docker`, `keycloak`, `bullmq`, `prisma` e `typeorm` só encontra essas palavras em `docs/`, `.agents/` e `.skills/`. Não há `apps/`, `docker-compose.yml`, Dockerfile, `.env.example`, migration, controller, página, hook, guard nem cliente HTTP.

Nesta sessão, `npm test` na raiz terminou com exit code 0: 1 suite, 7 testes, todos em `@victory/rules`.

`Ficha` (`packages/rules/src/ficha.ts`) tem `poder`, `habilidade`, `resistencia`, `pericias`, `vantagens` e `desvantagens`. Não tem nome, conceito, status, dono nem correlation id. `validarFicha` devolve `ok`, `pontosGastos`, `pool`, `pa`, `pm`, `pv` ou `ok: false` e `motivos`.

## 3. Diagnóstico

Cada linha é uma diferença entre o código atual e o alvo já escrito nos docs. Path marcado como "a criar" não existe. Não é arquivo encontrado.

| ID | Funcionalidade | Atual | Esperado | Camada | Prioridade | Depende de | Risco | Impacto | Estrutural | Migration | Muda contrato |
|----|----------------|-------|----------|--------|------------|------------|-------|---------|------------|-----------|---------------|
| D1 | Regra da ficha | `validarFicha` cobre pool 10, teto de atributo 5, no máximo 2 desvantagens, pares incompatíveis, Maestria e derivados PA/PM/PV | Manter. O domingo, a segunda e a terça chamam esta função | Testes (já coberto) | — | — | Baixo | Nenhum se ninguém copiar a conta para outro módulo | Não | Não | Não |
| D2 | Catálogo público | Não há HTTP | `GET /fichas-publicas` com fichas `aprovada` | Backend | Alta | D5, D6 | Médio | Novo processo Nest | Sim: criar `apps/api` | Sim: tabela nova, base vazia | Contrato novo |
| D3 | Home | Não há Next | `/` em Server Component: nome, conceito, P/H/R, PA/PM/PV, sem JS de cliente nessa lista | Frontend | Alta | D2, D7 | Médio | Novo app | Sim: criar `apps/web` | Não | Consome D7 |
| D4 | Campos de exibição | `Ficha` não tem nome nem conceito | A lista pública e o seed precisam dos dois | Integração | Alta | D7 | Médio | Entidade de inscrição, não a função pura | Sim, na entidade nova | Sim | Sim |
| D5 | Postgres | Sem compose e sem cliente SQL | Compose sobe Postgres; a API grava a inscrição | Banco | Alta | — | Médio | Volume novo, sem dado legado | Sim | Sim | Não |
| D6 | Workspace | `package.json` só inclui `packages/*` | `apps/*` precisa entrar no workspace para `npm run typecheck` e `npm test` da raiz enxergarem os apps | Infraestrutura/CI | Alta | — | Médio | Sem isso, a CI continua verde e não compila o app novo | Sim, uma linha de workspace | Não | Não |
| D7 | Contrato da lista | Não há request/response | JSON público definido na seção 4 antes de codar o controller e a página | API/contrato | Alta | D4 | Alto se cada lado inventar um campo | Trava D2 e D3 | Não | Não | Sim |
| D8 | Seed | Não há dado | Duas fichas originais com status `aprovada` | Banco | Alta | D4, D5, D7 | Baixo | Só dado de demo | Não | O seed acompanha a migration | Não |
| D9 | Login | Não há IdP nem cookie | Keycloak no Compose, Authorization Code + PKCE, sessão em cookie httpOnly no Next | Segurança | Alta | D3 | Alto | BFF novo | Sim | Não | Sim |
| D10 | Inscrição | Não há `POST` | `POST /inscricoes` com Bearer, grava `submetida`, enfileira `validar-ficha`, 401 se o token é inválido | Backend + segurança | Alta | D2, D9, D11 | Alto | Persiste ficha de jogador | Não, se a tabela de D2 já existir | Colunas de dono e status entram na tabela de D2 | Sim |
| D11 | Formulário | Não há rota | `/fichas/nova` logada; sem login, redireciona | Frontend + segurança | Alta | D9, D10 | Médio | Página nova | Não além de `apps/web` | Não | Consome D10 |
| D12 | Fila | Não há Redis nem BullMQ | Redis sobe na onda 3 para o POST publicar `validar-ficha`. O worker, na onda 4, muda `submetida` → `em_processamento` → `aprovada` ou `recusada` | Backend | Alta | D10 | Médio | Worker no mesmo projeto Nest | Sim: Redis no compose | Coluna de motivos, se ainda não existir | Não no HTTP de entrada |
| D13 | Dono | Não há `sub` | Leitura e alteração só do dono do `sub` | Segurança | Alta | D10 | Alto | Autorização | Não | Coluna `sub` | Sim |
| D14 | Correlation id | Não há log estruturado | Id na linha, no log da API, no log do worker e no header da resposta do POST | Backend | Média | D10, D12 | Médio | Observabilidade da demo | Não | Coluna | Header novo |
| D15 | Tela de status | Não há página | A terça pede a tela com status e motivos. Nenhum doc nomeia método nem path | Integração | Alta | D12, D13 | Alto se o path for inventado na hora de codar | Bloqueia a demo da terça | Não | Não | Sim, path ainda em aberto (seção 12) |
| D16 | Teste do caso de uso | Os 7 testes cobrem a função pura. Não há serviço de inscrição | Teste Jest do caso de uso, sem Keycloak e sem fila, quando `apps/api` existir (`docs/02-estrategia-testes.md`) | Testes | Alta | D10, D12 | Baixo | Não substitui o spec atual | Não | Não | Não |
| D17 | CI dos apps | Workflow só exercita o que é workspace com script | Apps novos expõem `typecheck` e, se tiverem teste, `test`. Job novo no workflow só se o fan-out da raiz não bastar | Infraestrutura/CI | Média | D6 | Médio | Lint da raiz já é `eslint .` e passará a ver os arquivos novos | Não | Não | Não |
| D18 | README da demo | README só fala da pipeline | Desenho browser → Next → Nest → Postgres → Redis → worker | Documentação | Média | D3, D9, D12 | Baixo | Quarta | Não | Não | Não |
| D19 | Segredos | `.env.example` não existe. `.gitignore` já preserva esse nome | Exemplo sem segredo real. `.env` continua fora do Git | Infraestrutura | Média | D5, D9 | Médio | Keycloak e Postgres de demo | Não | Não | Não |
| D20 | ESLint com TSX | `projectService` está restrito a `**/*.ts` | Next usa TSX. Ajustar o ESLint só se `npm run lint` falhar ao entrar `apps/web` | Infraestrutura | Baixa | D3 | Médio | Pode quebrar o job Lint | Não | Não | Não |

`validarFicha` já implementa os pares Ágil/Atrapalhado, Carismático/Antipático, Forte/Fracote, Vigoroso/Frágil, Resoluto/Indeciso e Gênio/Tapado. O spec cobre um par (Ágil/Atrapalhado), pool, atributo acima de 5, Maestria, duas desvantagens e a terceira. Isso coincide com a lista de `docs/02-estrategia-testes.md`. Não há onda para reescrever a regra.

Fora do corte, por `docs/01-mapa-arquitetura.md`: rolagem, combate, PDF e app mobile. Não entram em onda.

## 4. Arquitetura afetada

### Frontend

Não há `app/`, `pages/`, `components/`, `hooks/`, `services/`, contexto, store, middleware de Next nem teste de componente.

A criar na onda 3 e na onda 4, dentro de `apps/web` (diretório nomeado em `docs/01-mapa-arquitetura.md`):

- Server Component da rota `/` lendo `GET /fichas-publicas`.
- Rotas de login (início do Authorization Code, callback, cookie httpOnly).
- Página `/fichas/nova`.
- Página de status, depois que o path de D15 estiver fechado.
- Tipo local do JSON público. Não criar `packages/contracts`: o único pacote existente é `@victory/rules`, e a fronteira dele proíbe DTO HTTP.

Não há consumidor atual para quebrar. O impacto é o app novo e o workspace (D6).

### Backend

Não há `src/modules`, controller, service, DTO, entity, repository, guard, pipe, filter nem teste de API.

A criar em `apps/api`:

- `GET /fichas-publicas` sem autenticação (página pública em `docs/01-mapa-arquitetura.md`).
- `POST /inscricoes` com JWT conferido na JWKS (emissor, audiência, expiração), como em `docs/03-definition-of-done.md`.
- Publicação do job `validar-ficha` e worker que chama `validarFicha` de `@victory/rules`.
- Log com o mesmo correlation id.
- `GET /inscricoes/:id` com o mesmo JWT. Só a linha cujo `sub` é o do token. Ausente ou de outro dono: 404. Página `/fichas/:id`.

A regra não muda de arquivo. O Nest depende de `@victory/rules`; `packages/rules` não depende do Nest.

### API/contrato

Não há chamada HTTP no código. O contrato abaixo é decisão deste plano, alinhada aos campos que os docs já pedem. Implementar esse JSON. Não acrescentar campo fora desta tabela sem atualizar este arquivo.

`GET /fichas-publicas`

| Item | Valor |
|------|--------|
| Auth | Nenhuma |
| Sucesso | 200, `application/json`, array |
| Item | `nome`, `conceito`, `poder`, `habilidade`, `resistencia`, `pa`, `pm`, `pv` |
| Filtro | Somente status `aprovada` |
| Paginação, ordenação, upload | Não pedidos nos docs. Não incluir |

`pa`, `pm` e `pv` saem de `validarFicha`. A API não recalcula com outra fórmula. Nome e conceito são colunas da inscrição, porque não existem em `Ficha`.

`POST /inscricoes`

| Item | Valor |
|------|--------|
| Auth | `Authorization: Bearer`. Cookie de sessão não é enviado ao Nest |
| Body | Campos de `Ficha` mais `nome` e `conceito` (D4) |
| Sucesso | 201, corpo com `id` e `status: "submetida"` |
| Header | `x-correlation-id`, o mesmo valor da coluna, do log e da página |
| Token inválido, expirado ou de outro client | 401, sem corpo com segredo |
| Dono | `sub` do token, não um campo do body |

`GET /inscricoes/:id`

| Item | Valor |
|------|--------|
| Auth | `Authorization: Bearer`. Cookie de sessão não é enviado ao Nest |
| Sucesso | 200, `id`, `nome`, `conceito`, `status`, `motivos`, `correlationId` |
| Header | `x-correlation-id`, igual a `correlationId` e ao log do worker |
| Ausente ou `sub` de outro dono | 404 |
| Página | `/fichas/:id` |

Status persistido: `submetida`, `em_processamento`, `aprovada`, `recusada`. Motivos só na recusa, copiados de `ResultadoFicha.motivos`.

O formulário de `/fichas/nova` em `.skills/incremento-do-plano.md` lista atributos, perícias, vantagens, desvantagens e pontos restantes. Não lista nome nem conceito. A home do domingo exige os dois. O body do POST inclui os dois para a ficha aprovada poder aparecer na lista. Isso fecha D4.

### Banco

Não há schema. Uma tabela de inscrição, criada na onda 1, com colunas para o contrato inteiro (nome, conceito, atributos, perícias, vantagens, desvantagens, status, `sub` nulo no seed, correlation id, motivos). Seed de domingo preenche duas linhas `aprovada`. Evita migration só para acrescentar `sub` na segunda.

Não há dado de produção. Não há migração de dado legado.

### Testes

| Existente | Papel |
|-----------|--------|
| `packages/rules/src/validar-ficha.spec.ts` | Regressão da regra. Não mover para `apps/api`. Não exigir Docker |

A criar:

| Teste | Onde | Quando |
|-------|------|--------|
| Caso de uso aprova / recusa com repositório e fila falsos | `apps/api`, script `test` no package do app | Onda 5, depois do serviço existir |
| Nenhum E2E de browser | — | `docs/02-estrategia-testes.md` deixa browser de fora |

Não há Playwright, Cypress nem Vitest no repo. Não introduzir.

### Infraestrutura

Compose nomeado nos docs, arquivo ausente. Serviços: `web`, `api`, `postgres`, `redis`, `keycloak`. Realm `victory`, client público `victory-web` com PKCE, usuário `jogador`.

Domingo sobe `postgres`, `api` e `web`. Keycloak e Redis entram na onda 3, porque o POST publica o job. O processo que consome o job entra na onda 4.

CI atual não constrói imagem. Permanece assim: o teste da regra e o do caso de uso rodam com Jest, sem Docker (`docs/02-estrategia-testes.md`).

Não há Prettier no repositório. Não adicionar.

## 5. Dependências

```text
D1 (regra pronta)
  └─ D6 workspace
       └─ D5 Postgres + D7 contrato da lista
            └─ D2 GET + D8 seed + D4 colunas nome/conceito
                 └─ D3 home
                      └─ D9 Keycloak + cookie
                           └─ D10 POST + Redis para publicar o job + D11 formulário + D13 sub
                                └─ D12 worker (consome o Redis da onda 3) + D14 correlation id
                                     └─ D15 tela de status (path fechado antes)
                                               └─ D16 teste do caso de uso
                                                    └─ D17 CI vê os apps
                                                         └─ D18 README
```

D19 (`.env.example`) acompanha a primeira onda que sobe Compose.

D20 só acontece se o lint falhar.

Independentes entre si, desde que D1 não seja editado: nada. O pacote de regras pode ficar intocado enquanto a onda 1 cria a API.

## 6. Ondas de implementação

### Onda 0 — Baseline

Objetivo: partir do estado lido nesta auditoria, sem editar produção.

Escopo: conferir a árvore, os 7 testes e a ausência de `apps/`. Nenhuma alteração de código nesta onda. Ela já foi executada como diagnóstico.

Arquivos lidos: os da seção 2.

Alteração esperada: nenhuma.

Dependências: nenhuma.

Riscos: tratar `docs/01-mapa-arquitetura.md` como se `apps/` já existisse. Evidência em contrário: glob do repositório e a busca da seção 2.

Testes: `npm test` já passou (7/7). Não criar teste novo.

Critérios de aceite:

- Árvore sem `apps/web`, `apps/api` e `docker-compose.yml`.
- `validarFicha` e o spec continuam os únicos artefatos de produção e de teste.
- Este arquivo existe e os itens de implementação estão "Não iniciado".

### Onda 1 — Backend da lista pública

Objetivo: `GET /fichas-publicas` lendo Postgres, com o JSON da seção 4.

Escopo:

- Incluir `apps/*` em `workspaces` de `package.json` (D6).
- Criar `apps/api` (NestJS), dependência de workspace em `@victory/rules`.
- Tabela de inscrição com as colunas da seção 4, incluindo `sub`, status e motivos, para a onda 4 não reabrir o schema sem necessidade.
- Seed de duas fichas `aprovada`. A primeira pode repetir os números já usados no spec (Poder 2, Habilidade 2, Resistência 2, Luta, Manha, Forte, Ataque Especial Preciso). Nome, conceito e a segunda ficha: seção 12.
- `docker-compose.yml` com `postgres` e `api`. `.env.example` sem segredo real.
- PA/PM/PV via `validarFicha`, não via fórmula no service.

Arquivos: `package.json` (existe). A criar: `apps/api/**`, `docker-compose.yml`, `.env.example`.

Dependências: onda 0. Contrato da seção 4.

Riscos: ver seção 9. Não escolher dois clientes SQL.

Testes: `npm test` da raiz continua 7/7. Teste de repositório com banco fica de fora desta onda (`docs/02-estrategia-testes.md`).

Critérios de aceite:

- `GET /fichas-publicas` responde 200 com o JSON da seção 4 e só linhas `aprovada`.
- O service chama `validarFicha` para PA, PM e PV.
- `packages/rules` não importa Nest, `pg` nem driver.
- `npm run lint`, `npm run typecheck` e `npm test` passam na raiz.
- Compose sobe API e Postgres. Web ainda não é obrigatório.

### Onda 2 — Frontend da lista pública

Objetivo: a home mostra as duas fichas do seed sem JavaScript de cliente nessa lista.

Escopo: `apps/web` (Next.js App Router). Server Component em `/` busca o GET. Sem hook de data fetching para essa lista. Compose ganha o serviço `web`.

Arquivos a criar: `apps/web/**`. Alterar: `docker-compose.yml` criado na onda 1.

Dependências: onda 1 publicada no contrato da seção 4.

Riscos: D20. A página não revalida pontos com outra regra.

Testes: nenhum teste de browser. Typecheck do app entra pelo workspace.

Critérios de aceite:

- `/` renderiza nome, conceito, P/H/R e PA/PM/PV vindos da API.
- O HTML da lista não depende de componente cliente.
- Os três comandos da raiz passam.
- `docker compose up` mostra as duas fichas.

### Onda 3 — Login e inscrição

Objetivo: jogador autenticado grava `submetida`. Anônimo não acessa `/fichas/nova`. Token inválido recebe 401.

Escopo, nesta ordem interna:

1. Keycloak no Compose (realm, client e usuário já nomeados em `docs/01-mapa-arquitetura.md`).
2. Guard no Nest: JWKS, emissor, audiência, expiração. `sub` vem do token.
3. Redis no Compose. `POST /inscricoes` grava `submetida` e publica o job `validar-ficha`. O worker que consome o job fica na onda 4. Sem Redis, o POST não cumpre o enfileiramento.
4. BFF no Next: PKCE, callback, cookie httpOnly. O Server Component e as route handlers chamam o Nest com o access token.
5. `/fichas/nova` envia o body da seção 4, com pontos restantes na interface. Sem sessão, redireciona para o login.

Arquivos: `apps/api` (guard, controller do POST), `apps/web` (rotas de sessão e página), `docker-compose.yml`, `.env.example`.

Dependências: onda 2. A home pública continua sem auth.

Riscos: seção 9, segurança alta.

Testes: o 401 e o redirect são critério manual desta onda. O teste Jest sem Keycloak é a onda 5. Não apagar o spec da regra.

Critérios de aceite:

- Sem cookie, `/fichas/nova` redireciona.
- Com login, a linha nasce `submetida` e o `sub` é o do token, não o do body.
- Token expirado ou de outro client: 401.
- Sessão não é gravada no Nest.
- Job `validar-ficha` é publicado. Worker ainda não é critério desta onda.
- Lint, typecheck e test da raiz passam.

### Onda 4 — Worker, status e correlation id

Objetivo: a ficha ilegal termina `recusada` com o motivo, e o clique se amarra ao worker pelo mesmo id.

Escopo:

- Worker no mesmo projeto Nest, consumindo o Redis que a onda 3 já subiu.
- Transição `em_processamento`, depois `aprovada` ou `recusada` com `motivos` de `validarFicha`.
- Correlation id gerado no POST, coluna, log da API, log do worker, header da resposta.
- Fechar o path de D15 na seção 12 e só então criar a leitura (filtro por `sub`) e a página que mostra status e motivos.
- Atraso de um segundo só em desenvolvimento se o status intermediário não der tempo de aparecer (`.skills/incremento-do-plano.md`).

Dependências: onda 3. Path de D15 resolvido no início desta onda, antes do código da tela.

Testes: ainda sem Docker no Jest. A prova manual é submeter uma ficha ilegal e ver `recusada`.

Critérios de aceite:

- Ficha ilegal fica `recusada` e a tela mostra o motivo.
- Ficha válida fica `aprovada` e passa a aparecer em `GET /fichas-publicas`.
- O id do header é o id do log do worker.
- Log sem token e sem segredo (`docs/03-definition-of-done.md`).
- Outro `sub` não lê a inscrição (D13).

### Onda 5 — Teste do caso de uso e CI

Objetivo: a regra de inscrição fica provada sem Keycloak, sem Redis e sem Postgres.

Escopo: teste em `apps/api` com repositório e fila falsos. Script `test` no `package.json` do app, para o `npm test` da raiz (`--workspaces --if-present`) incluí-lo. Cenários da seção 8. Não mover esses cenários para dentro de `validar-ficha.spec.ts` se eles passarem a depender de Nest; os que já estão no spec permanecem lá.

Se `apps/api` não tiver o script `test`, a CI não vê o caso de uso. Evidência: `package.json` da raiz delega com `--if-present`.

Dependências: serviço da onda 3 e transição da onda 4, mesmo que o worker real não seja chamado no teste (fila falsa).

Critérios de aceite:

- Os cenários da seção 8 passam com Jest.
- Os 7 testes de `packages/rules` continuam passando.
- Nenhum teste novo sobe container.
- `.github/workflows/ci.yml` só muda se o fan-out não incluir o app. Preferir não criar job quarto.

### Onda 6 — Documentação da demo

Objetivo: o README permite ensaiar os oito minutos sem ler o código para achar o fluxo.

Escopo: atualizar `README.md` com o desenho browser → Next (sessão) → Nest (JWT via JWKS) → Postgres → Redis → worker. Atualizar a seção "No repositório" de `docs/01-mapa-arquitetura.md` para os paths que passaram a existir. Não colar texto do livreto.

Dependências: ondas 2, 3 e 4 concluídas. Pode ser escrita no mesmo dia da onda 5.

Critérios de aceite:

- O README cita os três checks e o fluxo.
- `docs/01-mapa-arquitetura.md` não chama de "alvo" um diretório que já está no tree.
- Lint, typecheck e test passam.
- Rolagem, combate, PDF e mobile continuam de fora.

## 7. Quadro comparativo de acompanhamento

| Onda | Camada | Item | Estado atual | Estado esperado | Arquivos principais | Dependências | Testes | Status |
|------|--------|------|--------------|-----------------|---------------------|--------------|--------|--------|
| 0 | Geral | Baseline do repo | Só `@victory/rules`, CI com 3 jobs, 7 testes verdes | Mesmo estado, usado como partida | `packages/rules/src/validar-ficha.ts`, `packages/rules/src/validar-ficha.spec.ts`, `.github/workflows/ci.yml` | Nenhuma | `npm test` 7/7 nesta sessão | Em análise |
| 1 | Infraestrutura | Workspace `apps/*` | `workspaces` é `packages/*` em `package.json` | `apps/*` incluído | `package.json` | Onda 0 | `npm run typecheck` passa a entrar no app | Não iniciado |
| 1 | Banco | Tabela de inscrição | Sem schema e sem compose | Uma tabela com nome, conceito, ficha, status, `sub`, correlation id, motivos | `docker-compose.yml` (a criar), migration em `apps/api` (a criar) | Onda 0 | Sem teste de banco | Não iniciado |
| 1 | Backend | `GET /fichas-publicas` | Endpoint inexistente | 200, só `aprovada`, PA/PM/PV via `validarFicha` | `apps/api` (a criar) | Contrato da seção 4, tabela | 7 testes atuais intactos | Não iniciado |
| 1 | Banco | Seed | Sem dado | Duas fichas originais `aprovada` | Seed junto da API | Colunas de nome e conceito | Conferência manual no GET | Não iniciado |
| 1 | Infraestrutura | `.env.example` | Arquivo ausente; `.gitignore` já tem `!.env.example` | Exemplo commitado, segredo só no `.env` | `.env.example` (a criar) | Compose | Nenhum | Não iniciado |
| 2 | Frontend | Home `/` | Sem Next | Server Component com nome, conceito, P/H/R, PA/PM/PV | `apps/web` (a criar) | Onda 1 | Sem teste de browser; typecheck do app | Não iniciado |
| 2 | API | Cliente da lista | Sem `fetch` | Um fetch no servidor para o GET da seção 4 | `apps/web` | JSON da seção 4 | Nenhum E2E | Não iniciado |
| 3 | Segurança | Keycloak PKCE | Sem IdP | Realm `victory`, client `victory-web`, usuário `jogador` | `docker-compose.yml` | Onda 2 | Manual: login e 401 | Não iniciado |
| 3 | Segurança | Cookie httpOnly | Sem sessão | Sessão no BFF do Next | `apps/web` | Keycloak | Manual: redirect sem login | Não iniciado |
| 3 | Infraestrutura | Redis | Sem Redis no compose | Redis no ar para o POST publicar o job | `docker-compose.yml` | Onda 2 | Nenhum teste de fila real | Não iniciado |
| 3 | Backend | `POST /inscricoes` | Endpoint inexistente | 201 `submetida`, job `validar-ficha`, 401 se JWT inválido | `apps/api` | Tabela da onda 1, guard JWKS, Redis | Jest do caso de uso fica na onda 5 | Não iniciado |
| 3 | Frontend | `/fichas/nova` | Rota inexistente | Formulário da `Ficha` mais nome e conceito | `apps/web` | POST e cookie | Manual | Não iniciado |
| 4 | Backend | Worker `validar-ficha` | Job publicado na onda 3, sem consumidor | `em_processamento`, depois `aprovada` ou `recusada` com `motivos` | `apps/api` | POST e Redis da onda 3 | Manual com ficha ilegal; Jest na onda 5 | Não iniciado |
| 4 | Backend | Correlation id | Sem log estruturado | Linha, logs e header iguais | POST e worker | Onda 3 | Manual: comparar header e log | Não iniciado |
| 4 | Integração | Tela de status | Path não nomeado nos docs | Leitura só do `sub` e página com status e motivos | Path fechado na seção 12 antes de criar o arquivo | Worker, D13 | Manual | Não iniciado |
| 5 | Testes | Caso de uso sem Docker | Só o spec puro | Aprova, recusa par, recusa pool, duas desvantagens, terceira desvantagem, com dobles | `apps/api` (teste a criar), script `test` do app | Serviço das ondas 3 e 4 | Jest novo + 7 testes antigos | Não iniciado |
| 5 | Infraestrutura | CI enxerga os apps | Workflow não cita `apps/` | Fan-out por workspace; workflow intacto se o script existir | `package.json`, `apps/*/package.json`, `.github/workflows/ci.yml` só se necessário | D6 | `npm run lint`, `typecheck`, `test` | Não iniciado |
| 6 | Documentação | README e mapa | README só tem a pipeline. Mapa marca apps como alvo | Fluxo da demo e mapa igual ao tree | `README.md`, `docs/01-mapa-arquitetura.md` | Ondas 2–4 | Nenhum teste novo | Não iniciado |

## 8. Estratégia de testes

Não há teste de integração, contrato automatizado nem E2E no repositório. A estratégia não cria esses runners.

### Onda 0

Coberto por `validar-ficha.spec.ts`: pool e PA/PM/PV; Ágil com Atrapalhado; 11 pontos com pool 10; duas desvantagens (gastos 11, pool 12); terceira desvantagem; Poder 6; Maestria sem Luta. Não alterar o arquivo nesta onda.

### Onda 1

Regressão: os mesmos 7 testes. Não há teste de GET. Sucesso manual: o array traz as duas seeds e omite qualquer linha que não esteja `aprovada`. Erro manual: ficha do seed que `validarFicha` recusaria não entra no seed.

### Onda 2

Sem teste de componente. Regressão: typecheck do `apps/web` e os 7 testes. Sucesso manual: a home mostra os campos do JSON. Erro manual: API fora do ar não vira lista vazia silenciosa sem sinal de falha (o Server Component precisa falhar de forma visível; não há página de erro no repo para copiar).

### Onda 3

Sucesso manual: login, POST, linha `submetida`. Erro manual: sem cookie há redirect; Bearer inválido há 401; body com `sub` de outro jogador é ignorado. Regressão: `GET /fichas-publicas` segue sem Authorization. O spec da regra não muda.

### Onda 4

Sucesso manual: ficha válida termina `aprovada` e entra no GET público. Erro manual: Ágil com Atrapalhado termina `recusada` com a frase já assertada no spec (`Ágil e Atrapalhado não podem estar na mesma ficha.`). Regressão: correlation id ausente no worker é falha da onda. Autorização: segundo usuário não lê a ficha do primeiro.

### Onda 5

Criar teste de caso de uso (Jest, dobles, sem IO):

- Ficha dentro do pool segue para aprovada.
- Ágil com Atrapalhado segue para recusada com motivo.
- 11 pontos sem desvantagem recusa.
- Duas desvantagens e o ponto extra aprovam.
- Terceira desvantagem recusa.

O spec puro já cobre a matemática. O teste novo cobre a orquestração (status e motivos gravados, job não chama Keycloak). Não duplicar a tabela de custos de vantagem neste teste.

Regressão obrigatória: `npm test` na raiz executa o spec antigo e o teste novo.

### Onda 6

Sem teste novo. Os três comandos da raiz são o gate.

## 9. Riscos e pontos de atenção

| Onda | Risco | Nível | Por quê |
|------|-------|-------|---------|
| 0 | Regressão | Baixo | Nenhum arquivo de produção é editado |
| 1 | Contrato | Alto | Não existe JSON hoje. Se o controller divergir da seção 4, a home da onda 2 quebra |
| 1 | Banco | Médio | Schema novo, base vazia. Não há dado legado para migrar. O risco é abrir uma segunda migration na onda 3 por falta de coluna `sub` |
| 1 | Deploy | Médio | Compose não passa na CI. A demo depende de `docker compose up` local |
| 1 | Compatibilidade | Baixo | Não há cliente antigo do GET |
| 2 | Regressão de front | Baixo | Não há página existente |
| 2 | Compatibilidade ESLint | Médio | `eslint.config.mjs` aplica `projectService` em `**/*.ts`. TSX do Next pode exigir ajuste (D20) só depois da falha real |
| 3 | Segurança | Alto | Não há guard no repo. Errar aqui grava sessão no Nest, aceita JWT sem JWKS ou confia num `sub` vindo do body |
| 3 | Contrato | Alto | POST ainda não existe. Body sem nome/conceito impede a lista pública de mostrar a ficha aprovada |
| 3 | Deploy | Médio | Keycloak no Compose aumenta o arranque da demo. Segredo de client não pode ir para o Git (`.gitignore` já cobre `.env`) |
| 4 | Dados | Baixo | Inscrições são de demo |
| 4 | Contrato | Médio | Path da tela de status não está nos docs. Codar um path sem registrá-lo aqui deixa o BFF e o Nest divergentes |
| 4 | Regressão | Médio | O worker é o único escritor de `aprovada` / `recusada`. Um segundo cálculo fora de `validarFicha` diverge do spec |
| 5 | Regressão de teste | Baixo | O spec atual não precisa mudar. O risco é o script `test` do app faltar e a CI ignorar o caso de uso |
| 6 | Documentação | Baixo | README desatualizado não quebra runtime. Quebra o ensaio da quarta |
| Todas | Copyright | Médio | Kit 3D&T é material da Jambô. Seed e exemplos usam fichas originais. Sem texto do livreto |
| Todas | Performance | Baixo | Volume da demo é duas seeds e poucas inscrições. Sem paginação, por ausência de requisito |

## 10. Critérios gerais de aceite

A implementação inteira fecha quando:

- `GET /fichas-publicas` e a home cumprem a seção 4.
- Login PKCE, cookie httpOnly, `POST /inscricoes` com JWKS e 401.
- Worker usa `validarFicha` e grava o status e os motivos.
- Correlation id atravessa POST e worker.
- A inscrição é do `sub` do token.
- `npm ci`, `npm run lint`, `npm run typecheck` e `npm test` passam, incluindo o caso de uso sem Docker.
- README tem o fluxo da demo.
- `packages/rules/src/validar-ficha.spec.ts` continua cobrindo os sete casos atuais.
- Nenhum item fora do corte (rolagem, combate, PDF, mobile) foi adicionado.

## 11. Ordem recomendada de execução

1. Onda 0 — já diagnosticada. Não reimplementar a regra.
2. Onda 1 — sem tabela e sem GET, a home não tem o que renderizar.
3. Onda 2 — depende do JSON real da onda 1.
4. Onda 3 — o POST grava na tabela da onda 1 e a página vive no app da onda 2. O guard vem antes do BFF.
5. Onda 4 — o worker consome o job que a onda 3 publica. O path de status é decidido no começo desta onda.
6. Onda 5 — o teste do caso de uso precisa do serviço já existente para não nascer acoplado a Docker.
7. Onda 6 — documenta o que já sobe, não o alvo.

A onda 6 pode ser commitada junto da onda 5. As ondas 1 e 2 não podem trocar de ordem. A onda 4 não começa antes do POST.

## 12. Pendências

Confirmar no início da onda citada, antes de criar o arquivo. Nenhuma está resolvida no código.

| Pendência | Bloqueia | O que falta |
|-----------|----------|-------------|
| Nome, conceito e atributos da segunda ficha de seed. A primeira pode usar os números do spec (Poder 2, Habilidade 2, Resistência 2, Luta, Manha, Forte, Ataque Especial Preciso), que não têm nome | Onda 1 | Dois nomes e dois conceitos originais, sem texto do livreto |
| Nome do header de correlation id | Onda 4 | Fechado: `x-correlation-id` no POST, no `GET /inscricoes/:id`, no log da API, no log do worker e na página |
| Método e path da leitura autenticada da inscrição | Onda 4 | Fechado: `GET /inscricoes/:id`, Bearer, filtro por `sub`. Ausente ou de outro dono: 404. Página `/fichas/:id` |
| Cliente SQL | Onda 1 | O repo não tem ORM nem `pg`. Escolher um cliente e ficar nele |
| Ajuste de ESLint para TSX | Onda 2 | Só se `npm run lint` falhar. Não antecipar a mudança |

---

# Plano de Ação — Autenticação, Dashboard e Gestão do Usuário

Diagnóstico em 2026-10-03. Esta parte não substitui o plano da demo acima e não renumera as seções 1 a 12. Nenhuma onda abaixo foi implementada. Nenhum código, teste ou configuração foi alterado nesta execução.

## 1. Objetivo

A entrada da aplicação passa a exigir sessão. Depois do login, a pessoa vê um painel com três entradas: Nova ficha, Meus personagens e Minha conta. Nome e sobrenome aparecem no cabeçalho, com a imagem em círculo. A sidebar existe em todas as telas autenticadas, exceto nesse painel. O fluxo atual de Keycloak, cookie `sessao` e `JwtGuard` é estendido. Não se cria um segundo login.

## 2. Requisitos funcionais

1. A primeira tela exige autenticação.
2. Depois do login, abre um painel inicial.
3. O painel tem cards para Nova ficha, Meus personagens e Minha conta.
4. Meus personagens lista o que a pessoa criou e o que já é público pelas regras que o código já tem, ou por regra ainda não escrita.
5. Minha conta edita nome, sobrenome, imagem e senha.
6. Nome e sobrenome ficam no canto superior direito depois do login.
7. A imagem fica ao lado do nome, em círculo.
8. Toda tela autenticada, menos o painel, tem sidebar.
9. A sidebar repete Nova ficha, Meus personagens e Minha conta.
10. A navegação respeita autenticação e autorização.
11. URL direta de área protegida, sem sessão, não abre a área.
12. O login existente é estendido, não duplicado.

## 3. Contexto

A demo já está em `apps/web` e `apps/api`. A identidade mora no Keycloak, realm `victory`, arquivo `apps/keycloak/victory-realm.json`. O Next guarda só o access token no cookie httpOnly `sessao`. O Nest não tem tabela de usuário. A ficha é a linha `inscricoes`, dono na coluna `sub`.

O plano acima, da inscrição, descreve o alvo da demo e está desatualizado no preâmbulo (ainda diz que `apps/` não existe). O código desta data é a fonte desta parte.

## 4. Diagnóstico

| Requisito | Estado atual | Estado esperado | Diferença | Camada | Arquivos | Dependências |
|-----------|--------------|-----------------|-----------|--------|----------|--------------|
| Login obrigatório na entrada | `/` em `apps/web/src/app/page.tsx` é pública e lista fichas aprovadas sem cookie | A primeira tela pede sessão | A home deixa de ser anônima | Frontend | `apps/web/src/app/page.tsx`, `apps/web/src/app/api/sessao/callback/route.ts` | Cookie `sessao` já existe |
| Dashboard | Não há rota de painel. O callback redireciona para `/fichas/nova` | Painel com três cards depois do login | Rota e destino do callback ainda não existem | Frontend | `apps/web/src/app/api/sessao/callback/route.ts` | Onda de proteção |
| Nova ficha | `/fichas/nova` existe, exige cookie presente, formulário em `formulario-ficha.tsx` chama `validarFicha` | Card e item de sidebar apontam para esse fluxo | Falta só a entrada no painel e na sidebar | Frontend | `apps/web/src/app/fichas/nova/page.tsx` | Nenhuma API nova |
| Meus personagens | Não há listagem por dono. `GET /inscricoes/:id` lê uma linha se o `sub` bater | Lista das fichas daquele `sub` | Endpoint e página ausentes | Full stack | `apps/api/src/inscricoes.controller.ts`, `apps/api/src/inscricoes.repository.ts` | Coluna `sub` já existe |
| Personagens públicos | `GET /fichas-publicas` devolve só `status = aprovada`, sem id e sem dono. Sementes nascem `aprovada` com `sub` NULL | A área Meus personagens também mostra esse conjunto, se a regra for essa | O JSON público não tem `id`. Não há página de detalhe público | Full stack | `apps/api/src/fichas-publicas.controller.ts`, `apps/api/src/inscricoes.repository.ts` | Regra de “público” ainda é só o status |
| Minha conta | Não há página, DTO nem endpoint de perfil | Formulário de nome, sobrenome, imagem e senha | Tudo a criar. Nome e senha estão no Keycloak, não no Postgres | Full stack | `apps/keycloak/victory-realm.json` | Onda de identidade |
| Avatar | Não há coluna, atributo, upload nem componente | Círculo no cabeçalho, com fallback se não houver imagem | Não há onde gravar o arquivo | Full stack | Nenhum path de avatar | Pendência de armazenamento |
| Alteração de senha | Senha é credencial do Keycloak (`type: password` no realm). O Nest não hasheia senha | A pessoa troca a própria senha | Não há endpoint na API nem política no app | Keycloak + BFF | `apps/keycloak/victory-realm.json` | Sessão atual é só access token |
| Header com usuário | `cabecalho.tsx` mostra “Victory” e “Nova ficha” em todas as rotas, inclusive na home | Nome, sobrenome e avatar à direita, só com sessão | O cabeçalho não lê o token nem o perfil | Frontend | `apps/web/src/app/cabecalho.tsx`, `apps/web/src/app/layout.tsx` | Escopo do token hoje é só `openid` |
| Sidebar | Não existe | Nova ficha, Meus personagens e Minha conta, fora do painel e do login | Layout único hoje embrulha todas as páginas | Frontend | `apps/web/src/app/layout.tsx` | Rotas do painel e da conta |
| Proteção de rotas | `/fichas/nova` e `/fichas/[id]` redirecionam se o cookie `sessao` não tem valor. Não há `middleware.ts`. O valor não é validado no Next | URL protegida sem sessão vai ao login. Sessão expirada também | Cookie presente e token vencido ainda abre a página | Frontend + API | `apps/web/src/app/fichas/nova/page.tsx`, `apps/web/src/app/fichas/[id]/page.tsx`, `apps/api/src/jwt.guard.ts` | `JwtGuard` já recusa Bearer inválido na API |

## 5. Arquitetura atual

### Frontend

App Router em `apps/web/src/app`. Não há `pages/`, `middleware.ts`, hook de sessão, context, store, sidebar nem teste de componente.

Rotas encontradas:

| Rota | Sessão | O que faz |
|------|--------|-----------|
| `/` | Não exige | Server Component. Lê `GET /fichas-publicas` |
| `/fichas/nova` | Cookie `sessao` com algum valor | Formulário. Sem cookie, `redirect("/api/sessao/login")` |
| `/fichas/[id]` | Igual | Painel de status. Sem cookie, o mesmo redirect |
| `GET /api/sessao/login` | Pública | Inicia Authorization Code + PKCE |
| `GET /api/sessao/callback` | Pública | Troca o code e grava `sessao` |
| `POST /api/inscricoes` | Cookie | BFF com Bearer |
| `GET /api/inscricoes/[id]` | Cookie | BFF com Bearer |

O layout raiz (`layout.tsx`) coloca `Cabecalho` e um `main` de no máximo 880px em toda página. O tema está em `apps/web/src/tema/tema.ts`. Card de ficha é `Card` do Material UI usado direto na home, sem componente compartilhado de card de navegação.

Não há logout. O callback, em `apps/web/src/app/api/sessao/callback/route.ts`, manda para `/fichas/nova`. O cookie `sessao` é httpOnly, `sameSite: lax`, `maxAge` igual a `expires_in` do token, senão 300 segundos. O realm define `accessTokenLifespan` 1800. Não há refresh token gravado. O scope pedido em `apps/web/src/app/api/sessao/login/route.ts` é só `openid`.

A página protegida só testa `jar.get("sessao")?.value`. Não chama o Keycloak nem o `JwtGuard`. Token vencido ou lixo ainda renderiza `/fichas/nova` e `/fichas/[id]`. A API responde 401 quando o Bearer falha.

### Backend

Não há `src/modules/`. Há controllers soltos:

- `GET /fichas-publicas` em `fichas-publicas.controller.ts`, sem guard.
- `POST /inscricoes` e `GET /inscricoes/:id` em `inscricoes.controller.ts`, com `JwtGuard`.

`JwtGuard` (`apps/api/src/jwt.guard.ts`) confere assinatura na JWKS, emissor, audiência e `sub`. O request fica com `usuario.sub`. Não lê nome, sobrenome nem imagem. Não há role.

Não há endpoint de usuário atual, perfil, senha, avatar nem listagem das fichas de um `sub`. Não há migration: a tabela nasce no boot em `SCHEMA`, dentro de `inscricoes.repository.ts`. Cliente SQL é `pg`. Não há ORM.

### Autenticação

Keycloak no Compose. Client `victory-web`: público, fluxo padrão, PKCE S256, direct grant desligado, redirect `http://localhost:3001/api/sessao/callback`. `registrationAllowed` é `false`. Usuários importados: `jogador` e `visitante`, com `firstName`, `lastName` e senha no realm. Admin do Compose: `KC_BOOTSTRAP_ADMIN_USERNAME` e `KC_BOOTSTRAP_ADMIN_PASSWORD` em `docker-compose.yml`, valor `admin` / `admin`. Esse admin não é conta da ficha.

Não há recuperação de senha no app. Não há tela de login no Next: o browser vai à página do Keycloak.

Usuário sem cookie em `/fichas/nova` ou `/fichas/[id]` cai em `/api/sessao/login`. A mesma URL em `/` abre a lista. Usuário com cookie válido chega em `/fichas/nova`, não em um painel. Logout não existe. Sessão expirada não é tratada no Next; a API recusa o Bearer.

### Navegação

Um cabeçalho global, sem estado de rota ativa e sem menu mobile próprio. O botão “Nova ficha” aparece também para quem não logou. Não há sidebar. O link da marca aponta para `/`.

### Personagens

Não há entidade Character. A ficha é `inscricoes`: `id`, `nome`, `conceito`, `ficha` jsonb, `status`, `sub`, `correlation_id`, `motivos`. O `sub` identifica o dono. Sementes Lívia e Nuno entram com `sub` NULL e `status` `aprovada`.

Criar: `POST /inscricoes`, dono = `sub` do token, status inicial `submetida`. Ver uma: `GET /inscricoes/:id`, só se `sub` coincidir; senão 404. Não há editar nem excluir pela HTTP. O worker muda status. Não há paginação, filtro nem ordenação na leitura do dono. A lista pública ordena por `nome`.

Público, no código: `status = aprovada` em `listarAprovadas`. Não há coluna público/privado. O JSON de `FichaPublica` não inclui `id` nem `sub`. Quem pode ver a lista pública: qualquer chamada a `GET /fichas-publicas`, sem login.

### Usuário/Conta

Não há tabela de usuário, tela de conta, upload nem alteração de senha. Nome e sobrenome existem só no usuário do Keycloak (`firstName`, `lastName`). A imagem não existe no realm nem no banco. A senha é credencial do Keycloak. O Nest não guarda hash.

## 6. Diferenças identificadas

A diferença de cada requisito está na tabela da seção 4. Problemas achados, sem correção nesta execução:

| Problema | Evidência | Comportamento atual | Comportamento que o requisito pede | Alteração necessária |
|----------|-----------|---------------------|--------------------------------------|----------------------|
| Home anônima | `apps/web/src/app/page.tsx` não lê cookie | `/` lista fichas sem login | A primeira tela exige sessão | Tratar `/` ou uma rota nova como porta autenticada e mandar quem não tem sessão ao login |
| Destino pós-login | `callback/route.ts` redireciona para `/fichas/nova` | Login abre o formulário | Login abre o painel | Trocar o destino do callback quando o painel existir |
| Cookie não é sessão válida | `nova/page.tsx` e `fichas/[id]/page.tsx` só checam o valor do cookie | Token vencido ainda renderiza a página | Área protegida não abre com sessão inválida | Na onda 1, definir se a página valida o JWT ou se 401 do BFF devolve ao login |
| Sem logout | Busca em `apps/web/src` não acha rota de logout | Não há como encerrar | Logout encerra a sessão | Rota que apaga `sessao`. Falta decidir se também encerra a sessão no Keycloak |
| Token sem nome | `login/route.ts` pede `scope=openid`. `JwtGuard` só guarda `sub` | O app não conhece nome nem sobrenome | Cabeçalho mostra os dois | Pedir o que o Keycloak já tem (`firstName`, `lastName`) sem criar usuário paralelo no Postgres, ou registrar a pendência se o scope não bastar |
| Lista do dono inexistente | `InscricoesRepository` não tem `SELECT` por `sub` | Só existe leitura de um id | Meus personagens lista as fichas da pessoa | Novo método e endpoint, com o mesmo filtro de dono do `GET /inscricoes/:id` |
| JSON público sem id | `FichaPublica` em `inscricoes.repository.ts` | A home não consegue abrir uma ficha pública por id | Se o card público tiver destino, o contrato precisa de id | Não inventar o campo nesta etapa. Fechar na onda de personagens |
| Avatar sem armazenamento | Nenhum path de upload, coluna ou atributo | Não há imagem | Círculo no cabeçalho | Bloqueado até escolher onde o arquivo fica |
| Senha fora da API | Credencial só no realm | A aplicação não troca senha | Minha conta troca senha | BFF para a conta do Keycloak, não uma tabela nova de senha no Nest |
| Cabeçalho em toda rota | `layout.tsx` renderiza `Cabecalho` sempre | Login do Keycloak é externo; a home anônima já tem a barra com “Nova ficha” | Login sem sidebar; painel sem sidebar; demais telas com sidebar | Separar layout da área autenticada do layout da entrada |
| Cadastro fechado | `registrationAllowed: false` | Não há auto-cadastro | Minha conta edita quem já existe | Não abrir cadastro público como parte deste plano, salvo decisão nova |

## 7. Contratos Frontend ↔ Backend

Contratos que existem hoje. O que não está na tabela não tem endpoint no repositório.

| Fluxo | Método e path | Auth | Request | Response | Erros |
|-------|---------------|------|---------|----------|-------|
| Lista pública | `GET /fichas-publicas` | Nenhuma | — | Array de `nome`, `conceito`, `poder`, `habilidade`, `resistencia`, `pa`, `pm`, `pv` | Falha de fetch vira alerta na home |
| Criar ficha | `POST /inscricoes` | Bearer, `JwtGuard` | `nome`, `conceito` e campos de `Ficha`. `sub` do corpo é ignorado; vale o do token | 201 `{ id, status: "submetida" }` e header `x-correlation-id` | 400 corpo inválido; 401 token inválido; 500 se a fila falha, e a linha `submetida` é apagada |
| Ler a própria | `GET /inscricoes/:id` | Bearer | — | `id`, `nome`, `conceito`, `status`, `motivos`, `correlationId` e o mesmo header | 404 se o id não existe, se o `sub` não é o dono, ou se não há `correlationId` |
| BFF criar | `POST /api/inscricoes` | Cookie `sessao` | Repassa o JSON | Repassa status e `x-correlation-id` | 401 se não há cookie ou `API_URL` |
| BFF ler | `GET /api/inscricoes/[id]` | Cookie `sessao` | — | Repassa o JSON | 401 nas mesmas condições |
| Login | `GET /api/sessao/login` | Nenhuma | — | Redirect ao Keycloak e cookie `pkce` | 500 se faltar variável |
| Callback | `GET /api/sessao/callback` | Cookie `pkce` | `code`, `state` | Redirect `/fichas/nova` e cookie `sessao` | Redirect de volta ao login se code, state ou token falharem |

Não há contrato para: usuário atual, atualizar nome, atualizar sobrenome, upload de avatar, trocar senha, logout, listar fichas do `sub`, refresh token.

Divergência: o Next trata cookie presente como autenticado; o Nest só aceita JWT válido. As duas camadas não concordam quando o cookie existe e o token não presta.

## 8. Arquitetura afetada

- Next: layout, cabeçalho, rotas novas de painel, conta e lista, callback, eventual logout. Formulário de ficha permanece.
- Nest: leitura das fichas do `sub`, se a lista não for só no BFF com queries que não existem. Não mover sessão para o Nest. Não criar usuário no Postgres enquanto o Keycloak for a fonte do nome e da senha.
- Keycloak: scope ou userinfo para nome e sobrenome; troca de senha e, se a pendência fechar assim, atributo de imagem. `registrationAllowed` continua falso até decisão contrária.
- Postgres: a tabela `inscricoes` já guarda o dono. Avatar e senha não têm coluna. Não adicionar coluna sem a pendência de armazenamento fechada.
- `packages/rules`: sem mudança. `validarFicha` continua a única conta da ficha.
- CI: `.github/workflows/ci.yml` permanece com Lint, Typecheck e Test. Prova de browser continua fora do workflow, como no restante da demo.

## 9. Dependências

```text
Cookie sessao e JwtGuard (já existem)
        │
        ▼
Onda 1  entrada exige sessão, destino do login, logout, sessão vencida
        │
        ▼
Onda 2  nome e sobrenome vindos do Keycloak; senha; avatar só depois da pendência
        │
        ├── Onda 3  cabeçalho com identidade e sidebar
        │
        └── Onda 4  painel com os três cards
                │
                ├── Onda 5  Meus personagens (lista do sub + lista aprovada já existente)
                │
                └── Onda 6  Nova ficha só como entrada; o formulário já existe
```

A onda 3 pode começar o desenho do layout com fallback de nome, mas o cabeçalho real depende da onda 2. A onda 5 depende da decisão sobre o que é público e se o JSON público ganha `id`. A onda 6 não espera endpoint novo.

## 10. Ondas de implementação

Nenhuma onda abaixo está em implementação. A onda 0 é este diagnóstico.

### Onda 0 — Baseline

Escopo: este texto. Confirmar Keycloak + cookie + `JwtGuard`, home pública, ausência de conta, sidebar, avatar e listagem por dono.

Critério de aceite: o diagnóstico cita path real. Nenhuma onda de código marcada como concluída.

Testes: não rodar suíte nesta execução. Os testes já existentes continuam os de `packages/rules` e `apps/api/src/processar-validacao.spec.ts`.

Risco: baixo. Só documentação.

Confirmado em 2026-10-03, antes da onda 1: o código continua com Keycloak, cookie `sessao`, `JwtGuard`, home então pública, e sem conta, sidebar, avatar ou listagem por dono. Status desta onda: concluída como diagnóstico, sem código novo.

### Onda 1 — Autenticação e proteção

Escopo: a primeira rota do app exige sessão. Quem não tem cookie em rota protegida vai a `/api/sessao/login`. O callback passa a abrir o painel quando ele existir; até lá, o destino novo fica nomeado nesta onda e não pode continuar só `/fichas/nova` no fim dela. Logout apaga `sessao`. Tratar cookie presente com token recusado pela API (401 leva de volta ao login). Não criar outro client nem outro cookie de access token.

Fora: nome, avatar, sidebar, conta, lista de personagens.

Critério de aceite: `/`, ou a rota que ficar como entrada, não renderiza área autenticada sem sessão. `/fichas/nova` e `/fichas/[id]` continuam exigindo sessão. URL direta sem cookie redireciona. Logout remove o cookie. `GET /fichas-publicas` pode continuar público na API; o requisito fala da primeira tela, não de fechar esse GET.

Testes: não há teste de browser. A prova é manual, no mesmo estilo da demo. Não enfraquecer o `JwtGuard`.

Risco: alto em autorização, porque a checagem atual é só a presença do cookie.

Decisão aplicada: até existir o painel, o callback abre `/`. `exigirSessao` em `apps/web/src/auth.ts` recusa cookie ausente, malformado ou com `exp` vencido e manda para `/api/sessao/login`. A assinatura do JWT continua só no `JwtGuard`. Se o Nest responde 401, o BFF apaga `sessao` e o formulário ou o painel de status navegam ao login. `GET /api/sessao/logout` apaga `sessao` e `pkce`.

### Onda 2 — Identidade e Minha conta

Escopo: ler `firstName` e `lastName` do usuário já existente no Keycloak, sem tabela de usuário no Nest. Página Minha conta edita esses dois campos e a senha na fonte que já guarda os dois, o Keycloak, via BFF. Senha atual continua obrigatória até o Keycloak dizer o contrário; o app não define política nova. Não há recuperação de senha no código: fica fora, salvo pendência explícita.

Avatar: não implementar o upload nesta onda enquanto a pendência de armazenamento estiver aberta. A tela pode reservar o círculo com fallback, sem gravar arquivo.

Critério de aceite: nome e sobrenome editados reaparecem no cabeçalho na próxima leitura. Senha nova passa a valer no próximo login Keycloak. Senha rejeitada não altera a credencial. Um `sub` não altera outro. Token e senha não aparecem em log.

Testes: prova manual com `jogador`. Não há spec de perfil.

Risco: alto em senha e em sessão, porque não há refresh token. Trocar a senha pode invalidar a sessão do Keycloak e deixar o cookie do Next órfão.

Decisão aplicada: a rota é `/conta`. O BFF lê e grava `firstName` e `lastName` em `GET`/`POST {interno}/realms/{realm}/account` e a senha em `POST .../account/credentials/password`, sempre com a senha atual. O realm passa `manage-account` e `view-profile` do client `account` para `jogador` e `visitante`. O círculo mostra iniciais; não há upload.

### Onda 3 — Layout autenticado

Escopo: cabeçalho com marca à esquerda e, à direita, imagem circular mais nome e sobrenome. Sem imagem, fallback visível, sem inventar arquivo. Sidebar só nas rotas autenticadas que não são o painel: Nova ficha, Meus personagens, Minha conta, e a já existente `/fichas/[id]` se ela permanecer no fluxo. Item ativo segue a rota. Em largura estreita, a sidebar não pode cobrir o formulário; o comportamento exato (drawer ou lista) usa o Material UI já presente, sem biblioteca nova de menu.

O layout raiz deixa de forçar o mesmo cabeçalho anônimo em todas as rotas.

Critério de aceite: painel sem sidebar. Login do Keycloak continua a página do próprio Keycloak, sem sidebar do Next. As outras telas autenticadas têm os três itens. O cabeçalho não mostra nome sem sessão.

Testes: prova visual desktop e largura estreita. Não há teste de componente.

Risco: médio de regressão no formulário, que hoje cabe em 880px.

Decisão aplicada: o grupo `(area)` não muda a URL. O painel fica em `/` com cabeçalho e sem sidebar. `/fichas/nova`, `/fichas/[id]` e `/conta` usam cabeçalho, avatar com iniciais e sidebar. Em largura estreita a sidebar é um drawer.

### Onda 4 — Painel

Escopo: rota inicial pós-login com três cards. Nova ficha aponta para `/fichas/nova`. Meus personagens e Minha conta apontam para as rotas das ondas 5 e 2. Sem sidebar nesta rota. Reutilizar `Card` do Material UI. Não duplicar a regra da ficha no card.

Critério de aceite: depois do login a pessoa vê os três cards e cada um navega. A rota não abre sem sessão.

Testes: prova manual do redirect do callback.

Risco: baixo, se a onda 1 já trocou o destino.

Decisão aplicada: o painel é `/`, o destino que o callback já abre. Os três cards vão a `/fichas/nova`, `/fichas` e `/conta`. Esta rota não usa a sidebar.

### Onda 5 — Meus personagens

Escopo: listar linhas cujo `sub` é o do token, em qualquer status já gravado (`submetida`, `em_processamento`, `aprovada`, `recusada`). Abrir a própria continua em `/fichas/[id]`. Não criar editar nem excluir: a HTTP atual não tem esses métodos.

Públicos: reutilizar `GET /fichas-publicas` (só `aprovada`). Sementes com `sub` NULL entram nessa lista porque o código as trata como aprovadas, não como “minhas”. Não há outra definição de público no repositório. Se o card público precisar de uma página, o contrato tem de ganhar `id` antes; hoje `FichaPublica` não tem. Isso é pendência, não campo inventado.

Critério de aceite: `jogador` vê as fichas que ele enviou e não vê a de `visitante`. A lista pública não mostra `submetida` nem `recusada`. Estado vazio e erro de carga aparecem. Loading aparece enquanto a lista não voltou.

Testes: estender o caso de uso em `apps/api` só se a listagem for função pura sobre repositório falso, no mesmo estilo de `processar-validacao.spec.ts`. Não subir Docker na CI.

Risco: alto se a lista do dono esquecer o filtro de `sub`, ou se o JSON público passar a incluir ficha não aprovada.

Decisão aplicada: `GET /inscricoes` filtra `WHERE sub = $1`. A página é `/fichas`. O card público não tem link, porque `FichaPublica` continua sem `id`. Sementes com `sub` nulo aparecem só na lista aprovada.

### Onda 6 — Nova ficha

Escopo: o card e a sidebar entram no fluxo que já existe. O formulário, o `POST /inscricoes` e o `validarFicha` permanecem. Personagem criado continua associado ao `sub`. Não reimplementar o pool.

Critério de aceite: enviar uma ficha ainda gera `submetida` e abre `/fichas/[id]`. Ficha ilegal ainda pode ser enviada, para o worker recusar. Ágil com Atrapalhado continua com o motivo já coberto pelo spec.

Testes: os sete de `packages/rules` e os cinco de `processar-validacao.spec.ts` seguem verdes sem mudança de comportamento.

Risco: baixo, se a onda não reescrever o formulário.

Decisão aplicada: o formulário em `/fichas/nova` não foi reescrito. O card do painel e o item da sidebar já apontam para essa rota. O envio continua criando `submetida` e abrindo `/fichas/[id]`.

### Onda 7 — Prova integrada

Não há E2E no repositório. Esta onda não cria framework novo. Ela junta a prova manual e os comandos já existentes.

Escopo: usuário sem cookie, login, URL direta, painel, sidebar, cabeçalho, conta, senha, lista própria, lista aprovada, nova ficha, logout, 401 com token vencido. `npm run lint`, `npm run typecheck`, `npm test`. Sem job novo no workflow.

Critério de aceite: os três checks verdes. A prova manual cobre a lista da seção 15. `packages/rules` não importa Next nem Nest.

Risco: médio se a prova manual pular o caso de outro `sub`.

## 11. Quadro comparativo de acompanhamento

| Onda | Funcionalidade | Camada | Estado atual | Estado esperado | Arquivos principais | Dependências | Testes | Risco | Status |
|------|----------------|--------|--------------|-----------------|---------------------|--------------|--------|-------|--------|
| 0 | Baseline | Geral | Home pública, login só em `/fichas/nova` e `/fichas/[id]`, sem conta nem sidebar | Diagnóstico citado em path real | `docs/plano-acao-implementacao.md` | Código em `apps/web` e `apps/api` | Nenhum nesta execução | Baixo | Concluído |
| 1 | Autenticação | Full stack | Cookie presente libera a página; callback vai a `/fichas/nova`; sem logout | Entrada exige sessão; logout apaga `sessao`; 401 volta ao login | `apps/web/src/app/page.tsx`, `apps/web/src/app/api/sessao/callback/route.ts`, `apps/web/src/app/fichas/nova/page.tsx` | Fluxo PKCE já existente | Prova manual | Alto | Concluído |
| 2 | Minha conta | Full stack | Nome e senha só no Keycloak; sem avatar e sem endpoint | Editar nome, sobrenome e senha na fonte já existente; avatar bloqueado até a pendência | `apps/keycloak/victory-realm.json`, `apps/web/src/app/api/sessao/login/route.ts` | Onda 1; pendência do arquivo de imagem | Prova manual com `jogador` | Alto | Concluído |
| 3 | Layout | Frontend | `Cabecalho` global sem usuário; sem sidebar | Nome e avatar à direita; sidebar fora do painel | `apps/web/src/app/layout.tsx`, `apps/web/src/app/cabecalho.tsx`, `apps/web/src/tema/tema.ts` | Onda 2 para o nome real | Prova visual | Médio | Concluído |
| 4 | Painel | Frontend | Não existe; login abre `/fichas/nova` | Três cards, sem sidebar | `apps/web/src/app/api/sessao/callback/route.ts` e rota nova ainda sem path | Ondas 1 e 3 | Prova manual | Baixo | Concluído |
| 5 | Personagens | Full stack | Pública = `aprovada`, sem id no JSON; dono só em `GET /inscricoes/:id` | Lista do `sub` e lista aprovada já definida | `apps/api/src/inscricoes.repository.ts`, `apps/api/src/fichas-publicas.controller.ts` | Onda 1; pendência do `id` público | Caso de uso sem Docker, se a lista for função testável | Alto | Concluído |
| 6 | Nova ficha | Full stack | Fluxo completo até `submetida` | O mesmo fluxo, aberto pelo card e pela sidebar | `apps/web/src/app/fichas/nova/formulario-ficha.tsx`, `apps/api/src/inscricoes.controller.ts` | Ondas 3 e 4 | Specs atuais de regra e caso de uso | Baixo | Concluído |
| 7 | Prova integrada | Full stack | Jest da regra e do caso de uso; sem E2E | Lint, typecheck, test e prova manual do fluxo novo | `.github/workflows/ci.yml` sem edição | Ondas 1 a 6 | Os comandos da raiz | Médio | Não iniciado |

## 12. Estratégia de testes

Não há teste de página, middleware nem E2E. Não propor suíte nova de browser dentro do CI nesta etapa.

| Área | Já existe | Ajustar | Criar só se a onda mudar comportamento | Sucesso | Erro / autorização |
|------|-----------|---------|----------------------------------------|---------|-------------------|
| Regra da ficha | `packages/rules/src/validar-ficha.spec.ts`, 7 casos | Não | Não | Pool, pares, Maestria | Ficha ilegal |
| Caso de uso | `apps/api/src/processar-validacao.spec.ts`, 5 casos | Não, se a onda 6 não mudar `processarValidacao` | Lista por `sub`, se nascer função pura | `aprovada` / `recusada` | Outro `sub` não entra na lista |
| Login | Nenhum automatizado | — | Prova manual | `jogador` abre o painel | Sem cookie, URL de ficha volta ao login |
| Sessão vencida | Nenhum | — | Prova manual | — | Cookie inválido não permanece na área protegida |
| Logout | Nenhum | — | Prova manual | Cookie some | Rota protegida volta a redirecionar |
| Perfil | Nenhum | — | Prova manual | Nome e sobrenome mudam e aparecem no cabeçalho | Um usuário não grava o nome do outro |
| Senha | Nenhum no app | — | Prova manual | Senha nova entra no Keycloak | Senha recusada não troca a credencial |
| Avatar | Nenhum | — | Só depois da pendência | Imagem no círculo | Tipo ou tamanho recusado não grava; sem imagem, fallback |
| Personagens | Lista pública sem teste HTTP | — | Caso de uso da lista do dono | Dono vê as suas; pública só `aprovada` | `visitante` não lê ficha de `jogador`; vazio e erro de carga |
| Navegação | Nenhum | — | Prova visual | Card e sidebar abrem a mesma rota; item ativo; painel sem sidebar | Largura estreita não esconde o formulário |

## 13. Riscos e pontos de atenção

| Risco | Nível | Por quê |
|-------|-------|---------|
| Cookie presente tratado como login | Alto | `nova/page.tsx` não valida o JWT. A área abre até a API responder 401 |
| Lista do dono sem filtro de `sub` | Alto | Vazaria ficha de outra pessoa. O `GET /inscricoes/:id` já devolve 404 quando o `sub` não bate |
| “Público” alargado além de `aprovada` | Alto | Hoje `submetida` e `recusada` ficam de fora de `listarAprovadas`. Mudar isso expõe ficha não aceita |
| Troca de senha | Alto | A senha não está no Nest. Um endpoint local duplicaria o Keycloak e criaria outro hash |
| Upload de avatar | Alto | Não há armazenamento, limite nem tipo aceito. Gravar no Postgres ou no disco sem decisão vaza arquivo ou estoura a demo |
| Sessão órfã depois da troca de senha | Médio | Só existe access token no cookie, sem refresh e sem logout no Keycloak |
| Regressão da home pública | Médio | `/` hoje é a lista anônima da demo. Passar a exigir login muda o ensaio da home |
| Contrato da ficha pública | Médio | Incluir `id` muda o JSON que a home já consome |
| Layout único | Médio | Sidebar no `layout.tsx` atual apareceria também no painel e em qualquer rota nova |
| UX do nome ausente | Médio | Scope `openid` não traz `firstName`. O cabeçalho ficaria vazio se a onda 3 sair antes da onda 2 |
| CI | Baixo | Não há teste de página. A onda 7 não deve ganhar job novo para esconder falha |
| Banco | Baixo para a lista do dono | A coluna `sub` já existe. Alto se avatar ou senha ganharem coluna sem pendência fechada |

## 14. Critérios de aceite por onda

Os critérios de cada onda estão na seção 10. Resumo objetivo por funcionalidade, para a prova da onda 7:

- Autenticação: sem cookie, a área privada redireciona; com login, o painel abre; logout apaga `sessao`; token recusado não deixa a pessoa na área protegida.
- Painel: três cards, destinos certos, sem sidebar, utilizável em largura estreita.
- Sidebar: Nova ficha, Meus personagens, Minha conta, rota ativa, ausente no painel.
- Minha conta: nome, sobrenome e senha persistem na fonte já existente; erros aparecem; avatar só com a pendência fechada, e o círculo tem fallback.
- Meus personagens: fichas do `sub`; aprovadas na parte pública; outro `sub` não vê a ficha alheia por id; vazio, loading e erro tratados.
- Nova ficha: o fluxo atual, dono no `sub`, `validarFicha` intacto.

## 15. Critérios gerais de aceite

- Nenhuma onda de código deste plano foi implementada nesta execução.
- `packages/rules` não passa a importar Next, Nest, banco nem Keycloak.
- O access token continua só no cookie httpOnly do Next.
- O Nest continua sem sessão de servidor.
- `GET /inscricoes/:id` continua 404 para outro `sub`.
- `GET /fichas-publicas` continua só com `aprovada`, até uma pendência dizer o contrário.
- Lint, Typecheck e Test da raiz seguem sendo a CI. Sem job de build, deploy ou E2E.
- Segredo de demo não entra em log.

## 16. Ordem recomendada de execução

1. Onda 0 — este diagnóstico.
2. Onda 1 — sem porta autenticada, o painel e a conta nascem públicos.
3. Onda 2 — nome e senha antes do cabeçalho definitivo. Avatar espera a pendência.
4. Onda 3 — layout, com o nome da onda 2.
5. Onda 4 — painel, e o callback passa a apontar para ele.
6. Onda 5 — lista. Fechar o `id` público antes de uma página de detalhe pública.
7. Onda 6 — só liga o fluxo que já existe. Pode ir junto da onda 4 se o destino for `/fichas/nova`.
8. Onda 7 — por último, com as ondas anteriores no ar.

A onda 6 não espera a onda 5. A onda 5 não espera a onda 6.

## 17. Pendências

Nenhuma das linhas abaixo está resolvida no código. A onda citada não começa a parte bloqueada antes de fechar a linha.

| Pendência | Bloqueia | O que o código não diz |
|-----------|----------|------------------------|
| Onde gravar a imagem | Upload e avatar no cabeçalho | Não há coluna, atributo do realm, disco nem URL |
| Logout também encerra a sessão do Keycloak? | Rota de logout | Só existe o cookie `sessao` para apagar |
| O JSON público ganha `id`? | Abrir uma ficha aprovada a partir de Meus personagens | `FichaPublica` não tem `id` |
| “Públicos” dentro de Meus personagens é exatamente `status = aprovada`, incluindo sementes com `sub` NULL? | Onda 5 | A única regra achada é essa. Não há flag público/privado |
| Nome vem de scope `profile`, userinfo, ou outro caminho do Keycloak? | Cabeçalho e Minha conta | O login pede só `openid`. O guard só guarda `sub` |
| Política de senha e se a senha atual é exigida | Formulário de senha | Não há política no app. A credencial é do Keycloak |
| Path do painel, de Meus personagens e de Minha conta | Rotas novas | Não existem. Não foram inventados aqui |
| Recuperação de senha | Fora do requisito implementável | Não há fluxo no app nem no realm importado |
| Auto-cadastro | Fora | `registrationAllowed` é `false` |

## 18. Observações técnicas

- Estender `apps/web/src/auth.ts`, `/api/sessao/login` e `/api/sessao/callback`. Não adicionar NextAuth nem um segundo cookie de token.
- Estender `JwtGuard` só se um endpoint novo precisar do mesmo Bearer. Não validar o token só no Next e deixar o Nest aberto.
- Minha conta não vira módulo de usuário no Nest enquanto nome e senha forem do Keycloak. Um BFF no Next combina com o cookie httpOnly que já existe.
- A sidebar não entra no `layout.tsx` raiz sem um grupo de rotas, senão o painel também a recebe.
- `GET /fichas-publicas` permanece o contrato da ficha aprovada. A tela `/` é que deixa de ser anônima, se a onda 1 confirmar que essa é a primeira tela.
- O plano da demo, nas seções 1 a 12 deste arquivo, fica como registro anterior. Várias frases de lá dizem que o app ainda não existe; o código de `apps/` desmente esse preâmbulo. Esta parte não reescreve aquelas seções.
- Fora deste corte, como já estava no mapa da demo: rolagem, combate, PDF e app mobile.
