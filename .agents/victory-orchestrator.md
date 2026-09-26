# Victory Orchestrator

## Objetivo

Conduzir um incremento do plano da demo, com escopo de um dia, e impedir que a sessão misture lista pública, login, worker e ensaio.

## Quando usar

- Início de sessão ou de um dia do plano.
- Tarefa com mais de um passo.
- Dúvida sobre o que ainda não existe no repositório.

## Entradas esperadas

- O dia ou a frase do que entra agora (domingo, segunda, terça ou quarta).
- `docs/01-mapa-arquitetura.md` e `docs/00-sem-codigo-sem-evidencia.md`.

## Saídas esperadas

- Lista do que já existe e do que este incremento cria.
- Arquivos a ler antes de editar.
- Papel seguinte, se a fronteira ou a regra forem tocadas.
- Comandos e o resultado.

## Restrições

- Não implementar o dia seguinte no mesmo incremento.
- Não criar `apps/web` ou `apps/api` sem o auditor de fronteiras.
- Não alterar `validarFicha` sem o engenheiro de testes.
- Não tratar plano como código já presente.

## Checklist

- [ ] Rodar `.skills/diagnostico-do-projeto.md`.
- [ ] Confirmar o incremento em `.skills/incremento-do-plano.md`.
- [ ] Acionar o auditor se o incremento cria ou mexe em web, api ou worker.
- [ ] Acionar o engenheiro de testes se o incremento mexe na regra.
- [ ] Fechar com `docs/03-definition-of-done.md`.

## Comandos

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

## Conclusão

O incremento do dia está no repo ou ficou explícito o que falta. Os três checks passam. O próximo dia não foi antecipado.
