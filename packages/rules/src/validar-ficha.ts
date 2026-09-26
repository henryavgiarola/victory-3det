import {
  PERICIAS,
  type Desvantagem,
  type Ficha,
  type Pericia,
  type ResultadoFicha,
  type Vantagem,
} from "./ficha";

const PONTOS_BASE = 10;
const MAX_PONTOS_DESVANTAGEM = 2;
const MAX_ATRIBUTO = 5;

const PERICIAS_VALIDAS = new Set<string>(PERICIAS);

export function validarFicha(ficha: Ficha): ResultadoFicha {
  const motivos: string[] = [];

  const atributos = [
    ["Poder", ficha.poder],
    ["Habilidade", ficha.habilidade],
    ["Resistência", ficha.resistencia],
  ] as const;

  for (const [nome, valor] of atributos) {
    if (!Number.isInteger(valor) || valor < 0 || valor > MAX_ATRIBUTO) {
      motivos.push(`${nome} deve ser um inteiro de 0 a ${MAX_ATRIBUTO}.`);
    }
  }

  const pericias = validarPericias(ficha.pericias, motivos);
  const custoVantagens = validarVantagens(ficha.vantagens, pericias, motivos);
  const pontosDesvantagem = validarDesvantagens(ficha.desvantagens, motivos);
  validarIncompatibilidades(ficha, motivos);

  const atributosValidos = atributos.every(
    ([, valor]) =>
      Number.isInteger(valor) && valor >= 0 && valor <= MAX_ATRIBUTO,
  );
  const pontosGastos = atributosValidos
    ? ficha.poder + ficha.habilidade + ficha.resistencia + pericias.length + custoVantagens
    : pericias.length + custoVantagens;
  const pool = PONTOS_BASE + pontosDesvantagem;

  if (atributosValidos && pontosGastos > pool) {
    motivos.push(
      `A ficha gasta ${pontosGastos} pontos e o pool é ${pool}.`,
    );
  }

  if (motivos.length > 0) {
    return { ok: false, motivos };
  }

  return {
    ok: true,
    pontosGastos,
    pool,
    pa: ficha.poder,
    pm: ficha.habilidade * 5,
    pv: ficha.resistencia * 5,
  };
}

function validarPericias(pericias: Pericia[], motivos: string[]): Pericia[] {
  const vistas = new Set<Pericia>();

  for (const pericia of pericias) {
    if (!PERICIAS_VALIDAS.has(pericia)) {
      motivos.push(`Perícia desconhecida: ${pericia}.`);
      continue;
    }
    if (vistas.has(pericia)) {
      motivos.push(`Perícia repetida: ${pericia}.`);
      continue;
    }
    vistas.add(pericia);
  }

  return [...vistas];
}

function validarVantagens(
  vantagens: Vantagem[],
  pericias: Pericia[],
  motivos: string[],
): number {
  const vistas = new Set<string>();
  let custo = 0;

  for (const vantagem of vantagens) {
    const chave = chaveVantagem(vantagem);
    if (vistas.has(chave)) {
      motivos.push(`Vantagem repetida: ${chave}.`);
      continue;
    }
    vistas.add(chave);
    custo += custoVantagem(vantagem, pericias, motivos);
  }

  return custo;
}

function validarDesvantagens(
  desvantagens: Desvantagem[],
  motivos: string[],
): number {
  const vistas = new Set<string>();

  for (const desvantagem of desvantagens) {
    const chave = chaveDesvantagem(desvantagem);
    if (vistas.has(chave)) {
      motivos.push(`Desvantagem repetida: ${chave}.`);
      continue;
    }
    vistas.add(chave);
  }

  if (vistas.size > MAX_PONTOS_DESVANTAGEM) {
    motivos.push(
      `Desvantagens concedem no máximo ${MAX_PONTOS_DESVANTAGEM} pontos.`,
    );
    return 0;
  }

  return vistas.size;
}

function validarIncompatibilidades(ficha: Ficha, motivos: string[]): void {
  const vantagens = new Set(ficha.vantagens.map((vantagem) => vantagem.tipo));
  const desvantagens = new Set(
    ficha.desvantagens.map((desvantagem) => desvantagem.tipo),
  );

  const pares = [
    ["agil", "atrapalhado", "Ágil e Atrapalhado não podem estar na mesma ficha."],
    ["carismatico", "antipatico", "Carismático e Antipático não podem estar na mesma ficha."],
    ["forte", "fracote", "Forte e Fracote não podem estar na mesma ficha."],
    ["vigoroso", "fragil", "Vigoroso e Frágil não podem estar na mesma ficha."],
    ["resoluto", "indeciso", "Resoluto e Indeciso não podem estar na mesma ficha."],
    ["genio", "tapado", "Gênio e Tapado não podem estar na mesma ficha."],
  ] as const;

  for (const [vantagem, desvantagem, mensagem] of pares) {
    if (vantagens.has(vantagem) && desvantagens.has(desvantagem)) {
      motivos.push(mensagem);
    }
  }
}

function custoVantagem(
  vantagem: Vantagem,
  pericias: Pericia[],
  motivos: string[],
): number {
  switch (vantagem.tipo) {
    case "alcance":
      if (vantagem.pontos !== 1 && vantagem.pontos !== 2) {
        motivos.push("Alcance custa 1 ou 2 pontos.");
        return 0;
      }
      return vantagem.pontos;
    case "ataqueEspecial":
      return custoGradual(
        vantagem.efeito === "potente",
        vantagem.graus,
        "Ataque Especial Potente",
        motivos,
      );
    case "defesaEspecial":
      return custoGradual(
        vantagem.efeito === "tenaz",
        vantagem.graus,
        "Defesa Especial Tenaz",
        motivos,
      );
    case "maestria":
      if (!pericias.includes(vantagem.pericia)) {
        motivos.push("Maestria exige a perícia escolhida.");
      }
      return 1;
    default:
      return 1;
  }
}

function custoGradual(
  acumula: boolean,
  graus: number | undefined,
  nome: string,
  motivos: string[],
): number {
  if (!acumula) {
    if (graus != null && graus !== 1) {
      motivos.push(`${nome.replace(" Potente", "").replace(" Tenaz", "")} não acumula graus.`);
    }
    return 1;
  }

  const valor = graus ?? 1;
  if (!Number.isInteger(valor) || valor < 1) {
    motivos.push(`${nome} precisa de ao menos 1 grau.`);
    return 0;
  }
  return valor;
}

function chaveVantagem(vantagem: Vantagem): string {
  switch (vantagem.tipo) {
    case "ataqueEspecial":
      return `ataque:${vantagem.efeito}`;
    case "defesaEspecial":
      return `defesa:${vantagem.efeito}`;
    case "maestria":
      return `maestria:${vantagem.pericia}`;
    case "alcance":
      return "alcance";
    default:
      return vantagem.tipo;
  }
}

function chaveDesvantagem(desvantagem: Desvantagem): string {
  if (desvantagem.tipo === "codigo") {
    return `codigo:${desvantagem.codigo}`;
  }
  return desvantagem.tipo;
}
