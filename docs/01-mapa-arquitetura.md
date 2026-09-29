# Mapa de arquitetura

Este documento define a arquitetura, as fronteiras entre módulos e as regras estruturais do projeto.

O Cursor deve ler este documento antes de implementar novas funcionalidades.

O objetivo é manter uma arquitetura simples, modular e evolutiva, adequada ao tamanho atual do sistema, evitando abstrações ou padrões arquiteturais que não sejam justificados por uma necessidade concreta.

A arquitetura adotada é:

* **Frontend:** Next.js + React, utilizando App Router e organização orientada a features.
* **Backend:** NestJS organizado como Modular Monolith.
* **Comunicação:** HTTP/REST entre frontend e backend.
* **Organização principal:** funcionalidades/domínios, e não camadas técnicas globais.
* **Princípio:** alta coesão dentro das features e baixo acoplamento entre elas.

---

## Arquitetura geral

```text
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                      Next.js + React                        │
│                                                             │
│  App Router                                                 │
│      │                                                      │
│      ▼                                                      │
│  Features                                                   │
│  ├── auth                                                   │
│  ├── users                                                  │
│  └── <outras features>                                     │
│      │                                                      │
│      ▼                                                      │
│  Services / API Client                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP / REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                            │
│                           NestJS                            │
│                      Modular Monolith                       │
│                                                             │
│                         AppModule                           │
│                             │                               │
│             ┌───────────────┼───────────────┐               │
│             ▼               ▼               ▼               │
│           Auth            Users          <Features>          │
│          Module           Module            Module           │
│             │               │               │               │
│        Controller      Controller      Controller            │
│        Service         Service         Service               │
│        Repository*     Repository*     Repository*           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                       Database

* Repository somente quando houver necessidade concreta
  de encapsular a persistência.
```

---

# Estrutura do repositório

O frontend e o backend são aplicações independentes.

A estrutura esperada do repositório é:

```text
project/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── docs/
│   └── architecture.md
│
└── README.md
```

Caso frontend e backend estejam em repositórios independentes, a mesma arquitetura e as mesmas regras devem ser aplicadas dentro de cada repositório.

---

# No repositório

Esta seção deve ser atualizada conforme novas funcionalidades, módulos ou componentes arquiteturais forem implementados.

## Frontend

```text
frontend/
└── src/
    ├── app/
    │   ├── (public)/
    │   ├── (authenticated)/
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── features/
    │   ├── auth/
    │   ├── users/
    │   └── <feature>/
    │
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   └── shared/
    │
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   └── utils/
    │
    ├── hooks/
    ├── types/
    └── styles/
```

## Backend

```text
backend/
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   └── guards/
    │
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── users.repository.ts
    │   ├── dto/
    │   └── entities/
    │
    ├── <feature>/
    │   ├── <feature>.module.ts
    │   ├── <feature>.controller.ts
    │   ├── <feature>.service.ts
    │   ├── dto/
    │   └── ...
    │
    ├── common/
    │   ├── decorators/
    │   ├── filters/
    │   ├── guards/
    │   ├── interceptors/
    │   └── pipes/
    │
    └── config/
```

A estrutura acima representa o modelo arquitetural. Ela deve ser adaptada ao código efetivamente existente.

Não criar diretórios vazios apenas para seguir o modelo.

---

# Organização por feature

A unidade principal de organização funcional é a **feature**.

Exemplo no frontend:

```text
features/
└── users/
    ├── components/
    │   ├── UserForm.tsx
    │   └── UserTable.tsx
    ├── hooks/
    │   └── useUsers.ts
    ├── services/
    │   └── userService.ts
    ├── schemas/
    │   └── userSchema.ts
    └── types.ts
```

Exemplo no backend:

```text
users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── dto/
└── entities/
```

Uma feature deve concentrar os elementos relacionados àquela funcionalidade.

Evitar espalhar uma mesma regra de negócio por diretórios globais como:

```text
components/
hooks/
services/
types/
```

quando esses elementos pertencem exclusivamente a uma feature.

---

# Responsabilidade de cada área

## Frontend

### `app/`

Responsável pela estrutura do Next.js:

* rotas;
* layouts;
* route groups;
* páginas;
* loading/error boundaries;
* metadata;
* composição das telas.

As `page.tsx` devem permanecer preferencialmente como pontos de composição.

Regra de negócio complexa não deve ser implementada diretamente em `page.tsx`.

---

### `features/`

Responsável pelas funcionalidades do sistema.

Uma feature pode conter:

```text
components/
hooks/
services/
schemas/
types.ts
```

Somente criar os diretórios necessários.

Exemplo:

```text
features/auth/
features/users/
features/products/
```

Uma feature pode utilizar infraestrutura compartilhada de `lib`, mas não deve depender diretamente de outra feature sem uma necessidade arquitetural clara.

---

### `components/`

Contém componentes reutilizáveis entre diferentes features.

Exemplos:

```text
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
│
├── layout/
│   ├── Header.tsx
│   └── Sidebar.tsx
│
└── shared/
```

Regra:

> Se o componente pertence exclusivamente a uma funcionalidade, ele deve ficar em `features/<feature>/components`.

> Se pode ser reutilizado por múltiplas funcionalidades, pode ficar em `components`.

---

### `lib/`

Contém infraestrutura técnica compartilhada.

Exemplo:

```text
lib/
├── api/
│   ├── client.ts
│   └── errors.ts
├── auth/
└── utils/
```

`lib` não deve se transformar em um depósito genérico de regras de negócio.

Exemplo:

```text
lib/api/client.ts
```

é infraestrutura.

Enquanto:

```text
features/users/services/userService.ts
```

é comportamento específico da funcionalidade de usuários.

---

### `hooks/`

Somente hooks genuinamente compartilhados.

Hooks específicos de uma feature devem permanecer dentro dela:

```text
features/users/hooks/
```

e não:

```text
hooks/useUsers.ts
```

---

### `types/`

Somente tipos compartilhados entre diferentes áreas.

Tipos específicos devem permanecer próximos da feature que os utiliza.

---

# Backend

## `app.module.ts`

É o módulo raiz da aplicação.

Deve realizar a composição dos módulos principais:

```text
AppModule
├── AuthModule
├── UsersModule
├── ProductsModule
└── ...
```

Não deve concentrar regras de negócio.

---

## Feature Module

Cada domínio ou funcionalidade relevante deve possuir seu próprio módulo.

Exemplo:

```text
UsersModule
├── UsersController
├── UsersService
├── UsersRepository
└── DTOs
```

O módulo define explicitamente suas dependências e o que disponibiliza para os demais módulos.

---

## Controllers

Controllers são responsáveis pela interface HTTP.

Devem:

* receber requisições;
* validar/encaminhar entradas;
* chamar services;
* retornar respostas HTTP.

Não devem concentrar regras de negócio complexas.

Evitar:

```text
Controller
├── regra de negócio
├── acesso ao banco
├── transformação complexa
└── integração externa
```

Preferir:

```text
Controller
      ↓
Service
      ↓
Repository / infraestrutura
```

---

## Services

Services concentram a lógica de aplicação e negócio da feature.

Exemplo:

```text
UsersController
       ↓
UsersService
       ↓
UsersRepository
```

Não criar múltiplos services artificiais apenas para aumentar o número de camadas.

---

## Repository

Repositories são opcionais.

Não devem ser criados automaticamente para toda operação.

Quando a persistência for simples, pode ser aceitável:

```text
Controller
    ↓
Service
    ↓
ORM
```

Caso exista uma necessidade concreta de encapsular a persistência:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
ORM
```

Motivos válidos para introduzir Repository incluem:

* múltiplas operações de persistência relacionadas;
* necessidade de isolamento do ORM;
* lógica de consulta complexa;
* necessidade de substituir ou abstrair a implementação de persistência;
* testes que se beneficiem de um limite explícito.

---

# Fronteiras

As dependências devem seguir as fronteiras abaixo.

| Área                 | Pode                                            | Não pode                                            |
| -------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `app/`               | Compor páginas, layouts e features              | Concentrar regras de negócio                        |
| `features/<feature>` | Implementar comportamento específico da feature | Acessar infraestrutura de forma inconsistente       |
| `components/`        | Ser reutilizado por várias features             | Depender de uma feature específica                  |
| `lib/`               | Fornecer infraestrutura compartilhada           | Conter regra de negócio específica                  |
| `hooks/`             | Fornecer hooks realmente compartilhados         | Concentrar hooks exclusivos de uma feature          |
| `types/`             | Fornecer tipos compartilhados                   | Virar depósito de todos os tipos                    |
| Nest `controller`    | HTTP e delegação                                | Regra de negócio complexa ou acesso direto ao banco |
| Nest `service`       | Regra de aplicação/negócio                      | Responsabilidades de HTTP                           |
| Nest `repository`    | Persistência                                    | Regras de apresentação                              |
| Nest `common`        | Infraestrutura transversal                      | Regras específicas de uma feature                   |

---

# Regra de dependência

A aplicação deve buscar uma direção clara de dependências:

```text
Frontend:

app
 ↓
features
 ↓
lib
```

Componentes compartilhados:

```text
features ──────┐
               ├──→ components
app ───────────┘
```

No backend:

```text
Controller
    ↓
Service
    ↓
Repository / Infrastructure
```

O código não deve criar dependências circulares entre features.

Evitar:

```text
users → products → users
```

Quando duas features precisam compartilhar comportamento, avaliar se esse comportamento realmente pertence a uma infraestrutura compartilhada ou se existe um limite arquitetural inadequado.

---

# Comunicação entre frontend e backend

O frontend não deve acessar diretamente o banco de dados ou recursos internos do backend.

O fluxo padrão é:

```text
Next.js
   ↓
Feature Service
   ↓
API Client
   ↓
HTTP/REST
   ↓
NestJS Controller
   ↓
NestJS Service
   ↓
Repository / Database
```

Exemplo:

```text
features/users/services/userService.ts
                ↓
lib/api/client.ts
                ↓
GET /users
                ↓
UsersController
                ↓
UsersService
```

A infraestrutura HTTP deve ficar centralizada em `lib/api` no frontend.

Não criar clientes HTTP independentes em cada feature sem necessidade.

---

# Autenticação

A autenticação deve ser tratada como uma preocupação transversal.

A implementação concreta deve respeitar a tecnologia definida pelo projeto, mas a responsabilidade deve permanecer separada:

```text
Frontend
    ↓
Session / Auth
    ↓
API Client
    ↓
NestJS
    ↓
Auth / Guards
```

Regras de autenticação não devem ser duplicadas em cada feature.

Features devem consumir o mecanismo de autenticação existente.

---

# Validação

A validação deve ocorrer no limite apropriado.

No frontend:

```text
UI
 ↓
Schema / Form Validation
```

No backend:

```text
HTTP
 ↓
DTO / Validation Pipe
 ↓
Service
```

A validação do frontend não substitui a validação do backend.

O backend é responsável por proteger suas próprias fronteiras.

---

# Tratamento de erros

Erros devem possuir tratamento consistente.

No frontend:

```text
API Client
    ↓
normalização do erro
    ↓
feature
    ↓
UI
```

No backend:

```text
Controller / Service
    ↓
Nest Exception
    ↓
HTTP Response
```

Não espalhar tratamentos diferentes para o mesmo tipo de erro em múltiplas features.

---

# Regras para novas funcionalidades

Antes de implementar uma nova funcionalidade, identificar:

1. Qual é a feature/domínio ao qual ela pertence?
2. Existe uma feature existente que deve receber a alteração?
3. Algum componente é específico da feature ou compartilhado?
4. Existe infraestrutura compartilhada necessária?
5. A alteração cria uma nova dependência entre features?
6. A alteração exige uma nova abstração ou pode utilizar a estrutura existente?

A implementação deve preferir:

```text
estrutura existente
       ↓
extensão da feature
       ↓
extração de compartilhamento quando necessário
       ↓
nova abstração somente se justificada
```

Evitar criar uma nova camada arquitetural apenas para acomodar uma implementação isolada.

---

# Regra contra overengineering

Não introduzir automaticamente:

```text
UseCase
RepositoryInterface
Adapter
Gateway
Factory
Mapper
Port
DomainService
ValueObject
```

Essas abstrações somente devem ser introduzidas quando houver uma necessidade concreta e documentável.

A arquitetura escolhida é deliberadamente pragmática.

O projeto não deve implementar Clean Architecture, Hexagonal Architecture ou DDD completo apenas por convenção.

Caso a complexidade do domínio aumente, uma evolução arquitetural poderá ser proposta e documentada antes da implementação.

---

# Critérios para evolução arquitetural

Uma nova camada ou padrão pode ser introduzido quando existir pelo menos uma necessidade concreta, como:

* complexidade significativa de negócio;
* múltiplas implementações de uma mesma abstração;
* necessidade de isolamento de infraestrutura;
* crescimento significativo da equipe;
* múltiplos sistemas consumidores;
* necessidade de testes isolados de infraestrutura;
* aumento significativo da complexidade de persistência;
* integração com múltiplos provedores;
* necessidade de separar um módulo em outro serviço.

A justificativa deve ser registrada no plano da implementação.

---

# Modular Monolith

O backend deve permanecer como um **Modular Monolith** enquanto o tamanho e a complexidade do sistema não justificarem a separação em serviços independentes.

A existência de módulos independentes não significa que cada módulo deva ser transformado em microservice.

Estrutura esperada:

```text
NestJS
│
├── AuthModule
├── UsersModule
├── ProductsModule
└── ...
```

Se futuramente um módulo precisar ser extraído para um serviço independente, sua fronteira já deverá estar suficientemente definida para permitir essa evolução.

---

# Microservices

Não criar microservices como decisão inicial.

A separação em serviços somente deve ser considerada quando existir uma necessidade concreta relacionada a:

* escala independente;
* ciclo de deploy independente;
* isolamento operacional;
* domínio suficientemente independente;
* requisitos específicos de infraestrutura;
* necessidade de equipes independentes;
* limitações reais do monólito.

Até que essas necessidades existam, manter o backend como Modular Monolith.

---

# Banco de dados

O banco de dados pertence à infraestrutura do backend.

O frontend nunca deve acessar diretamente:

```text
Database
```

O acesso deve ocorrer através da API:

```text
Frontend
    ↓
HTTP
    ↓
NestJS
    ↓
Database
```

Detalhes específicos do ORM ou banco devem permanecer encapsulados no backend.

---

# Testes

Os testes devem acompanhar a estrutura funcional.

Frontend:

```text
features/users/
├── components/
├── hooks/
├── services/
└── ...
```

Testes específicos devem permanecer próximos da funcionalidade quando isso melhorar a localização e manutenção.

Backend:

```text
users/
├── users.controller.spec.ts
├── users.service.spec.ts
└── ...
```

A estratégia de testes deve priorizar comportamento e regras relevantes, evitando testes que apenas reproduzam detalhes internos de implementação.

---

# Documentação arquitetural

Este arquivo é a referência estrutural do projeto.

Sempre que uma implementação alterar significativamente:

* módulos;
* fronteiras;
* dependências;
* estrutura de diretórios;
* estratégia de autenticação;
* comunicação entre aplicações;
* persistência;
* arquitetura de deployment;

a seção **"No repositório"** e as demais seções afetadas devem ser atualizadas.

A documentação deve representar o código existente, não um estado futuro desejado.

---

# Fora do escopo arquitetural inicial

Não introduzir inicialmente:

* microservices;
* event-driven architecture completa;
* CQRS;
* Event Sourcing;
* DDD completo;
* Clean Architecture completa;
* Hexagonal Architecture completa;
* API Gateway separado;
* service mesh;
* abstrações de infraestrutura sem necessidade concreta.

Essas abordagens podem ser avaliadas futuramente caso requisitos reais passem a justificá-las.

---

# Princípios de decisão

Quando houver dúvida arquitetural, seguir esta ordem:

```text
1. Reutilizar a estrutura existente
          ↓
2. Manter a funcionalidade dentro da feature
          ↓
3. Compartilhar somente o que é realmente compartilhado
          ↓
4. Criar nova abstração quando houver necessidade concreta
          ↓
5. Avaliar mudança arquitetural somente quando a
   complexidade justificar
```

A solução deve priorizar:

* simplicidade;
* coesão;
* baixo acoplamento;
* facilidade de manutenção;
* facilidade de testes;
* evolução incremental;
* clareza das responsabilidades.

A complexidade arquitetural deve acompanhar a complexidade real do sistema.

---

# Referência arquitetural

A arquitetura deste projeto é baseada principalmente nos seguintes conceitos:

```text
Next.js
└── App Router

React
└── Componentização

Frontend
└── Feature-Oriented Architecture

NestJS
└── Feature Modules

Backend
└── Modular Monolith

Comunicação
└── HTTP / REST
```

A arquitetura não é definida pela quantidade de camadas existentes, mas pela clareza das responsabilidades e das fronteiras entre os módulos.
