# victory-3det
A web application to develop coding skills and present in job interviews.

## Pipeline

Todo push e todo pull request dispara três checks no GitHub Actions. Os três precisam passar.

| Check | Comando | O que demonstra |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint no TypeScript |
| Typecheck | `npm run typecheck` | `tsc --noEmit` sem emitir arquivo |
| Test | `npm test` | Regra da ficha e o caso de uso da inscrição, sem banco, fila nem Keycloak |

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

O workflow está em `.github/workflows/ci.yml`. Não há job de build nem de deploy.

`feature/*` e `fix/*` entram em `development` por squash. `release/x.y.z` nasce de `development` quando houver uma versão para publicar e entra em `main` por merge commit. A tag é manual, depois desse merge. `main` é a branch padrão.

Lint, Typecheck e Test são obrigatórios no pull request para `development`, `release/*` e `main`. O detalhe da migração está em `docs/plano-acao-ci-cd.md`.

O corte da demo e as fronteiras entre a regra, o Next e o Nest estão em `docs/`. Papéis de sessão ficam em `.agents/` e os procedimentos em `.skills/`. O índice para o Cursor é `AGENTS.md`.

## Demo

`docker compose up --build` sobe o browser em `http://localhost:3001`, a API em `http://localhost:3000` e o Keycloak em `http://localhost:8080`. Postgres e Redis não publicam porta no host. Os três checks acima não sobem esse Compose.

```text
browser
  │
  ▼
Next (sessão httpOnly, PKCE)
  │  Authorization: Bearer
  ▼
Nest (JWT via JWKS)
  ├── Postgres   linha da inscrição
  └── Redis      job validar-ficha
        │
        ▼
      worker     validarFicha → aprovada | recusada
```

A matemática fica só em `packages/rules`. O Next e o Nest chamam `validarFicha`; não recalculam o pool.

| Passo | Onde | O que mostrar |
| --- | --- | --- |
| Lista pública | `/` | Só fichas `aprovada`, com nome, conceito, P/H/R e PA/PM/PV. Sem login |
| Login | `/fichas/nova` | Sem o cookie `sessao`, o Next redireciona ao Keycloak. Usuário `jogador`, senha `jogador` |
| Inscrição | `POST /inscricoes` | 201 `submetida`. O Nest grava o `sub` do token, publica `validar-ficha` e devolve `x-correlation-id` |
| Status | `/fichas/:id` | `em_processamento`, depois `aprovada` ou `recusada` com os motivos. Outro `sub` recebe 404 |

O worker, no mesmo processo da API, é quem grava `aprovada` ou `recusada`. Rolagem, combate, PDF e mobile ficam de fora.

# Processo de criação do projeto

Este documento registra o processo de criação e evolução inicial do projeto, incluindo as decisões de planejamento, CI/CD, governança do repositório e arquitetura.

O objetivo é manter documentado não apenas o resultado final, mas também o raciocínio utilizado durante a construção do projeto.

---

## Dia 1 — Sábado

### Planejamento e preparação do projeto

O primeiro dia foi dedicado à definição da estratégia para a entrevista técnica e à preparação da base do projeto.

### 1. Planejamento da demonstração técnica

Foi criado um plano de ação para a entrevista técnica com o objetivo de desenvolver um projeto simples, mas capaz de demonstrar:

* capacidade de desenvolvimento;
* organização de código;
* definição arquitetural;
* práticas de CI/CD;
* governança de código;
* utilização de ferramentas de IA/LLMs durante o desenvolvimento;
* capacidade de documentar decisões técnicas.

A proposta não foi criar um sistema grande, mas construir uma aplicação pequena que permitisse demonstrar decisões técnicas de forma objetiva.

A arquitetura e as ferramentas foram escolhidas considerando o tamanho do projeto, evitando introduzir complexidade que não trouxesse benefício proporcional.

---

### 2. Criação do repositório

Foi criado o repositório que centraliza o desenvolvimento da aplicação e sua documentação.

Desde o início, a intenção foi tratar o repositório não apenas como armazenamento do código, mas como o ambiente central para:

* desenvolvimento;
* validação automática;
* controle de branches;
* pull requests;
* documentação;
* colaboração com ferramentas de IA.

---

### 3. Criação da pipeline de CI

Foi criada a pipeline inicial de CI com validações automáticas para garantir um estado mínimo de qualidade antes da integração das alterações.

As validações definidas foram:

```text
Pull Request
     │
     ▼
┌─────────────┐
│    Lint     │
├─────────────┤
│  Typecheck  │
├─────────────┤
│    Tests    │
└─────────────┘
     │
     ▼
   Merge
```

A pipeline passou a funcionar como uma primeira barreira automatizada contra alterações que não atendam aos critérios técnicos definidos pelo projeto.

A utilização de status checks como requisito para integração também está alinhada ao mecanismo de proteção oferecido pelo GitHub, no qual verificações obrigatórias precisam apresentar estado válido antes que uma alteração possa ser integrada a uma branch protegida.

---

### 4. Regras para Pull Requests

Foram configuradas regras para impedir a integração de alterações sem que as validações automatizadas da pipeline fossem executadas e aprovadas.

O objetivo foi estabelecer o seguinte fluxo:

```text
Desenvolvimento
      │
      ▼
Feature Branch
      │
      ▼
Pull Request
      │
      ▼
CI
 ┌────┼────┐
 ▼    ▼    ▼
Lint Type Test
 └────┼────┘
      ▼
Validação
      │
      ▼
Merge
```

O GitHub permite exigir que uma alteração esteja associada a um Pull Request e que os status checks obrigatórios estejam aprovados antes do merge.

Para este projeto de demonstração, algumas exigências foram deliberadamente simplificadas. Em um ambiente corporativo, essas regras podem ser reforçadas com aprovação obrigatória de revisores.

---

### 5. Configuração do ambiente de trabalho com IA

Foram adaptadas as configurações de:

* **Agents** — definição de papéis e responsabilidades dos agentes;
* **Skills** — procedimentos e formas padronizadas de execução;
* **Docs** — documentação utilizada como fonte de verdade arquitetural e funcional.

A intenção é que o uso de LLMs faça parte do processo de desenvolvimento de maneira estruturada, e não apenas como geração pontual de código.

O princípio adotado é:

```text
Documentação
     │
     ▼
Contexto arquitetural
     │
     ▼
Agente / Skill
     │
     ▼
Implementação
     │
     ▼
CI
     │
     ▼
Pull Request
```

Dessa forma, a IA participa do processo dentro das mesmas regras arquiteturais e de qualidade utilizadas pelo restante do projeto.

---

# Dia 2 — Domingo

## Consolidação de CI/CD e definição arquitetural

O segundo dia foi dedicado principalmente à consolidação do fluxo de integração e à definição do modelo arquitetural definitivo.

---

## 1. Estratégia de branches

Foram definidas as branches principais:

```text
main
  ▲
  │
release/*
  ▲
  │
homolog
  ▲
  │
development
  ▲
  │
feature/*
```

A intenção é separar os diferentes estados do desenvolvimento:

| Branch        | Responsabilidade                       |
| ------------- | -------------------------------------- |
| `development` | Desenvolvimento e integração contínua  |
| `homolog`     | Consolidação para homologação          |
| `release/*`   | Preparação de uma versão               |
| `main`        | Código considerado pronto para release |

As branches não representam apenas ambientes, mas também diferentes níveis de estabilidade e controle sobre a integração.

---

# 2. Ruleset da branch `development`

Foi criado um Ruleset específico para `development`.

Configuração definida:

* **Block force pushes**
* **Restrict deletions**
* **Require a pull request before merging**
* **Allow merge methods:** Squash e Merge
* **Require status check to pass**

### Motivo das regras

`development` é a branch de integração contínua do projeto. Por isso, alterações não devem ser inseridas de maneira que possam contornar a pipeline ou destruir o histórico da branch.

O bloqueio de force push reduz o risco de alterações destrutivas no histórico.

A restrição de deleção impede a remoção acidental da branch.

A exigência de Pull Request estabelece o ponto formal de integração.

A exigência de status checks garante que as validações automatizadas estejam concluídas antes da integração. O GitHub documenta que regrasets podem exigir Pull Requests, status checks e outras proteções sobre branches específicas.

### Aprovação

Neste projeto de demonstração, não foi exigido número mínimo de approvals.

Em um ambiente corporativo, a regra recomendada para este fluxo seria adicionar aprovação obrigatória de um ou mais revisores, conforme a política da equipe.

O GitHub permite configurar quantidade de aprovações e outras condições de revisão em conjunto com os Rulesets.

---

# 3. Ruleset da branch `main`

Foi criado um Ruleset mais restritivo para `main`.

Configuração:

* **Block force pushes**
* **Restrict deletions**
* **Require a pull request before merging**
* **Allow merge method:** Merge
* **Require status check to pass**

### Estratégia

A branch `main` representa o estado final do projeto e não deve receber alterações diretamente provenientes do fluxo normal de desenvolvimento.

O fluxo planejado é:

```text
development
      │
      ▼
   homolog
      │
      ▼
 release/*
      │
      ▼
    main
```

Por esse motivo, o método de merge permitido em `main` foi restringido a **Merge**.

A intenção é preservar a característica de que uma alteração em `main` representa a integração de uma release, em vez de uma alteração isolada de desenvolvimento.

O GitHub permite restringir os métodos de merge disponíveis para uma branch por meio dos Rulesets.

---

# 4. Ruleset das branches `release/*`

Foi criado um Ruleset específico para branches de release.

Configuração:

* **Block force pushes**
* **Deleção permitida**
* **Require a pull request before merging**
* **Allow merge methods:** Squash e Merge
* **Do not require status checks on creation**
* **Require status check to pass**

### Motivo

Branches de release possuem um ciclo de vida diferente das branches permanentes.

A criação de uma nova release não deve ser bloqueada por um status check que ainda não existe no momento da criação da branch.

Por isso, foi utilizada a configuração:

```text
criação da release
        ↓
não exigir status check na criação
        ↓
pipeline executa
        ↓
status check passa a ser obrigatório para merge
```

A diferença entre criação e atualização das branches permite manter o fluxo de release controlado sem impedir sua criação.

O GitHub permite aplicar Rulesets a branches utilizando padrões de nome e configurar regras específicas para esses alvos.

---

# 5. Modelo de CI/CD resultante

Com as regras definidas, o fluxo conceitual passou a ser:

```text
                    feature/*
                       │
                       ▼
                 Pull Request
                       │
                       ▼
                     CI
               ┌───────┼───────┐
               ▼       ▼       ▼
             Lint   Typecheck Tests
               └───────┼───────┘
                       │
                       ▼
                  development
                       │
                       ▼
                    homolog
                       │
                       ▼
                   release/*
                       │
                       ▼
                     main
```

O princípio adotado é que a pipeline não seja apenas uma ferramenta de execução, mas também uma **barreira de qualidade integrada ao processo de merge**.

---

# 6. Definição do modelo arquitetural

Durante o segundo dia também foi revisada a arquitetura inicialmente considerada para o projeto.

A decisão final foi adotar:

> **Feature-Oriented Modular Architecture + Modular Monolith**

A escolha foi feita considerando:

* pequeno tamanho inicial do projeto;
* baixa/moderada complexidade de negócio;
* necessidade de demonstrar organização arquitetural;
* possibilidade de crescimento futuro;
* necessidade de manter o projeto simples;
* utilização de Next.js + React no frontend;
* utilização de NestJS no backend.

A decisão foi evitar uma implementação inicial de:

* Clean Architecture completa;
* Hexagonal Architecture;
* DDD completo;
* CQRS;
* Event Sourcing;
* Microservices.

A ausência desses padrões não significa que sejam inadequados. A decisão foi proporcional ao tamanho e à complexidade atual do projeto.

---

# 7. Arquitetura do frontend

O frontend utiliza:

```text
Next.js
   +
React
   +
App Router
   +
Feature-Oriented Architecture
```

A estrutura conceitual é:

```text
src/
├── app/
├── features/
├── components/
├── lib/
├── hooks/
├── types/
└── styles/
```

O `app/` representa a estrutura de roteamento e composição do Next.js.

As funcionalidades ficam organizadas em `features`.

Componentes reutilizáveis ficam em `components`.

Infraestrutura compartilhada fica em `lib`.

Essa decisão utiliza o App Router como estrutura principal do Next.js. A documentação oficial do framework apresenta o App Router como a abordagem mais recente de roteamento e destaca sua integração com os recursos modernos do React.

A organização por componentes também segue o modelo de composição do React, no qual a interface é decomposta em componentes e os dados fluem entre eles de maneira explícita.

---

# 8. Arquitetura do backend

O backend utiliza:

```text
NestJS
   +
Feature Modules
   +
Modular Monolith
```

A estrutura conceitual é:

```text
src/
├── main.ts
├── app.module.ts
├── auth/
├── users/
├── <features>/
├── common/
└── config/
```

Cada domínio relevante possui seu próprio módulo.

Exemplo:

```text
UsersModule
├── UsersController
├── UsersService
└── UsersRepository
```

O NestJS recomenda Modules como mecanismo principal para organizar componentes relacionados e documenta especificamente o conceito de **Feature Modules**, que agrupam funcionalidades de um mesmo domínio e ajudam a manter limites claros.

A arquitetura também evita tornar todos os providers globais sem necessidade, mantendo dependências explícitas entre módulos. A própria documentação do NestJS destaca que módulos globais indiscriminados aumentam o acoplamento e que a exposição explícita por `imports` e `exports` ajuda a manter a estrutura sustentável.

---

# 9. Motivo da escolha arquitetural

O fator de decisão principal foi a relação entre:

```text
Complexidade do sistema
          ×
Tamanho do projeto
          ×
Necessidade de evolução
```

A arquitetura escolhida busca o seguinte equilíbrio:

```text
              Arquitetura
                  │
        ┌─────────┴─────────┐
        │                   │
   Simplicidade        Evolutividade
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
      Feature-Oriented Modular
                  +
         Modular Monolith
```

O projeto começa com poucas abstrações e limites claros.

Caso a complexidade aumente, novas abstrações podem ser introduzidas conforme necessidades concretas apareçam.

A intenção não é prever todas as necessidades futuras, mas criar uma estrutura que permita evoluir sem precisar reestruturar todo o projeto.

---

# 10. Decisão sobre microservices

Também foi decidido que o backend não será inicialmente dividido em microservices.

O modelo inicial é:

```text
Next.js
   │
   │ HTTP / REST
   ▼
NestJS
   │
   ▼
Database
```

O NestJS permanece como um **Modular Monolith**.

A divisão em microservices poderá ser considerada posteriormente caso existam requisitos reais que justifiquem:

* escala independente;
* deploy independente;
* isolamento operacional;
* domínio suficientemente independente;
* equipes independentes;
* requisitos de infraestrutura distintos.

Até que exista uma dessas necessidades, a modularização interna é considerada suficiente.

---

# 11. Princípio de evolução

A principal regra arquitetural estabelecida durante esta etapa foi:

> **Começar modular, não complexo.**

A evolução esperada é:

```text
Estrutura simples
       ↓
Necessidade concreta
       ↓
Nova abstração
       ↓
Nova fronteira
       ↓
Evolução arquitetural
```

e não:

```text
Arquitetura complexa
       ↓
Implementação de abstrações
       ↓
Tentativa de encontrar utilidade para elas
```

Dessa forma, padrões como Repository, Use Case, Adapter, Gateway ou interfaces adicionais devem ser introduzidos quando houver uma necessidade concreta.

---

# 12. Resultado dos dois primeiros dias

Ao final do segundo dia, o projeto passou a possuir:

```text
┌───────────────────────────────────────────────┐
│                 PROJETO                       │
├───────────────────────────────────────────────┤
│                                               │
│  Planejamento técnico                        │
│          │                                    │
│          ▼                                    │
│  Repositório                                  │
│          │                                    │
│          ▼                                    │
│  CI                                           │
│  ├── Lint                                     │
│  ├── Typecheck                                │
│  └── Tests                                    │
│          │                                    │
│          ▼                                    │
│  Rulesets                                     │
│  ├── development                              │
│  ├── release/*                                │
│  └── main                                     │
│          │                                    │
│          ▼                                    │
│  Arquitetura                                  │
│  ├── Next.js + React                          │
│  ├── Feature-Oriented                         │
│  ├── NestJS                                   │
│  └── Modular Monolith                         │
│          │                                    │
│          ▼                                    │
│  Agents + Skills + Docs                       │
│                                               │
└───────────────────────────────────────────────┘
```

O projeto deixa de ser apenas uma aplicação em desenvolvimento e passa a possuir uma estrutura mínima de engenharia para controlar como o código é criado, validado, integrado e evoluído.

---

# Dia 3 — Segunda, 28/09/2026

## Primeira onda funcional: lista pública na API

O terceiro dia foi a primeira implementação de produto depois do planejamento e do fluxo de branches. O alvo foi a onda 1 de `docs/plano-acao-implementacao.md`: a API passa a expor a lista pública de fichas aprovadas, lendo Postgres e calculando os pontos de exibição com `validarFicha`.

A alteração foi feita na branch `feature/lista-publica` e entrou em `development` por squash. `main` não foi movida. O fluxo definido no dia anterior permanece: `main` só recebe uma release.

---

# 1. Contrato de `GET /fichas-publicas`

`apps/*` passou a fazer parte dos workspaces. Foi criado `apps/api`, pacote `@victory/api`, com NestJS. O endpoint não exige autenticação. A resposta é um array JSON com `nome`, `conceito`, `poder`, `habilidade`, `resistencia`, `pa`, `pm` e `pv`. A consulta filtra `status = aprovada` e ordena por nome.

`pa`, `pm` e `pv` não são gravados. Saem de `validarFicha`: PA é o Poder, PM é a Habilidade vezes cinco e PV é a Resistência vezes cinco. Nome e conceito são colunas da inscrição, porque não existem no tipo `Ficha`.

Se uma linha já marcada como aprovada não passa na validação, ela fica de fora da lista e o repositório registra um aviso. A matemática continua só em `packages/rules`. O pacote ganhou compilação (`build`, `main` e `src/index.ts`) para a API importar o JavaScript gerado. O typecheck da API compila as regras antes de checar o Nest. Os sete testes de `validarFicha` não foram movidos.

---

# 2. Tabela, cliente SQL e sementes

O acesso ao banco ficou em `InscricoesRepository`, com o cliente `pg`. Não foi adotado um segundo ORM. `DATABASE_URL` é obrigatória. Na subida, a API tenta a conexão quinze vezes, com um segundo entre as tentativas, cria a tabela `inscricoes` se ela não existir e semeia.

A tabela já nasce com as colunas previstas para as ondas seguintes: `id`, `nome`, `conceito`, `ficha` em JSON, `status`, `sub`, `correlation_id` e `motivos`. No seed, `sub` e o correlation id ficam nulos.

As duas linhas entram como `aprovada`. O insert usa `ON CONFLICT (id) DO NOTHING`. Uma semente que `validarFicha` recusa interrompe a subida.

* **Lívia do Cais** — Estivadora que briga com gancho e blefe. Poder 2, Habilidade 2, Resistência 2, Luta, Manha, Forte e Ataque Especial Preciso. A exibição fica PA 2, PM 10 e PV 10.
* **Nuno do Farol** — Guia do porto que lê o tempo e convence a tripulação. Poder 1, Habilidade 2, Resistência 2, Influência, Percepção, Medicina, Carismático e Ágil. A exibição fica PA 1, PM 10 e PV 10.

Os nomes e os conceitos são originais. Isso fecha, no código, a pendência da segunda ficha que o plano deixava em aberto. O arquivo do plano não foi reescrito neste dia.

---

# 3. Compose e a porta do Postgres

O `docker-compose.yml` sobe Postgres 16 e a API. O banco tem healthcheck com `pg_isready`. A API só inicia depois que o Postgres está saudável e publica a porta 3000. O Dockerfile usa Node 22, instala as dependências na raiz do monorepo e compila `@victory/rules` e `@victory/api`.

A primeira subida tentou publicar a porta 5432 do Postgres no host e falhou, porque essa porta já estava ocupada. A correção foi não publicar a porta do banco. A API alcança o Postgres pelo nome `postgres` na rede do Compose. O `.env.example` registra `DATABASE_URL` e `PORT` para uso local. O `.env` continua fora do Git.

Com a stack no ar, `GET /fichas-publicas` respondeu 200 com as duas fichas.

---

# 4. O que esta onda não fez

Não houve frontend, login, `POST /inscricoes`, Redis, worker nem correlation id na resposta. O workflow de CI não mudou: continuam Lint, Typecheck e Test, sem job de build ou de deploy. A raiz ainda não tem script `build`.

A lista pública está em `development`. `main` segue com a documentação dos dois primeiros dias até a próxima release.

---

# 5. Próximo passo

A onda 2 do plano é a home em Next.js: Server Component na rota `/`, lendo este endpoint, com nome, conceito, atributos e PA, PM e PV. O Compose ainda não inclui o serviço web.

---

# Referências utilizadas

As decisões deste documento foram baseadas principalmente na documentação oficial das tecnologias utilizadas e na documentação oficial do GitHub.

### Next.js

**Next.js Documentation**

[Next.js Documentation](https://nextjs.org/docs?utm_source=chatgpt.com)

A documentação apresenta o Next.js como framework React e documenta o App Router como a arquitetura de roteamento moderna do framework.

### React

**Thinking in React**

[React — Thinking in React](https://react.dev/learn/thinking-in-react?utm_source=chatgpt.com)

Utilizado como referência para a decomposição da interface em componentes e organização do fluxo de dados.

### NestJS

**NestJS — Modules**

[NestJS — Modules](https://docs.nestjs.com/modules?utm_source=chatgpt.com)

Referência principal para a utilização de Modules e Feature Modules como mecanismo de organização do backend.

### GitHub

**GitHub — Available rules for rulesets**

[GitHub — Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets?utm_source=chatgpt.com)

Referência utilizada para as regras de Pull Request, status checks, force pushes, deleções e métodos de merge.

**GitHub — Creating rulesets for a repository**

[GitHub — Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository?utm_source=chatgpt.com)

Referência utilizada para configuração dos Rulesets e direcionamento das regras para branches.

**GitHub — Status checks**

[GitHub — Status checks](https://docs.github.com/en/pull-requests/reference/status-checks?utm_source=chatgpt.com)

Referência para a utilização dos status checks como requisito para integração das alterações.

---

# Estado atual

**Dia 1 — concluído**

* Planejamento da entrevista técnica;
* criação do repositório;
* pipeline inicial;
* lint;
* typecheck;
* testes;
* regras de Pull Request;
* configuração de Agents;
* configuração de Skills;
* definição inicial da documentação como fonte de verdade.

**Dia 2 — concluído**

* criação das branches `development` e `homolog`;
* definição dos Rulesets;
* proteção de `development`;
* proteção de `main`;
* regras para `release/*`;
* integração dos status checks ao fluxo de merge;
* consolidação do modelo arquitetural;
* definição de **Feature-Oriented Modular Architecture + Modular Monolith**.

**Demo — no ar em `development`**

* home pública, login PKCE e inscrição;
* worker `validar-ficha` com correlation id;
* caso de uso no Jest, sem Docker;
* Compose com Next, Nest, Postgres, Redis e Keycloak.

**Próxima etapa:** release quando houver uma versão para publicar. `main` ainda não inclui o app Next.
