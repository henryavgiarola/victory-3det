"use client";

import { useEffect, useState } from "react";

interface Estado {
  status: string;
  motivos: string[];
  correlationId: string;
}

export function PainelStatus({ id }: { id: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function ler() {
      const http = await fetch(`/api/inscricoes/${id}`);
      if (!ativo) {
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
    return <p>{erro}</p>;
  }
  if (!estado) {
    return <p>Carregando.</p>;
  }

  return (
    <section>
      <p>Status: {estado.status}</p>
      <p>Correlation id: {estado.correlationId}</p>
      {estado.status === "recusada" ? (
        <ul>
          {estado.motivos.map((motivo) => (
            <li key={motivo}>{motivo}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
