import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { listarFichasPublicas, type FichaPublica } from "../../../../listar-fichas-publicas";
import { listarMinhasFichas, type ResumoInscricao } from "../../../../listar-minhas-fichas";
import { ROTULO_STATUS } from "../../../../tema/rotulos";
import { CartaoMinhaFicha } from "./cartao-minha-ficha";

export async function ListasDeFichas() {
  let minhas: ResumoInscricao[] = [];
  let publicas: FichaPublica[] = [];
  let falhaMinhas = false;
  let falhaPublicas = false;

  try {
    minhas = await listarMinhasFichas();
  } catch {
    falhaMinhas = true;
  }
  try {
    publicas = await listarFichasPublicas();
  } catch {
    falhaPublicas = true;
  }

  return (
    <Stack spacing={4}>
      <section>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Minhas fichas
        </Typography>
        {falhaMinhas ? <Alert severity="error">Não foi possível carregar as suas fichas.</Alert> : null}
        {!falhaMinhas && minhas.length === 0 ? <Alert severity="info">Você ainda não enviou uma ficha.</Alert> : null}
        <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {minhas.map((ficha) => (
            <CartaoMinhaFicha
              key={ficha.id}
              id={ficha.id}
              nome={ficha.nome}
              conceito={ficha.conceito}
              status={ROTULO_STATUS[ficha.status] ?? ficha.status}
            />
          ))}
        </Stack>
      </section>
      <section>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Aprovadas
        </Typography>
        {falhaPublicas ? <Alert severity="error">Não foi possível carregar as fichas aprovadas.</Alert> : null}
        {!falhaPublicas && publicas.length === 0 ? <Alert severity="info">Nenhuma ficha aprovada.</Alert> : null}
        <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {publicas.map((ficha) => (
            <Card key={ficha.nome} component="li">
              <CardContent>
                <Typography variant="h2">{ficha.nome}</Typography>
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
      </section>
    </Stack>
  );
}
