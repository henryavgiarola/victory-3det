import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { lerPerfil } from "../../perfil";
import { Cabecalho } from "../cabecalho";
import { MenuLateral } from "../menu-lateral";

export const dynamic = "force-dynamic";

export default async function LayoutArea({ children }: { children: ReactNode }) {
  const perfil = await lerPerfil();

  return (
    <>
      <Cabecalho nome={perfil?.nome ?? ""} sobrenome={perfil?.sobrenome ?? ""} />
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <MenuLateral />
        <Box
          component="main"
          sx={{ flex: 1, minWidth: 0, maxWidth: 880, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}
