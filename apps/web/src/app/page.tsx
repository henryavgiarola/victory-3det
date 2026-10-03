import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { exigirSessao } from "../auth";
import { CartaoPainel } from "./cartao-painel";
import { MolduraPainel } from "./moldura-painel";

export const dynamic = "force-dynamic";

export default async function Home() {
  await exigirSessao();

  return (
    <MolduraPainel>
      <Stack spacing={3}>
        <header>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
            Painel
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Escolha o que fazer com as fichas ou com a conta.
          </Typography>
        </header>
        <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
          <CartaoPainel href="/fichas/nova" titulo="Nova ficha" texto="Criar um personagem e enviar para validação." />
          <CartaoPainel href="/fichas" titulo="Meus personagens" texto="Ver as fichas desta conta e as já aprovadas." />
          <CartaoPainel href="/conta" titulo="Minha conta" texto="Alterar nome, sobrenome e senha." />
        </Stack>
      </Stack>
    </MolduraPainel>
  );
}
