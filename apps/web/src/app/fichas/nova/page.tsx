import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { exigirSessao } from "../../../auth";
import { FormularioFicha } from "./formulario-ficha";

export const dynamic = "force-dynamic";

export default async function NovaFicha() {
  await exigirSessao();

  return (
    <Stack spacing={3}>
      <header>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Nova ficha
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Monte o personagem e envie. A regra continua valendo no envio.
        </Typography>
      </header>
      <FormularioFicha />
    </Stack>
  );
}
