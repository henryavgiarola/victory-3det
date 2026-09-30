import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { validarFicha } from "@victory/rules";
import { Worker } from "bullmq";
import { conexaoRedis } from "./fila-validacao";
import { InscricoesRepository } from "./inscricoes.repository";

const ATRASO_MS = 1000;

type Gravacao = Pick<InscricoesRepository, "buscar" | "marcarProcessamento" | "concluir">;

export async function processarValidacao(
  id: string,
  inscricoes: Gravacao,
  pausar: () => Promise<void> = async () => undefined,
): Promise<{ correlationId: string; status: "aprovada" | "recusada" } | undefined> {
  if (!id) {
    return undefined;
  }
  const linha = await inscricoes.buscar(id);
  if (!linha?.correlationId) {
    return undefined;
  }
  await inscricoes.marcarProcessamento(id);
  await pausar();
  const calculo = validarFicha(linha.ficha);
  if (calculo.ok) {
    await inscricoes.concluir(id, "aprovada", []);
    return { correlationId: linha.correlationId, status: "aprovada" };
  }
  await inscricoes.concluir(id, "recusada", calculo.motivos);
  return { correlationId: linha.correlationId, status: "recusada" };
}

@Injectable()
export class WorkerValidacao implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerValidacao.name);
  private worker: Worker | undefined;

  constructor(private readonly inscricoes: InscricoesRepository) {}

  onModuleInit(): void {
    this.worker = new Worker(
      "validar-ficha",
      async (job) => {
        const id = typeof job.data?.id === "string" ? job.data.id : "";
        const resultado = await processarValidacao(id, this.inscricoes, async () => {
          if (process.env.NODE_ENV !== "production") {
            await new Promise((resolver) => setTimeout(resolver, ATRASO_MS));
          }
        });
        if (!resultado) {
          return;
        }
        this.logger.log(`correlationId=${resultado.correlationId} id=${id} status=${resultado.status}`);
      },
      { connection: conexaoRedis() },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
