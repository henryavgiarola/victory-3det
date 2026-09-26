# Incremento do plano

Um dia por vez. O critério de pronto está em `docs/03-definition-of-done.md`.

## Domingo — lista pública

Compose com Postgres. Nest expõe `GET /fichas-publicas`. A `/` do Next busca isso num Server Component: nome, conceito em uma linha, P/H/R e PA/PM/PV. Seed com duas fichas originais `aprovada`.

Pronto quando a home mostra as duas fichas sem JavaScript no cliente para essa lista.

## Segunda — login e inscrição

Keycloak no Compose. Authorization Code com PKCE, callback, cookie httpOnly. `/fichas/nova` monta a ficha. `POST /inscricoes` exige Bearer válido, grava `submetida` e enfileira `validar-ficha`.

Pronto quando, sem login, a rota redireciona; com login, a ficha entra como `submetida`; token inválido recebe 401.

## Terça — worker e trilha

O worker marca `em_processamento`, chama `validarFicha` e grava `aprovada` ou `recusada` com os motivos. Log com `correlationId` na API e no worker.

Pronto quando uma ficha ilegal fica `recusada` com o motivo e o teste da regra segue sem Docker.

## Quarta — demo

README com o desenho browser → Next → Nest → Postgres → Redis → worker. Não acrescentar rolagem, combate ou PDF.

## Referência

`docs/01-mapa-arquitetura.md` e `.agents/victory-orchestrator.md`
