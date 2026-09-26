# Sem código sem evidência

Nenhuma alteração de produção, teste ou configuração parte só de suposição. A decisão cita arquivo ou configuração lida neste repositório.

O plano da entrevista descreve `apps/web`, `apps/api` e `docker-compose.yml`. Enquanto esses paths não existirem, trate-os como alvo, não como código presente.

## Checklist antes de implementar

- [ ] Li `package.json` (workspaces, scripts, Node `>=22`).
- [ ] Confirmei o que já existe em `packages/rules/src/`.
- [ ] Confirmei se `apps/web` e `apps/api` já foram criados.
- [ ] Li `.github/workflows/ci.yml` (jobs Lint, Typecheck, Test).
- [ ] Li `eslint.config.mjs`.
- [ ] O incremento cabe em um item do plano em `docs/01-mapa-arquitetura.md`.

## Checklist antes de refatorar

- [ ] O comportamento atual tem teste em `packages/rules`?
- [ ] Se não tiver, o teste de caracterização vem antes da mudança.
- [ ] A mudança é a menor que fecha o incremento.

## Evidências aceitas

| Tipo | Exemplo neste repo |
|------|--------------------|
| Regra | `packages/rules/src/validar-ficha.ts` |
| Teste | `packages/rules/src/validar-ficha.spec.ts` |
| Contrato | `packages/rules/src/ficha.ts` |
| CI | `.github/workflows/ci.yml` |
| Workspace | `package.json`, `packages/rules/package.json` |

## Saída de cada incremento

1. Paths lidos.
2. O que foi confirmado no código e o que ainda é só plano.
3. Comandos rodados e o resultado.
