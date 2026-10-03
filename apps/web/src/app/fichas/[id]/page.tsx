import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { exigirSessao } from "../../../auth";
import { PainelStatus } from "./painel-status";

export const dynamic = "force-dynamic";

export default async function PaginaInscricao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirSessao();

  return (
    <Stack spacing={3}>
      <header>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Inscrição
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          O status atualiza sozinho até a ficha ser aprovada ou recusada.
        </Typography>
      </header>
      <PainelStatus id={id} />
    </Stack>
  );
}
