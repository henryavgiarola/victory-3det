import { Suspense } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { exigirSessao } from "../../../auth";
import { ListasDeFichas } from "./listas-de-fichas";

export const dynamic = "force-dynamic";

export default async function Fichas() {
  await exigirSessao();

  return (
    <Stack spacing={3}>
      <header>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Meus personagens
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          As suas fichas, em qualquer situação, e as aprovadas de todo mundo.
        </Typography>
      </header>
      <Suspense fallback={<Typography role="status">Carregando.</Typography>}>
        <ListasDeFichas />
      </Suspense>
    </Stack>
  );
}
