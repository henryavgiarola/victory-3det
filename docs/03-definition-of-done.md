# Definition of Done

## Qualquer incremento

- [ ] Um item do plano em `docs/01-mapa-arquitetura.md`, sem misturar o dia seguinte.
- [ ] `npm ci` sem erro.
- [ ] `npm run lint`, `npm run typecheck` e `npm test` verdes, os mesmos jobs de `.github/workflows/ci.yml`.
- [ ] Nenhum teste existente removido sem o motivo no incremento.
- [ ] Segredo só em `.env`, nunca commitado. `.env.example` pode subir.
- [ ] Sem texto do livreto do 3D&T.

## Regra da ficha

- [ ] A matemática continua só em `packages/rules`.
- [ ] Happy path e pelo menos um caso de recusa cobertos.
- [ ] O teste não sobe Docker, banco, fila nem Keycloak.

## Web e API, quando existirem

- [ ] Sessão no cookie httpOnly do Next. O Nest não guarda sessão.
- [ ] `POST /inscricoes` rejeita token inválido.
- [ ] A inscrição só é lida ou alterada pelo `sub` do token.
- [ ] Correlation id na linha, no log e no header da resposta.
- [ ] Token e segredo não aparecem no log.

## Comandos

```bash
npm ci
npm run lint
npm run typecheck
npm test
```
