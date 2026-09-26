# Diagnóstico do projeto

Snapshot antes de editar. Não assuma apps que o plano ainda não criou.

## Passos

1. Ler `package.json` (workspaces, scripts, `engines`).
2. Listar `packages/` e `apps/`. Registrar ausência de `apps/` se for o caso.
3. Ler `packages/rules/src/ficha.ts`, `validar-ficha.ts` e `validar-ficha.spec.ts`.
4. Ler `.github/workflows/ci.yml`.
5. Ler `docs/01-mapa-arquitetura.md` e separar "no repositório" de "alvo da demo".
6. Rodar `npm test` se o ambiente tiver dependências instaladas.

## Saída

Uma lista curta: paths confirmados, comandos e exit code, próximo incremento permitido.

## Referência

`.agents/victory-orchestrator.md`
