import type { Ficha } from "@victory/rules";
import type { Inscricao } from "./inscricoes.repository";
import { processarValidacao } from "./worker-validacao";

function ficha(parcial: Partial<Ficha> = {}): Ficha {
  return {
    poder: 0,
    habilidade: 0,
    resistencia: 0,
    pericias: [],
    vantagens: [],
    desvantagens: [],
    ...parcial,
  };
}

class RepositorioFalso {
  linha: Inscricao;
  historico: string[] = [];

  constructor(dados: Ficha) {
    this.linha = {
      id: "33333333-3333-4333-8333-333333333333",
      nome: "Ficha de prova",
      conceito: "Personagem usado só no teste.",
      ficha: dados,
      status: "submetida",
      sub: "dono",
      correlationId: "correlation-de-prova",
      motivos: [],
    };
  }

  async buscar(id: string): Promise<Inscricao | undefined> {
    return id === this.linha.id ? this.linha : undefined;
  }

  async marcarProcessamento(id: string): Promise<void> {
    if (id !== this.linha.id || this.linha.status !== "submetida") {
      return;
    }
    this.linha.status = "em_processamento";
    this.historico.push(this.linha.status);
  }

  async concluir(id: string, status: "aprovada" | "recusada", motivos: string[]): Promise<void> {
    if (id !== this.linha.id) {
      return;
    }
    if (this.linha.status !== "submetida" && this.linha.status !== "em_processamento") {
      return;
    }
    this.linha.status = status;
    this.linha.motivos = motivos;
    this.historico.push(status);
  }
}

class FilaFalsa {
  jobs: { nome: string; dados: { id: string } }[] = [];

  publicar(id: string): void {
    this.jobs.push({ nome: "validar-ficha", dados: { id } });
  }

  async consumir(repositorio: RepositorioFalso): Promise<void> {
    const job = this.jobs.shift();
    if (!job) {
      throw new Error("fila vazia");
    }
    await processarValidacao(job.dados.id, repositorio);
  }
}

async function executar(dados: Ficha): Promise<RepositorioFalso> {
  const repositorio = new RepositorioFalso(dados);
  const fila = new FilaFalsa();
  fila.publicar(repositorio.linha.id);
  expect(fila.jobs).toEqual([{ nome: "validar-ficha", dados: { id: repositorio.linha.id } }]);
  await fila.consumir(repositorio);
  return repositorio;
}

describe("processarValidacao", () => {
  it("aprova uma ficha dentro do pool", async () => {
    const repositorio = await executar(
      ficha({
        poder: 2,
        habilidade: 2,
        resistencia: 2,
        pericias: ["luta", "manha"],
        vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
      }),
    );

    expect(repositorio.historico).toEqual(["em_processamento", "aprovada"]);
    expect(repositorio.linha.motivos).toEqual([]);
  });

  it("recusa Ágil com Atrapalhado e grava o motivo", async () => {
    const repositorio = await executar(
      ficha({
        vantagens: [{ tipo: "agil" }],
        desvantagens: [{ tipo: "atrapalhado" }],
      }),
    );

    expect(repositorio.linha.status).toBe("recusada");
    expect(repositorio.linha.motivos).toContain("Ágil e Atrapalhado não podem estar na mesma ficha.");
  });

  it("recusa gasto acima de 10 pontos sem desvantagem", async () => {
    const repositorio = await executar(ficha({ poder: 5, habilidade: 5, resistencia: 1 }));

    expect(repositorio.linha.status).toBe("recusada");
    expect(repositorio.linha.motivos).toContain("A ficha gasta 11 pontos e o pool é 10.");
  });

  it("aprova o ponto extra de duas desvantagens", async () => {
    const repositorio = await executar(
      ficha({
        poder: 5,
        habilidade: 5,
        resistencia: 1,
        desvantagens: [{ tipo: "infame" }, { tipo: "codigo", codigo: "herois" }],
      }),
    );

    expect(repositorio.historico).toEqual(["em_processamento", "aprovada"]);
    expect(repositorio.linha.motivos).toEqual([]);
  });

  it("recusa uma terceira desvantagem", async () => {
    const repositorio = await executar(
      ficha({
        desvantagens: [
          { tipo: "infame" },
          { tipo: "antipatico" },
          { tipo: "codigo", codigo: "combate" },
        ],
      }),
    );

    expect(repositorio.linha.status).toBe("recusada");
    expect(repositorio.linha.motivos).toContain("Desvantagens concedem no máximo 2 pontos.");
  });
});
