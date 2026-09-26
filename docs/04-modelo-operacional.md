# Modelo operacional

Papéis em `.agents/` e procedimentos em `.skills/`. Não substituem o que você explica na entrevista. Servem para cada sessão do Cursor repetir o mesmo corte, sem trazer o ambiente do Autua.

## O que não vem do Autua

| Autua-v2 | victory-3det |
|----------|----------------|
| Flutter, `flutter analyze`, `flutter test` | Node 22, `npm run lint`, `npm run typecheck`, `npm test` |
| GitLab CI e Sonar | GitHub Actions, três checks: Lint, Typecheck, Test |
| `lib/features`, Modular, MobX, mocktail | `packages/rules` hoje; Next e Nest no plano |
| Quality gate e exclusão de cobertura | Não enfraquecer o workflow para esconder falha |

## Orquestração

```text
Victory Orchestrator
        │
        ├── Auditor de fronteiras    (quando cria ou mexe em web, api ou worker)
        └── Engenheiro de testes     (quando mexe na regra ou no caso de uso)
```

## Quem acionar

| Tarefa | Papel | Procedimento |
|--------|-------|----------------|
| Começar o dia ou uma tarefa com mais de um passo | `.agents/victory-orchestrator.md` | `.skills/diagnostico-do-projeto.md` |
| Criar `apps/web`, `apps/api` ou o worker | `.agents/auditor-de-fronteiras.md` | `.skills/incremento-do-plano.md` |
| Alterar `validarFicha` ou o teste | `.agents/engenheiro-de-testes-da-ficha.md` | `.skills/teste-da-regra-da-ficha.md` |

## Sequência

1. Diagnóstico: o que já está no repo.
2. Um incremento do plano (domingo, segunda, terça ou quarta).
3. Se a estrutura de app mudar, o auditor confirma a fronteira antes do código.
4. Se a regra mudar, o teste acompanha no mesmo incremento.
5. `npm run lint`, `npm run typecheck`, `npm test`.

Handoff entre papéis: paths alterados, comandos e exit code, testes adicionados, pendência.

No Cursor, referencie o papel ou o procedimento no prompt, por exemplo `@.agents/victory-orchestrator.md`.

## Anti-padrões

- Implementar segunda (login) dentro do incremento de domingo (lista pública).
- Recalcular pontos no Next ou no Nest em vez de chamar `validarFicha`.
- Subir Keycloak ou Redis para provar a regra da ficha.
- Copiar agente, skill ou doc do Autua sem trocar Flutter, Sonar e GitLab pelos comandos deste repo.
