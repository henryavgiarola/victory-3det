import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { validarFicha, type Ficha } from "@victory/rules";
import { Pool } from "pg";

export interface FichaPublica {
  nome: string;
  conceito: string;
  poder: number;
  habilidade: number;
  resistencia: number;
  pa: number;
  pm: number;
  pv: number;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS inscricoes (
  id uuid PRIMARY KEY,
  nome text NOT NULL,
  conceito text NOT NULL,
  ficha jsonb NOT NULL,
  status text NOT NULL,
  sub text,
  correlation_id text,
  motivos jsonb NOT NULL DEFAULT '[]'::jsonb
);
`;

const LIVIA: Ficha = {
  poder: 2,
  habilidade: 2,
  resistencia: 2,
  pericias: ["luta", "manha"],
  vantagens: [{ tipo: "forte" }, { tipo: "ataqueEspecial", efeito: "preciso" }],
  desvantagens: [],
};

const NUNO: Ficha = {
  poder: 1,
  habilidade: 2,
  resistencia: 2,
  pericias: ["influencia", "percepcao", "medicina"],
  vantagens: [{ tipo: "carismatico" }, { tipo: "agil" }],
  desvantagens: [],
};

const SEMENTES = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    nome: "Lívia do Cais",
    conceito: "Estivadora que briga com gancho e blefe.",
    ficha: LIVIA,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    nome: "Nuno do Farol",
    conceito: "Guia do porto que lê o tempo e convence a tripulação.",
    ficha: NUNO,
  },
] as const;

@Injectable()
export class InscricoesRepository implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InscricoesRepository.name);
  private pool: Pool | undefined;

  async onModuleInit(): Promise<void> {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL ausente.");
    }
    this.pool = new Pool({ connectionString: url });
    await this.esperarConexao();
    await this.pool.query(SCHEMA);
    await this.semear();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  async listarAprovadas(): Promise<FichaPublica[]> {
    const resultado = await this.conexao().query<{
      nome: string;
      conceito: string;
      ficha: Ficha;
    }>(
      "SELECT nome, conceito, ficha FROM inscricoes WHERE status = $1 ORDER BY nome",
      ["aprovada"],
    );

    const publicas: FichaPublica[] = [];
    for (const linha of resultado.rows) {
      const calculo = validarFicha(linha.ficha);
      if (!calculo.ok) {
        this.logger.warn(`Ficha aprovada recusada por validarFicha: ${linha.nome}`);
        continue;
      }
      publicas.push({
        nome: linha.nome,
        conceito: linha.conceito,
        poder: linha.ficha.poder,
        habilidade: linha.ficha.habilidade,
        resistencia: linha.ficha.resistencia,
        pa: calculo.pa,
        pm: calculo.pm,
        pv: calculo.pv,
      });
    }
    return publicas;
  }

  private conexao(): Pool {
    if (!this.pool) {
      throw new Error("Postgres ainda não conectou.");
    }
    return this.pool;
  }

  private async esperarConexao(): Promise<void> {
    const pool = this.conexao();
    for (let tentativa = 1; tentativa <= 15; tentativa += 1) {
      try {
        await pool.query("SELECT 1");
        return;
      } catch (erro) {
        if (tentativa === 15) {
          throw erro;
        }
        await new Promise((resolver) => setTimeout(resolver, 1000));
      }
    }
  }

  private async semear(): Promise<void> {
    const pool = this.conexao();
    for (const semente of SEMENTES) {
      const calculo = validarFicha(semente.ficha);
      if (!calculo.ok) {
        throw new Error(`Seed inválida: ${semente.nome}`);
      }
      await pool.query(
        `INSERT INTO inscricoes (id, nome, conceito, ficha, status, sub, correlation_id, motivos)
         VALUES ($1, $2, $3, $4::jsonb, 'aprovada', NULL, NULL, '[]'::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [semente.id, semente.nome, semente.conceito, JSON.stringify(semente.ficha)],
      );
    }
  }
}
