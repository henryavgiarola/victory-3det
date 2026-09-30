"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  PERICIAS,
  validarFicha,
  type Codigo,
  type Desvantagem,
  type EfeitoAtaque,
  type EfeitoDefesa,
  type Ficha,
  type Pericia,
  type Vantagem,
} from "@victory/rules";

const VANTAGENS_SIMPLES = [
  "agil",
  "anulacao",
  "carismatico",
  "forte",
  "genio",
  "resoluto",
  "vigoroso",
] as const;

const DESVANTAGENS_SIMPLES = [
  "antipatico",
  "atrapalhado",
  "fracote",
  "fragil",
  "indeciso",
  "infame",
  "tapado",
] as const;

const EFEITOS_ATAQUE: EfeitoAtaque[] = ["espiritual", "potente", "penetrante", "perigoso", "preciso"];
const EFEITOS_DEFESA: EfeitoDefesa[] = ["esquiva", "reflexao", "robusta", "tenaz"];
const CODIGOS: Codigo[] = ["cacador", "combate", "derrota", "herois"];

export function FormularioFicha() {
  const [nome, setNome] = useState("");
  const [conceito, setConceito] = useState("");
  const [poder, setPoder] = useState(1);
  const [habilidade, setHabilidade] = useState(1);
  const [resistencia, setResistencia] = useState(1);
  const [pericias, setPericias] = useState<Pericia[]>([]);
  const [simples, setSimples] = useState<string[]>([]);
  const [ataque, setAtaque] = useState(false);
  const [efeitoAtaque, setEfeitoAtaque] = useState<EfeitoAtaque>("preciso");
  const [defesa, setDefesa] = useState(false);
  const [efeitoDefesa, setEfeitoDefesa] = useState<EfeitoDefesa>("esquiva");
  const [alcance, setAlcance] = useState(false);
  const [pontosAlcance, setPontosAlcance] = useState<1 | 2>(1);
  const [maestria, setMaestria] = useState(false);
  const [periciaMaestria, setPericiaMaestria] = useState<Pericia>("luta");
  const [desvantagens, setDesvantagens] = useState<string[]>([]);
  const [codigo, setCodigo] = useState(false);
  const [qualCodigo, setQualCodigo] = useState<Codigo>("cacador");
  const [resposta, setResposta] = useState("");
  const router = useRouter();

  const ficha = useMemo<Ficha>(() => {
    const vantagens: Vantagem[] = simples.map((tipo) => ({ tipo }) as Vantagem);
    if (ataque) {
      vantagens.push({ tipo: "ataqueEspecial", efeito: efeitoAtaque });
    }
    if (defesa) {
      vantagens.push({ tipo: "defesaEspecial", efeito: efeitoDefesa });
    }
    if (alcance) {
      vantagens.push({ tipo: "alcance", pontos: pontosAlcance });
    }
    if (maestria) {
      vantagens.push({ tipo: "maestria", pericia: periciaMaestria });
    }
    const listaDesvantagens: Desvantagem[] = desvantagens.map((tipo) => ({ tipo }) as Desvantagem);
    if (codigo) {
      listaDesvantagens.push({ tipo: "codigo", codigo: qualCodigo });
    }
    return { poder, habilidade, resistencia, pericias, vantagens, desvantagens: listaDesvantagens };
  }, [
    alcance,
    ataque,
    codigo,
    defesa,
    desvantagens,
    efeitoAtaque,
    efeitoDefesa,
    habilidade,
    maestria,
    periciaMaestria,
    pericias,
    poder,
    pontosAlcance,
    qualCodigo,
    resistencia,
    simples,
  ]);

  const calculo = validarFicha(ficha);
  const restantes = calculo.ok ? calculo.pool - calculo.pontosGastos : null;

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const http = await fetch("/api/inscricoes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nome, conceito, ...ficha }),
    });
    const texto = await http.text();
    if (!http.ok) {
      setResposta(`Erro ${http.status}`);
      return;
    }
    const json = JSON.parse(texto) as { id: string };
    router.push(`/fichas/${json.id}`);
  }

  function alternar<T extends string>(atual: T[], valor: T, marcar: boolean): T[] {
    return marcar ? [...atual, valor] : atual.filter((item) => item !== valor);
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nome
        <input value={nome} onChange={(evento) => setNome(evento.target.value)} required />
      </label>
      <label>
        Conceito
        <input value={conceito} onChange={(evento) => setConceito(evento.target.value)} required />
      </label>
      <fieldset>
        <legend>Atributos</legend>
        <Numero rotulo="Poder" valor={poder} aoMudar={setPoder} />
        <Numero rotulo="Habilidade" valor={habilidade} aoMudar={setHabilidade} />
        <Numero rotulo="Resistência" valor={resistencia} aoMudar={setResistencia} />
      </fieldset>
      <fieldset>
        <legend>Perícias</legend>
        {PERICIAS.map((pericia) => (
          <label key={pericia}>
            <input
              type="checkbox"
              checked={pericias.includes(pericia)}
              onChange={(evento) => setPericias(alternar(pericias, pericia, evento.target.checked))}
            />
            {pericia}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Vantagens</legend>
        {VANTAGENS_SIMPLES.map((tipo) => (
          <label key={tipo}>
            <input
              type="checkbox"
              checked={simples.includes(tipo)}
              onChange={(evento) => setSimples(alternar(simples, tipo, evento.target.checked))}
            />
            {tipo}
          </label>
        ))}
        <label>
          <input type="checkbox" checked={ataque} onChange={(evento) => setAtaque(evento.target.checked)} />
          ataque especial
          <select value={efeitoAtaque} onChange={(evento) => setEfeitoAtaque(evento.target.value as EfeitoAtaque)}>
            {EFEITOS_ATAQUE.map((efeito) => (
              <option key={efeito}>{efeito}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={defesa} onChange={(evento) => setDefesa(evento.target.checked)} />
          defesa especial
          <select value={efeitoDefesa} onChange={(evento) => setEfeitoDefesa(evento.target.value as EfeitoDefesa)}>
            {EFEITOS_DEFESA.map((efeito) => (
              <option key={efeito}>{efeito}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={alcance} onChange={(evento) => setAlcance(evento.target.checked)} />
          alcance
          <select
            value={pontosAlcance}
            onChange={(evento) => setPontosAlcance(Number(evento.target.value) as 1 | 2)}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={maestria} onChange={(evento) => setMaestria(evento.target.checked)} />
          maestria
          <select value={periciaMaestria} onChange={(evento) => setPericiaMaestria(evento.target.value as Pericia)}>
            {PERICIAS.map((pericia) => (
              <option key={pericia}>{pericia}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Desvantagens</legend>
        {DESVANTAGENS_SIMPLES.map((tipo) => (
          <label key={tipo}>
            <input
              type="checkbox"
              checked={desvantagens.includes(tipo)}
              onChange={(evento) => setDesvantagens(alternar(desvantagens, tipo, evento.target.checked))}
            />
            {tipo}
          </label>
        ))}
        <label>
          <input type="checkbox" checked={codigo} onChange={(evento) => setCodigo(evento.target.checked)} />
          código
          <select value={qualCodigo} onChange={(evento) => setQualCodigo(evento.target.value as Codigo)}>
            {CODIGOS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <p>
        {calculo.ok
          ? `Pontos restantes: ${restantes}`
          : calculo.motivos.join(" ")}
      </p>
      <button type="submit">Enviar</button>
      {resposta ? <p>{resposta}</p> : null}
    </form>
  );
}

function Numero({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: number;
  aoMudar: (valor: number) => void;
}) {
  return (
    <label>
      {rotulo}
      <input
        type="number"
        min={0}
        max={5}
        value={valor}
        onChange={(evento) => aoMudar(Number(evento.target.value))}
      />
    </label>
  );
}
