# Estratégia de testes

A regra da ficha é o teste que a entrevista mostra. Infra (Keycloak, Postgres, Redis) não entra no teste dessa regra.

## Pirâmide

```text
integração do caso de uso   sem Keycloak e sem fila, quando apps/api existir
teste da regra              packages/rules, prioridade, já existe
```

Não há teste de browser neste corte.

## Stack

| Ferramenta | Uso |
|------------|-----|
| Jest + ts-jest | `packages/rules`, config em `jest.config.mjs` |
| `tsc --noEmit` | tipos, job Typecheck |
| ESLint | job Lint |

O script da raiz delega com `npm run test --workspaces --if-present`.

## Prioridade

| Prioridade | Alvo | Motivo |
|------------|------|--------|
| P0 | `validarFicha` | Pura, já é o gate da CI, é o que se altera ao vivo na demo |
| P1 | Caso de uso da inscrição, quando `apps/api` existir | Aprova dentro do pool e recusa sem subir Docker |
| Fora | Keycloak, Redis, Postgres, página Next | Lentos e não provam a regra |

## Casos que o teste da regra precisa continuar cobrindo

- Ficha dentro do pool aprova e devolve PA, PM e PV.
- Par incompatível (Ágil com Atrapalhado) recusa.
- Gasto acima do pool recusa.
- Maestria sem a perícia recusa.
- Terceira desvantagem recusa; duas desvantagens aumentam o pool.

Arquivo: `packages/rules/src/validar-ficha.spec.ts`, ao lado de `validar-ficha.ts`.
