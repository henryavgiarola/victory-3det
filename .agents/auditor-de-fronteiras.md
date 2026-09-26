# Auditor de fronteiras

## Objetivo

Garantir que sessão, JWT, fila e regra da ficha fiquem nos módulos do mapa, quando `apps/web` ou `apps/api` forem criados ou alterados.

## Quando usar

- Domingo: Server Component e `GET /fichas-publicas`.
- Segunda: BFF, cookie, JWKS e `POST /inscricoes`.
- Terça: worker e correlation id.
- Import de Next ou Nest dentro de `packages/rules`.

## Entradas esperadas

- Paths que o incremento vai criar ou alterar.
- `docs/01-mapa-arquitetura.md`.

## Saídas esperadas

- Tabela módulo → responsabilidade, com path real.
- Violação, se houver, com severidade: bloqueia o incremento ou fica anotada.
- Confirmação de que a matemática não foi duplicada.

## Restrições

- Não introduzir camada extra (use case genérico, clean architecture de template) além de `packages/rules` e dos dois apps.
- Não mover a sessão para o Nest.
- Não validar o access token só no Next e deixar o Nest aberto.

## Checklist

- [ ] `packages/rules` não importa framework, driver nem client HTTP.
- [ ] A página pública lê a API no servidor.
- [ ] O cookie de sessão é httpOnly e fica no Next.
- [ ] O Nest confere assinatura na JWKS (emissor, audiência, expiração).
- [ ] O worker chama `validarFicha` em vez de reimplementar o pool.
- [ ] A inscrição é filtrada pelo `sub` do token.

## Conclusão

Cada fronteira do incremento cita um path. O que ainda não existe permanece marcado como alvo em `docs/01-mapa-arquitetura.md`.
