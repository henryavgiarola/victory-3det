import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FormularioFicha } from "./formulario-ficha";

export const dynamic = "force-dynamic";

export default async function NovaFicha() {
  const jar = await cookies();
  if (!jar.get("sessao")?.value) {
    redirect("/api/sessao/login");
  }

  return (
    <main>
      <h1>Nova ficha</h1>
      <FormularioFicha />
    </main>
  );
}
