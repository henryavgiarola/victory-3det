import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class FilaValidacao implements OnModuleDestroy {
  private readonly fila: Queue;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL ausente.");
    }
    const endereco = new URL(url);
    this.fila = new Queue("validar-ficha", {
      connection: {
        host: endereco.hostname,
        port: Number(endereco.port || 6379),
        maxRetriesPerRequest: null,
      },
    });
  }

  async publicar(id: string): Promise<void> {
    await this.fila.add("validar-ficha", { id });
  }

  async onModuleDestroy(): Promise<void> {
    await this.fila.close();
  }
}
