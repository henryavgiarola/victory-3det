"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function iniciais(nome: string, sobrenome: string): string {
  const letras = `${nome} ${sobrenome}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
  return letras || "?";
}

export function FormularioConta() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function ler() {
      const http = await fetch("/api/conta");
      if (!ativo) {
        return;
      }
      if (http.status === 401) {
        window.location.assign("/api/sessao/login");
        return;
      }
      if (!http.ok) {
        setErro("Não foi possível ler a conta.");
        setCarregando(false);
        return;
      }
      const json = (await http.json()) as { nome: string; sobrenome: string };
      setNome(json.nome);
      setSobrenome(json.sobrenome);
      setCarregando(false);
    }
    void ler();
    return () => {
      ativo = false;
    };
  }, []);

  async function salvarNome() {
    setAviso("");
    setErro("");
    const http = await fetch("/api/conta", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nome, sobrenome }),
    });
    if (http.status === 401) {
      window.location.assign("/api/sessao/login");
      return;
    }
    const json = (await http.json()) as { mensagem?: string };
    if (!http.ok) {
      setErro(json.mensagem ?? "Não foi possível gravar a conta.");
      return;
    }
    setAviso("Nome e sobrenome gravados.");
  }

  async function salvarSenha() {
    setAviso("");
    setErro("");
    const http = await fetch("/api/conta/senha", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ senhaAtual, senhaNova, confirmacao }),
    });
    if (http.status === 401) {
      window.location.assign("/api/sessao/login");
      return;
    }
    if (http.status === 204) {
      setSenhaAtual("");
      setSenhaNova("");
      setConfirmacao("");
      setAviso("Senha alterada.");
      return;
    }
    const json = (await http.json()) as { mensagem?: string };
    setErro(json.mensagem ?? "Não foi possível alterar a senha.");
  }

  if (carregando) {
    return <Typography role="status">Carregando.</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Avatar aria-label="Sem imagem de perfil" sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
          {iniciais(nome, sobrenome)}
        </Avatar>
        <Typography color="text.secondary">A imagem ainda não tem onde ser gravada.</Typography>
      </Stack>
      {erro ? <Alert severity="error">{erro}</Alert> : null}
      {aviso ? <Alert severity="success">{aviso}</Alert> : null}
      <Stack spacing={2} component="form" onSubmit={(evento) => evento.preventDefault()}>
        <TextField label="Nome" value={nome} onChange={(evento) => setNome(evento.target.value)} required fullWidth />
        <TextField
          label="Sobrenome"
          value={sobrenome}
          onChange={(evento) => setSobrenome(evento.target.value)}
          required
          fullWidth
        />
        <Button type="button" variant="contained" onClick={() => void salvarNome()} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Salvar nome
        </Button>
      </Stack>
      <Stack spacing={2} component="form" onSubmit={(evento) => evento.preventDefault()}>
        <Typography variant="h2">Senha</Typography>
        <TextField
          label="Senha atual"
          type="password"
          value={senhaAtual}
          onChange={(evento) => setSenhaAtual(evento.target.value)}
          autoComplete="current-password"
          fullWidth
        />
        <TextField
          label="Senha nova"
          type="password"
          value={senhaNova}
          onChange={(evento) => setSenhaNova(evento.target.value)}
          autoComplete="new-password"
          fullWidth
        />
        <TextField
          label="Confirmação"
          type="password"
          value={confirmacao}
          onChange={(evento) => setConfirmacao(evento.target.value)}
          autoComplete="new-password"
          fullWidth
        />
        <Button type="button" variant="contained" color="secondary" onClick={() => void salvarSenha()} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Alterar senha
        </Button>
      </Stack>
    </Stack>
  );
}
