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
