import type { ReactNode } from "react";
import { Outfit, Source_Sans_3 } from "next/font/google";
import Box from "@mui/material/Box";
import { ProvedorTema } from "../tema/provedor-tema";
import { Cabecalho } from "./cabecalho";
import "./globals.css";

const fonteTitulo = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const fonteCorpo = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600"] });

export const metadata = {
  title: "Fichas públicas",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}>
      <body>
        <ProvedorTema>
          <Cabecalho />
          <Box
            component="main"
            sx={{ maxWidth: 880, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}
          >
            {children}
          </Box>
        </ProvedorTema>
      </body>
    </html>
  );
}
