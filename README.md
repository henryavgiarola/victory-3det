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

O workflow está em `.github/workflows/ci.yml`. Para o GitHub impedir merge com check vermelho, em **Settings → Branches** crie uma regra para `main` e marque **Require status checks to pass** com Lint, Typecheck e Test. Esses nomes só aparecem depois do primeiro workflow concluído.
