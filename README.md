# victory-3det
A web application to develop coding skills and present in job interviews.

## Pipeline

Todo push e todo pull request dispara três checks no GitHub Actions. Os três precisam passar.

| Check | Comando | O que demonstra |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint no TypeScript |
| Typecheck | `npm run typecheck` | `tsc --noEmit` sem emitir arquivo |
| Test | `npm test` | Regra de criação da ficha, sem banco e sem fila |

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
