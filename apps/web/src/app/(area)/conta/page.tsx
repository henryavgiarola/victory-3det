import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { exigirSessao } from "../../../auth";
import { FormularioConta } from "./formulario-conta";

export const dynamic = "force-dynamic";

export default async function Conta() {
  await exigirSessao();

  return (
    <Stack spacing={3}>
      <header>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Minha conta
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Nome e senha ficam no Keycloak. A imagem circular usa as iniciais enquanto não há arquivo.
        </Typography>
      </header>
      <FormularioConta />
    </Stack>
  );
}
