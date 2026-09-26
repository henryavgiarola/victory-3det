# Teste da regra da ficha

## Quando usar

Mudança em `packages/rules` ou ensaio de uma alteração ao vivo na entrevista.

## Passos

1. Ler `packages/rules/src/validar-ficha.ts` e `validar-ficha.spec.ts`.
2. Reusar o helper `ficha()` do spec. Não criar outro runner.
3. Cobrir o caminho feliz e a recusa do caso novo. A resposta de recusa expõe `motivos`.
4. Manter o teste determinístico: sem relógio, rede, banco ou fila.
5. Rodar `npm test -w @victory/rules` e depois `npm test` na raiz.

## Convenções

- Package: `@victory/rules`.
- Tipos em `ficha.ts`. A função exportada é `validarFicha`.
- Fichas de exemplo são originais. A de 10 pontos já no spec: Poder 2, Habilidade 2, Resistência 2, Luta, Manha, Forte, Ataque Especial Preciso.

## Anti-padrões

- Reimplementar o pool no teste em vez de assertar o retorno.
- Importar Nest ou Next no spec.

## Referência

`.agents/engenheiro-de-testes-da-ficha.md` e `docs/02-estrategia-testes.md`
