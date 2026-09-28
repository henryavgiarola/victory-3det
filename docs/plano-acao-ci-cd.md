# Plano de Ação — Estruturação de Branches e CI/CD

Diagnóstico em 2026-09-27. A onda 1 foi executada em 2026-09-27: `development` está em `origin` no mesmo commit de `main` (`37936f1`). Nenhuma `release/*` foi criada, o workflow não mudou e nenhum commit novo foi feito.

A onda 2 foi concluída em 2026-09-27, com o repositório público. Rulesets ativos: `development-ruleset` em `refs/heads/development`, `main-ruleset` na branch padrão e `release-ruleset` em `refs/heads/release/*`. Os três exigem pull request, bloqueiam force push e cobram Lint, Typecheck e Test, sem segundo revisor. O admin tem bypass. `development` e `main` exigem a branch atualizada. `development` aceita squash e merge. `main` aceita só merge commit. `release-ruleset` aceita squash e merge e não exige check na criação da branch.

A onda 3 foi validada no mesmo dia, sem editar `.github/workflows/ci.yml`. O `on` continua `push` e `pull_request`, sem filtro de branch. `permissions` segue `contents: read`. Não há job de build nem de deploy. O run `36368240071` na branch `development`, commit `37936f1`, concluiu Lint, Typecheck e Test com sucesso. O mesmo workflow em `main` é o run `36279209059`, também verde nesse commit.

A onda 4 foi fechada em 2026-09-27 sem criar infra. A API pública lista um workflow, `.github/workflows/ci.yml`, e zero environments. O YAML não cita `deploy`, `environment` nem `secrets`. Produção continua sendo o commit de `main`, não um servidor.

A onda 5 foi fechada no mesmo dia sem cortar versão. `main` e `development` ainda são `37936f1`. Não há tag, `release/*` nem `hotfix/*`. O roteiro abaixo fica para quando `development` tiver commits que `main` não tem. A primeira versão será `release/0.1.0` e a tag `v0.1.0`, só depois do merge em `main`.

A onda 6 é o pull request https://github.com/henryavgiarola/victory-3det/pull/1 (`feature/prova-ci` → `development`), mergeado por squash. Lint, Typecheck e Test ficaram verdes. `main` permanece em `37936f1`. Nenhuma tag foi criada.

## 1. Objetivo

Separar integração e produção no GitHub sem trocar a pipeline que já roda lint, typecheck e teste. `main` continua sendo o que o remoto trata como padrão. `development` passa a receber `feature/*` e `fix/*`. `release/*` só nasce quando houver uma versão candidata a entrar em `main`.

Não há deploy. Esta migração não cria ambiente, secret nem job de publicação.

## 2. Estado atual

### Branches

Evidência local e de `git ls-remote` contra `origin` (`https://github.com/henryavgiarola/victory-3det.git`):

| Item | Estado |
|------|--------|
| Branch atual | `main` |
| Branches locais | só `main` |
| Branches remotas | só `refs/heads/main` |
| HEAD remoto | `refs/heads/main` → `37936f1e104e24cad1b6412dd0aca51c87d0f012` |
| Tracking | `main` acompanha `origin/main` |
| `feature/*`, `fix/*`, `release/*`, `hotfix/*` | não existem |
| Tags | `git tag -l` vazio |
| Working tree | limpo no momento da leitura |

Histórico, um pai por commit, sem merge commit:

| Commit | Pais | Mensagem |
|--------|------|----------|
| `37936f1` | `1a5dbb1` | `feat: adding-skills-agents-docs-plan` |
| `1a5dbb1` | `ddeb420` | `Point npm installs at the public registry.` |
| `ddeb420` | `76c32b2` | `Add CI checks for lint, types, and character rules.` |
| `76c32b2` | nenhum | `Initial commit` |

Autores: `henry` (`hgiarola@grupoimagetech.com.br`) nos três commits depois do inicial; o inicial está como `Henry` (`95929061+henryavgiarola@users.noreply.github.com`). Um único fluxo de push direto em `main`. Não há evidência de squash via pull request nem de rebase publicado (não há segundo pai nem commit de merge).

Não há `.gitlab-ci.yml` no `git ls-files`. A plataforma é GitHub: remote `github.com` e workflow em `.github/workflows/ci.yml`.

Proteção de branch não foi lida na API do GitHub nesta sessão. O `README.md` (seção Pipeline) manda criar a regra de `main` em Settings → Branches. Isso documenta a proteção como passo pendente, não como regra já aplicada. Confirmar na interface fica na seção 19.

### Pipeline

Um workflow, nome `CI`, arquivo `.github/workflows/ci.yml`.

Disparo: `push` e `pull_request`, sem filtro de branch. Qualquer branch nova entra no mesmo CI sem editar o arquivo.

`permissions: contents: read`. `concurrency` cancela execução anterior do mesmo ref. Não há `environment`, secret, artefato, `needs` entre jobs nem passo de deploy.

| Job | Estágio | Comando | Branch | Artefato | Bloqueia sozinho |
|-----|---------|---------|--------|----------|------------------|
| Lint | paralelo | `npm ci` depois `npm run lint` | todo push e todo PR | não | falha o check Lint |
| Typecheck | paralelo | `npm ci` depois `npm run typecheck` | idem | não | falha o check Typecheck |
| Test | paralelo | `npm ci` depois `npm test` | idem | não | falha o check Test |

Runner `ubuntu-latest`. Node 22 com cache npm (`actions/setup-node@v4`, `actions/checkout@v4`). Registry fixo em `NPM_CONFIG_REGISTRY` e em `.npmrc` (`https://registry.npmjs.org/`).

O workflow não marca check como obrigatório para merge. Essa trava, se existir, está na proteção de branch, que o README ainda pede para criar. Os nomes que a proteção deve usar são os `name` dos jobs: Lint, Typecheck, Test.

### Scripts

Raiz, `package.json`:

| Script | Comando | Existe |
|--------|---------|--------|
| `npm ci` | lockfile `package-lock.json` | sim, não é script |
| `npm run lint` | `eslint .` | sim |
| `npm run typecheck` | `npm run typecheck --workspaces --if-present` | sim |
| `npm test` | `npm run test --workspaces --if-present` | sim |
| `npm run build` | — | não |

`@victory/rules` (`packages/rules/package.json`, `version` `0.0.0`, `private: true`): `typecheck` é `tsc -p tsconfig.json --noEmit`; `test` é `jest --config jest.config.mjs`. Sem script de build. A raiz não tem campo `version`. `engines.node` é `>=22`.

Não há Prettier, Playwright, Cypress nem Vitest no tree. ESLint está em `eslint.config.mjs`. Jest está em `packages/rules/jest.config.mjs`.

Não há `next.config`, app Next, Dockerfile nem `docker-compose` no `git ls-files`. O Next ainda é alvo de `docs/plano-acao-implementacao.md`, não código presente.

### Ambientes

Não há ambiente de desenvolvimento, homologação nem produção.

Evidência: o workflow não declara `environment`; não há `.env` commitado; `.gitignore` ignora `.env` e `.env.*` e abre exceção para `.env.example`, mas esse arquivo não está no `git ls-files`; não há URL de API, secret referenciado no YAML nem passo de deploy.

`development` neste plano é branch de integração. Não é servidor.

### Versionamento

Sem tag, sem changelog, sem release no tree. O único número de versão é `0.0.0` em `@victory/rules`, pacote `private`. Commits não seguem uma convenção só (`feat:` em um, frase solta nos outros). Não há automação de versão.

## 3. Arquitetura Git proposta

```text
feature/* / fix/*
        │
        ▼
 development
        │
        ▼
 release/*
        │
        ▼
      main
```

`hotfix/*` não entra. Justificativa na seção 5.

| Branch | Papel |
|--------|--------|
| `feature/*`, `fix/*` | Um incremento, alinhado a `docs/03-definition-of-done.md` (escopo único por branch). Morrem depois do merge. |
| `development` | Integração. Recebe feature e fix. Não é ambiente. |
| `release/x.y.z` | Temporária, criada de `development` quando uma versão vai para `main`. Não existe branch permanente `release`. |
| `main` | O que o remoto já usa como padrão. Passa a receber só o resultado de uma `release/*`. |

Branch permanente `release` seria uma segunda integração sem staging para justificar. `release/*` existe só o tempo da candidata e sai depois do merge em `main` e da volta do que mudou para `development`.

## 4. Diagnóstico da pipeline atual

O CI já cobre o fluxo novo porque o `on` não lista branches. Criar `development` ou abrir PR não exige workflow novo para lint, typecheck e teste.

Não há build para adaptar: `package.json` não define `build`, e `tsc` do pacote de regras usa `--noEmit`.

Não há CD. Incluir deploy nesta migração criaria publicação para um app que ainda não está no repositório.

Jobs são independentes. Os três precisam ficar verdes para o merge quando a proteção passar a exigi-los. Hoje a falha fica visível no Actions e não há evidência, neste repositório, de que o GitHub impeça o merge.

## 5. Estratégia de branches

### feature/* e fix/*

Origem: `development`. Nome: `feature/<incremento>` ou `fix/<incremento>`, em minúsculas e hífen. Exemplo: `feature/lista-publica`.

`fix/*` é correção em cima de `development`, não atalho para `main`.

### development

Cópia do commit atual de `main` (`37936f1`) no dia em que a onda 1 rodar, desde que `main` não tenha andado. Integração contínua: todo push e todo PR já disparam o workflow.

Push direto deixa de ser o caminho quando a onda 2 aplicar a proteção. Até lá, o hábito atual (push em `main`) continua possível. A onda 2 é o que muda o hábito.

Não há deploy a partir desta branch.

### release/*

Criar só quando `development` tiver commits que devam entrar em produção e a validação da candidata for o trabalho daquele momento. Não criar na mesma operação que cria `development`: as duas pontas estariam iguais e a release não carregaria delta.

Nome: `release/0.1.0` na primeira. Tag correspondente: `v0.1.0`, criada em `main` depois do merge, não no meio da candidata.

Quem cria: quem já faz push neste repositório (um autor no histórico). Não há CODEOWNERS.

Correção achada na candidata: branch curta a partir da `release/*`, PR de volta para ela, CI igual. Não commitar direto se a proteção da onda 2 cobrir o padrão `release/*`.

Ao fechar: PR `release/*` → `main`. Em seguida, o que a release tiver a mais que `development` volta por PR `main` → `development` (ou `release/*` → `development` antes de apagar a branch). Sem esse retorno, um fix da candidata some de `development`.

Apagar a `release/*` depois do merge e do retorno. Não mantê-la aberta.

### main

Continua sendo a branch padrão do remoto. Não renomear. Não reescrever os quatro commits.

Passa a ser atualizada por PR vindo de `release/*`. Tag anotada `vX.Y.Z` no commit do merge, manual. O workflow tem `contents: read` e não cria tag. Manter assim evita tag acidental.

Rollback de `main`, quando não há deploy: PR de revert. Sem force push.

### hotfix/*

Não adotar agora.

Não há produção publicada, nem ambiente, nem job de deploy. Um hotfix seria um segundo caminho para `main` antes de existir uma `release/*` sequer. Correção urgente, enquanto `main` e `development` ainda apontam para o mesmo commit, é um `fix/*` em `development`. Depois da primeira release, correção da candidata fica na própria `release/*`. Reabrir `hotfix/*` só se um dia existir deploy de `main` que não possa esperar uma release. Isso fica como pendência, não como branch desta migração.

## 6. Fluxo de Pull Request

Plataforma: GitHub. Não há merge request do GitLab.

Hoje o fluxo observado é push direto em `main`. O alvo abaixo passa a valer quando a onda 2 existir. Até lá, merge direto ainda é possível e é o risco da seção 15.

| Fluxo | Origem | Destino | Finalidade | Checks | Aprovação de outra pessoa | Merge direto | Estratégia | Atualizada antes do merge |
|-------|--------|---------|------------|--------|---------------------------|--------------|------------|---------------------------|
| Feature | `feature/*` | `development` | Integrar um incremento | Lint, Typecheck, Test | Não exigir | Não, depois da proteção | Squash | Sim |
| Fix | `fix/*` | `development` | Corrigir integração | os três | Não exigir | Não | Squash | Sim |
| Abrir candidata | `development` | `release/x.y.z` | A branch nasce de `development`; não é um PR de "tudo" | os três no push da branch nova | — | A criação é branch, não merge | — | `development` é a origem |
| Fechar candidata | `release/*` | `main` | Publicar o commit no padrão | os três | Não exigir um segundo revisor | Não | Merge commit | Sim |
| Volta | `main` ou `release/*` | `development` | Devolver fix feito só na candidata | os três | Não exigir | Não | Merge commit | Sim |

Squash em `feature/*` e `fix/*` deixa `development` com um commit por incremento. O histórico atual de `main` já é linear, um commit por push. Merge commit só na entrada em `main` e na volta, para o limite da versão aparecer no grafo.

Não exigir review de outra pessoa: o log tem um autor. Exigir aprovação travaria o merge ou obrigaria bypass de admin o tempo todo. O gate é o CI verde.

PR de `feature/*` direto para `main` fica fora do fluxo. A proteção de `main` deve limitar quem entra.

## 7. Estratégia de CI

Preservar `.github/workflows/ci.yml`. A onda 3 não edita o arquivo, salvo se um push em `development` não disparar os três jobs. O `on` atual não filtra branch, então o resultado esperado é diff zero.

| Job | feature/* | development | release/* | main | Obrigatório no merge | Manual | Depende de outro job | Ambiente | Artefato |
|-----|-----------|-------------|-----------|------|----------------------|--------|----------------------|----------|----------|
| Lint | Sim | Sim | Sim | Sim | Sim, via proteção | Não | Não | Não | Não |
| Typecheck | Sim | Sim | Sim | Sim | Sim | Não | Não | Não | Não |
| Test | Sim | Sim | Sim | Sim | Sim | Não | Não | Não | Não |
| Build | Não | Não | Não | Não | — | — | — | — | — |
| Deploy | Não | Não | Não | Não | — | — | — | — | — |

Build fica de fora porque não existe `npm run build`. Quando `docs/plano-acao-implementacao.md` criar app com script de build, um job novo entra em plano próprio. Não antecipar aqui.

Os três checks bloqueiam merge só depois da onda 2, e só nas branches protegidas. Em `feature/*` o CI roda no PR; a branch curta em si não precisa de regra de proteção.

## 8. Estratégia de CD

Não há CD. Não mapear `development` → servidor, `release/*` → staging nem `main` → produção: esses servidores não aparecem no workflow, no compose nem em `.env` versionado.

Preparação, sem implementar:

| Para um CD futuro | Dependência que hoje falta |
|-------------------|----------------------------|
| Ambiente | Nenhum declarado no Actions |
| Artefato | Nenhum job faz upload; não há `build` |
| Secret | Nenhum nome de secret no YAML |
| Produção só via `main` | Proteção da onda 2, mais um job de deploy que ainda não deve ser escrito |
| Rollback | Sem deploy, rollback é revert em `main` por PR |

O workflow segue com `contents: read` para não ganhar permissão de publicar.

## 9. Estratégia de versionamento

Recomendação, sem implementar:

- SemVer `MAJOR.MINOR.PATCH` em tag git `v0.1.0`, `v0.2.0`, `v0.1.1`.
- A primeira tag é `v0.1.0`, no merge da primeira `release/0.1.0` em `main`. Partir de 0 porque não há release anterior e `@victory/rules` está em `0.0.0`. Não usar `1.0.0` enquanto o app Next/Nest da demo não estiver no tree.
- Não publicar no npm. Os pacotes estão `private` e a raiz não tem `version`. Não obrigar bump de `package.json` para taggear.
- Sem changelog: não há arquivo. Não criar um só para a migração de branches.
- Tag anotada, manual, no commit de `main` que o PR da release produziu. Não taggear `development` nem a ponta solta da `release/*` antes do merge.
- PATCH (`v0.1.1`) quando a `release/*` seguinte só corrige. MINOR quando entra incremento de `development`.

Convenção de commit atual é mista. Não bloquear o fluxo por Conventional Commits.

## 10. Estratégia de proteção

Recomendação para a interface do GitHub (Settings → Branches ou rulesets). Não aplicar nesta execução.

O README já cita os nomes Lint, Typecheck e Test para `main`. Esses nomes passam a valer também para `development` e para `release/*`. Eles só podem ser exigidos depois que o workflow tiver rodado pelo menos uma vez na branch (o próprio README avisa isso).

### development

- Pull request obrigatório.
- Checks Lint, Typecheck e Test obrigatórios.
- Branch atualizada antes do merge.
- Squash permitido; merge commit não é o caminho de feature.
- Force push bloqueado.
- Sem aprovação de segundo revisor.
- Push direto bloqueado para quem não é admin. Admin não deve usar bypass no dia a dia; o bypass fica como saída da seção 16.

### release/*

Mesmas travas de PR, checks, branch atualizada e force push. Merge commit permitido, porque o fechamento vai para `main` com merge commit. Apagar a branch no merge.

### main

- Pull request obrigatório a partir de `release/*`.
- Os três checks.
- Force push bloqueado.
- Sem segundo revisor, pelo mesmo motivo da `development`.
- Tag não é regra de proteção; é passo manual depois do merge verde.
- Não exigir deploy.

`feature/*` e `fix/*` sem proteção de branch. O CI do PR basta.

## 11. Dependências

```text
Onda 0  estado lido (main = 37936f1, CI sem filtro de branch, sem CD)
  └─ Onda 1  criar development nesse commit, sem mover main
       └─ Onda 2  proteção, depois do primeiro CI em development
            ├─ Onda 3  confirmar que o YAML atual já cobre as branches (diff zero esperado)
            └─ Onda 5  procedimento de release/* (não criar a branch ainda)
                 └─ Onda 6  um PR feature → development com os três checks
                      └─ Onda 7  README deixa de falar só de main
Onda 4  CD fica documentado como inexistente. Não depende de branch nova e não bloqueia as outras.
```

A onda 4 não espera a onda 2. A onda 7 espera a decisão das ondas 1 e 5 para não documentar um fluxo que ainda não foi escolhido. A primeira `release/*` real espera `development` estar à frente de `main`. Isso não é uma onda automática no dia da migração.

## 12. Ondas de implementação

### Onda 0 — Baseline

Objetivo: partir do estado da seção 2.

Escopo: nenhuma alteração. Esta execução é a onda 0.

Arquivos lidos: `.github/workflows/ci.yml`, `package.json`, `packages/rules/package.json`, `README.md`, `.gitignore`, `.npmrc`, `git ls-files`.

Critérios de aceite:

- Só `main` no remoto, em `37936f1`, salvo commits novos entre esta leitura e a onda 1.
- Workflow único, três jobs, sem deploy.
- Sem tag.
- Este arquivo existe e o restante está "Não iniciado".

### Onda 1 — Branches

Objetivo: criar `development` no mesmo commit de `main`, sem renomear `main` e sem apagar histórico.

Escopo: `git branch development` a partir de `main` e push de `development`. Não criar `release/*`. Não criar `feature/*` ainda.

Configuração: nenhuma.

Riscos: seção 15, divergência se alguém commitar em `main` no meio do push.

Testes: `git rev-parse main development` iguais depois do push. `git ls-remote --heads origin` mostra as duas. O push dispara o workflow por causa do `on: push`.

Critérios de aceite:

- `origin/main` e `origin/development` no mesmo SHA.
- Histórico dos quatro commits intacto em `main`.
- Nenhuma `release/*`.
- `hotfix/*` continua ausente.

### Onda 2 — Proteção

Objetivo: aplicar a seção 10 em `development`, `main` e no padrão `release/*`.

Escopo: só Settings do GitHub. Sem editar arquivo.

Dependências: onda 1, e uma execução do workflow em `development` para os nomes Lint, Typecheck e Test existirem.

Riscos: exigir segundo revisor impede o único autor de mergear. Não marcar essa opção.

Critérios de aceite:

- Push direto em `development` e em `main` recusado para o fluxo normal.
- PR com check vermelho não mergeia.
- Force push recusado nas três.
- PR de `feature/*` para `development` usa squash.
- PR de `release/*` para `main` usa merge commit.

### Onda 3 — CI

Objetivo: manter os três jobs em toda branch, sem job novo.

Escopo esperado: nenhum diff em `.github/workflows/ci.yml`. Abrir a confirmação na onda 6. Se o Actions não rodar em `development`, aí sim corrigir o `on`, e registrar o motivo.

Dependências: onda 1 para ter a branch. A proteção da onda 2 é o que torna o check obrigatório; o YAML não faz isso.

Critérios de aceite:

- O push da onda 1 em `development` mostra Lint, Typecheck e Test. O PR da onda 6 mostra os mesmos três.
- `release/*` e `main` usam o mesmo `on`, sem lista de branches. A prova deles é o PR da primeira release, não uma branch criada só para o CI.
- Nenhum job de build ou deploy foi adicionado.
- `permissions` continua `contents: read`.

### Onda 4 — CD

Objetivo: deixar escrito que não há ambiente nem deploy. Não criar secret, environment nem workflow de deploy.

Escopo: a seção 8 deste arquivo. Nenhum YAML novo.

Dependências: nenhuma. Pode ser considerada fechada quando este plano for aceito, sem mudança de infra.

Critérios de aceite:

- Nenhum workflow além de `.github/workflows/ci.yml`.
- Nenhuma environment no repositório.
- Produção não recebe deploy porque deploy não existe.

### Onda 5 — Procedimento de release

Objetivo: deixar o roteiro da primeira versão pronto, sem executar.

Roteiro, para quando `development` estiver à frente de `main`:

1. Branch `release/0.1.0` a partir de `development`.
2. CI no push.
3. Correção só por PR para essa branch.
4. PR para `main`, merge commit, checks verdes.
5. Tag anotada `v0.1.0` em `main`.
6. PR de volta para `development` se a release tiver commit que `development` não tem.
7. Apagar `release/0.1.0`.

Dependências: ondas 1 e 2. Não depende de a onda 6 já ter uma feature, mas a primeira execução real depende de haver delta.

Critérios de aceite:

- O roteiro está neste arquivo.
- Nenhuma `release/*` foi criada nesta onda.
- `hotfix/*` permanece fora.

### Onda 6 — Validação

Objetivo: provar o caminho `feature/*` → `development` com o CI atual, sem cortar release e sem deploy.

Escopo: uma branch `feature/` de prova, PR para `development`, três checks verdes, squash. Conteúdo do PR mínimo (não misturar com a implementação do app). Não mergear em `main`.

Dependências: ondas 1, 2 e 3.

Critérios de aceite:

- O PR não aponta para `main`.
- Actions mostra Lint, Typecheck e Test no PR.
- Depois do squash, `main` continua no SHA anterior à feature.
- Nenhuma tag criada.

### Onda 7 — Documentação

Objetivo: o `README.md` deixar de instruir só a proteção de `main`.

Escopo: seção Pipeline do `README.md` passa a citar `development`, `release/*`, `main` e os três checks. Não duplicar este plano inteiro no README; apontar para `docs/plano-acao-ci-cd.md`.

Dependências: ondas 1 e 5, para o texto bater com o fluxo escolhido.

Critérios de aceite:

- README não diz que a única branch do fluxo é `main`.
- README não descreve deploy.
- Os comandos continuam `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`.

## 13. Quadro comparativo de acompanhamento

| Onda | Área | Item | Estado atual | Estado esperado | Arquivos/configurações | Dependências | Validação | Status |
|------|------|------|--------------|-----------------|------------------------|--------------|-----------|--------|
| 0 | Baseline | Git | Só `main` local e em `origin`, SHA `37936f1` | Mesmo estado registrado | `git branch -a`, `git ls-remote --heads origin` | Nenhuma | Leitura desta sessão | Concluído |
| 0 | Baseline | Pipeline | `.github/workflows/ci.yml`, push e PR sem filtro | Preservada | `.github/workflows/ci.yml` | Nenhuma | Três jobs descritos na seção 4 | Concluído |
| 0 | Baseline | Versionamento | Sem tag; rules em `0.0.0` | Sem tag ainda | `packages/rules/package.json` | Nenhuma | `git tag -l` vazio | Concluído |
| 1 | Git | `development` | Publicada em `origin`, SHA `37936f1` | Mesmo SHA de `main` | Branch remota, sem arquivo novo | Onda 0 | `git rev-parse` de `main` e `development` iguais | Concluído |
| 1 | Git | `main` | Padrão do remoto, quatro commits lineares, SHA `37936f1` | Continua padrão; histórico intacto | `origin/HEAD` | Onda 0 | `ls-remote` segue em `main` | Concluído |
| 1 | Git | `release/*` | Não existe | Continua ausente nesta onda | — | Onda 5 para o procedimento | `git branch -a` sem `release/` | Concluído |
| 1 | Git | `hotfix/*` | Não existe | Não será criada | — | Descartada na seção 5 | Ausente | Concluído |
| 2 | Governança | Proteção de `development` | `development-ruleset` ativo: PR, squash e merge, checks estritos, sem force push | PR, três checks, sem force push, sem segundo revisor | Ruleset `24093247` | Onda 1 e CI em `37936f1` | Ruleset lido na API | Concluído |
| 2 | Governança | Proteção de `main` | `main-ruleset` ativo: PR, só merge commit, três checks, branch atualizada | PR, três checks, sem force push | Ruleset `24093284` | Onda 1 | `strict_required_status_checks_policy=true` | Concluído |
| 2 | Governança | Proteção de `release/*` | `release-ruleset` ativo em `refs/heads/release/*`: PR, squash e merge, três checks, sem force push | Mesmas travas no padrão `release/*` | Ruleset `24093394` | Onda 2 | Include lido na API | Concluído |
| 3 | CI | Lint | Job Lint no run `36368240071` (`development`) e no run `36279209059` (`main`), sem diff no YAML | Igual, sem diff | `.github/workflows/ci.yml` | Nenhuma | `conclusion=success` | Concluído |
| 3 | CI | Typecheck | Job Typecheck nos mesmos runs | Igual, sem diff | `.github/workflows/ci.yml` | Nenhuma | `conclusion=success` | Concluído |
| 3 | CI | Testes | Job Test nos mesmos runs | Igual, sem diff | `.github/workflows/ci.yml` | Nenhuma | `conclusion=success` | Concluído |
| 3 | CI | Build | Script ausente. YAML sem passo `build` nem deploy. `contents: read` | Sem job | `package.json`, `.github/workflows/ci.yml` | App com script ainda não existe | Leitura do workflow | Concluído |
| 4 | CD | Desenvolvimento | Um workflow, zero environments. `development` não publica | Segue sem deploy; branch não é servidor | `.github/workflows/ci.yml` | Nenhuma | API `total_count=1` e `environments=0` | Concluído |
| 4 | CD | Staging | Sem homologação no Actions | Não criar | — | Sem infra | Ausente | Concluído |
| 4 | CD | Produção | Sem job de deploy. YAML sem `environment` e sem `secrets` | Não criar job | `permissions: contents: read` | Sem artefato de build | Leitura do workflow | Concluído |
| 5 | Release | Versionamento | Sem tag. `main` e `development` em `37936f1`. Roteiro de `release/0.1.0` e tag `v0.1.0` neste arquivo | Roteiro pronto; branch só quando houver delta | `docs/plano-acao-ci-cd.md` | Ondas 1 e 2 | `git tag -l` vazio e sem `release/` no remoto | Concluído |
| 6 | Validação | Fluxo feature | PR 1 `feature/prova-ci` → `development`, squash. `main` em `37936f1`. Sem tag | PR com Lint, Typecheck e Test, sem tag | `docs/plano-acao-ci-cd.md` | Ondas 1–3 | Checks verdes no PR 1 | Concluído |
| 7 | Documentação | README | Só ensina a proteger `main` | Cita o fluxo e este plano | `README.md` | Ondas 1 e 5 | Leitura da seção Pipeline | Não iniciado |

## 14. Estratégia de testes

Comandos que existem:

```text
npm ci
npm run lint
npm run typecheck
npm test
```

`npm test` delega ao Jest de `@victory/rules` (`packages/rules/src/validar-ficha.spec.ts`). Não há teste de integração HTTP, contrato, E2E de browser nem pipeline de teste separada. `docs/02-estrategia-testes.md` deixa browser de fora. Não propor Playwright.

| Validação | Onde roda | Obrigatória |
|-----------|-----------|-------------|
| Lint, typecheck, test | Todo push e todo PR, qualquer branch | Sim, nas branches protegidas, depois da onda 2 |
| Build | Não existe | Não |
| E2E, contrato, integração de API | Não existem | Não nesta migração |
| Antes de abrir `release/*` | Os três jobs verdes em `development` | Sim |
| Antes de mergear em `main` | Os três jobs verdes no PR da `release/*` | Sim |
| Tag | Não substitui os três jobs | Manual, depois do merge |

Durante a transição, `main` continua disparando o mesmo CI em cada push. Criar `development` não desliga o CI de `main`.

## 15. Riscos e pontos de atenção

| Risco | Nível | Justificativa |
|-------|-------|----------------|
| `main` mistura integração e produção | Médio | É a única branch e recebe push direto. Enquanto a onda 2 não existe, um commit novo em `main` não passa por `development`. |
| Perder commit na migração | Baixo | A onda 1 não reseta. `development` nasce do SHA atual. O histórico tem um pai por commit. |
| CI deixar de rodar | Baixo | Não há filtro de branch. O risco aparece só se alguém adicionar `branches:` e esquecer um prefixo. A onda 3 evita esse diff. |
| Pipeline duplicada | Baixo | Há um workflow. Não criar outro. |
| Deploy acidental | Baixo | Não há job de deploy e a permissão é `contents: read`. O risco sobe se um workflow novo ganhar `contents: write` ou environment de produção. |
| Proteção inexistente | Médio | O README trata a regra de `main` como coisa a criar. Sem a onda 2, o desenho de branches é só convenção. |
| Segundo revisor obrigatório | Alto | Um autor no log. A regra travaria o repositório. |
| `development` e `main` divergirem | Médio | Depois da primeira feature, é o esperado. O buraco é fix feito na `release/*` sem PR de volta. |
| Release vazia | Baixo | Criar `release/0.1.0` no mesmo commit da onda 1 não carrega versão. A onda 5 adia a branch. |
| Force push reescrevendo `main` | Médio | Não há merge commit hoje; um reset apagaria os quatro commits. A onda 2 bloqueia. |
| Tag sem release | Baixo | Não há tag. Criar `v1.0.0` agora marcaria só o pacote de regras e os docs. |
| Secret | Baixo | Nenhum secret no workflow. `.gitignore` já cobre `.env`. |
| Conflito de merge | Baixo | Quatro commits lineares e working tree limpo. Conflito só aparece depois que as duas branches divergirem. |
| Rollback da migração | Baixo | Se `development` não tiver commit próprio, apagar a branch deixa `main` como está. Se tiver, não apagar antes de guardar esses commits. |
| Hotfix paralelo | Baixo | Fica de fora de propósito. Inventar o atalho agora cria dois jeitos de chegar em `main`. |

## 16. Estratégia de migração

1. Confirmar que `origin/main` ainda é o SHA lido na onda 0 (`37936f1`), ou anotar o SHA novo se `main` andou. Não migrar no escuro.
2. Criar `development` nesse SHA e dar push. Não usar `push --force`. Não apagar `main`.
3. Esperar o Actions em `development` (o `on: push` já cobre).
4. Aplicar a proteção da seção 10. Não proteger um nome de check que o Actions ainda não mostrou.
5. Não abrir `release/*` nesse dia.
6. A partir daí, incremento novo sai de `development` em `feature/*` ou `fix/*`. `main` só anda no roteiro da onda 5.
7. O CI de `main` segue no arquivo atual durante todos esses passos.

Rollback: se `development` e `main` ainda forem o mesmo SHA, apagar `origin/development` e remover a proteção criada na onda 2. `main` não precisa de reset. Se `development` já tiver commits, trazê-los de volta com PR para `main` ou deixá-los na branch até decidir; não usar force push para "desfazer".

Não há deploy para desligar durante a transição.

## 17. Critérios gerais de aceite

- `origin/main` segue como padrão e conserva o histórico anterior à migração.
- `origin/development` existe e recebe feature por PR com squash.
- `release/*` é temporária, nasce de `development` e só então entra em `main`.
- `hotfix/*` não foi criada.
- Lint, Typecheck e Test continuam sendo os três jobs, nas branches do fluxo, sem build e sem deploy novos.
- Proteção impede push direto e force push em `development` e `main`, sem exigir outro revisor.
- README descreve esse fluxo.
- Nenhum ambiente foi inventado no Actions.

## 18. Ordem recomendada de execução

1. Onda 0 — feita como esta leitura.
2. Onda 1 — `development` no SHA de `main`.
3. Onda 2 — proteção, depois do primeiro Actions em `development`.
4. Onda 3 — confirmar diff zero no workflow.
5. Onda 5 — deixar o roteiro de release combinado antes de escrever o README.
6. Onda 6 — um PR de feature para `development`.
7. Onda 7 — README.
8. Onda 4 — sem trabalho de infra; o texto da seção 8 fecha essa onda.

A primeira `release/0.1.0` não está nessa lista. Ela espera `development` ter commits que `main` não tem.

## 19. Pendências

| Pendência | Por que não fechou nesta leitura |
|-----------|----------------------------------|
| A regra de `main` em Settings → Branches já foi criada depois do README? | Sim, via ruleset `main-ruleset`, não via branch protection clássica. O repositório está público. |
| O SHA de `main` ainda é `37936f1` no dia da onda 1? | O plano fixa o SHA desta sessão. Um push posterior muda a origem de `development`. |
| Ruleset da organização GitHub por cima do repositório | Não há arquivo no repo que prove ou negue regra herdada. |
| Quando cortar `v0.1.0` | Depende do app da demo existir em `development`, não desta migração de branches. |
| Reabrir `hotfix/*` | Só se surgir deploy de produção que não possa esperar `release/*`. Hoje esse deploy não existe. |
