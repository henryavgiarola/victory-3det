import { Controller, Get } from "@nestjs/common";
import { InscricoesRepository, type FichaPublica } from "./inscricoes.repository";

@Controller()
export class FichasPublicasController {
  constructor(private readonly inscricoes: InscricoesRepository) {}

  @Get("fichas-publicas")
  listar(): Promise<FichaPublica[]> {
    return this.inscricoes.listarAprovadas();
  }
}
