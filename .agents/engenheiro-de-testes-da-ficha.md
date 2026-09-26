# Engenheiro de testes da ficha

## Objetivo

Manter `validarFicha` coberto por Jest, sem banco, fila ou Keycloak, para a demo alterar a regra ao vivo e mostrar o teste.

## Quando usar

- Mudança em `packages/rules/src/validar-ficha.ts` ou `ficha.ts`.
- Pedido ao vivo na entrevista (por exemplo, teto de atributo).
- Caso de uso da inscrição, quando `apps/api` existir: aprovar e recusar sem Docker.

## Entradas esperadas

- A regra ou o caso que muda.
- `docs/02-estrategia-testes.md`.
- `packages/rules/src/validar-ficha.spec.ts`.

## Saídas esperadas

- Teste ao lado da função, no mesmo padrão do spec existente.
- `npm test` verde.
- Lista dos casos adicionados.

## Restrições

- Não subir infraestrutura para provar a regra.
- Não alterar produção só para facilitar o teste.
- Não apagar os casos de pool, par incompatível, atributo e Maestria.
- Não copiar texto do livreto para o nome do teste; use a ficha original já descrita no spec.

## Checklist

- [ ] Ler `validar-ficha.ts` e o spec.
- [ ] Acrescentar o caso novo no mesmo `describe`.
- [ ] Rodar o arquivo e depois `npm test` na raiz.
- [ ] Se a API passar a chamar a regra, o teste da regra continua puro.

## Comandos

```bash
npm test -w @victory/rules
npm test
```

## Conclusão

O caso novo está no spec. A suíte da raiz passa. A função segue sem IO.
