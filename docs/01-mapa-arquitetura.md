# Mapa de arquitetura

O que está no repositório hoje e o desenho que a demo da entrevista precisa atingir. Atualize a seção "No repositório" quando um app entrar.

## No repositório

```text
victory-3det/
  packages/rules/     @victory/rules — validarFicha, sem IO
  .github/workflows/ci.yml
```

`validarFicha` em `packages/rules/src/validar-ficha.ts` aplica o kit demo: pool de 10 pontos, no máximo 2 de desvantagem, atributo de 0 a 5, perícias, vantagens, desvantagens e pares incompatíveis. Derivados de exibição: PA = Poder, PM = Habilidade × 5, PV = Resistência × 5. A resposta traz `motivos` quando recusa.

O teste em `packages/rules/src/validar-ficha.spec.ts` cobre ficha dentro do pool, Ágil com Atrapalhado, atributo acima de 5 e Maestria sem a perícia.

## Alvo da demo

Ainda não está no código. Cada linha entra no dia indicado.

| Peça | Onde | Dia |
|------|------|-----|
| `GET /fichas-publicas` e `/` em Server Component | `apps/api`, `apps/web` | Domingo |
| Login OIDC (PKCE), cookie httpOnly, `POST /inscricoes` | BFF no Next, Nest com JWKS | Segunda |
| Fila `validar-ficha`, status e correlation id | worker BullMQ no mesmo projeto Nest | Terça |
| README do fluxo e ensaio da demo | raiz | Quarta |

```text
browser → Next (sessão no BFF) → Nest (JWT via JWKS) → Postgres
                                      └→ Redis → worker → validarFicha
```

Compose previsto: `web`, `api`, `postgres`, `redis`, `keycloak`. Realm `victory`, client público `victory-web` com PKCE, usuário `jogador`.

Status: `submetida` → `em_processamento` → `aprovada` ou `recusada`. A ficha só é lida ou alterada pelo `sub` do token. Cada `POST /inscricoes` gera um correlation id na linha, no log e no header; o worker reutiliza o mesmo id.

## Fronteiras

| Módulo | Pode | Não pode |
|--------|------|----------|
| `packages/rules` | Função pura da ficha | Next, Nest, Postgres, Redis, Keycloak |
| `apps/web` | Server Component, cookie de sessão, chamar a API com o access token | Validar pontos da ficha de novo; guardar sessão no Nest |
| `apps/api` | JWT via JWKS, gravar inscrição, publicar job | Aceitar request sem conferir emissor, audiência e expiração |
| worker | Chamar `validarFicha` e gravar o status | Duplicar a matemática fora de `packages/rules` |

Fora do corte: rolagem de dados, combate, PDF e app mobile.

O kit 3D&T Victory é material da Jambô. Implemente a matemática e fichas originais. Não copie texto, biografia ou arte do livreto.
