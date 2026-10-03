"use client";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";

function iniciais(nome: string, sobrenome: string): string {
  const letras = `${nome} ${sobrenome}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
  return letras || "?";
}

export function Cabecalho({ nome, sobrenome }: { nome: string; sobrenome: string }) {
  const texto = [nome, sobrenome].filter(Boolean).join(" ") || "Conta";

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: "3px solid", borderColor: "warning.main" }}>
      <Toolbar component="nav" aria-label="Principal" sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
        <Typography
          component={Link}
          href="/"
          variant="h2"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontSize: "1.25rem" }}
        >
          Victory
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Avatar aria-label="Sem imagem de perfil" sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}>
            {iniciais(nome, sobrenome)}
          </Avatar>
          <Typography>{texto}</Typography>
        </Stack>
        <Button component={Link} href="/api/sessao/logout" color="inherit">
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
}
