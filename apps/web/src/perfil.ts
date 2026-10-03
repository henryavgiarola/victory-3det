import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { configuracaoAuth, sessaoUtilizavel } from "./auth";

export interface Perfil {
  nome: string;
  sobrenome: string;
}

export async function tokenSeUtilizavel(): Promise<string | undefined> {
  const jar = await cookies();
  const token = jar.get("sessao")?.value;
  return sessaoUtilizavel(token) ? token : undefined;
}

function urlConta(caminho: string): URL {
  const { interno, realm } = configuracaoAuth();
  return new URL(`/realms/${realm}/account${caminho}`, interno);
}

export async function lerPerfilDoToken(token: string): Promise<{ perfil?: Perfil; status: number }> {
  const resposta = await fetch(urlConta(""), {
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resposta.ok) {
    return { status: resposta.status };
  }
  const json = (await resposta.json()) as { firstName?: unknown; lastName?: unknown };
  return {
    status: resposta.status,
    perfil: {
      nome: typeof json.firstName === "string" ? json.firstName : "",
      sobrenome: typeof json.lastName === "string" ? json.lastName : "",
    },
  };
}

export async function lerPerfil(): Promise<Perfil | undefined> {
  const token = await tokenSeUtilizavel();
  if (!token) {
    redirect("/api/sessao/login");
  }
  const leitura = await lerPerfilDoToken(token);
  if (leitura.status === 401) {
    redirect("/api/sessao/logout");
  }
  return leitura.perfil;
}

export async function gravarPerfil(token: string, nome: string, sobrenome: string): Promise<number> {
  const leitura = await fetch(urlConta(""), {
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!leitura.ok) {
    return leitura.status;
  }
  const corpo = (await leitura.json()) as Record<string, unknown>;
  corpo.firstName = nome;
  corpo.lastName = sobrenome;
  const gravacao = await fetch(urlConta(""), {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(corpo),
  });
  return gravacao.status;
}

export async function gravarSenha(
  token: string,
  senhaAtual: string,
  senhaNova: string,
  confirmacao: string,
): Promise<number> {
  const resposta = await fetch(urlConta("/credentials/password"), {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      currentPassword: senhaAtual,
      newPassword: senhaNova,
      confirmation: confirmacao,
    }),
  });
  return resposta.status;
}
