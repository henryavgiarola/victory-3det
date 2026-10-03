"use client";

import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/fichas/nova", rotulo: "Nova ficha" },
  { href: "/fichas", rotulo: "Meus personagens" },
  { href: "/conta", rotulo: "Minha conta" },
];

function itemAtivo(caminho: string, href: string): boolean {
  if (href === "/fichas/nova") {
    return caminho === "/fichas/nova" || caminho.startsWith("/fichas/nova/");
  }
  if (href === "/fichas") {
    return caminho === "/fichas" || /^\/fichas\/[^/]+$/.test(caminho);
  }
  return caminho === href;
}

export function MenuLateral() {
  const caminho = usePathname();
  const tema = useTheme();
  const permanente = useMediaQuery(tema.breakpoints.up("sm"));
  const [aberto, setAberto] = useState(false);

  const lista = (
    <List component="nav" aria-label="Área da ficha">
      {ITENS.map((item) => (
        <ListItemButton
          key={item.href}
          component={Link}
          href={item.href}
          selected={itemAtivo(caminho, item.href)}
          onClick={() => setAberto(false)}
        >
          <ListItemText primary={item.rotulo} />
        </ListItemButton>
      ))}
    </List>
  );

  if (permanente) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", position: "relative" },
        }}
      >
        {lista}
      </Drawer>
    );
  }

  return (
    <>
      <IconButton aria-label="Abrir menu" onClick={() => setAberto(true)} sx={{ m: 1 }}>
        <MenuIcon />
      </IconButton>
      <Drawer variant="temporary" open={aberto} onClose={() => setAberto(false)}>
        {lista}
      </Drawer>
    </>
  );
}
