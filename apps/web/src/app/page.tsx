import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { listarFichasPublicas, type FichaPublica } from "../listar-fichas-publicas";

export const dynamic = "force-dynamic";

export default async function Home() {
  let fichas: FichaPublica[] = [];
  let falha = false;
  try {
    fichas = await listarFichasPublicas();
  } catch {
    falha = true;
  }

  return (
    <Stack spacing={3}>
      <header>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}>
          Fichas públicas
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Personagens já aprovados. A lista vem do servidor.
        </Typography>
      </header>
      {falha ? <Alert severity="error">Não foi possível carregar as fichas.</Alert> : null}
      {!falha && fichas.length === 0 ? <Alert severity="info">Nenhuma ficha aprovada.</Alert> : null}
      <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {fichas.map((ficha) => (
          <Card key={ficha.nome} component="li">
            <CardContent>
              <Typography variant="h2" component="h2">
                {ficha.nome}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                {ficha.conceito}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Chip label={`Poder ${ficha.poder}`} variant="outlined" color="primary" />
                <Chip label={`Habilidade ${ficha.habilidade}`} variant="outlined" color="primary" />
                <Chip label={`Resistência ${ficha.resistencia}`} variant="outlined" color="primary" />
                <Chip label={`PA ${ficha.pa}`} color="secondary" />
                <Chip label={`PM ${ficha.pm}`} color="secondary" />
                <Chip label={`PV ${ficha.pv}`} color="secondary" />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
