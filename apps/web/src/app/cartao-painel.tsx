"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export function CartaoPainel({ href, titulo, texto }: { href: string; titulo: string; texto: string }) {
  return (
    <Card component="li">
      <CardActionArea component={Link} href={href}>
        <CardContent>
          <Typography variant="h2">{titulo}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {texto}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
