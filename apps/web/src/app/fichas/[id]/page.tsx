import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PainelStatus } from "./painel-status";

export const dynamic = "force-dynamic";

export default async function PaginaInscricao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();
  if (!jar.get("sessao")?.value) {
    redirect("/api/sessao/login");
  }

  return (
    <main>
      <h1>Inscrição</h1>
      <PainelStatus id={id} />
    </main>
  );
}
