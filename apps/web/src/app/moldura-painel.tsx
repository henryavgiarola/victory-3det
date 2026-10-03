import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { lerPerfil } from "../perfil";
import { Cabecalho } from "./cabecalho";

export async function MolduraPainel({ children }: { children: ReactNode }) {
  const perfil = await lerPerfil();

  return (
    <>
      <Cabecalho nome={perfil?.nome ?? ""} sobrenome={perfil?.sobrenome ?? ""} />
      <Box component="main" sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}>
        {children}
      </Box>
    </>
  );
}
