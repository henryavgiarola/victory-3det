import { listarFichasPublicas } from "../listar-fichas-publicas";

export const dynamic = "force-dynamic";

export default async function Home() {
  const fichas = await listarFichasPublicas();

  return (
    <main>
      <h1>Fichas públicas</h1>
      {fichas.length === 0 ? <p>Nenhuma ficha aprovada.</p> : null}
      <ul>
        {fichas.map((ficha) => (
          <li key={ficha.nome}>
            <h2>{ficha.nome}</h2>
            <p>{ficha.conceito}</p>
            <p>
              P {ficha.poder} H {ficha.habilidade} R {ficha.resistencia}
            </p>
            <p>
              PA {ficha.pa} PM {ficha.pm} PV {ficha.pv}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
