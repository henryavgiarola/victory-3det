"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ROTULO_STATUS } from "../../../../tema/rotulos";

interface Estado {
  status: string;
  motivos: string[];
  correlationId: string;
}

const COR_STATUS: Record<string, "info" | "warning" | "success" | "error" | "default"> = {
  submetida: "info",
  em_processamento: "warning",
  aprovada: "success",
  recusada: "error",
};

export function PainelStatus({ id }: { id: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function ler() {
      let http: Response;
      try {
        http = await fetch(`/api/inscricoes/${id}`);
      } catch {
        if (ativo) {
          setErro("Não foi possível consultar a inscrição.");
        }
        return;
      }
      if (!ativo) {
        return;
      }
      if (http.status === 401) {
        window.location.assign("/api/sessao/login");
        return;
      }
      if (!http.ok) {
        setErro(http.status === 404 ? "Inscrição não encontrada." : `Erro ${http.status}`);
        return;
      }
      const json = (await http.json()) as { status: string; motivos: string[] };
      const correlationId = http.headers.get("x-correlation-id") ?? "";
      setEstado({ status: json.status, motivos: json.motivos ?? [], correlationId });
      if (json.status === "submetida" || json.status === "em_processamento") {
        timer = setTimeout(() => void ler(), 400);
      }
    }

    void ler();
    return () => {
      ativo = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [id]);

  if (erro) {
    return <Alert severity="error">{erro}</Alert>;
  }
  if (!estado) {
    return (
      <Stack spacing={1} role="status">
        <Typography>Carregando.</Typography>
        <LinearProgress aria-label="Carregando a inscrição" />
      </Stack>
    );
  }

  const acompanhando = estado.status === "submetida" || estado.status === "em_processamento";
  const rotulo = ROTULO_STATUS[estado.status] ?? estado.status;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {acompanhando ? <LinearProgress aria-label="Acompanhando a inscrição" /> : null}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography component="h2" variant="h2">
              {rotulo}
            </Typography>
            <Chip label={estado.status} color={COR_STATUS[estado.status] ?? "default"} />
          </Stack>
          {estado.status === "recusada" ? (
            <Alert severity="error">
              <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>
                {estado.motivos.map((motivo) => (
                  <li key={motivo}>{motivo}</li>
                ))}
              </Stack>
            </Alert>
          ) : null}
          {estado.status === "aprovada" ? <Alert severity="success">A ficha foi aprovada.</Alert> : null}
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Correlation id
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
              {estado.correlationId}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
