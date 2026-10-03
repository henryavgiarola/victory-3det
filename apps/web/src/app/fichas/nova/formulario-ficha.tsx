"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  PERICIAS,
  validarFicha,
  type Codigo,
  type Desvantagem,
  type EfeitoAtaque,
  type EfeitoDefesa,
  type Ficha,
  type Pericia,
  type Vantagem,
} from "@victory/rules";
import {
  ROTULO_ATAQUE,
  ROTULO_CODIGO,
  ROTULO_DEFESA,
  ROTULO_DESVANTAGEM,
  ROTULO_PERICIA,
  ROTULO_VANTAGEM,
} from "../../../tema/rotulos";

const VANTAGENS_SIMPLES = [
  "agil",
  "anulacao",
  "carismatico",
  "forte",
  "genio",
  "resoluto",
  "vigoroso",
] as const;

const DESVANTAGENS_SIMPLES = [
  "antipatico",
  "atrapalhado",
  "fracote",
  "fragil",
  "indeciso",
  "infame",
  "tapado",
] as const;

const EFEITOS_ATAQUE: EfeitoAtaque[] = ["espiritual", "potente", "penetrante", "perigoso", "preciso"];
const EFEITOS_DEFESA: EfeitoDefesa[] = ["esquiva", "reflexao", "robusta", "tenaz"];
const CODIGOS: Codigo[] = ["cacador", "combate", "derrota", "herois"];

export function FormularioFicha() {
  const [nome, setNome] = useState("");
  const [conceito, setConceito] = useState("");
  const [poder, setPoder] = useState(1);
  const [habilidade, setHabilidade] = useState(1);
  const [resistencia, setResistencia] = useState(1);
  const [pericias, setPericias] = useState<Pericia[]>([]);
  const [simples, setSimples] = useState<string[]>([]);
  const [ataque, setAtaque] = useState(false);
  const [efeitoAtaque, setEfeitoAtaque] = useState<EfeitoAtaque>("preciso");
  const [defesa, setDefesa] = useState(false);
  const [efeitoDefesa, setEfeitoDefesa] = useState<EfeitoDefesa>("esquiva");
  const [alcance, setAlcance] = useState(false);
  const [pontosAlcance, setPontosAlcance] = useState<1 | 2>(1);
  const [maestria, setMaestria] = useState(false);
  const [periciaMaestria, setPericiaMaestria] = useState<Pericia>("luta");
  const [desvantagens, setDesvantagens] = useState<string[]>([]);
  const [codigo, setCodigo] = useState(false);
  const [qualCodigo, setQualCodigo] = useState<Codigo>("cacador");
  const [resposta, setResposta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const ficha = useMemo<Ficha>(() => {
    const vantagens: Vantagem[] = simples.map((tipo) => ({ tipo }) as Vantagem);
    if (ataque) {
      vantagens.push({ tipo: "ataqueEspecial", efeito: efeitoAtaque });
    }
    if (defesa) {
      vantagens.push({ tipo: "defesaEspecial", efeito: efeitoDefesa });
    }
    if (alcance) {
      vantagens.push({ tipo: "alcance", pontos: pontosAlcance });
    }
    if (maestria) {
      vantagens.push({ tipo: "maestria", pericia: periciaMaestria });
    }
    const listaDesvantagens: Desvantagem[] = desvantagens.map((tipo) => ({ tipo }) as Desvantagem);
    if (codigo) {
      listaDesvantagens.push({ tipo: "codigo", codigo: qualCodigo });
    }
    return { poder, habilidade, resistencia, pericias, vantagens, desvantagens: listaDesvantagens };
  }, [
    alcance,
    ataque,
    codigo,
    defesa,
    desvantagens,
    efeitoAtaque,
    efeitoDefesa,
    habilidade,
    maestria,
    periciaMaestria,
    pericias,
    poder,
    pontosAlcance,
    qualCodigo,
    resistencia,
    simples,
  ]);

  const calculo = validarFicha(ficha);
  const restantes = calculo.ok ? calculo.pool - calculo.pontosGastos : null;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setResposta("");
    try {
      const http = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nome, conceito, ...ficha }),
      });
      const texto = await http.text();
      if (http.status === 401) {
        window.location.assign("/api/sessao/login");
        return;
      }
      if (!http.ok) {
        setEnviando(false);
        setResposta(`Erro ${http.status}`);
        return;
      }
      const json = JSON.parse(texto) as { id: string };
      router.push(`/fichas/${json.id}`);
    } catch {
      setEnviando(false);
      setResposta("Erro ao enviar.");
    }
  }

  function alternar<T extends string>(atual: T[], valor: T, marcar: boolean): T[] {
    return marcar ? [...atual, valor] : atual.filter((item) => item !== valor);
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={enviar}>
      <TextField label="Nome" value={nome} onChange={(evento) => setNome(evento.target.value)} required fullWidth />
      <TextField
        label="Conceito"
        value={conceito}
        onChange={(evento) => setConceito(evento.target.value)}
        required
        fullWidth
      />
      <Secao titulo="Atributos">
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
          <Numero rotulo="Poder" valor={poder} aoMudar={setPoder} />
          <Numero rotulo="Habilidade" valor={habilidade} aoMudar={setHabilidade} />
          <Numero rotulo="Resistência" valor={resistencia} aoMudar={setResistencia} />
        </Box>
      </Secao>
      <Secao titulo="Perícias">
        <Grade>
          {PERICIAS.map((pericia) => (
            <FormControlLabel
              key={pericia}
              control={
                <Checkbox
                  checked={pericias.includes(pericia)}
                  onChange={(evento) => setPericias(alternar(pericias, pericia, evento.target.checked))}
                />
              }
              label={ROTULO_PERICIA[pericia]}
            />
          ))}
        </Grade>
      </Secao>
      <Secao titulo="Vantagens">
        <Grade>
          {VANTAGENS_SIMPLES.map((tipo) => (
            <FormControlLabel
              key={tipo}
              control={
                <Checkbox
                  checked={simples.includes(tipo)}
                  onChange={(evento) => setSimples(alternar(simples, tipo, evento.target.checked))}
                />
              }
              label={ROTULO_VANTAGEM[tipo]}
            />
          ))}
        </Grade>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <LinhaOpcao
            marcado={ataque}
            aoMarcar={setAtaque}
            rotulo="Ataque especial"
            controle={
              <TextField
                select
                label="Efeito do ataque"
                value={efeitoAtaque}
                disabled={!ataque}
                onChange={(evento) => setEfeitoAtaque(evento.target.value as EfeitoAtaque)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                {EFEITOS_ATAQUE.map((efeito) => (
                  <MenuItem key={efeito} value={efeito}>
                    {ROTULO_ATAQUE[efeito]}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
          <LinhaOpcao
            marcado={defesa}
            aoMarcar={setDefesa}
            rotulo="Defesa especial"
            controle={
              <TextField
                select
                label="Efeito da defesa"
                value={efeitoDefesa}
                disabled={!defesa}
                onChange={(evento) => setEfeitoDefesa(evento.target.value as EfeitoDefesa)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                {EFEITOS_DEFESA.map((efeito) => (
                  <MenuItem key={efeito} value={efeito}>
                    {ROTULO_DEFESA[efeito]}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
          <LinhaOpcao
            marcado={alcance}
            aoMarcar={setAlcance}
            rotulo="Alcance"
            controle={
              <TextField
                select
                label="Pontos"
                value={pontosAlcance}
                disabled={!alcance}
                onChange={(evento) => setPontosAlcance(Number(evento.target.value) as 1 | 2)}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </TextField>
            }
          />
          <LinhaOpcao
            marcado={maestria}
            aoMarcar={setMaestria}
            rotulo="Maestria"
            controle={
              <TextField
                select
                label="Perícia"
                value={periciaMaestria}
                disabled={!maestria}
                onChange={(evento) => setPericiaMaestria(evento.target.value as Pericia)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                {PERICIAS.map((pericia) => (
                  <MenuItem key={pericia} value={pericia}>
                    {ROTULO_PERICIA[pericia]}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        </Stack>
      </Secao>
      <Secao titulo="Desvantagens">
        <Grade>
          {DESVANTAGENS_SIMPLES.map((tipo) => (
            <FormControlLabel
              key={tipo}
              control={
                <Checkbox
                  checked={desvantagens.includes(tipo)}
                  onChange={(evento) => setDesvantagens(alternar(desvantagens, tipo, evento.target.checked))}
                />
              }
              label={ROTULO_DESVANTAGEM[tipo]}
            />
          ))}
        </Grade>
        <Box sx={{ mt: 1 }}>
          <LinhaOpcao
            marcado={codigo}
            aoMarcar={setCodigo}
            rotulo="Código"
            controle={
              <TextField
                select
                label="Qual código"
                value={qualCodigo}
                disabled={!codigo}
                onChange={(evento) => setQualCodigo(evento.target.value as Codigo)}
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
              >
                {CODIGOS.map((item) => (
                  <MenuItem key={item} value={item}>
                    {ROTULO_CODIGO[item]}
                  </MenuItem>
                ))}
              </TextField>
            }
          />
        </Box>
      </Secao>
      <Alert severity={calculo.ok ? "success" : "warning"} role="status">
        {calculo.ok ? `Pontos restantes: ${restantes}` : calculo.motivos.join(" ")}
      </Alert>
      {resposta ? <Alert severity="error">{resposta}</Alert> : null}
      <Box>
        <Button type="submit" variant="contained" disabled={enviando} sx={{ width: { xs: "100%", sm: "auto" } }}>
          {enviando ? "Enviando…" : "Enviar"}
        </Button>
      </Box>
    </Stack>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Box
      component="fieldset"
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: { xs: 1.5, sm: 2 }, m: 0 }}
    >
      <Typography component="legend" variant="subtitle1" sx={{ px: 1 }}>
        {titulo}
      </Typography>
      {children}
    </Box>
  );
}

function Grade({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 1 }}>
      {children}
    </Box>
  );
}

function LinhaOpcao({
  marcado,
  aoMarcar,
  rotulo,
  controle,
}: {
  marcado: boolean;
  aoMarcar: (valor: boolean) => void;
  rotulo: string;
  controle: ReactNode;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
      <FormControlLabel
        sx={{ minWidth: { sm: 200 }, m: 0 }}
        control={<Checkbox checked={marcado} onChange={(evento) => aoMarcar(evento.target.checked)} />}
        label={rotulo}
      />
      {controle}
    </Stack>
  );
}

function Numero({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: number;
  aoMudar: (valor: number) => void;
}) {
  return (
    <TextField
      label={rotulo}
      type="number"
      value={valor}
      onChange={(evento) => aoMudar(Number(evento.target.value))}
      slotProps={{ htmlInput: { min: 0, max: 5 } }}
      fullWidth
    />
  );
}
