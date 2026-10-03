import type { ReactNode } from "react";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { ProvedorTema } from "../tema/provedor-tema";
import "./globals.css";

const fonteTitulo = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const fonteCorpo = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600"] });

export const metadata = {
  title: "Victory",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteCorpo.variable}`}>
      <body>
        <ProvedorTema>{children}</ProvedorTema>
      </body>
    </html>
  );
}
